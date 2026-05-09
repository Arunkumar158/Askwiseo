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

def create_document_record(
    user_id: str,
    filename: str,
    page_count: int,
    chunk_count: int,
    file_size_bytes: int,
    file_hash: str = None,
    summary: str = "",
    key_topics: list = [],
    document_type: str = "Other",
    action_items: list = [],
) -> Dict[str, Any]:
    db = get_db()
    doc_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    data = {
        "id": doc_id,
        "user_id": user_id,
        "filename": filename,
        "page_count": page_count,
        "chunk_count": chunk_count,
        "file_size_bytes": file_size_bytes,
        "file_hash": file_hash,
        "status": "ready",
        "summary": summary,
        "key_topics": key_topics,
        "document_type": document_type,
        "action_items": action_items,
        "created_at": now,
        "updated_at": now,
    }
    db.collection("documents").document(doc_id).set(data)
    return data

def get_document_by_hash(user_id: str, file_hash: str):
    db = get_db()
    docs = db.collection("documents") \
        .where("user_id", "==", user_id) \
        .where("file_hash", "==", file_hash) \
        .limit(1).stream()
    
    for doc in docs:
        return doc.to_dict()
    return None

def count_user_documents(user_id: str) -> int:
    db = get_db()
    return db.collection("documents").where("user_id", "==", user_id).count().get()[0][0].value

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

def get_user_insights(user_id: str) -> Dict[str, Any]:
    db = get_db()
    docs = db.collection("documents").where("user_id", "==", user_id).stream()
    doc_list = [doc.to_dict() for doc in docs]
    
    total_pages = 0
    total_chunks = 0
    total_size = 0
    type_counts = {}
    topic_counts = {}
    all_action_items = []
    
    for doc in doc_list:
        total_pages += doc.get("page_count", 0)
        total_chunks += doc.get("chunk_count", 0)
        total_size += doc.get("file_size_bytes", 0)
        
        doc_type = doc.get("document_type", "Other")
        type_counts[doc_type] = type_counts.get(doc_type, 0) + 1
        
        for topic in doc.get("key_topics", []):
            topic_counts[topic] = topic_counts.get(topic, 0) + 1
            
        for item in doc.get("action_items", []):
            all_action_items.append({
                "text": item,
                "source": doc.get("filename", "Unknown"),
                "document_id": doc.get("id")
            })
            
    # Sort topics by count
    sorted_topics = [
        {"topic": t, "count": c} 
        for t, c in sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)
    ]
    
    return {
        "total_documents": len(doc_list),
        "total_pages": total_pages,
        "total_chunks": total_chunks,
        "total_size_bytes": total_size,
        "document_types": type_counts,
        "top_topics": sorted_topics[:15],
        "all_action_items": all_action_items
    }

def get_user_plan(user_id: str) -> Dict[str, Any]:
    db = get_db()
    ref = db.collection("user_plans").document(user_id).get()
    if not ref.exists:
        now = datetime.now(timezone.utc).isoformat()
        default_plan = {
            "user_id": user_id,
            "plan": "free",
            "pdf_limit": 10,
            "questions_limit": 20,
            "questions_today": 0,
            "storage_limit_bytes": 52428800,
            "last_question_date": now[:10],
            "billing_cycle_start": now,
            "razorpay_subscription_id": None
        }
        db.collection("user_plans").document(user_id).set(default_plan)
        return default_plan
    return ref.to_dict()

def update_user_plan(user_id: str, updates: Dict[str, Any]) -> None:
    db = get_db()
    db.collection("user_plans").document(user_id).set(updates, merge=True)

def increment_question_count(user_id: str) -> None:
    plan = get_user_plan(user_id)
    today = datetime.now(timezone.utc).isoformat()[:10]
    
    if plan.get("last_question_date") != today:
        updates = {
            "questions_today": 1,
            "last_question_date": today
        }
    else:
        updates = {
            "questions_today": plan.get("questions_today", 0) + 1
        }
    
    update_user_plan(user_id, updates)