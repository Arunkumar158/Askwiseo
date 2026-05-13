
import chromadb
from chromadb.config import Settings as ChromaSettings
import os

def test_chroma():
    try:
        path = "./chroma_db"
        print(f"Testing Chroma at {path}...")
        client = chromadb.PersistentClient(
            path=path,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        collection = client.get_or_create_collection(name="askwiseo_docs")
        print(f"Collection count: {collection.count()}")
        print("Chroma OK")
    except Exception as e:
        print(f"Chroma FAIL: {e}")

if __name__ == "__main__":
    test_chroma()
