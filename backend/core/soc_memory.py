from backend.models.alert_model import ChatSession, ChatMessage
from typing import Dict

class SOCMemory:
    def __init__(self):
        self.sessions: Dict[str, ChatSession] = {}

    def get_or_create_session(self, session_id: str) -> ChatSession:
        if session_id not in self.sessions:
            self.sessions[session_id] = ChatSession(session_id=session_id)
        return self.sessions[session_id]

    def add_message(self, session_id: str, role: str, content: str):
        session = self.get_or_create_session(session_id)
        session.messages.append(ChatMessage(role=role, content=content))
        # Keep only last 20 messages to manage context window
        if len(session.messages) > 20:
            session.messages = session.messages[-20:]

soc_memory = SOCMemory()
