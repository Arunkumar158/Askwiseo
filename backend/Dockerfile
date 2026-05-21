FROM python:3.11

WORKDIR /app

# Install system dependencies including Rust
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    build-essential \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.cargo/bin:${PATH}"

COPY requirements.txt .

RUN pip install --upgrade pip setuptools wheel

# Install packages one by one to isolate issues
RUN pip install fastapi==0.111.0
RUN pip install uvicorn[standard]==0.29.0
RUN pip install python-multipart==0.0.9
RUN pip install pydantic==2.7.1
RUN pip install pydantic-settings==2.2.1
RUN pip install firebase-admin==6.5.0
RUN pip install google-generativeai==0.5.4
RUN pip install PyMuPDF==1.24.3
RUN pip install "numpy==1.26.4"
RUN pip install chromadb==0.5.23
RUN pip install paypalrestsdk==1.13.3
RUN pip install cloudinary==1.40.0

COPY . .

EXPOSE 8000

CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}