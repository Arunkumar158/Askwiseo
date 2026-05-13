
import firebase_admin
from firebase_admin import credentials, storage
import os

def check_bucket(name):
    try:
        print(f"Checking bucket: {name}")
        bucket = storage.bucket(name)
        if bucket.exists():
            print(f"  Bucket {name} exists!")
            return True
        else:
            print(f"  Bucket {name} does NOT exist.")
            return False
    except Exception as e:
        print(f"  Error checking {name}: {e}")
        return False

if __name__ == "__main__":
    if not firebase_admin._apps:
        cred = credentials.Certificate("firebase-service-account.json")
        firebase_admin.initialize_app(cred)
    
    project_id = "askwiseo"
    check_bucket(f"{project_id}.firebasestorage.app")
    check_bucket(f"{project_id}.appspot.com")
    check_bucket(f"{project_id}-default")
    check_bucket(project_id)
