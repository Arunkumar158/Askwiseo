import logging
import traceback

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from auth import get_current_user
from services.ai_service import generate_answer
from services.db_service import save_chat_message, get_chat_history, get_user_plan, get_question_count_today, increment_questions_today

logger = logging.getLogger("askwiseo.chat")

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

    # ---- plan / quota check ----
    try:
        questions_today = get_question_count_today(user_id)
        plan = get_user_plan(user_id)
    except Exception as exc:
        logger.error("Failed to fetch user plan: %s\n%s", exc, traceback.format_exc())
        raise HTTPException(status_code=500, detail="Unable to check your usage quota. Please try again.")

    if questions_today >= plan.get("questions_limit", 20):
        raise HTTPException(status_code=403, detail="Daily question limit reached. Upgrade your plan for more questions.")

    # ---- chat history ----
    history = []
    if body.include_history:
        try:
            history = get_chat_history(user_id=user_id, document_id=body.document_id, limit=6)
        except Exception as exc:
            logger.warning("Failed to load chat history (non-fatal): %s", exc)
            history = []

    # ---- generate answer (Pinecone + Gemini) ----
    try:
        result = await generate_answer(
            question=body.question,
            user_id=user_id,
            document_id=body.document_id,
            chat_history=history,
        )
    except ValueError as exc:
        # Missing API key or config issue
        logger.error("Configuration error in generate_answer: %s", exc)
        raise HTTPException(status_code=503, detail="AI service is not configured. Please contact support.")
    except Exception as exc:
        logger.error("generate_answer failed: %s\n%s", exc, traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate answer. Please try again. (Error: {type(exc).__name__})",
        )

    # ---- persist chat ----
    try:
        saved = save_chat_message(
            user_id=user_id,
            document_id=body.document_id,
            question=body.question,
            answer=result["answer"],
            sources=result["sources"],
        )
        increment_questions_today(user_id)
    except Exception as exc:
        logger.error("Failed to save chat message: %s\n%s", exc, traceback.format_exc())
        # Still return the answer even if persistence fails
        early: dict = {"answer": result["answer"], "sources": result["sources"], "chat_id": None}
        if result.get("error_code"):
            early["error_code"] = result["error_code"]
        return early

    response_payload: dict = {
        "answer": result["answer"],
        "sources": result["sources"],
        "chat_id": saved["id"],
    }
    if result.get("error_code"):
        response_payload["error_code"] = result["error_code"]
    return response_payload

@router.get("/chat/history")
async def chat_history(document_id: Optional[str] = None, limit: int = 20,
                        user: dict = Depends(get_current_user)):
    try:
        history = get_chat_history(user_id=user["uid"], document_id=document_id, limit=limit)
    except Exception as exc:
        logger.error("Failed to fetch chat history: %s\n%s", exc, traceback.format_exc())
        raise HTTPException(status_code=500, detail="Failed to load chat history. Please try again.")
    return {"history": history}