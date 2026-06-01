import logging
import traceback
import os
from google import genai

from config import settings
from typing import List, Dict, Any
from fastapi.concurrency import run_in_threadpool

logger = logging.getLogger("askwiseo.vector_store")
_genai_client = None

# Embedding utilities (still use Gemini embeddings)

def _get_genai_client() -> genai.Client:
    """Initialize and cache a genai.Client using the GEMINI API key.

    The key can be provided via the environment variable ``GEMINI_API_KEY``
    or through ``settings.GEMINI_API_KEY``. The client is cached in the module
    level ``_genai_client`` variable for reuse.
    """
    global _genai_client
    if _genai_client is None:
        # Prefer environment variable for security; fallback to settings.
        api_key = os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", None)
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set")
        _genai_client = genai.Client(api_key=api_key)
    return _genai_client





def _get_model_name() -> str:
    """Gets the embedding model name and normalizes it to start with 'models/' exactly once."""
    model_name = getattr(settings, "EMBEDDING_MODEL", "models/gemini-embedding-2")
    if not model_name:
        model_name = "models/gemini-embedding-2"
    model_name = model_name.strip()
    
    # Strip any leading 'models/' first to normalize, then prefix with 'models/'
    while model_name.startswith("models/"):
        model_name = model_name[len("models/"):]
        
    return f"models/{model_name}"


def embed_texts(texts: List[str]) -> List[List[float]]:
    client = _get_genai_client()
    model_name = _get_model_name()
    response = client.models.embed_content(
        model=model_name,
        contents=texts,
        config={"task_type": "retrieval_document", "output_dimensionality": 768}
    )
    return [e.values for e in response.embeddings]


def embed_query(text: str) -> List[float]:
    client = _get_genai_client()
    model_name = _get_model_name()
    response = client.models.embed_content(
        model=model_name,
        contents=text,
        config={"task_type": "retrieval_query", "output_dimensionality": 768}
    )
    return response.embeddings[0].values

# ---------------------------------------------------------------------
# Pinecone integration – delegate storage/retrieval to pinecone_service
# ---------------------------------------------------------------------

from services.pinecone_service import (
    upsert_document_chunks,
    delete_document,
    query_vectors,
)

async def store_chunks(document_id: str, user_id: str, filename: str, chunks: List[str]) -> int:
    """Generate embeddings for chunks and upsert them into Pinecone.

    Returns the number of chunks indexed.
    """
    try:
        embeddings = embed_texts(chunks)
    except Exception as exc:
        logger.error(
            "Embedding generation failed for file %s (ID: %s) of user %s: %s\n%s",
            filename,
            document_id,
            user_id,
            exc,
            traceback.format_exc()
        )
        raise ValueError(f"Failed to generate embeddings for document: {exc}")

    await upsert_document_chunks(
        document_id=document_id,
        user_id=user_id,
        filename=filename,
        chunks=chunks,
        embeddings=embeddings,
    )
    return len(chunks)

async def retrieve_chunks(
    query: str,
    user_id: str,
    document_id: str | None = None,
    n_results: int | None = None,
) -> List[Dict[str, Any]]:
    """Retrieve relevant chunks from Pinecone based on a query.

    Returns a list of dicts with ``text``, ``metadata`` and ``score``.
    """
    try:
        query_emb = embed_query(query)
    except Exception as exc:
        logger.error("Failed to generate query embedding: %s\n%s", exc, traceback.format_exc())
        return []  # Graceful fallback — generate_answer handles empty chunks

    filter_dict: Dict[str, Any] = {"user_id": user_id}
    if document_id:
        filter_dict["document_id"] = document_id
    top_k = n_results or settings.MAX_RETRIEVED_CHUNKS

    try:
        matches = await query_vectors(
            query_embedding=query_emb,
            namespace=user_id,
            top_k=top_k,
            filter=filter_dict,
        )
    except Exception as exc:
        logger.error("Pinecone query failed: %s\n%s", exc, traceback.format_exc())
        return []  # Graceful fallback — generate_answer handles empty chunks

    # Transform Pinecone matches into the legacy format
    chunks: List[Dict[str, Any]] = []
    for m in matches:
        metadata = m.get("metadata", {})
        chunks.append(
            {
                "text": metadata.get("text", ""),
                "metadata": metadata,
                "score": m.get("score", 0),  # Pinecone cosine already returns similarity
            }
        )
    return chunks

async def delete_document_chunks(document_id: str, user_id: str) -> None:
    """Delete all vectors for a document belonging to a user."""
    await delete_document(document_id=document_id, user_id=user_id)