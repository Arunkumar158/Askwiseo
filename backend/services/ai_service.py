import google.generativeai as genai
from config import settings
from services.vector_store import retrieve_chunks
from typing import List, Dict, Any

SYSTEM_PROMPT = """You are Askwiseo, an AI assistant that answers questions based strictly on the provided document context.
- Answer ONLY using the provided context. Do not hallucinate.
- If the answer is not in the context, say: "I couldn't find that information in the uploaded documents."
- Be concise and accurate. Use markdown formatting where helpful.
- Mention which document the information comes from when relevant.
"""

def build_context(chunks: List[Dict[str, Any]]) -> str:
    parts = []
    for i, chunk in enumerate(chunks, 1):
        filename = chunk["metadata"].get("filename", "Unknown")
        parts.append(f"[Source {i} — {filename}]\n{chunk['text']}")
    return "\n\n---\n\n".join(parts)

async def generate_answer(question: str, user_id: str, document_id=None, chat_history=None):
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set")
    genai.configure(api_key=settings.GEMINI_API_KEY)

    chunks = await retrieve_chunks(query=question, user_id=user_id, document_id=document_id)

    if not chunks:
        return {
            "answer": "I couldn't find any relevant documents. Please upload some PDFs first.",
            "sources": [],
        }

    context = build_context(chunks)

    # Build conversation history for multi-turn
    history = []
    if chat_history:
        for turn in chat_history[-6:]:
            history.append({"role": "user", "parts": [turn["question"]]})
            history.append({"role": "model", "parts": [turn["answer"]]})

    model = genai.GenerativeModel(
        model_name=settings.CHAT_MODEL,
        system_instruction=SYSTEM_PROMPT,
    )

    chat = model.start_chat(history=history)

    prompt = f"Context from documents:\n\n{context}\n\n---\n\nQuestion: {question}"
    response = chat.send_message(prompt)
    answer = response.text

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
    """
    Generate a summary and extract key topics from document text.
    Called automatically after PDF upload.
    """
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set")
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
    # Use first 3000 chars for summary (cost efficient)
    sample_text = text[:3000]
    
    model = genai.GenerativeModel(
        model_name=settings.CHAT_MODEL,
        system_instruction="You are a business document analyst. Be concise and professional."
    )
    
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
        response = model.generate_content(prompt)
        import json
        # Clean response text
        text_response = response.text.strip()
        if text_response.startswith("```"):
            text_response = text_response.split("```")[1]
            if text_response.startswith("json"):
                text_response = text_response[4:]
        return json.loads(text_response.strip())
    except Exception as e:
        return {
            "summary": f"Document uploaded successfully: {filename}",
            "key_topics": [],
            "document_type": "Other",
            "action_items": []
        }
    