from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, model_validator
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
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://askwiseo.vercel.app",
    ]
    FRONTEND_URL: str = "https://askwiseo.vercel.app"
    MAX_FILE_SIZE_MB: int = 50
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    EMBEDDING_MODEL: str = "models/gemini-embedding-2"
    CHAT_MODEL: str = "gemini-2.5-flash"
    MAX_RETRIEVED_CHUNKS: int = 5
    SENTRY_DSN: str = ""
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    ENVIRONMENT: str = "development"
    # List of environment variables that must be present in production
    _REQUIRED_PROD_VARS: List[str] = [
        "SENTRY_DSN",
        "RAZORPAY_KEY_ID",
        "RAZORPAY_KEY_SECRET",
        "PAYPAL_CLIENT_ID",
        "PAYPAL_SECRET",
    ]
    RAZORPAY_WEBHOOK_SECRET: str = ""
    PAYPAL_CLIENT_ID: str = ""
    PAYPAL_SECRET: str = ""
    ENABLE_NEW_FEATURE: bool = False
    PAYPAL_STARTER_PLAN_ID: str = ""
    PAYPAL_PRO_PLAN_ID: str = ""
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Pinecone settings
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX_NAME: str = ""
    PINECONE_ENVIRONMENT: str = ""
    # optional cloud/region pair (not used if environment provided)
    PINECONE_CLOUD: str = ""
    PINECONE_REGION: str = ""

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, value):
        if isinstance(value, str):
            value = value.strip()
            if not value:
                return []
            if value.startswith("["):
                return value
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @model_validator(mode="after")
    def check_production_vars(self):
        """Validate that required env vars are present when ENVIRONMENT is 'production'."""
        env = self.ENVIRONMENT
        if env == "production":
            missing = []
            for var in self._REQUIRED_PROD_VARS:
                if not getattr(self, var, None):
                    missing.append(var)
            if missing:
                raise ValueError(
                    f"Missing required environment variables for production: {', '.join(missing)}"
                )
        return self

    def validate_pinecone_env(self) -> None:
        """Ensure Pinecone required environment variables are set.

        Requires PINECONE_API_KEY and PINECONE_INDEX_NAME.
        For the host/region, accepts either PINECONE_ENVIRONMENT (legacy)
        or the PINECONE_CLOUD + PINECONE_REGION pair (Pinecone v3+).

        Raises:
            RuntimeError: If any required Pinecone variable is missing.
        """
        missing = []
        for var in ("PINECONE_API_KEY", "PINECONE_INDEX_NAME"):
            if not getattr(self, var, ""):
                missing.append(var)
        # Accept either PINECONE_ENVIRONMENT or PINECONE_CLOUD+PINECONE_REGION
        has_env = bool(getattr(self, "PINECONE_ENVIRONMENT", ""))
        has_cloud_region = bool(getattr(self, "PINECONE_CLOUD", "")) and bool(getattr(self, "PINECONE_REGION", ""))
        if not has_env and not has_cloud_region:
            missing.append("PINECONE_ENVIRONMENT (or PINECONE_CLOUD + PINECONE_REGION)")
        if missing:
            raise RuntimeError(
                f"Missing required Pinecone environment variables: {', '.join(missing)}"
            )

settings = Settings()
