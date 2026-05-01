from firebase_admin import firestore
from typing import List, Dict, Any
import uuid
from datetime import datetime, timezone

_db = None

def get_db():
    global _db
    if _db is None:
        _db = firestore.client()
    return _db

def create_document_record(user_id, filename, page_count, chunk_count, file_size_bytes):
    db = get_db()
    doc_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    data = {
        "id": doc_id, "user_id": user_id, "filename": filename,
        "page_count": page_count, "chunk_count": chunk_count,
        "file_size_bytes": file_size_bytes, "status": "ready",
        "created_at": now, "updated_at": now,
    }
    get_db().collection("documents").document(doc_id).set(data)
    return data

def get_user_documents(user_id: str):
    db = get_db()
    docs = db.collection("documents").where("user_id", "==", user_id).stream()
    doc_list = [doc.to_dict() for doc in docs]
    # Sort by created_at descending in Python to avoid needing a composite index
    return sorted(doc_list, key=lambda x: x.get("created_at", ""), reverse=True)

def get_document(document_id: str, user_id: str):
    db = get_db()
    ref = db.collection("documents").document(document_id).get()
    if not ref.exists:
        return None
    data = ref.to_dict()
    if data.get("user_id") != user_id:
        return None
    return data

def delete_document_record(document_id: str, user_id: str) -> bool:
    if not get_document(document_id, user_id):
        return False
    get_db().collection("documents").document(document_id).delete()
    return True

def save_chat_message(user_id, document_id, question, answer, sources):
    db = get_db()
    chat_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    data = {
        "id": chat_id, "user_id": user_id, "document_id": document_id,
        "question": question, "answer": answer, "sources": sources, "created_at": now,
    }
    db.collection("chat_history").document(chat_id).set(data)
    return data

def get_chat_history(user_id: str, document_id=None, limit: int = 20):
    db = get_db()
    query = db.collection("chat_history").where("user_id", "==", user_id)
    if document_id:
        query = query.where("document_id", "==", document_id)
    
    # We fetch without order_by to avoid composite index requirements
    # Then sort and limit in Python
    chats_data = query.stream()
    chat_list = [c.to_dict() for c in chats_data]
    
    # Sort by created_at descending
    sorted_chats = sorted(chat_list, key=lambda x: x.get("created_at", ""), reverse=True)
    
    # Take the limit and then reverse back for chronological order in UI
    return list(reversed(sorted_chats[:limit]))