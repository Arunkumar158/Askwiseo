from fastapi import APIRouter, Depends
from auth import get_current_user

router = APIRouter()

@router.get("/")
async def list_documents(current_user: dict = Depends(get_current_user)):
    return {"documents": []}
    
@router.get("/{document_id}")
async def get_document(document_id: str, current_user: dict = Depends(get_current_user)):
    return {"id": document_id, "title": "Sample Document"}
