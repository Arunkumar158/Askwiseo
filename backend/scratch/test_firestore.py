import os
import sys
from firebase_admin import firestore
import firebase_admin
from firebase_admin import credentials

# Add current directory to path
sys.path.append(os.getcwd())

from config import settings

def test_query():
    base_dir = os.getcwd()
    service_account_path = os.path.join(base_dir, settings.FIREBASE_SERVICE_ACCOUNT_PATH)
    
    if os.path.exists(service_account_path):
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        
        user_id = "test_user_id"
        print(f"Testing query for user: {user_id}")
        try:
            docs = (db.collection("documents").where("user_id", "==", user_id)
                    .order_by("created_at", direction=firestore.Query.DESCENDING).stream())
            results = [doc.to_dict() for doc in docs]
            print(f"Query successful. Found {len(results)} documents.")
        except Exception as e:
            print(f"Query failed: {str(e)}")
    else:
        print(f"Service account not found at: {service_account_path}")

if __name__ == "__main__":
    test_query()
