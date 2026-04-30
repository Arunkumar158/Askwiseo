import fitz
from typing import List
from config import settings

def extract_text_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages_text = []
    for page in doc:
        pages_text.append(page.get_text())
    doc.close()
    return "\n".join(pages_text)

def chunk_text(text: str) -> List[str]:
    chunk_size = settings.CHUNK_SIZE
    overlap = settings.CHUNK_OVERLAP
    text = " ".join(text.split())
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if end < len(text):
            last_period = chunk.rfind(". ")
            last_newline = chunk.rfind("\n")
            break_at = max(last_period, last_newline)
            if break_at > chunk_size // 2:
                chunk = text[start:start + break_at + 1]
                end = start + break_at + 1
        if chunk.strip():
            chunks.append(chunk.strip())
        start = end - overlap
    return chunks

def get_page_count(file_bytes: bytes) -> int:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    count = doc.page_count
    doc.close()
    return count