import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from fastapi import Header, HTTPException, status
from config import settings
import os

if not firebase_admin._apps:
    # Get absolute path relative to this file
    base_dir = os.path.dirname(os.path.abspath(__file__))
    service_account_path = os.path.join(base_dir, settings.FIREBASE_SERVICE_ACCOUNT_PATH)
    
    if os.path.exists(service_account_path):
        print(f"Loading Firebase service account from: {service_account_path}")
        cred = credentials.Certificate(service_account_path)
    else:
        print(f"Service account not found at: {service_account_path}, using ApplicationDefault")
        cred = credentials.ApplicationDefault()
    
    firebase_admin.initialize_app(cred)

async def get_current_user(authorization: str = Header(...)) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header. Use: Bearer <token>",
        )
    id_token = authorization.split("Bearer ")[1]
    try:
        decoded = firebase_auth.verify_id_token(id_token)
        return decoded
    except firebase_admin.exceptions.FirebaseError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(e)}",
        )