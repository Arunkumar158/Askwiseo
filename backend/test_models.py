
import google.generativeai as genai
import os
from config import settings

def list_models():
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        print("Available models:")
        for m in genai.list_models():
            if 'embedContent' in m.supported_generation_methods:
                print(f"Embedding Model: {m.name}")
            else:
                print(f"Generation Model: {m.name}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_models()
