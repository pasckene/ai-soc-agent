from backend.models.alert_model import SOCAlert

class AIRanker:
    def calculate_risk_score(self, alert: SOCAlert) -> float:
        """
        Calculate a final risk score (0-100) based on multiple factors.
        """
        base_score = alert.severity * 6.66 # Scale 0-15 to approx 0-100
        
        # Adjust based on MITRE techniques
        mitre_bonus = len(alert.mitre_techniques) * 5
        
        # Adjust based on AI priority if available
        ai_bonus = (alert.ai_priority or 5) * 2
        
        final_score = min(100, base_score + mitre_bonus + ai_bonus)
        return round(final_score, 2)

    def prioritize_alerts(self, alerts: list[SOCAlert]) -> list[SOCAlert]:
        """
        Sort alerts by risk score descending.
        """
        return sorted(alerts, key=lambda x: self.calculate_risk_score(x), reverse=True)

ai_ranker = AIRanker()
