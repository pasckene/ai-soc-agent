import json
import asyncio
import random
import uuid
from datetime import datetime
from backend.models.alert_model import SOCAlert
from backend.core.ai_engine import ai_engine
from backend.core.ai_ranker import ai_ranker
from typing import Callable, List

class WazuhMockIngest:
    def __init__(self, sample_data_path: str):
        self.sample_data_path = sample_data_path
        self.callbacks: List[Callable] = []

    def on_new_alert(self, callback: Callable):
        self.callbacks.append(callback)

    async def start_simulating(self):
        """
        Simulate incoming alerts from a file or random generation.
        """
        while True:
            try:
                # Simulate an alert every 10-30 seconds
                await asyncio.sleep(random.randint(10, 30))
                
                # Create a mock alert
                users = ["admin", "root", "zyra", "guest", "svc_account", "it_admin"]
                alert = SOCAlert(
                    id=str(uuid.uuid4()),
                    rule_id=str(random.randint(100000, 100500)),
                    rule_description=random.choice([
                        "Brute force attempt detected",
                        "Multiple failed SSH logins",
                        "Web scan detected (Nikto)",
                        "Potential SQL injection attempt",
                        "Unauthorized admin access"
                    ]),
                    severity=random.randint(3, 15),
                    source_ip=f"192.168.1.{random.randint(2, 254)}",
                    user_name=random.choice(users),
                    agent_name="kali-linux-agent",
                    agent_id="001",
                    full_log="Mock log data for testing AI analysis.",
                    mitre_techniques=random.sample(["T1110", "T1190", "T1059", "T1078"], random.randint(1, 3))
                )

                # Process with AI
                analysis = await ai_engine.analyze_alert(alert)
                alert.ai_analysis = analysis.get("analysis")
                alert.ai_priority = analysis.get("priority")
                alert.ai_explanation = analysis.get("explanation")
                alert.recommended_actions = analysis.get("recommended_actions")

                # Notify callbacks (e.g., WebSocket broadcaster)
                for cb in self.callbacks:
                    await cb(alert)
            except Exception as e:
                print(f"Error in simulation loop: {e}")
                await asyncio.sleep(5) # Wait before retrying

# Temporary sample data creator
def create_sample_data():
    data = [
        {"rule_id": "100201", "desc": "Firewall drop", "sev": 3},
        {"rule_id": "5710", "desc": "SSH login success", "sev": 5},
        {"rule_id": "5712", "desc": "SSH login failure", "sev": 7},
    ]
    # In a real app, this would be written to data/sample_alerts.json
    return data
