import logging
import traceback
import os
from typing import List, Dict, Any

from google import genai
from fastapi.concurrency import run_in_threadpool

from config import settings
from cache import _embed_cache, _retrieve_cache, cache_key, get_from_cache, set_in_cache

logger = logging.getLogger("askwiseo.vector_store")
_genai_client = None


# ---------------------------------------------------------------------------
# Gemini Embedding client
# ---------------------------------------------------------------------------

def _get_genai_client() -> genai.Client:
    """Initialize and cache a genai.Client using the GEMINI API key."""
    global _genai_client
    if _genai_client is None:
        # Prefer environment variable for security; fallback to settings.
        api_key = os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", None)
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set")
        _genai_client = genai.Client(api_key=api_key)
    return _genai_client


def _get_model_name() -> str:
    """Gets the embedding model name and normalises it to start with 'models/' exactly once."""
    model_name = getattr(settings, "EMBEDDING_MODEL", "models/gemini-embedding-2")
    if not model_name:
        model_name = "models/gemini-embedding-2"
    model_name = model_name.strip()
    # Strip any leading 'models/' first to normalize, then prefix with 'models/'
    while model_name.startswith("models/"):
        model_name = model_name[len("models/"):]
    return f"models/{model_name}"


# ---------------------------------------------------------------------------
# Synchronous embedding helpers (always called via run_in_threadpool)
# ---------------------------------------------------------------------------

def _embed_texts_sync(texts: List[str]) -> List[List[float]]:
    """Blocking call — must be called via run_in_threadpool."""
    client = _get_genai_client()
    model_name = _get_model_name()
    response = client.models.embed_content(
        model=model_name,
        contents=texts,
        config={"task_type": "retrieval_document", "output_dimensionality": 768},
    )
    return [e.values for e in response.embeddings]


def _embed_query_sync(text: str) -> List[float]:
    """Blocking call — must be called via run_in_threadpool."""
    client = _get_genai_client()
    model_name = _get_model_name()
    response = client.models.embed_content(
        model=model_name,
        contents=text,
        config={"task_type": "retrieval_query", "output_dimensionality": 768},
    )
    return response.embeddings[0].values


# ---------------------------------------------------------------------------
# Public async wrappers (non-blocking)
# ---------------------------------------------------------------------------

async def embed_texts(texts: List[str]) -> List[List[float]]:
    """Generate document embeddings asynchronously (does NOT block the event loop).

    Results are cached for 5 minutes to reduce Gemini API costs on repeated uploads.
    Large text lists are chunked into batches of 50 to respect API limits.
    """
    BATCH_SIZE = 50
    all_embeddings: List[List[float]] = []

    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i : i + BATCH_SIZE]
        # Build a cache key for this batch
        key = cache_key("embed_texts", *batch)
        cached = get_from_cache(_embed_cache, key)
        if cached is not None:
            all_embeddings.extend(cached)
            continue
        result = await run_in_threadpool(_embed_texts_sync, batch)
        set_in_cache(_embed_cache, key, result)
        all_embeddings.extend(result)

    return all_embeddings


async def embed_query(text: str) -> List[float]:
    """Generate a query embedding asynchronously (does NOT block the event loop).

    Results are cached for 5 minutes.
    """
    key = cache_key("embed_query", text)
    cached = get_from_cache(_embed_cache, key)
    if cached is not None:
        return cached
    result = await run_in_threadpool(_embed_query_sync, text)
    set_in_cache(_embed_cache, key, result)
    return result


# ---------------------------------------------------------------------------
# Pinecone integration — delegate storage/retrieval to pinecone_service
# ---------------------------------------------------------------------------

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
        embeddings = await embed_texts(chunks)
    except Exception as exc:
        logger.error(
            "Embedding generation failed for file %s (ID: %s) of user %s: %s\n%s",
            filename,
            document_id,
            user_id,
            exc,
            traceback.format_exc(),
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
    Results are cached for 5 minutes.
    """
    top_k = n_results or settings.MAX_RETRIEVED_CHUNKS

    # Check retrieve cache first
    r_key = cache_key("retrieve", query, user_id, document_id, top_k)
    cached_chunks = get_from_cache(_retrieve_cache, r_key)
    if cached_chunks is not None:
        return cached_chunks

    try:
        query_emb = await embed_query(query)
    except Exception as exc:
        logger.error("Failed to generate query embedding: %s\n%s", exc, traceback.format_exc())
        return []  # Graceful fallback — generate_answer handles empty chunks

    filter_dict: Dict[str, Any] = {"user_id": user_id}
    if document_id:
        filter_dict["document_id"] = document_id

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
                "score": m.get("score", 0),
            }
        )

    set_in_cache(_retrieve_cache, r_key, chunks)
    return chunks


async def delete_document_chunks(document_id: str, user_id: str) -> None:
    """Delete all vectors for a document belonging to a user."""
    await delete_document(document_id=document_id, user_id=user_id)