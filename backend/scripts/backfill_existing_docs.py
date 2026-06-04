"""
backfill_existing_docs.py
=========================
One-time fix for documents uploaded before the upload.py bug fix.

Problems fixed:
  1. file_url is None  — Cloudinary was using resource_type="image" which
                         fails for PDFs, leaving file_url as None in Firestore.
  2. No Pinecone vectors — store_chunks was called without `await`, so the
                           coroutine was silently discarded and nothing was
                           indexed.

This script:
  - Scans every document in Firestore
  - For documents with a missing or broken file_url, downloads the PDF bytes
    from Cloudinary (if possible) and re-uploads with resource_type="raw"
  - Re-chunks and re-embeds each document and upserts to Pinecone

Usage (run from the backend/ directory with the venv active):
    python scripts/backfill_existing_docs.py [--dry-run]

Flags:
    --dry-run   Print what would be done without making any changes.
"""

import asyncio
import sys
import os
import io
import hashlib
import traceback
import argparse

# Force UTF-8 output on Windows (avoids CP1252 UnicodeEncodeError on emoji)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# ── make sure backend packages resolve correctly ──────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import settings
from auth import _init_firebase
from services.db_service import get_db
from services.vector_store import store_chunks, embed_texts
from services.pinecone_service import get_index, upsert_document_chunks, query_vectors
import cloudinary
import cloudinary.uploader
import cloudinary.api


# ── helpers ───────────────────────────────────────────────────────────────────

def _needs_fix(doc: dict) -> tuple[bool, str]:
    """Return (needs_fix, reason) for a document record."""
    file_url = doc.get("file_url") or ""
    has_bad_url = (
        not file_url
        or file_url == "None"
        # Old image-type Cloudinary URLs have /image/upload/ in the path
        or "/image/upload/" in file_url
    )
    return has_bad_url, "missing or image-type file_url" if has_bad_url else ""


def _cloudinary_public_id(doc_id: str, user_id: str) -> str:
    """Reconstruct the Cloudinary public_id used during the original (broken) upload."""
    # Old code used public_id=doc_id with format="pdf" → Cloudinary appended .pdf
    # New code uses public_id=f"{doc_id}.pdf"
    return f"askwiseo/uploads/{user_id}/{doc_id}"


def _re_upload_to_cloudinary(file_bytes: bytes, doc_id: str, user_id: str) -> str | None:
    """Upload PDF bytes to Cloudinary with the correct resource_type="raw"."""
    try:
        response = cloudinary.uploader.upload(
            io.BytesIO(file_bytes),
            resource_type="raw",
            public_id=f"{doc_id}.pdf",
            folder=f"askwiseo/uploads/{user_id}",
            overwrite=True,
        )
        return response.get("secure_url")
    except Exception as exc:
        print(f"  ⚠ Cloudinary re-upload failed: {exc}")
        return None


def _fetch_original_pdf_bytes(doc: dict) -> bytes | None:
    """
    Attempt to download the original PDF from Cloudinary.
    
    The old upload stored it as resource_type="image" with format="pdf",
    so the URL is something like:
      https://res.cloudinary.com/{cloud}/image/upload/{folder}/{doc_id}.pdf
    """
    try:
        import urllib.request
        doc_id = doc.get("id", "")
        user_id = doc.get("user_id", "")
        # Possible old URL patterns to try
        candidates = [
            doc.get("file_url"),  # whatever was stored (might work for image type)
            f"https://res.cloudinary.com/{settings.CLOUDINARY_CLOUD_NAME}/image/upload/askwiseo/uploads/{user_id}/{doc_id}.pdf",
            f"https://res.cloudinary.com/{settings.CLOUDINARY_CLOUD_NAME}/image/upload/askwiseo/uploads/{user_id}/{doc_id}",
        ]
        for url in candidates:
            if not url:
                continue
            try:
                with urllib.request.urlopen(url, timeout=15) as r:
                    data = r.read()
                    if data[:4] == b"%PDF":
                        print(f"  ✓ Downloaded PDF bytes from: {url}")
                        return data
            except Exception:
                continue
    except Exception as exc:
        print(f"  ⚠ Could not fetch original PDF bytes: {exc}")
    return None


