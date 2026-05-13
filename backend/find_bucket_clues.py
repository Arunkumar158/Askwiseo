
import firebase_admin
from firebase_admin import credentials, firestore, storage
import os

def search_for_bucket():
    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate("firebase-service-account.json")
            firebase_admin.initialize_app(cred)
        
        db = firestore.client()
        print("Searching Firestore for bucket clues...")
        
        # Check a few collections
        for coll_name in ["documents", "user_plans", "settings"]:
            docs = db.collection(coll_name).limit(10).stream()
            for doc in docs:
                data = doc.to_dict()
                for key, value in data.items():
                    if isinstance(value, str) and (".appspot.com" in value or "firebasestorage.app" in value):
                        print(f"Found clue in {coll_name}/{doc.id}: {key} = {value}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    search_for_bucket()
