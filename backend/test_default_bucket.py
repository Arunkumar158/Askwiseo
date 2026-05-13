
import firebase_admin
from firebase_admin import credentials, storage

def test_default_bucket():
    try:
        cred = credentials.Certificate("firebase-service-account.json")
        firebase_admin.initialize_app(cred)
        bucket = storage.bucket()
        print(f"Default bucket name: {bucket.name}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_default_bucket()
