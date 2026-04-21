from fastapi import APIRouter, Depends, HTTPException, Security, status
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


@router.post("", response_model=Dict[str, str], status_code=status.HTTP_201_CREATED)
async def ingest_external_alert(
    alert: SOCAlert,
):
    """
    Ingest an alert from an external agent (Wazuh, EDR, custom SIEM, etc.).

    Minimal required payload
    ------------------------
    {
        "rule_id":          "5710",
        "rule_description": "SSH brute-force detected",
        "severity":         12,
        "source_ip":        "203.0.113.42",
        "agent_name":       "prod-web-01",
        "full_log":         "<raw log line>"
    }

    Optional fields
    ---------------
    id, timestamp, dest_ip, user_name, agent_id, mitre_techniques

    Pipeline
    --------
    1. Assign a UUID if no id was provided.
    2. Default agent_id to "external" if omitted.
    3. Enrich with AI triage (analysis, priority, explanation, actions).
    4. Persist to the database.
    5. Broadcast to all connected UI clients via WebSocket.
    """
    # 1. Identifiers
    if not alert.id:
        alert.id = str(uuid.uuid4())
    if not alert.agent_id:
        alert.agent_id = "external"

    # 2. AI triage
    analysis = await ai_engine.analyze_alert(alert)
    alert.ai_analysis = analysis.get("analysis")
    alert.ai_priority = analysis.get("priority")
    alert.ai_explanation = analysis.get("explanation")
    alert.recommended_actions = analysis.get("recommended_actions", [])

    # 3. Persist
    await save_alert(alert)

    # 4. Push to UI
    await manager.broadcast(alert.model_dump_json())

    return {"status": "success", "alert_id": alert.id}
