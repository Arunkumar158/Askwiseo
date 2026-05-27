import os
import sys
import requests
from firebase_admin import firestore
import firebase_admin
from firebase_admin import credentials
import cloudinary
import cloudinary.uploader

sys.path.append(os.getcwd())
from config import settings

def main():
    service_account_path = os.path.join(os.getcwd(), settings.FIREBASE_SERVICE_ACCOUNT_PATH)
    if not os.path.exists(service_account_path):
        print("Firebase service account not found")
        return

    # Init Firebase
    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    # Init Cloudinary
    if not (settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY):
        print("Cloudinary credentials not configured")
        return
        
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )

    print("Fetching documents from Firestore...")
    docs = db.collection("documents").stream()
    migrated_count = 0
    
    for doc in docs:
        data = doc.to_dict()
        doc_id = data.get("id")
        file_url = data.get("file_url")
        user_id = data.get("user_id")
        filename = data.get("filename")
        
        if file_url and "cloudinary.com" in file_url and "/raw/upload/" in file_url:
            print(f"\nFound legacy raw PDF: '{filename}' (ID: {doc_id})")
            print(f"Current URL: {file_url}")
            
            try:
                # 1. Download the PDF file from current raw URL
                print("Downloading PDF...")
                res = requests.get(file_url)
                if res.status_code != 200:
                    print(f"Failed to download PDF, status code: {res.status_code}")
                    continue
                pdf_bytes = res.content
                
                # 2. Upload to Cloudinary as image resource type
                print("Uploading to Cloudinary as 'image' resource type...")
                response = cloudinary.uploader.upload(
                    pdf_bytes,
                    resource_type="image",
                    public_id=doc_id,
                    format="pdf",
                    folder=f"askwiseo/uploads/{user_id}"
                )
                
                new_url = response.get("secure_url")
                if new_url:
                    print(f"Successfully uploaded! New URL: {new_url}")
                    
                    # 3. Update Firestore
                    db.collection("documents").document(doc_id).update({
                        "file_url": new_url,
                        "updated_at": firestore.SERVER_TIMESTAMP
                    })
                    print("Updated Firestore record successfully.")
                    migrated_count += 1
                else:
                    print("Failed to get secure_url from Cloudinary response.")
            except Exception as e:
                print(f"Error migrating document {doc_id}: {str(e)}")

    print(f"\nMigration finished. Successfully migrated {migrated_count} documents.")

if __name__ == "__main__":
    main()
