from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from backend.core.ai_engine import ai_engine
from backend.core.soc_memory import soc_memory
from backend.models.alert_model import ChatMessage
from backend.auth.jwt_handler import get_current_user

router = APIRouter(prefix="/chat", tags=["AI Copilot"])

class ChatRequest(BaseModel):
    session_id: str
    query: str

class TokenUsage(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    model: str

class ChatResponse(BaseModel):
    response: str
    usage: Optional[TokenUsage] = None

@router.post("", response_model=ChatResponse)
async def chat_with_copilot(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    session = soc_memory.get_or_create_session(request.session_id)

    result = await ai_engine.chat_response(session.messages, request.query)
    response_text = result["text"]
    usage_data   = result.get("usage")

    # Store in memory
    soc_memory.add_message(request.session_id, "user", request.query)
    soc_memory.add_message(request.session_id, "assistant", response_text)

    return ChatResponse(
        response=response_text,
        usage=TokenUsage(**usage_data) if usage_data else None,
    )
