from fastapi import APIRouter
from backend.core.wazuh_connector import get_alerts, get_agents

router = APIRouter()

# 🚨 Alerts endpoint
@router.get("/alerts/wazuh") # Changed to avoid conflict with existing /api/alerts
def wazuh_alerts():
    return get_alerts()

# 🧑‍💻 Agents endpoint
@router.get("/agents/wazuh") # Changed to avoid conflict
def wazuh_agents():
    return get_agents()

# 🔥 SOC summary endpoint (useful for dashboard cards)
@router.get("/summary/wazuh") # Changed to avoid conflict
def wazuh_summary():
    alerts = get_alerts()
    agents = get_agents()

    total_alerts = alerts.get("data", {}).get("total_affected_items", 0) if isinstance(alerts, dict) else 0
    total_agents = agents.get("data", {}).get("total_affected_items", 0) if isinstance(agents, dict) else 0

    return {
        "total_alerts": total_alerts,
        "total_agents": total_agents,
    }
