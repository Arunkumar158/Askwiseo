import logging
import os

import sentry_sdk
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from config import settings
from routers import upload, chat, documents, billing

# ---------------------------------------------------------------------------
# Sentry — error monitoring
# ---------------------------------------------------------------------------
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=1.0,
        environment=settings.ENVIRONMENT,
        # Use RENDER_GIT_COMMIT when running on Render; falls back to "unknown"
        release=f"askwiseo@{os.getenv('RENDER_GIT_COMMIT', 'unknown')}",
    )

logger = logging.getLogger("askwiseo")

# ---------------------------------------------------------------------------
# CORS origins — deduplicated set
# ---------------------------------------------------------------------------
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

# ---------------------------------------------------------------------------
# Prometheus metrics
# ---------------------------------------------------------------------------
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

REQUEST_COUNT = Counter(
    "request_count", "Total HTTP requests", ["method", "endpoint", "http_status"]
)
REQUEST_LATENCY = Histogram(
    "request_latency_seconds", "Latency of HTTP requests", ["method", "endpoint"]
)

# ---------------------------------------------------------------------------
# App + Rate Limiter
# ---------------------------------------------------------------------------
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Askwiseo API",
    description="AI-powered PDF knowledge base backend",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# ---------------------------------------------------------------------------
# CORS — must be added before custom middlewares so it wraps the full stack
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=sorted(allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Prometheus instrumentation middleware
# ---------------------------------------------------------------------------
@app.middleware("http")
async def prometheus_middleware(request, call_next):
    method = request.method
    path = request.url.path
    with REQUEST_LATENCY.labels(method=method, endpoint=path).time():
        response = await call_next(request)
    REQUEST_COUNT.labels(method=method, endpoint=path, http_status=response.status_code).inc()
    return response


# ---------------------------------------------------------------------------
# Security headers middleware
# (applied after CORS so CORS headers are not overwritten)
# ---------------------------------------------------------------------------
@app.middleware("http")
async def security_headers_middleware(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    # NOTE: CSP is intentionally omitted here because it would block
    # third-party API calls originating from the browser.  Add a
    # browser-facing CSP via Vercel response headers instead.
    return response


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(documents.router, prefix="/api", tags=["documents"])
app.include_router(billing.router, prefix="/api", tags=["billing"])


# ---------------------------------------------------------------------------
# Startup validation
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def log_config_status():
    try:
        settings.validate_pinecone_env()
    except RuntimeError as e:
        logger.warning(
            "Pinecone configuration warning: %s — AI/Vector endpoints will fail until "
            "variables are set on Render.",
            e,
        )
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not set — AI endpoints will fail")
    if not settings.FIREBASE_SERVICE_ACCOUNT_JSON:
        path = settings.FIREBASE_SERVICE_ACCOUNT_PATH
        if not os.path.exists(path):
            logger.warning(
                "Firebase credentials not found — set FIREBASE_SERVICE_ACCOUNT_JSON on Render"
            )


# ---------------------------------------------------------------------------
# Utility endpoints
# ---------------------------------------------------------------------------
@app.get("/metrics")
async def metrics():
    """Internal Prometheus metrics — restrict access in production via infra-level rules."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/healthz")
async def healthz():
    return {"status": "ok", "service": "askwiseo-api"}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "askwiseo-api"}


@app.get("/")
async def root():
    return {"status": "ok", "service": "Askwiseo Backend API"}
