# Dockerfile for FastAPI backend (Askwiseo)
# -------------------------------------------------
# Multi‑stage build to keep the final image lightweight.
# Builder stage installs system dependencies and Python packages.
# Runtime stage uses a slim Python image with copied dependencies.

# ---- Builder ----
FROM python:3.11-slim AS builder
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    curl && \
    rm -rf /var/lib/apt/lists/*

# Install Python packages
COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# ---- Runtime ----
FROM python:3.11-slim AS runtime
WORKDIR /app

# Copy only the needed runtime files from builder
COPY --from=builder /app /app

# Copy installed Python site-packages and binaries from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Expose the API port (default 8000)
EXPOSE 8000

# Use environment variable for port (Render/Vercel compatibility)
ENV PORT=8000

# Start the FastAPI server using shell format to support port expansion from Render
CMD uvicorn main:app --host 0.0.0.0 --port $PORT