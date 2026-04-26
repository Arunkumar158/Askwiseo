from fastapi import APIRouter, Depends
from pydantic import BaseModel
from auth import get_current_user

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    document_id: str | None = None

@router.post("/")
async def chat(
    message: ChatMessage,
    current_user: dict = Depends(get_current_user)
):
    return {"response": f"Echo: {message.message}"}
