
import firebase_admin
from firebase_admin import credentials
import os

def check_project():
    try:
        cred = credentials.Certificate("firebase-service-account.json")
        print(f"Project ID from cred: {cred.project_id}")
        app = firebase_admin.initialize_app(cred)
        print(f"Project ID from app: {app.project_id}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_project()
