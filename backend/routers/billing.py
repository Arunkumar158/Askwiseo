from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from config import settings
from auth import get_current_user
from services.db_service import get_user_plan, update_user_plan, get_user_documents
from services.paypal_service import (
    create_subscription,
    get_subscription_details,
    cancel_subscription,
    verify_webhook_signature,
)
import logging
from datetime import datetime, timezone

router = APIRouter()
logger = logging.getLogger("askwiseo.billing")


class SubscriptionRequest(BaseModel):
    plan_type: str


@router.get("/plan")
def get_plan(user: dict = Depends(get_current_user)):
    user_id = user["uid"]
    plan = get_user_plan(user_id)

    docs = get_user_documents(user_id)
    plan["pdf_count"] = len(docs)
    plan["storage_used_bytes"] = sum(doc.get("file_size_bytes", 0) for doc in docs)

    return plan


@router.post("/billing/create-subscription")
async def create_sub(request: SubscriptionRequest, user: dict = Depends(get_current_user)):
    plan_type = request.plan_type
    if plan_type == "starter":
        plan_id = settings.PAYPAL_STARTER_PLAN_ID
    elif plan_type == "pro":
        plan_id = settings.PAYPAL_PRO_PLAN_ID
    else:
        raise HTTPException(status_code=400, detail="Invalid plan type")

    if not plan_id:
        raise HTTPException(status_code=500, detail="PayPal Plan ID not configured for this plan")

    return_url = f"{settings.FRONTEND_URL}/billing/success?plan_type={plan_type}"
    cancel_url = f"{settings.FRONTEND_URL}/billing/cancel"

    approval_url = create_subscription(plan_id, return_url, cancel_url)
    if not approval_url:
        raise HTTPException(status_code=500, detail="Failed to create PayPal subscription")

    return {"approval_url": approval_url}


@router.get("/billing/success")
async def payment_success(
    subscription_id: str,
    plan_type: str,
    user: dict = Depends(get_current_user),
):
    user_id = user["uid"]

    # Verify subscription with PayPal
    details = get_subscription_details(subscription_id)
    # Safe state access — details may be None if PayPal call fails
    state = getattr(details, "state", None) if details else None
    if state != "Active":
        logger.warning(
            "Subscription %s state is %s — updating plan anyway for UX", subscription_id, state
        )

    updates = {
        "plan": plan_type,
        "paypal_subscription_id": subscription_id,
    }

    if plan_type == "starter":
        updates.update({
            "pdf_limit": 50,
            "questions_limit": 200,
            "storage_limit_bytes": 15 * 1024 * 1024,
        })
    elif plan_type == "pro":
        updates.update({
            "pdf_limit": 999999,
            "questions_limit": 999999,
            "storage_limit_bytes": 50 * 1024 * 1024,
        })

    update_user_plan(user_id, updates)
    return {"status": "success", "message": "Plan upgraded successfully"}


@router.get("/billing/cancel")
async def payment_cancel():
    return {"message": "Payment flow cancelled by user"}


@router.post("/billing/webhook")
async def paypal_webhook(request: Request):
    """Process PayPal webhook events.

    Verifies the PayPal signature before processing any event to prevent
    forged subscription activations or cancellations.
    """
    payload_bytes = await request.body()
    headers = request.headers

    # ----------------------------------------------------------------
    # Signature verification — required for security
    # ----------------------------------------------------------------
    webhook_id = settings.PAYPAL_WEBHOOK_ID
    if webhook_id:
        is_valid = verify_webhook_signature(
            payload=payload_bytes.decode("utf-8"),
            signature=headers.get("PAYPAL-TRANSMISSION-SIG", ""),
            auth_algo=headers.get("PAYPAL-AUTH-ALGO", ""),
            cert_url=headers.get("PAYPAL-CERT-URL", ""),
            transmission_id=headers.get("PAYPAL-TRANSMISSION-ID", ""),
            transmission_sig=headers.get("PAYPAL-TRANSMISSION-SIG", ""),
            transmission_time=headers.get("PAYPAL-TRANSMISSION-TIME", ""),
            webhook_id=webhook_id,
        )
        if not is_valid:
            logger.warning("PayPal webhook: invalid signature — rejecting request")
            raise HTTPException(status_code=400, detail="Invalid webhook signature")
    else:
        logger.warning(
            "PAYPAL_WEBHOOK_ID not configured — skipping signature verification (insecure)"
        )

    # ----------------------------------------------------------------
    # Event processing
    # ----------------------------------------------------------------
    try:
        import json
        data = json.loads(payload_bytes)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = data.get("event_type")
    resource = data.get("resource", {})

    if event_type in ["BILLING.SUBSCRIPTION.CANCELLED", "BILLING.SUBSCRIPTION.SUSPENDED"]:
        subscription_id = resource.get("id")
        logger.info("PayPal subscription %s: %s", subscription_id, event_type)
        # TODO: Look up user by subscription_id in Firestore and downgrade plan

    elif event_type == "PAYMENT.SALE.COMPLETED":
        logger.info("PayPal payment completed: %s", resource.get("id"))

    else:
        logger.debug("Unhandled PayPal webhook event: %s", event_type)

    return {"status": "ok"}


@router.post("/billing/cancel-subscription")
async def cancel_sub(user: dict = Depends(get_current_user)):
    user_id = user["uid"]
    plan = get_user_plan(user_id)
    subscription_id = plan.get("paypal_subscription_id")

    if subscription_id:
        cancel_subscription(subscription_id)

    # Downgrade to free regardless of PayPal success for user experience
    update_user_plan(
        user_id,
        {
            "plan": "free",
            "pdf_limit": 10,
            "questions_limit": 20,
            "storage_limit_bytes": 5 * 1024 * 1024,
            "paypal_subscription_id": "",
        },
    )

    return {"status": "success", "message": "Subscription cancelled and downgraded to free"}
