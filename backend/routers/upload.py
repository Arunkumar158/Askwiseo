from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from auth import get_current_user
from services.pdf_service import extract_text_from_pdf, chunk_text, get_page_count
from services.vector_store import store_chunks
from services.db_service import (
    create_document_record,
    get_document_by_hash,
    count_user_documents,
    update_document_status,
)
from services.ai_service import generate_document_summary
from fastapi.concurrency import run_in_threadpool
from config import settings
import cloudinary
import cloudinary.uploader
import hashlib
import uuid
import traceback
import io

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# PDF magic bytes — the first 4 bytes of every valid PDF
_PDF_MAGIC = b"%PDF"


@router.post("/upload")
@limiter.limit("10/minute")
async def upload_pdf(
    request: Request,
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """Upload and index a PDF document.

    Rate-limited to 10 requests/minute per IP.
    """
    try:
        return await _upload_pdf_impl(file, user)
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


async def _upload_pdf_impl(file: UploadFile, user: dict):
    # ------------------------------------------------------------------
    # 1. Basic MIME validation (relaxed — some browsers send octet-stream)
    # ------------------------------------------------------------------
    ALLOWED_MIME = {"application/pdf", "application/octet-stream"}
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    file_bytes = await file.read()

    # ------------------------------------------------------------------
    # 2. Magic-byte validation (catches renamed non-PDF files)
    # ------------------------------------------------------------------
    if not file_bytes.startswith(_PDF_MAGIC):
        raise HTTPException(
            status_code=400,
            detail="File does not appear to be a valid PDF (failed magic-byte check).",
        )

    if len(file_bytes) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit.",
        )
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # ------------------------------------------------------------------
    # 3. Duplicate detection by MD5 hash
    # ------------------------------------------------------------------
    file_hash = hashlib.md5(file_bytes).hexdigest()
    existing_doc = get_document_by_hash(user["uid"], file_hash)
    if existing_doc:
        existing_url = existing_doc.get("file_url") or ""
        url_is_healthy = (
            existing_url
            and existing_url != "None"
            and "/image/upload/" not in existing_url
        )
        if url_is_healthy:
            return {
                "success": True,
                "document": existing_doc,
                "message": "Duplicate document detected. Returning existing record.",
                "is_duplicate": True,
            }

    # ------------------------------------------------------------------
    # 4. Plan limit check
    # ------------------------------------------------------------------
    doc_count = count_user_documents(user["uid"])
    if doc_count >= 10:
        raise HTTPException(
            status_code=403,
            detail=(
                f"Free plan limit reached. You have uploaded {doc_count} PDFs. "
                "Please upgrade to Pro for unlimited uploads."
            ),
        )

    # ------------------------------------------------------------------
    # 5. Generate document ID and upload to Cloudinary (optional storage)
    # ------------------------------------------------------------------
    doc_id = str(uuid.uuid4())
    file_url = None

    try:
        if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET,
                secure=True,
            )
            response = await run_in_threadpool(
                cloudinary.uploader.upload,
                io.BytesIO(file_bytes),
                resource_type="raw",
                public_id=f"{doc_id}.pdf",
                folder=f"askwiseo/uploads/{user['uid']}",
            )
            file_url = response.get("secure_url")
        else:
            print("WARNING: Cloudinary credentials not configured. Skipping upload.")
    except Exception as e:
        print(f"WARNING: Cloudinary upload failed (pipeline continuing): {str(e)}")

    # ------------------------------------------------------------------
    # 6. Extract text and chunk
    # ------------------------------------------------------------------
    try:
        text = await run_in_threadpool(extract_text_from_pdf, file_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse PDF: {str(e)}")

    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail="PDF has no extractable text (image-only PDF not supported).",
        )

    page_count = await run_in_threadpool(get_page_count, file_bytes)
    chunks = await run_in_threadpool(chunk_text, text)
    filename = file.filename or "document.pdf"

    # ------------------------------------------------------------------
    # 7. Generate AI summary (non-blocking)
    # ------------------------------------------------------------------
    insights = await run_in_threadpool(generate_document_summary, filename, text)

    # ------------------------------------------------------------------
    # 8. INDEX IN PINECONE FIRST — then write Firestore record.
    #    This ensures no "zombie" documents exist in Firestore without
    #    corresponding vectors in Pinecone.
    # ------------------------------------------------------------------
    # Write a provisional Firestore record with status="processing" so we
    # have a doc_id to reference in Pinecone metadata.
    doc_record = create_document_record(
        user_id=user["uid"],
        filename=filename,
        page_count=page_count,
        chunk_count=len(chunks),
        file_size_bytes=len(file_bytes),
        file_hash=file_hash,
        summary=insights.get("summary", ""),
        key_topics=insights.get("key_topics", []),
        document_type=insights.get("document_type", "Other"),
        action_items=insights.get("action_items", []),
        file_url=file_url,
        doc_id=doc_id,
        status="processing",          # will be flipped to "ready" after indexing
    )

    try:
        await store_chunks(
            document_id=doc_record["id"],
            user_id=user["uid"],
            filename=filename,
            chunks=chunks,
        )
    except Exception as e:
        # Mark the Firestore record as errored so the UI can surface it
        update_document_status(doc_id, "error")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to index document: {str(e)}",
        )

    # Pinecone succeeded — mark the document as ready
    update_document_status(doc_id, "ready")
    doc_record["status"] = "ready"

    return {
        "success": True,
        "document": doc_record,
        "chunk_count": len(chunks),
        "page_count": page_count,
    }