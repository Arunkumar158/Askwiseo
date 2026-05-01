import os
import sys
import firebase_admin
from firebase_admin import credentials

# Add current directory to path
sys.path.append(os.getcwd())

from services.db_service import get_user_documents
from config import settings

def test_fix():
    # Initialization is handled by auth.py normally, but for standalone script:
    if not firebase_admin._apps:
        base_dir = os.getcwd()
        service_account_path = os.path.join(base_dir, settings.FIREBASE_SERVICE_ACCOUNT_PATH)
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
    
    user_id = "test_user_id"
    print(f"Testing get_user_documents for user: {user_id}")
    try:
        docs = get_user_documents(user_id)
        print(f"Success! Found {len(docs)} documents.")
        if len(docs) > 0:
            print(f"First doc: {docs[0].get('filename')}")
    except Exception as e:
        print(f"Failed: {str(e)}")

if __name__ == "__main__":
    test_fix()
