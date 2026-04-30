from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from auth import get_current_user
from services.ai_service import generate_answer
from services.db_service import save_chat_message, get_chat_history

router = APIRouter()

class ChatRequest(BaseModel):
    question: str
    document_id: Optional[str] = None
    include_history: bool = True

@router.post("/chat")
async def chat(body: ChatRequest, user: dict = Depends(get_current_user)):
    if not body.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    user_id = user["uid"]
    history = get_chat_history(user_id=user_id, document_id=body.document_id, limit=6) if body.include_history else []
    result = generate_answer(question=body.question, user_id=user_id,
                             document_id=body.document_id, chat_history=history)
    saved = save_chat_message(user_id=user_id, document_id=body.document_id,
                              question=body.question, answer=result["answer"], sources=result["sources"])
    return {"answer": result["answer"], "sources": result["sources"], "chat_id": saved["id"]}

@router.get("/chat/history")
async def chat_history(document_id: Optional[str] = None, limit: int = 20,
                        user: dict = Depends(get_current_user)):
    history = get_chat_history(user_id=user["uid"], document_id=document_id, limit=limit)
    return {"history": history}