from fastapi import APIRouter, Depends, HTTPException
from auth import get_current_user
from services.db_service import get_user_documents, get_document, delete_document_record
from services.vector_store import delete_document_chunks

router = APIRouter()

@router.get("/documents")
async def list_documents(user: dict = Depends(get_current_user)):
    docs = get_user_documents(user_id=user["uid"])
    return {"documents": docs, "count": len(docs)}

@router.get("/documents/{document_id}")
async def get_document_detail(document_id: str, user: dict = Depends(get_current_user)):
    doc = get_document(document_id=document_id, user_id=user["uid"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc

@router.delete("/documents/{document_id}")
async def delete_document(document_id: str, user: dict = Depends(get_current_user)):
    doc = get_document(document_id=document_id, user_id=user["uid"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    delete_document_chunks(document_id=document_id)
    delete_document_record(document_id=document_id, user_id=user["uid"])
    return {"success": True, "deleted_id": document_id}