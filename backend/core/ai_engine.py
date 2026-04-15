import google.generativeai as genai
from groq import Groq
from backend.config import settings
from backend.models.alert_model import SOCAlert,ChatMessage
from typing import List, Dict, Any

class AIEngine:
    def __init__(self):
        # Configure Gemini
        if settings.GOOGLE_API_KEY:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            self.gemini_model = genai.GenerativeModel(settings.DEFAULT_MODEL)
        else:
            self.gemini_model = None

        # Configure Groq
        if settings.GROQ_API_KEY:
            self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
        else:
            self.groq_client = None

    async def analyze_alert(self, alert_data: SOCAlert) -> Dict[str, Any]:
        """
        Analyze a SOC alert and return enrichment data.
        """
        prompt = f"""
        Analyze the following security alert and provide:
        1. A concise explanation of what happened.
        2. A priority score (1-10, where 10 is critical).
        3. Recommended remediation steps.

        Alert Details:
        Rule: {alert_data.rule_description}
        Severity: {alert_data.severity}
        Agent: {alert_data.agent_name}
        Log: {alert_data.full_log}
        """

        # Prefer Groq for fast alert analysis if available
        if self.groq_client:
            try:
                response = self.groq_client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt}],
                    model=settings.GROQ_MODEL,
                )
                content = response.choices[0].message.content
                return self._parse_ai_response(content)
            except Exception as e:
                print(f"Groq error: {e}")

        # Fallback to Gemini
        if self.gemini_model:
            try:
                response = self.gemini_model.generate_content(prompt)
                return self._parse_ai_response(response.text)
            except Exception as e:
                print(f"Gemini error: {e}")

        return {
            "explanation": "AI Analysis unavailable. Check API keys.",
            "priority": 5,
            "recommendations": ["Investigate manually"]
        }

    async def chat_response(self, history: List[ChatMessage], query: str) -> str:
        """
        Generate a response for the SOC Copilot chat.
        """
        # Formulate prompt with history
        messages = []
        for msg in history[-5:]: # Use last 5 messages for context
            messages.append({"role": msg.role, "parts": [msg.content]})
        
        # Add current query
        # For Gemini Pro/Flash
        if self.gemini_model:
            try:
                chat = self.gemini_model.start_chat(history=messages[:-1] if messages else [])
                response = chat.send_message(query)
                return response.text
            except Exception as e:
                return f"Error generating response: {str(e)}"
        
        return "AI Copilot is offline. Please check configuration."

    def _parse_ai_response(self, text: str) -> Dict[str, Any]:
        # Simple parser logic (Ideally would use JSON mode if supported)
        # For now, let's just do basic extraction
        return {
            "analysis": text,
            "priority": 7, # Placeholder logic
            "explanation": text[:200] + "...",
            "recommended_actions": ["Isolate host", "Block IP"]
        }

ai_engine = AIEngine()
