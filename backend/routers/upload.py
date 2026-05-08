from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from auth import get_current_user
from services.pdf_service import extract_text_from_pdf, chunk_text, get_page_count
from services.vector_store import store_chunks
from services.db_service import create_document_record, get_document_by_hash, count_user_documents
from config import settings
import hashlib

router = APIRouter()

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")
    file_bytes = await file.read()
    if len(file_bytes) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit.")
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    # Calculate MD5 hash for duplicate detection
    file_hash = hashlib.md5(file_bytes).hexdigest()
    
    # Check if document already exists for this user
    existing_doc = get_document_by_hash(user["uid"], file_hash)
    if existing_doc:
        return {
            "success": True, 
            "document": existing_doc, 
            "message": "Duplicate document detected. Returning existing record.",
            "is_duplicate": True
        }

    # Plan Limits Check: Reject if user has 10 or more documents
    doc_count = count_user_documents(user["uid"])
    if doc_count >= 10:
        raise HTTPException(
            status_code=403, 
            detail=f"Free plan limit reached. You have uploaded {doc_count} PDFs. Please upgrade to Pro for unlimited uploads."
        )

    try:
        text = extract_text_from_pdf(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse PDF: {str(e)}")
    if not text.strip():
        raise HTTPException(status_code=422, detail="PDF has no extractable text (image-only PDF not supported).")
    page_count = get_page_count(file_bytes)
    chunks = chunk_text(text)
    doc_record = create_document_record(
        user_id=user["uid"], filename=file.filename or "document.pdf",
        page_count=page_count, chunk_count=len(chunks), file_size_bytes=len(file_bytes),
        file_hash=file_hash
    )
    try:
        store_chunks(document_id=doc_record["id"], user_id=user["uid"],
                     filename=file.filename or "document.pdf", chunks=chunks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to index document: {str(e)}")
    return {"success": True, "document": doc_record, "chunk_count": len(chunks), "page_count": page_count}