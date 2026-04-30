from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    FIREBASE_SERVICE_ACCOUNT_PATH: str = "firebase-service-account.json"
    CHROMA_PERSIST_DIR: str = "./chroma_db"
    CHROMA_COLLECTION_NAME: str = "askwiseo_docs"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001", "https://askwiseo.vercel.app"]
    MAX_FILE_SIZE_MB: int = 50
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    EMBEDDING_MODEL: str = "models/text-embedding-004"
    CHAT_MODEL: str = "gemini-1.5-flash"
    MAX_RETRIEVED_CHUNKS: int = 5

    class Config:
        env_file = ".env"

settings = Settings()