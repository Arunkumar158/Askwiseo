
import os
import sys
from auth import firebase_admin
from services.db_service import get_db, count_user_documents
from firebase_admin import storage

def test_docs():
    try:
        print("Checking existing documents for bucket name...")
        db = get_db()
        docs = db.collection("documents").limit(5).stream()
        for doc in docs:
            data = doc.to_dict()
            print(f"Doc ID: {data.get('id')}, File URL: {data.get('file_url')}")
    except Exception as e:
        print(f"Error fetching docs: {e}")

def test_count():
    try:
        uid = "test-user-id" 
        print(f"Testing count for user: {uid}")
        count = count_user_documents(uid)
        print(f"Count: {count}")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_docs()
    test_count()
