import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Terminal, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AlertFeed = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Fetch initial history
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:8000/alerts/');
        const data = await response.json();
        setAlerts(data);
      } catch (err) {
        console.error("Failed to fetch alert history", err);
      }
    };
    fetchHistory();

    const ws = new WebSocket('ws://localhost:8000/ws/alerts');
    
    ws.onmessage = (event) => {
      const newAlert = JSON.parse(event.data);
      setAlerts((prev) => {
        // Prevent duplicates if they arrive via WS while fetching history
        if (prev.find(a => a.id === newAlert.id)) return prev;
        return [newAlert, ...prev].slice(0, 50);
      });
    };

    return () => ws.close();
  }, []);


  const getSeverityClass = (sev) => {
    if (sev >= 12) return 'high';
    if (sev >= 7) return 'medium';
    return 'low';
  };

  return (
    <div className="card alert-feed">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
        <Activity size={20} color="var(--accent)" />
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Live Alert Feed</h2>
      </div>
      
      <AnimatePresence initial={false}>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className={`alert-card ${getSeverityClass(alert.severity)}`}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{alert.source_ip}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Level {alert.severity}</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '8px' }}>
              {alert.rule_description}
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {alert.mitre_techniques.map(t => (
                <span key={t} style={{ fontSize: '0.7rem', background: 'var(--border)', padding: '2px 6px', borderRadius: '4px' }}>
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AlertFeed;
