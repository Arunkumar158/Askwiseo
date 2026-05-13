
import google.auth
from google.cloud import storage

def list_buckets():
    try:
        # Load credentials from service account
        import os
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "firebase-service-account.json"
        
        credentials, project = google.auth.default()
        print(f"Default Project: {project}")
        
        client = storage.Client(credentials=credentials, project=project)
        buckets = list(client.list_buckets())
        print(f"Buckets in project {project}: {[b.name for b in buckets]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_buckets()
