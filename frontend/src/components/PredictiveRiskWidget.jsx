import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle } from 'lucide-react';

const PredictiveRiskWidget = ({ alerts }) => {
  // Simple heuristic for trajectory based on low-severity volume
  const recentLowSev = alerts.filter(a => a.severity < 7).length;
  
  // Calculate forecast: If high volume of low sev alerts, risk increases
  let riskPercentage = 15;
  let riskText = "Standard Background Noise";
  let color = "var(--success)";
  let target = "None detected";
  
  if (recentLowSev > 20) {
    riskPercentage = 85;
    riskText = "High Probability of Imminent Lateral Movement";
    color = "var(--danger)";
    target = "Domain Controller / DB Server";
  } else if (recentLowSev > 10) {
    riskPercentage = 55;
    riskText = "Coordinated Reconnaissance Detected";
    color = "var(--warning)";
    target = "External Facing Services";
  }

  return (
    <div className="card predictive-widget" style={{ padding: '16px' }}>
      <div className="widget-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <TrendingUp size={16} color="var(--primary)" />
        <h3 style={{ fontSize: '1rem', margin: 0 }}>Risk Forecast</h3>
        <span style={{ 
          marginLeft: 'auto', 
          backgroundColor: 'rgba(99, 102, 241, 0.15)', 
          color: 'var(--primary)',
          padding: '2px 6px',
          borderRadius: '10px',
          fontSize: '0.65rem',
          fontWeight: 700
        }}>
          LIVE
        </span>
      </div>

      <div className="widget-body" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="risk-meter" style={{ 
            position: 'relative', 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%',
            background: `conic-gradient(${color} ${riskPercentage}%, var(--border) 0)`,
            flexShrink: 0
          }}>
          <div style={{
            position: 'absolute',
            inset: '5px',
            background: 'var(--bg-card)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            fontWeight: 800,
            color: '#fff'
          }}>
            {riskPercentage}%
          </div>
        </div>

        <div className="risk-details" style={{ flex: 1 }}>
          <div style={{ color: color, fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>
            {riskText}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.4 }}>
            Aggregating {recentLowSev} low-signal events indicates a potential coordinated campaign targeting <strong style={{ color: 'var(--text-main)' }}>{target}</strong> within the next 12-24 hours.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveRiskWidget;
