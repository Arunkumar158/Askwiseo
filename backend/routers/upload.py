from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from auth import get_current_user
from services.pdf_service import extract_text_from_pdf, chunk_text, get_page_count
from services.vector_store import store_chunks
from services.db_service import create_document_record, get_document_by_hash, count_user_documents
from services.ai_service import generate_document_summary
from config import settings
import cloudinary
import cloudinary.uploader
import hashlib
import uuid
import traceback
import datetime
import io

router = APIRouter()

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...), user: dict = Depends(get_current_user)):  # noqa: E501
    try:
        return await _upload_pdf_impl(file, user)
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()  # prints full stack trace to uvicorn terminal
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

async def _upload_pdf_impl(file: UploadFile, user: dict):
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

    # Plan Limits Check
    doc_count = count_user_documents(user["uid"])
    if doc_count >= 10:
        raise HTTPException(
            status_code=403, 
            detail=f"Free plan limit reached. You have uploaded {doc_count} PDFs. Please upgrade to Pro for unlimited uploads."
        )

    # Generate document ID and upload to Cloudinary (Optional)
    doc_id = str(uuid.uuid4())
    file_url = None
    
    try:
        # Initialize Cloudinary if credentials exist
        if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET,
                secure=True
            )
            
            response = cloudinary.uploader.upload(
                io.BytesIO(file_bytes),
                resource_type="raw",
                public_id=f"{doc_id}.pdf",
                folder=f"askwiseo/uploads/{user['uid']}"
            )
            file_url = response.get("secure_url")
        else:
            print("WARNING: Cloudinary credentials not configured. Skipping upload.")
    except Exception as e:
        print(f"WARNING: Cloudinary upload failed (pipeline continuing): {str(e)}")
        # We continue without file_url - the indexing and record creation will still work.

    try:
        text = extract_text_from_pdf(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse PDF: {str(e)}")
    
    if not text.strip():
        raise HTTPException(status_code=422, detail="PDF has no extractable text (image-only PDF not supported).")
    
    page_count = get_page_count(file_bytes)
    chunks = chunk_text(text)
    filename = file.filename or "document.pdf"

    # Generate summary and topics
    insights = generate_document_summary(filename=filename, text=text)

    doc_record = create_document_record(
        user_id=user["uid"],
        filename=filename,
        page_count=page_count,
        chunk_count=len(chunks),
        file_size_bytes=len(file_bytes),
        file_hash=file_hash,
        summary=insights.get("summary", ""),
        key_topics=insights.get("key_topics", []),
        document_type=insights.get("document_type", "Other"),
        action_items=insights.get("action_items", []),
        file_url=file_url,
        doc_id=doc_id,
    )
    try:
        store_chunks(document_id=doc_record["id"], user_id=user["uid"],
                     filename=filename, chunks=chunks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to index document: {str(e)}")
    return {"success": True, "document": doc_record, "chunk_count": len(chunks), "page_count": page_count}