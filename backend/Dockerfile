# Dockerfile for FastAPI backend (Askwiseo)
# -------------------------------------------------
# Multi‑stage build to keep the final image lightweight.
# Builder stage installs system dependencies and Python packages.
# Runtime stage uses a minimal Python image.

# ---- Builder ----
FROM python:3.11-slim AS builder
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    curl && \
    rm -rf /var/lib/apt/lists/*

# Install Rust toolchain (required by some wheels, e.g., chromadb)
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
    export PATH="/root/.cargo/bin:${PATH}" && \
    rustup default stable && \
    rustup component add rustfmt clippy
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Python packages
COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel && \
    pip install -r requirements.txt

# Copy source code
COPY . .

# ---- Runtime ----
FROM python:3.11-alpine AS runtime
WORKDIR /app

# Copy only the needed runtime files from builder
COPY --from=builder /app /app

# Expose the API port (default 8000)
EXPOSE 8000

# Use environment variable for port (Render/Vercel compatibility)
ENV PORT=8000

# Start the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "${PORT:-8000}"]