import json
import logging
import traceback
import os

from google import genai
from google.genai import types
from fastapi.concurrency import run_in_threadpool
from config import settings
from services.vector_store import retrieve_chunks
from services.pinecone_service import is_initialized as pinecone_is_initialized
from typing import List, Dict, Any

logger = logging.getLogger("askwiseo.ai")

SYSTEM_PROMPT = """You are Askwiseo, an AI assistant that answers questions based strictly on the provided document context.
- Answer ONLY using the provided context. Do not hallucinate.
- If the answer is not in the context, say: "I couldn't find that information in the uploaded documents."
- Be concise and accurate. Use markdown formatting where helpful.
- Mention which document the information comes from when relevant.
"""


def _get_genai_client() -> genai.Client:
    """Return a singleton genai.Client configured with the Gemini API key."""
    api_key = getattr(settings, "GEMINI_API_KEY", None) or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set")
    return genai.Client(api_key=api_key)


def build_context(chunks: List[Dict[str, Any]]) -> str:
    parts = []
    for i, chunk in enumerate(chunks, 1):
        filename = chunk["metadata"].get("filename", "Unknown")
        parts.append(f"[Source {i} — {filename}]\n{chunk['text']}")
    return "\n\n---\n\n".join(parts)


async def generate_answer(question: str, user_id: str, document_id=None, chat_history=None):
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set")

    # Check vector store health BEFORE embedding the query
    if not pinecone_is_initialized():
        logger.error(
            "generate_answer called but Pinecone vector store is not initialized. "
            "Check PINECONE_API_KEY, PINECONE_INDEX_NAME, and PINECONE_CLOUD/PINECONE_REGION "
            "environment variables on Render."
        )
        return {
            "answer": (
                "⚠️ The document search service is temporarily unavailable due to a "
                "server configuration issue. Please contact support — your documents are safe."
            ),
            "sources": [],
            "error_code": "VECTOR_STORE_UNAVAILABLE",
        }

    chunks = await retrieve_chunks(query=question, user_id=user_id, document_id=document_id)

    if not chunks:
        return {
            "answer": "I couldn't find any relevant documents. Please upload some PDFs first.",
            "sources": [],
        }

    context = build_context(chunks)

    # Build conversation history for multi-turn (new SDK format)
    history = []
    if chat_history:
        for turn in chat_history[-6:]:
            history.append(types.Content(role="user", parts=[types.Part(text=turn["question"])]))
            history.append(types.Content(role="model", parts=[types.Part(text=turn["answer"])]))

    client = _get_genai_client()
    prompt = f"Context from documents:\n\n{context}\n\n---\n\nQuestion: {question}"

    def _call_gemini():
        chat = client.chats.create(
            model=settings.CHAT_MODEL,
            config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
            history=history,
        )
        return chat.send_message(prompt)

    try:
        # Run the blocking Gemini HTTP call in a thread to avoid blocking the event loop
        response = await run_in_threadpool(_call_gemini)
        answer = response.text
    except Exception as exc:
        logger.error("Gemini API call failed: %s\n%s", exc, traceback.format_exc())
        raise RuntimeError(f"AI model request failed: {exc}") from exc

    sources = [
        {
            "filename": c["metadata"].get("filename"),
            "document_id": c["metadata"].get("document_id"),
            "chunk_index": c["metadata"].get("chunk_index"),
            "score": round(c["score"], 3),
            "excerpt": c["text"][:300] + "..." if len(c["text"]) > 300 else c["text"],
        }
        for c in chunks
    ]

    return {"answer": answer, "sources": sources}


def generate_document_summary(filename: str, text: str) -> dict:
    """Generate a summary and extract key topics from document text.

    Called automatically after PDF upload (wrapped in run_in_threadpool
    by the upload router so it does not block the event loop).
    """
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set")

    # Use first 3000 chars for summary (cost efficient)
    sample_text = text[:3000]

    prompt = f"""Analyze this document and respond ONLY with a valid JSON object, no markdown, no backticks:
{{
  "summary": "2-3 sentence summary of what this document is about",
  "key_topics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
  "document_type": "one of: Contract, Report, Resume, Invoice, Policy, Meeting Notes, Proposal, Other",
  "action_items": ["any deadlines or action items found, empty array if none"]
}}

Document name: {filename}
Document content: {sample_text}"""

    try:
        client = _get_genai_client()
        response = client.models.generate_content(
            model=settings.CHAT_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="You are a business document analyst. Be concise and professional."
            ),
        )
        # Clean response text — strip markdown code fences if present
        text_response = response.text.strip()
        if text_response.startswith("```"):
            text_response = text_response.split("```")[1]
            if text_response.startswith("json"):
                text_response = text_response[4:]
        return json.loads(text_response.strip())
    except Exception as e:
        logger.warning("Document summary generation failed for '%s': %s", filename, e)
        return {
            "summary": f"Document uploaded successfully: {filename}",
            "key_topics": [],
            "document_type": "Other",
            "action_items": [],
        }