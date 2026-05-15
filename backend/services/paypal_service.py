import paypalrestsdk
from config import settings
import logging
from datetime import datetime, timezone, timedelta

def configure_paypal():
    paypalrestsdk.configure({
        "mode": settings.PAYPAL_MODE,
        "client_id": settings.PAYPAL_CLIENT_ID,
        "client_secret": settings.PAYPAL_SECRET
    })

def create_subscription(plan_id: str, return_url: str, cancel_url: str):
    configure_paypal()
    
    # Create Billing Agreement (Subscription)
    # Note: In PayPal REST SDK v1, subscriptions are handled via Billing Plans and Agreements
    # This implementation assumes the plan_id is a PayPal Billing Plan ID
    
    agreement = paypalrestsdk.BillingAgreement({
        "name": "Askwiseo Subscription",
        "description": "Subscription for Askwiseo AI knowledge base",
        "start_date": (datetime.now(timezone.utc) + timedelta(minutes=5)).strftime('%Y-%m-%dT%H:%M:%SZ'),
        "plan": {
            "id": plan_id
        },
        "payer": {
            "payment_method": "paypal"
        }
    })

    if agreement.create():
        for link in agreement.links:
            if link.rel == "approval_url":
                return link.href
    else:
        logging.error(f"Error creating subscription: {agreement.error}")
        return None

def get_subscription_details(subscription_id: str):
    configure_paypal()
    try:
        # For Billing Agreements, we use find
        agreement = paypalrestsdk.BillingAgreement.find(subscription_id)
        return agreement
    except Exception as e:
        logging.error(f"Error fetching subscription details: {e}")
        return None

def cancel_subscription(subscription_id: str):
    configure_paypal()
    try:
        agreement = paypalrestsdk.BillingAgreement.find(subscription_id)
        if agreement.state == "Active":
            agreement.cancel({"note": "Cancelled by user"})
            return True
        return False
    except Exception as e:
        logging.error(f"Error cancelling subscription: {e}")
        return False

def verify_webhook_signature(payload: str, signature: str, auth_algo: str, cert_url: str, transmission_id: str, transmission_sig: str, transmission_time: str, webhook_id: str):
    configure_paypal()
    try:
        # PayPal webhook verification
        return paypalrestsdk.WebhookEvent.verify(
            transmission_id=transmission_id,
            timestamp=transmission_time,
            webhook_id=webhook_id,
            event_body=payload,
            cert_url=cert_url,
            actual_signature=transmission_sig,
            auth_algo=auth_algo
        )
    except Exception as e:
        logging.error(f"Webhook verification error: {e}")
        return False
