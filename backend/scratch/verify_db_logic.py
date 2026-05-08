import os
import sys
import hashlib

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import services
from services.db_service import create_document_record, get_document_by_hash, get_db
import auth # This initializes firebase

def test_duplicate_logic():
    user_id = "test_user_id_123"
    dummy_content = b"This is a test file content for MD5 hashing."
    file_hash = hashlib.md5(dummy_content).hexdigest()
    
    print(f"Testing with hash: {file_hash}")
    
    # 1. Ensure document doesn't exist initially
    existing = get_document_by_hash(user_id, file_hash)
    if existing:
        print(f"Warning: Document already exists. Cleaning up first...")
        get_db().collection("documents").document(existing["id"]).delete()
    
    # 2. Create document record
    print("Creating document record...")
    doc = create_document_record(
        user_id=user_id,
        filename="test_file.pdf",
        page_count=1,
        chunk_count=1,
        file_size_bytes=len(dummy_content),
        file_hash=file_hash
    )
    print(f"Created doc ID: {doc['id']}")
    
    # 3. Try to find it by hash
    print("Checking for duplicate by hash...")
    found = get_document_by_hash(user_id, file_hash)
    if found and found["id"] == doc["id"]:
        print("Success: Document found by hash correctly.")
    else:
        print("Error: Could not find document by hash.")
    
    # 4. Clean up
    print("Cleaning up test record...")
    get_db().collection("documents").document(doc["id"]).delete()
    print("Cleanup complete.")

if __name__ == "__main__":
    try:
        test_duplicate_logic()
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
