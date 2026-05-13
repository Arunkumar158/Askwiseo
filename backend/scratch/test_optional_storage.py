import sys, os
import asyncio
from unittest.mock import MagicMock, patch

# Add backend to path
sys.path.insert(0, os.path.join(os.getcwd(), "backend"))

# Set dummy env vars
os.environ["GEMINI_API_KEY"] = "dummy"

# Mock firebase_admin completely
mock_firebase_admin = MagicMock()
sys.modules["firebase_admin"] = mock_firebase_admin
mock_storage = MagicMock()
sys.modules["firebase_admin.storage"] = mock_storage

async def test_upload_without_storage():
    # Now import
    import routers.upload as upload_router
    
    # Mock UploadFile
    mock_file = MagicMock()
    mock_file.content_type = "application/pdf"
    mock_file.filename = "test.pdf"
    
    file_content = b"%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\nxref\n0 1\n0000000000 65535 f\ntrailer<</Size 1>>\nstartxref\n9\n%%EOF"
    async def mock_read():
        return file_content
    mock_file.read = mock_read
    
    # Mock User
    user = {"uid": "test-user-id"}
    
    # Force storage.bucket() to fail - directly on the router's imported storage
    upload_router.storage.bucket.side_effect = Exception("Simulated Storage Failure")
    
    # Mock dependencies directly in the router module
    with patch("routers.upload.extract_text_from_pdf", return_value="Test text"), \
         patch("routers.upload.get_page_count", return_value=1), \
         patch("routers.upload.chunk_text", return_value=["Chunk 1"]), \
         patch("routers.upload.generate_document_summary", return_value={"summary": "S", "key_topics": [], "document_type": "T", "action_items": []}), \
         patch("routers.upload.get_document_by_hash", return_value=None), \
         patch("routers.upload.count_user_documents", return_value=0), \
         patch("routers.upload.create_document_record", side_effect=lambda **kwargs: kwargs | {"id": "test-doc-id"}), \
         patch("routers.upload.store_chunks", return_value=None):

        try:
            print("Starting upload with simulated storage failure...")
            result = await upload_router._upload_pdf_impl(mock_file, user)
            print("Upload result SUCCESS:", result["success"])
            print("file_url:", result["document"].get("file_url"))
            
            if result["success"] and result["document"]["file_url"] is None:
                print("\nSUCCESS: Upload continued and file_url is None as expected.")
            else:
                print("\nFAILURE: Upload result not as expected.")
                
        except Exception as e:
            print("\nFAILURE: Upload raised an exception:", e)
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_upload_without_storage())
