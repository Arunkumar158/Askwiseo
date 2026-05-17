from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    GEMINI_API_KEY: str = ""
    FIREBASE_SERVICE_ACCOUNT_PATH: str = "firebase-service-account.json"
    FIREBASE_SERVICE_ACCOUNT_JSON: str = ""
    CHROMA_PERSIST_DIR: str = "./chroma_db"
    CHROMA_COLLECTION_NAME: str = "askwiseo_docs"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001", "https://askwiseo.vercel.app"]
    MAX_FILE_SIZE_MB: int = 50
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    EMBEDDING_MODEL: str = "models/gemini-embedding-2"
    CHAT_MODEL: str = "gemini-2.5-flash"
    MAX_RETRIEVED_CHUNKS: int = 5
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""
    PAYPAL_CLIENT_ID: str = ""
    PAYPAL_SECRET: str = ""
    PAYPAL_MODE: str = "sandbox"
    PAYPAL_STARTER_PLAN_ID: str = ""
    PAYPAL_PRO_PLAN_ID: str = ""
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

settings = Settings()
