import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient, { WS_BASE_URL } from '../api/apiClient';

const getSeverityClass = (sev) => {
  if (sev >= 12) return 'high';
  if (sev >= 7) return 'medium';
  return 'low';
};

const AlertFeed = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiClient.get('/alerts/');
        setAlerts(response.data);
      } catch (err) {
        console.error('Failed to fetch alert history', err);
      }
    };
    fetchHistory();

    const token = localStorage.getItem('soc_token');
    const ws = new WebSocket(`${WS_BASE_URL}/ws/alerts${token ? `?token=${token}` : ''}`);
    ws.onmessage = (event) => {
      const newAlert = JSON.parse(event.data);
      setAlerts((prev) => {
        if (prev.find((a) => a.id === newAlert.id)) return prev;
        return [newAlert, ...prev].slice(0, 80);
      });
    };

    return () => ws.close();
  }, []);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="alert-feed-header">
        <Activity size={18} color="var(--accent)" />
        <h2 className="section-title">Live Alert Feed</h2>
        <span style={{
          marginLeft: 'auto',
          fontSize: '0.72rem',
          background: 'var(--primary-dim)',
          color: 'var(--primary)',
          padding: '2px 8px',
          borderRadius: '20px',
          fontWeight: 600
        }}>
          {alerts.length}
        </span>
      </div>

      <div className="alert-feed">
        <AnimatePresence initial={false}>
          {alerts.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
              Waiting for alerts...
            </div>
          )}
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className={`alert-card ${getSeverityClass(alert.severity)}`}
            >
              <div className="alert-meta">
                <span>{alert.source_ip}</span>
                <span style={{ fontWeight: 600 }}>Lvl {alert.severity}</span>
              </div>
              <div className="alert-desc">{alert.rule_description}</div>
              <div className="alert-tags">
                {alert.mitre_techniques?.map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AlertFeed;
