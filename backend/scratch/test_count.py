import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize firebase if not already
if not firebase_admin._apps:
    cred = credentials.Certificate("backend/firebase-service-account.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()
try:
    count = db.collection("documents").count().get()[0][0].value
    print(f"Count works: {count}")
except Exception as e:
    print(f"Count failed: {e}")
