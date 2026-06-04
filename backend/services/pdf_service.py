import fitz
from typing import List
from config import settings


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF byte payload.

    Uses PyMuPDF (fitz) with a context manager to guarantee the
    document handle is closed even if an exception is raised during
    page iteration.
    """
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        return "\n".join(page.get_text() for page in doc)


def chunk_text(text: str) -> List[str]:
    """Split *text* into overlapping fixed-size chunks.

    Tries to break at sentence boundaries ('. ') or newlines so that
    chunks are semantically coherent.  Falls back to hard character
    boundaries when no natural break-point exists in the second half of
    the window.
    """
    chunk_size = settings.CHUNK_SIZE
    overlap = settings.CHUNK_OVERLAP
    text = " ".join(text.split())
    chunks: List[str] = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if end < len(text):
            last_period = chunk.rfind(". ")
            last_newline = chunk.rfind("\n")
            break_at = max(last_period, last_newline)
            if break_at > chunk_size // 2:
                chunk = text[start : start + break_at + 1]
                end = start + break_at + 1
        if chunk.strip():
            chunks.append(chunk.strip())
        start = end - overlap
    return chunks


def get_page_count(file_bytes: bytes) -> int:
    """Return the number of pages in the PDF without leaking the handle."""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        return doc.page_count