import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import upload, chat, documents, billing

logger = logging.getLogger("askwiseo")

allowed_origins = {
    origin.rstrip("/")
    for origin in settings.ALLOWED_ORIGINS
    if origin and origin.strip()
}
allowed_origins.update(
    {
        "http://localhost:3000",
        "https://askwiseo.vercel.app",
    }
)

app = FastAPI(
    title="Askwiseo API",
    description="AI-powered PDF knowledge base backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=sorted(allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(documents.router, prefix="/api", tags=["documents"])
app.include_router(billing.router, prefix="/api", tags=["billing"])


@app.on_event("startup")
async def log_config_status():
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not set — AI endpoints will fail")
    if not settings.FIREBASE_SERVICE_ACCOUNT_JSON:
        path = settings.FIREBASE_SERVICE_ACCOUNT_PATH
        if not os.path.exists(path):
            logger.warning(
                "Firebase credentials not found — set FIREBASE_SERVICE_ACCOUNT_JSON on Render"
            )


@app.get("/health")
async def health():
    return {"status": "ok", "service": "askwiseo-api"}
