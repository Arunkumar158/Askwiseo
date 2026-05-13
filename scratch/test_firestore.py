
import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from auth import firebase_admin
from services.db_service import count_user_documents
from config import settings

def test_count():
    try:
        uid = "test-user-id" # Use a dummy UID
        print(f"Testing count for user: {uid}")
        count = count_user_documents(uid)
        print(f"Count: {count}")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_count()
