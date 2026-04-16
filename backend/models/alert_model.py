from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class SOCAlert(BaseModel):
    id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    rule_id: str
    rule_description: str
    severity: int  # 0-15 (Wazuh style)
    source_ip: str
    dest_ip: Optional[str] = None
    user_name: Optional[str] = None
    agent_name: str
    agent_id: str
    full_log: str
    mitre_techniques: List[str] = []
    
    # AI generated fields
    ai_analysis: Optional[str] = None
    ai_priority: Optional[int] = None # 1-10
    ai_explanation: Optional[str] = None
    recommended_actions: List[str] = []

class ChatMessage(BaseModel):
    role: str # 'user' or 'assistant'
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatSession(BaseModel):
    session_id: str
    messages: List[ChatMessage] = []
