from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from backend.api import chat, alerts, auth
from backend.database.db import init_db
from backend.realtime.manager import manager

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic: Initialize DB
    await init_db()
    
    yield

app = FastAPI(
    title="AI SOC Copilot API",
    lifespan=lifespan
)

# CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(chat.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(auth.router, prefix="/api")

# WebSocket Clients (using shared manager)

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text() # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# External ingestion is now handled via the /api/alerts POST endpoint in backend/api/alerts.py


@app.get("/")
def read_root():
    return {"message": "AI SOC Copilot API is running"}


def start():
    """Entry point for the application script."""
    import uvicorn
    from backend.config import settings
    uvicorn.run(
        "backend.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    )


if __name__ == "__main__":
    start()
