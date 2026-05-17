import json
import os

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from fastapi import Header, HTTPException, status

from config import settings

_firebase_initialized = False


def _init_firebase() -> None:
    global _firebase_initialized
    if _firebase_initialized or firebase_admin._apps:
        _firebase_initialized = True
        return

    base_dir = os.path.dirname(os.path.abspath(__file__))
    cred = None

    if settings.FIREBASE_SERVICE_ACCOUNT_JSON:
        cred = credentials.Certificate(json.loads(settings.FIREBASE_SERVICE_ACCOUNT_JSON))
        print("Loading Firebase service account from FIREBASE_SERVICE_ACCOUNT_JSON")
    else:
        service_account_path = os.path.join(base_dir, settings.FIREBASE_SERVICE_ACCOUNT_PATH)
        if os.path.exists(service_account_path):
            print(f"Loading Firebase service account from: {service_account_path}")
            cred = credentials.Certificate(service_account_path)

    if cred is None:
        raise RuntimeError(
            "Firebase credentials not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON "
            "on Render, or place firebase-service-account.json in the backend folder."
        )

    firebase_admin.initialize_app(cred, {"storageBucket": "askwiseo.firebasestorage.app"})
    _firebase_initialized = True


async def get_current_user(authorization: str = Header(...)) -> dict:
    _init_firebase()
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header. Use: Bearer <token>",
        )
    id_token = authorization.split("Bearer ")[1]
    try:
        decoded = firebase_auth.verify_id_token(id_token, clock_skew_seconds=60)
        return decoded
    except firebase_admin.exceptions.FirebaseError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(e)}",
        )
