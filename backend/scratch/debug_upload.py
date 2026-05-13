"""
Run from: c:\Business\Askwiseo\backend
Usage: python scratch/debug_upload.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

print("=== Step 1: Config ===")
try:
    from config import settings
    print(f"  GEMINI_API_KEY: {'set' if settings.GEMINI_API_KEY else 'MISSING'}")
    print(f"  FIREBASE_SA: {settings.FIREBASE_SERVICE_ACCOUNT_PATH}")
    print(f"  OK")
except Exception as e:
    print(f"  FAIL: {e}")
    sys.exit(1)

print("\n=== Step 2: Firebase Admin init ===")
try:
    import firebase_admin
    from firebase_admin import credentials, storage
    from firebase_admin import auth as firebase_auth

    if not firebase_admin._apps:
        sa_path = settings.FIREBASE_SERVICE_ACCOUNT_PATH
        cred = credentials.Certificate(sa_path)
        firebase_admin.initialize_app(cred, {'storageBucket': 'askwiseo.firebasestorage.app'})
    print("  OK")
except Exception as e:
    print(f"  FAIL: {e}")
    sys.exit(1)

print("\n=== Step 3: Storage bucket access ===")
try:
    bucket = storage.bucket()
    print(f"  Bucket name: {bucket.name}")
    print("  OK")
except Exception as e:
    print(f"  FAIL: {e}")

print("\n=== Step 4: PDF Service ===")
try:
    from services.pdf_service import extract_text_from_pdf, chunk_text, get_page_count
    # Minimal PDF bytes
    pdf_bytes = b"%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\nxref\n0 1\n0000000000 65535 f\ntrailer<</Size 1>>\nstartxref\n9\n%%EOF"
    text = extract_text_from_pdf(pdf_bytes)
    print(f"  Extracted text length: {len(text)}")
    print("  OK")
except Exception as e:
    print(f"  FAIL: {e}")

print("\n=== Step 5: AI Service ===")
try:
    from services.ai_service import generate_document_summary
    result = generate_document_summary("test.pdf", "This is a test document about Python programming.")
    print(f"  Summary keys: {list(result.keys())}")
    print("  OK")
except Exception as e:
    print(f"  FAIL: {e}")

print("\n=== Step 6: DB Service ===")
try:
    from services.db_service import get_document_by_hash, count_user_documents
    # Just test the import — don't actually call Firestore
    print("  Import OK")
except Exception as e:
    print(f"  FAIL: {e}")

print("\n=== Step 7: Vector Store ===")
try:
    from services.vector_store import store_chunks
    print("  Import OK")
except Exception as e:
    print(f"  FAIL: {e}")

print("\nDone. Check FAILs above for the 500 cause.")
