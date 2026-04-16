import asyncio
import uuid
from datetime import datetime, timedelta
from backend.database.db import save_alert, init_db
from backend.models.alert_model import SOCAlert

async def inject_lateral_movement_scenario():
    print("🚀 Initializing Database and Lateral Movement Scenario...")
    await init_db()
    
    # We need to make sure the user exists or at least the alerts refer to a consistent user
    target_user = "admin_compromised"
    base_time = datetime.utcnow() - timedelta(minutes=10)
    
    alerts = [
        # Phase 1: Entry on Host A
        SOCAlert(
            id=str(uuid.uuid4()),
            timestamp=base_time,
            rule_id="1001",
            rule_description="Initial access via Brute Force",
            severity=10,
            source_ip="10.0.0.50",
            user_name=target_user,
            agent_name="workstation-01",
            agent_id="agt-01",
            full_log="Failed SSH logins followed by success for admin_compromised on 10.0.0.50",
            mitre_techniques=["T1110"],
            ai_analysis="CRITICAL: Initial entry detected. Attacker successfully brute-forced the admin_compromised account.",
            ai_priority=9
        ),
        # Phase 2: Pivot to Host B
        SOCAlert(
            id=str(uuid.uuid4()),
            timestamp=base_time + timedelta(minutes=2),
            rule_id="1002",
            rule_description="Lateral Movement: Remote Command Execution",
            severity=12,
            source_ip="10.0.0.60",
            user_name=target_user,
            agent_name="file-server",
            agent_id="agt-02",
            full_log="PowerShell remoting session initiated by admin_compromised from 10.0.0.50 to 10.0.0.60",
            mitre_techniques=["T1059"],
            ai_analysis="LATERAL MOVEMENT: Compromised account used to access file-server. High risk of data exposure.",
            ai_priority=10
        ),
        # Phase 3: Pivot to Host C (Domain Controller)
        SOCAlert(
            id=str(uuid.uuid4()),
            timestamp=base_time + timedelta(minutes=5),
            rule_id="1003",
            rule_description="Privilege Escalation: Use of Valid Account on DC",
            severity=15,
            source_ip="10.0.0.10",
            user_name=target_user,
            agent_name="domain-controller",
            agent_id="agt-03",
            full_log="Logon attempt with admin_compromised credentials on Domain Controller (10.0.0.10)",
            mitre_techniques=["T1078"],
            ai_analysis="IMMINENT THREAT: Attacker has reached the Domain Controller using valid credentials. Total domain takeover is likely.",
            ai_priority=10
        )
    ]
    
    for alert in alerts:
        await save_alert(alert)
        print(f"✅ Injected: {alert.rule_description} (User: {alert.user_name})")

    print("\n🔥 Scenario Injected Successfully! Refresh your dashboard to see the pivot.")

if __name__ == "__main__":
    asyncio.run(inject_lateral_movement_scenario())
