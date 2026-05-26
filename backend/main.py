import logging
import os

import sentry_sdk
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import upload, chat, documents, billing

# Initialize Sentry for error monitoring
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=1.0,
        environment=settings.ENVIRONMENT,
        release="askwiseo@${{ github.sha }}" if hasattr(settings, "ENVIRONMENT") else None,
    )

logger = logging.getLogger("askwiseo")

allowed_origins = {
    origin.rstrip("/")
    for origin in settings.ALLOWED_ORIGINS
    if origin and origin.strip()
}
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
app = FastAPI(
    title="Askwiseo API",
    description="AI-powered PDF knowledge base backend",
    version="1.0.0",
)

# Prometheus metrics
REQUEST_COUNT = Counter('request_count', 'Total HTTP requests', ['method', 'endpoint', 'http_status'])
REQUEST_LATENCY = Histogram('request_latency_seconds', 'Latency of HTTP requests', ['method', 'endpoint'])

@app.middleware("http")
async def prometheus_middleware(request, call_next):
    method = request.method
    path = request.url.path
    with REQUEST_LATENCY.labels(method=method, endpoint=path).time():
        response = await call_next(request)
    status_code = response.status_code
    REQUEST_COUNT.labels(method=method, endpoint=path, http_status=status_code).inc()
    return response

@app.get("/metrics")
async def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

# Security headers middleware
@app.middleware("http")
async def security_headers_middleware(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response

allowed_origins.update(
    {
        "http://localhost:3000",
        "https://askwiseo.vercel.app",
    }
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
    # Validate required Pinecone environment variables for production
    try:
        settings.validate_pinecone_env()
    except RuntimeError as e:
        logger.warning(f"Pinecone configuration warning: {e} — AI/Vector endpoints will fail until variables are set on Render.")
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not set — AI endpoints will fail")
    if not settings.FIREBASE_SERVICE_ACCOUNT_JSON:
        path = settings.FIREBASE_SERVICE_ACCOUNT_PATH
        if not os.path.exists(path):
            logger.warning(
                "Firebase credentials not found — set FIREBASE_SERVICE_ACCOUNT_JSON on Render"
            )


@app.get("/healthz")
async def healthz():
    return {"status": "ok", "service": "askwiseo-api"}

@app.get("/health")
async def health():
    return {"status": "ok", "service": "askwiseo-api"}
@app.get("/")
async def root():
    return {"status": "ok", "service": "Askwiseo Backend API"}

