import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Info, ChevronRight, ShieldBan, Lock, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import apiClient from '../api/apiClient';

const AlertsListPage = ({ alerts, onClearAlert }) => {
  const [actionStatuses, setActionStatuses] = useState({});

  const handleRemediate = async (alertId, action, target) => {
    setActionStatuses(prev => ({ ...prev, [alertId]: 'loading' }));
    try {
      await apiClient.post('/alerts/remediate', {
        action,
        target,
        alert_id: alertId
      });
      setActionStatuses(prev => ({ ...prev, [alertId]: 'success' }));
      // Optional: Revert success state after a few seconds
      setTimeout(() => {
        setActionStatuses(prev => ({ ...prev, [alertId]: null }));
      }, 3000);
    } catch (error) {
      console.error('Failed to remediate:', error);
      setActionStatuses(prev => ({ ...prev, [alertId]: 'error' }));
    }
  };

  const getSevColor = (sev) => {
    if (sev >= 12) return 'var(--danger)';
    if (sev >= 7) return 'var(--warning)';
    return 'var(--success)';
  };

  const getSevLabel = (sev) => {
    if (sev >= 12) return 'CRITICAL';
    if (sev >= 7) return 'WARNING';
    return 'INFO';
  };

  return (
    <div className="alerts-blog-container">
      <div className="blog-hero">
        <h1 className="blog-main-title">Forensic Activity Log</h1>
        <p className="blog-subtitle">A chronological digest of all security events and AI analysis.</p>
      </div>

      <div className="blog-feed">
        {alerts.length === 0 ? (
          <div className="empty-state">
            <Info size={40} color="var(--text-muted)" />
            <p>No alerts recorded in the last 24 hours.</p>
          </div>
        ) : (
          alerts.map((alert, index) => (
            <motion.div 
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="alert-blog-card"
            >
              <div className="alert-blog-header">
                <div className="blog-meta-left">
                  <span className="blog-timestamp">
                    <Clock size={14} />
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                  <span className={`blog-badge`} style={{ backgroundColor: getSevColor(alert.severity) }}>
                    {getSevLabel(alert.severity)}
                  </span>
                </div>
                <div className="blog-rule-id">#{alert.rule_id}</div>
              </div>

              <h2 className="alert-blog-title">{alert.rule_description}</h2>
              
              <div className="alert-blog-content">
                <div className="blog-summary">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {alert.ai_explanation || alert.full_log.substring(0, 200) + '...'}
                  </ReactMarkdown>
                </div>
                
                {alert.ai_analysis && (
                  <div className="blog-ai-insight">
                    <div className="ai-insight-label">AI ANALYST INSIGHT</div>
                    <div className="ai-insight-text">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {alert.ai_analysis.split('\n')[0]}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>

              <div className="alert-blog-footer">
                <div className="blog-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Source IP</span>
                    <span className="detail-value">{alert.source_ip}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Agent</span>
                    <span className="detail-value">{alert.agent_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">User Account</span>
                    <span className="detail-value">{alert.user_name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Tech Group</span>
                    <span className="detail-value">{alert.mitre_techniques?.join(', ') || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="blog-action-group">
                  {actionStatuses[alert.id] === 'success' ? (
                    <div className="action-success">
                      <CheckCircle2 size={16} /> Containment Executed
                    </div>
                  ) : actionStatuses[alert.id] === 'loading' ? (
                    <div className="action-loading">
                      <div className="spinner" /> Executing Playbook...
                    </div>
                  ) : (
                    <>
                      <button 
                        className="blog-action-btn primary-action"
                        onClick={() => handleRemediate(alert.id, 'Isolate Host', alert.agent_name || alert.source_ip)}
                      >
                        <Lock size={14} /> Isolate Host
                      </button>
                      <button 
                        className="blog-action-btn secondary-action"
                        onClick={() => handleRemediate(alert.id, 'Block IP', alert.source_ip)}
                      >
                        <ShieldBan size={14} /> Block IP
                      </button>
                      <button 
                        className="blog-action-btn tertiary-action"
                        onClick={() => onClearAlert(alert.id)}
                      >
                        <CheckCircle2 size={14} /> Clear Alert
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsListPage;
