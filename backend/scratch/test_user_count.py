import firebase_admin
from firebase_admin import credentials, firestore
import os

if not firebase_admin._apps:
    cred = credentials.Certificate("backend/firebase-service-account.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Get a user who has documents
docs = db.collection("documents").limit(1).stream()
first_doc = next(docs, None)

if first_doc:
    user_id = first_doc.to_dict().get("user_id")
    print(f"Testing for user: {user_id}")
    count = db.collection("documents").where("user_id", "==", user_id).count().get()[0][0].value
    print(f"Count for user {user_id}: {count}")
else:
    print("No documents found in the database.")
