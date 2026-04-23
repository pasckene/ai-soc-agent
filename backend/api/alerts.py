from fastapi import APIRouter, Depends, HTTPException, Request, Security, status
from fastapi.security import APIKeyHeader
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from backend.config import settings
from backend.database.db import get_db, DBAlert, save_alert
from backend.models.alert_model import SOCAlert
from backend.core.ai_engine import ai_engine
from backend.realtime.manager import manager
from pydantic import BaseModel
from typing import List, Dict
import uuid
from datetime import datetime, timezone
from json import JSONDecodeError

router = APIRouter(prefix="/alerts", tags=["Alerts"])




# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("", response_model=List[SOCAlert])
async def get_alerts(
    db: AsyncSession = Depends(get_db),
):
    """Return the 100 most recent alerts (UI use). JWT authentication removed."""
    result = await db.execute(
        select(DBAlert).where(DBAlert.cleared == False).order_by(DBAlert.timestamp.desc()).limit(100)
    )
    alerts = result.scalars().all()
    return alerts


class RemediationRequest(BaseModel):
    action: str
    target: str
    alert_id: str


@router.post("/remediate")
async def execute_remediation(
    req: RemediationRequest,
):
    """Simulate SOAR playbook execution (UI use). JWT authentication removed."""
    return {
        "status": "success",
        "message": f"Successfully executed '{req.action}' playbook on target: {req.target}",
        "action": req.action,
        "target": req.target,
        "alert_id": req.alert_id,
    }

class ClearAlertsRequest(BaseModel):
    alert_ids: List[str]

@router.post("/clear")
async def clear_alerts(
    req: ClearAlertsRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Mark a list of alerts as cleared. JWT authentication removed.
    """
    await db.execute(
        update(DBAlert)
        .where(DBAlert.id.in_(req.alert_ids))
        .values(cleared=True)
    )
    await db.commit()
    return {"status": "success", "message": f"Successfully cleared {len(req.alert_ids)} alerts."}


@router.post("", status_code=status.HTTP_201_CREATED)
async def ingest_external_alert(request: Request):
    raw_data = await request.json()
    
    # Map fields and handle the missing timestamp
    mapped_data = {
        "rule_id": str(raw_data.get("rule", {}).get("id")),
        "rule_description": raw_data.get("rule", {}).get("description"),
        "severity": raw_data.get("rule", {}).get("level"),
        "agent_name": raw_data.get("agent", {}).get("name"),
        "full_log": raw_data.get("full_log", ""),
        
        # FIX: Use Wazuh timestamp if it exists, otherwise use current time
        "timestamp": raw_data.get("timestamp") or datetime.now(timezone.utc),
        "id": str(uuid.uuid4()), # Generate UUID here as well
        "agent_id": raw_data.get("agent", {}).get("id", "external"),
        "source_ip": raw_data.get("data", {}).get("srcip", "0.0.0.0"),
    }

    try:
        alert = SOCAlert(**mapped_data)
    except Exception as e:
        print(f"[!] Validation Error: {e}")
        raise HTTPException(status_code=422, detail=str(e))

    # ... proceed to AI triage and broadcast ...
    # 4. AI Triage & Real-time Broadcast
    analysis = await ai_engine.analyze_alert(alert)
    alert.ai_analysis = analysis.get("analysis")
    alert.ai_priority = analysis.get("priority") # Re-adding these based on previous logic
    alert.ai_explanation = analysis.get("explanation")
    alert.recommended_actions = analysis.get("recommended_actions", [])
    
    await save_alert(alert)
    await manager.broadcast(alert.model_dump_json())
    return {"status": "success", "alert_id": alert.id}
