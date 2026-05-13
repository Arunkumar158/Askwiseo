
import sys, os
sys.path.insert(0, os.getcwd())

import firebase_admin
from firebase_admin import credentials, storage
import hashlib
import uuid
import datetime
from config import settings
from auth import get_current_user

# Mock user
user = {"uid": "test-user-id", "email": "test@example.com"}

def test_full_upload_flow():
    # 1. Firebase Init
    if not firebase_admin._apps:
        cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
        firebase_admin.initialize_app(cred, {'storageBucket': 'askwiseo.firebasestorage.app'})
    
    print("Firebase initialized.")

    # 2. Prepare dummy file
    file_bytes = b"%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\nxref\n0 1\n0000000000 65535 f\ntrailer<</Size 1>>\nstartxref\n9\n%%EOF"
    doc_id = str(uuid.uuid4())
    
    # 3. Storage Upload
    try:
        print(f"Uploading to bucket: {storage.bucket().name}")
        bucket = storage.bucket()
        blob = bucket.blob(f"uploads/{user['uid']}/{doc_id}.pdf")
        
        print("Starting blob upload...")
        blob.upload_from_string(file_bytes, content_type="application/pdf")
        print("Upload successful.")
        
        print("Generating signed URL...")
        file_url = blob.generate_signed_url(
            expiration=datetime.timedelta(days=365),
            method="GET",
            version="v4",
        )
        print(f"URL: {file_url}")
    except Exception as e:
        print(f"STORAGE FAIL: {e}")
        import traceback
        traceback.print_exc()
        return

    # 4. Text Extraction
    try:
        from services.pdf_service import extract_text_from_pdf
        text = extract_text_from_pdf(file_bytes)
        print(f"Text extraction OK, length: {len(text)}")
    except Exception as e:
        print(f"PDF FAIL: {e}")
        return

    # 5. DB Record
    try:
        from services.db_service import create_document_record
        # We'll use a test user to avoid cluttering real data
        doc_record = create_document_record(
            user_id="test-user-id",
            filename="test.pdf",
            page_count=1,
            chunk_count=1,
            file_size_bytes=len(file_bytes),
            file_url=file_url,
            doc_id=doc_id
        )
        print(f"DB Record created: {doc_record['id']}")
    except Exception as e:
        print(f"DB FAIL: {e}")
        return

if __name__ == "__main__":
    test_full_upload_flow()
