from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from backend.core.ai_engine import ai_engine
from backend.core.soc_memory import soc_memory
from backend.models.alert_model import ChatMessage
from backend.auth.auth import get_current_user

router = APIRouter(prefix="/chat", tags=["AI Copilot"])

class ChatRequest(BaseModel):
    session_id: str
    query: str

class ChatResponse(BaseModel):
    response: str

@router.post("/", response_model=ChatResponse)
async def chat_with_copilot(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    # current_user now contains the decoded JWT data
    # Get session history
    session = soc_memory.get_or_create_session(request.session_id)
    
    # Generate response
    response_text = await ai_engine.chat_response(session.messages, request.query)
    
    # Store in memory
    soc_memory.add_message(request.session_id, "user", request.query)
    soc_memory.add_message(request.session_id, "assistant", response_text)
    
    return ChatResponse(response=response_text)
