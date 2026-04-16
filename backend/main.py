import sys
import os
from pathlib import Path

# Add project root to sys.path for absolute imports
root_path = str(Path(__file__).parent.parent)
if root_path not in sys.path:
    sys.path.append(root_path)

import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from backend.api import chat, alerts, auth
from backend.core.wazuh_ingest import WazuhMockIngest
from backend.models.alert_model import SOCAlert
from backend.database.db import init_db, save_alert
import json

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic: Initialize DB and start simulation
    await init_db()
    ingest_engine.on_new_alert(alert_callback)
    # Start the simulation background task
    simulation_task = asyncio.create_task(ingest_engine.start_simulating())
    
    yield
    
    # Shutdown logic: Cancel the simulation task
    simulation_task.cancel()
    try:
        await simulation_task
    except asyncio.CancelledError:
        pass

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
app.include_router(chat.router)
app.include_router(alerts.router)
app.include_router(auth.router)

# WebSocket Clients
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text() # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Mock Ingestion Setup
ingest_engine = WazuhMockIngest(sample_data_path="data/sample_alerts.json")

async def alert_callback(alert: SOCAlert):
    # Log to persistent history
    await save_alert(alert)
    # Broadcast to UI
    await manager.broadcast(alert.model_dump_json())


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
