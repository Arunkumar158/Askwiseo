import logging
import traceback
from typing import List, Dict, Any

from pinecone import Pinecone, ServerlessSpec
from fastapi.concurrency import run_in_threadpool

from config import settings

logger = logging.getLogger("askwiseo.pinecone")

# -----------------------------------------------------------------------------
# Initialization
# -----------------------------------------------------------------------------

def _init_pinecone():
    """Initialize Pinecone client and return the index instance.

    This function is idempotent – it will create the index if it does not exist.
    The index is configured for dense vectors with dimension 768 and cosine metric
    as required by the migration plan.

    Uses the Pinecone v3+ SDK which requires instantiating a ``Pinecone`` client
    object rather than calling the legacy ``pinecone.init()`` function.
    """
    missing_vars = []
    if not settings.PINECONE_API_KEY:
        missing_vars.append("PINECONE_API_KEY")
    if not settings.PINECONE_INDEX_NAME:
        missing_vars.append("PINECONE_INDEX_NAME")
    has_env = bool(settings.PINECONE_ENVIRONMENT)
    has_cloud_region = bool(settings.PINECONE_CLOUD) and bool(settings.PINECONE_REGION)
    if not has_env and not has_cloud_region:
        missing_vars.append("PINECONE_ENVIRONMENT (or both PINECONE_CLOUD + PINECONE_REGION)")
    if missing_vars:
        logger.warning(
            "Pinecone configuration is incomplete. Missing: %s. "
            "Vector store will be unavailable until these Render Environment Variables are set.",
            ", ".join(missing_vars),
        )
        return None

    try:
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)

        # Check if the index already exists (v5 SDK: items support dict-style access)
        existing_indexes = [idx["name"] for idx in pc.list_indexes()]

        if settings.PINECONE_INDEX_NAME not in existing_indexes:
            cloud = settings.PINECONE_CLOUD or "aws"
            region = settings.PINECONE_REGION or "us-east-1"
            logger.info("Creating Pinecone index '%s' on %s/%s", settings.PINECONE_INDEX_NAME, cloud, region)
            pc.create_index(
                name=settings.PINECONE_INDEX_NAME,
                dimension=768,
                metric="cosine",
                spec=ServerlessSpec(cloud=cloud, region=region),
            )

        return pc.Index(settings.PINECONE_INDEX_NAME)
    except Exception as exc:
        logger.error("Pinecone initialization failed: %s\n%s", exc, traceback.format_exc())
        raise RuntimeError(f"Pinecone initialization failed: {exc}") from exc

# Cache the index singleton
_pinecone_index = None
# Track whether initialization has been attempted
_init_attempted = False

def get_index():
    global _pinecone_index, _init_attempted
    if not _init_attempted:
        _pinecone_index = _init_pinecone()
        _init_attempted = True
    return _pinecone_index


def is_initialized() -> bool:
    """Return True if the Pinecone index is available and ready.

    Use this to distinguish a vector-store configuration failure from a
    legitimate "no documents found" result.
    """
    return get_index() is not None

# -----------------------------------------------------------------------------
# Public async‑friendly API
# -----------------------------------------------------------------------------

async def upsert_vectors(
    ids: List[str],
    embeddings: List[List[float]],
    metadatas: List[Dict[str, Any]],
    namespace: str,
) -> None:
    """Upsert a batch of vectors into Pinecone.

    Args:
        ids: Unique identifiers for the vectors (e.g. "doc123_chunk_0").
        embeddings: List of 768‑dim float vectors.
        metadatas: Corresponding metadata dictionaries.
        namespace: Pinecone namespace – we use the Firebase ``user_id`` to isolate
            each user's data.
    """
    index = get_index()
    if index is None:
        logger.warning("Pinecone is not initialized. Skipping upsert.")
        return

    vectors = [(vid, vec, meta) for vid, vec, meta in zip(ids, embeddings, metadatas)]
    await run_in_threadpool(index.upsert, vectors=vectors, namespace=namespace)


async def query_vectors(
    query_embedding: List[float],
    namespace: str,
    top_k: int = 5,
    filter: Dict[str, Any] | None = None,
) -> List[Dict[str, Any]]:
    """Query Pinecone for the nearest neighbours.

    Returns a list of matches where each entry contains ``id``, ``score``, ``metadata`` and ``values``.
    """
    index = get_index()
    if index is None:
        logger.warning("Pinecone is not initialized. Returning empty query results.")
        return []

    try:
        response = await run_in_threadpool(
            index.query,
            vector=query_embedding,
            top_k=top_k,
            namespace=namespace,
            filter=filter,
            include_values=False,
            include_metadata=True,
        )
        return response.get("matches", [])
    except Exception as exc:
        logger.error("Pinecone query error: %s\n%s", exc, traceback.format_exc())
        raise


async def delete_by_ids(ids: List[str], namespace: str) -> None:
    """Delete specific vector IDs from a namespace."""
    index = get_index()
    if index is None:
        logger.warning("Pinecone is not initialized. Skipping delete.")
        return

    await run_in_threadpool(index.delete, ids=ids, namespace=namespace)


async def delete_by_filter(filter: Dict[str, Any], namespace: str) -> None:
    """Delete all vectors matching a metadata filter within a namespace."""
    index = get_index()
    if index is None:
        logger.warning("Pinecone is not initialized. Skipping delete.")
        return

    await run_in_threadpool(index.delete, filter=filter, namespace=namespace)

# -----------------------------------------------------------------------------
# Convenience wrappers used by ``vector_store.py``
# -----------------------------------------------------------------------------

async def upsert_document_chunks(
    document_id: str,
    user_id: str,
    filename: str,
    chunks: List[str],
    embeddings: List[List[float]],
) -> None:
    """Helper used by ``vector_store.store_chunks`` – builds metadata and calls ``upsert_vectors``."""
    ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [
        {
            "document_id": document_id,
            "user_id": user_id,
            "filename": filename,
            "chunk_index": i,
            "text": chunk,
        }
        for i, chunk in enumerate(chunks)
    ]
    await upsert_vectors(ids=ids, embeddings=embeddings, metadatas=metadatas, namespace=user_id)


async def delete_document(document_id: str, user_id: str) -> None:
    """Delete all chunks belonging to ``document_id`` for a given user."""
    await delete_by_filter({"document_id": document_id}, namespace=user_id)
