import chromadb
from chromadb.config import Settings as ChromaSettings
import google.generativeai as genai
from config import settings
from typing import List, Dict, Any

_chroma_client = None
_collection = None

def _init_genai():
    genai.configure(api_key=settings.GEMINI_API_KEY)

def get_chroma_collection():
    global _chroma_client, _collection
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIR,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
    if _collection is None:
        _collection = _chroma_client.get_or_create_collection(
            name=settings.CHROMA_COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
    return _collection

def embed_texts(texts: List[str]) -> List[List[float]]:
    _init_genai()
    embeddings = []
    for text in texts:
        result = genai.embed_content(
            model=settings.EMBEDDING_MODEL,
            content=text,
            task_type="retrieval_document",
        )
        embeddings.append(result["embedding"])
    return embeddings

def embed_query(text: str) -> List[float]:
    _init_genai()
    result = genai.embed_content(
        model=settings.EMBEDDING_MODEL,
        content=text,
        task_type="retrieval_query",
    )
    return result["embedding"]

def store_chunks(document_id: str, user_id: str, filename: str, chunks: List[str]) -> int:
    collection = get_chroma_collection()
    embeddings = embed_texts(chunks)
    ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [
        {"document_id": document_id, "user_id": user_id, "filename": filename, "chunk_index": i}
        for i in range(len(chunks))
    ]
    collection.add(ids=ids, embeddings=embeddings, documents=chunks, metadatas=metadatas)
    return len(chunks)

def retrieve_chunks(query: str, user_id: str, document_id: str | None = None, n_results: int | None = None) -> List[Dict[str, Any]]:
    collection = get_chroma_collection()
    n = n_results or settings.MAX_RETRIEVED_CHUNKS
    query_embedding = embed_query(query)
    where: Dict[str, Any] = {"user_id": user_id}
    if document_id:
        where = {"$and": [{"user_id": user_id}, {"document_id": document_id}]}
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n,
        where=where,
        include=["documents", "metadatas", "distances"],
    )
    chunks = []
    for i, doc in enumerate(results["documents"][0]):
        chunks.append({
            "text": doc,
            "metadata": results["metadatas"][0][i],
            "score": 1 - results["distances"][0][i],
        })
    return chunks

def delete_document_chunks(document_id: str) -> None:
    collection = get_chroma_collection()
    results = collection.get(where={"document_id": document_id})
    if results["ids"]:
        collection.delete(ids=results["ids"])