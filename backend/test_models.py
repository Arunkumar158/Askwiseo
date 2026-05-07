import google.generativeai as genai
from config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

for m in genai.list_models():
    print(f"{m.name}: {m.supported_generation_methods}")
