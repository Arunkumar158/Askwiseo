import paypalrestsdk
import json

paypalrestsdk.configure({
    "mode": "sandbox",
    "client_id": "AYclnGiFfwQPTsf5BGpdI-EWHvVqiibdwSEd-9LYkYjmX78_GyRCSKdiK0FCeKhnaRH4ACIpEpEZgKk6",
    "client_secret": "EAH6WcJf9Uek45wbmM9k28muMMHQ97pbYbO9BGN_wGlIWct-9Ojt1VMIfwCR0TqN9UAyKiLGzPdaTxwR",
})

# Create Product first
product = paypalrestsdk.BillingPlan({
    "name": "Askwiseo",
    "description": "AI Document Intelligence Platform",
    "type": "SERVICE"
})

# Create Starter Plan
starter_plan = paypalrestsdk.BillingPlan({
    "name": "Askwiseo Starter",
    "description": "50 PDFs, 200 questions/month",
    "type": "INFINITE",
    "payment_definitions": [{
        "name": "Starter Monthly",
        "type": "REGULAR",
        "frequency": "MONTH",
        "frequency_interval": "1",
        "amount": {
            "value": "5.99",
            "currency": "USD"
        },
        "cycles": "0"
    }],
    "merchant_preferences": {
        "return_url": "http://localhost:3000/billing/success",
        "cancel_url": "http://localhost:3000/billing/cancel",
        "auto_bill_amount": "YES",
        "initial_fail_amount_action": "CONTINUE",
        "max_fail_attempts": "3"
    }
})

if starter_plan.create():
    print(f"Starter Plan ID: {starter_plan.id}")
    # Activate it
    if starter_plan.activate():
        print("Starter Plan activated!")
else:
    print(starter_plan.error)

# Create Pro Plan
pro_plan = paypalrestsdk.BillingPlan({
    "name": "Askwiseo Pro",
    "description": "Unlimited PDFs, Unlimited questions",
    "type": "INFINITE",
    "payment_definitions": [{
        "name": "Pro Monthly",
        "type": "REGULAR",
        "frequency": "MONTH",
        "frequency_interval": "1",
        "amount": {
            "value": "17.99",
            "currency": "USD"
        },
        "cycles": "0"
    }],
    "merchant_preferences": {
        "return_url": "http://localhost:3000/billing/success",
        "cancel_url": "http://localhost:3000/billing/cancel",
        "auto_bill_amount": "YES",
        "initial_fail_amount_action": "CONTINUE",
        "max_fail_attempts": "3"
    }
})

if pro_plan.create():
    print(f"Pro Plan ID: {pro_plan.id}")
    if pro_plan.activate():
        print("Pro Plan activated!")
else:
    print(pro_plan.error)