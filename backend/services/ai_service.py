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

def generate_answer(question: str, user_id: str, document_id=None, chat_history=None):
    genai.configure(api_key=settings.GEMINI_API_KEY)

    chunks = retrieve_chunks(query=question, user_id=user_id, document_id=document_id)

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