async def _reindex_document(doc: dict, file_bytes: bytes, dry_run: bool) -> bool:
    """Re-chunk and re-upsert a document's vectors to Pinecone."""
    from services.pdf_service import extract_text_from_pdf, chunk_text

    try:
        text = extract_text_from_pdf(file_bytes)
    except Exception as exc:
        print(f"  ⚠ PDF extraction failed: {exc}")
        return False

    if not text.strip():
        print("  ⚠ No extractable text found (image-only PDF).")
        return False

    chunks = chunk_text(text)
    doc_id = doc["id"]
    user_id = doc["user_id"]
    filename = doc.get("filename", "document.pdf")

    print(f"  → {len(chunks)} chunks to index")

    if dry_run:
        print("  [DRY RUN] Would upsert chunks to Pinecone")
        return True

    await store_chunks(
        document_id=doc_id,
        user_id=user_id,
        filename=filename,
        chunks=chunks,
    )
    return True


async def _has_pinecone_vectors(doc_id: str, user_id: str) -> bool:
    """Quick check: does Pinecone already have at least one vector for this doc?"""
    try:
        from services.vector_store import embed_query
        test_emb = embed_query("test")
        matches = await query_vectors(
            query_embedding=test_emb,
            namespace=user_id,
            top_k=1,
            filter={"document_id": doc_id},
        )
        return len(matches) > 0
    except Exception:
        return False


# ── main ──────────────────────────────────────────────────────────────────────

async def run(dry_run: bool):
    print("=" * 60)
    print("Askwiseo — Document Backfill Script")
    print("=" * 60)
    if dry_run:
        print("⚠  DRY RUN MODE — no changes will be made\n")

    # Init Firebase + Pinecone
    _init_firebase()
    db = get_db()
    index = get_index()
    if index is None:
        print("✗ Pinecone is not initialized. Check PINECONE_API_KEY / PINECONE_INDEX_NAME.")
        return

    # Init Cloudinary
    if not (settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY):
        print("✗ Cloudinary credentials not configured. Cannot re-upload files.")
        return

    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )

    # Fetch all documents
    all_docs_stream = db.collection("documents").stream()
    all_docs = [d.to_dict() for d in all_docs_stream]
    print(f"Found {len(all_docs)} total document(s) in Firestore.\n")

    fixed_url = 0
    fixed_vectors = 0
    skipped = 0
    failed = 0

    for doc in all_docs:
        doc_id = doc.get("id", "<unknown>")
        user_id = doc.get("user_id", "")
        filename = doc.get("filename", "?")
        print(f"[{doc_id[:8]}…] {filename}")

        # ── 1. Check if vectors already exist ───────────────────────────────
        has_vectors = await _has_pinecone_vectors(doc_id, user_id)
        needs_url_fix, url_reason = _needs_fix(doc)

        if not needs_url_fix and has_vectors:
            print("  ✓ OK — file_url valid & vectors present. Skipping.")
            skipped += 1
            continue

        if needs_url_fix:
            print(f"  ✗ URL problem: {url_reason}")
        if not has_vectors:
            print("  ✗ No Pinecone vectors found")

        # ── 2. Try to get the original PDF bytes ─────────────────────────────
        file_bytes = _fetch_original_pdf_bytes(doc)
        if not file_bytes:
            print("  ✗ Could not retrieve original PDF. Manual re-upload required.")
            failed += 1
            continue

        # ── 3. Re-upload to Cloudinary as raw ────────────────────────────────
        if needs_url_fix:
            new_url = None if dry_run else _re_upload_to_cloudinary(file_bytes, doc_id, user_id)
            if dry_run:
                print(f"  [DRY RUN] Would re-upload to Cloudinary as resource_type=raw")
            elif new_url:
                print(f"  ✓ New file_url: {new_url}")
                db.collection("documents").document(doc_id).update({"file_url": new_url})
                fixed_url += 1
            else:
                print("  ⚠ Cloudinary re-upload failed; skipping vector re-index to be safe.")
                failed += 1
                continue

        # ── 4. Re-index vectors ───────────────────────────────────────────────
        if not has_vectors:
            success = await _reindex_document(doc, file_bytes, dry_run)
            if success:
                if not dry_run:
                    fixed_vectors += 1
                    print("  ✓ Vectors upserted to Pinecone")
            else:
                failed += 1

        print()

    # ── Summary ──────────────────────────────────────────────────────────────
    print("=" * 60)
    print(f"Done. Results:")
    print(f"  Skipped (already OK)  : {skipped}")
    print(f"  file_url fixed        : {fixed_url}")
    print(f"  Vectors re-indexed    : {fixed_vectors}")
    print(f"  Failed (manual needed): {failed}")
    print("=" * 60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Backfill broken Askwiseo documents")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without applying them")
    args = parser.parse_args()
    asyncio.run(run(dry_run=args.dry_run))
