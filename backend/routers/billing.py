from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from config import settings
from auth import get_current_user
from services.db_service import get_user_plan, update_user_plan, get_user_documents
import logging

router = APIRouter()

client = None # Disabled razorpay for now

PLAN_PRICING = {
    "starter": {"amount": 49900, "currency": "INR", "name": "Starter Plan"},
    "pro": {"amount": 149900, "currency": "INR", "name": "Pro Plan"}
}

class CreateOrderRequest(BaseModel):
    plan_id: str

@router.get("/plan")
def get_plan(user: dict = Depends(get_current_user)):
    user_id = user["uid"]
    plan = get_user_plan(user_id)
    
    docs = get_user_documents(user_id)
    plan["pdf_count"] = len(docs)
    plan["storage_used_bytes"] = sum(doc.get("file_size_bytes", 0) for doc in docs)
    
    return plan

@router.post("/billing/create-order")
async def create_order(request: CreateOrderRequest, user: dict = Depends(get_current_user)):
    if not client:
        raise HTTPException(status_code=500, detail="Razorpay is not configured")
        
    plan_id = request.plan_id
    if plan_id not in PLAN_PRICING:
        raise HTTPException(status_code=400, detail="Invalid plan ID")
    
    pricing = PLAN_PRICING[plan_id]
    
    try:
        order = client.order.create({
            "amount": pricing["amount"],
            "currency": pricing["currency"],
            "notes": {
                "user_id": user["uid"],
                "plan_id": plan_id
            }
        })
        return {"order_id": order["id"], "amount": order["amount"], "currency": order["currency"]}
    except Exception as e:
        logging.error(f"Error creating order: {e}")
        raise HTTPException(status_code=500, detail="Failed to create order")

@router.post("/billing/webhook")
async def razorpay_webhook(request: Request):
    if not client:
        raise HTTPException(status_code=500, detail="Razorpay is not configured")
        
    payload = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")
    
    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")
        
    try:
        client.utility.verify_webhook_signature(
            payload.decode("utf-8"), 
            signature, 
            settings.RAZORPAY_WEBHOOK_SECRET
        )
        
        data = await request.json()
        event = data.get("event")
        
        if event in ["payment.captured", "order.paid", "subscription.charged"]:
            payload_data = data.get("payload", {})
            payment = payload_data.get("payment", {}).get("entity", {})
            notes = payment.get("notes", {})
            
            user_id = notes.get("user_id")
            plan_id = notes.get("plan_id")
            
            if user_id and plan_id:
                updates = {"plan": plan_id}
                if plan_id == "starter":
                    updates.update({
                        "pdf_limit": 50,
                        "questions_limit": 200,
                        "storage_limit_bytes": 15 * 1024 * 1024
                    })
                elif plan_id == "pro":
                    updates.update({
                        "pdf_limit": 999999,
                        "questions_limit": 999999,
                        "storage_limit_bytes": 50 * 1024 * 1024
                    })
                
                update_user_plan(user_id, updates)
                
        return {"status": "ok"}
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")
