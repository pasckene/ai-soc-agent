import os
from dotenv import load_dotenv

load_dotenv()

try:
    from google import genai
    client = genai.Client()
    print("Available Gemini models:")
    try:
        for model in client.models.list():
            if "gemini" in model.name.lower():
                print(f" - {model.name}")
    except Exception as e:
        print("Error listing models:", e)
except ImportError:
    import google.generativeai as genai
    genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
    print("Available Gemini models (old SDK):")
    for m in genai.list_models():
        if "gemini" in m.name.lower():
            print(f" - {m.name}")
