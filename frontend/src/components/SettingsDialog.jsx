import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Cpu, ShieldCheck, User as UserIcon, 
  Settings, Zap, Database, Globe, Sliders
} from 'lucide-react';

const SettingsDialog = ({ isOpen, onClose, user }) => {
  const [activeTab, setActiveTab] = useState('ai');
  
  // Local settings state
  const [model, setModel] = useState(localStorage.getItem('soc_model') || 'Gemini 1.5 Flash');
  const [threshold, setThreshold] = useState(localStorage.getItem('soc_threshold') || 7);
  const [autoAnalyze, setAutoAnalyze] = useState(localStorage.getItem('soc_auto_analyze') === 'true');

  const saveSettings = () => {
    localStorage.setItem('soc_model', model);
    localStorage.setItem('soc_threshold', threshold);
    localStorage.setItem('soc_auto_analyze', autoAnalyze);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="settings-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sidebar */}
          <div className="settings-sidebar">
            <div className="sidebar-header">
              <Settings size={20} color="var(--primary)" />
              <span>Settings</span>
            </div>
            
            <div className="sidebar-nav">
              <button 
                className={`nav-btn ${activeTab === 'ai' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai')}
              >
                <Cpu size={16} /> AI Engine
              </button>
              <button 
                className={`nav-btn ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <ShieldCheck size={16} /> Security
              </button>
              <button 
                className={`nav-btn ${activeTab === 'integrations' ? 'active' : ''}`}
                onClick={() => setActiveTab('integrations')}
              >
                <Database size={16} /> Integrations
              </button>
              <button 
                className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <UserIcon size={16} /> My Profile
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="settings-content">
            <button className="close-btn" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>

            <div className="content-inner">
              {activeTab === 'ai' && (
                <div className="settings-section">
                  <h3>AI Engine Configuration</h3>
                  <p className="section-desc">Customize how the AI SOC Agent analyzes threats.</p>
                  
                  <div className="form-group">
                    <label>Preferred Intelligence Model</label>
                    <div className="custom-select">
                      <select value={model} onChange={(e) => setModel(e.target.value)}>
                        <option>Gemini 1.5 Flash (Default)</option>
                        <option>Gemini 1.5 Pro (Advanced Forensic)</option>
                        <option>Groq Llama 3 (Ultra Fast)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Automation</label>
                    <div className="toggle-row">
                      <span>Enable Auto-Forensics on high severity</span>
                      <input 
                        type="checkbox" 
                        checked={autoAnalyze} 
                        onChange={(e) => setAutoAnalyze(e.target.checked)} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="settings-section">
                  <h3>Security Parameters</h3>
                  <p className="section-desc">Set analysis thresholds and monitoring preferences.</p>
                  
                  <div className="form-group">
                    <label>Analysis Threshold: {threshold}</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="15" 
                      value={threshold} 
                      onChange={(e) => setThreshold(e.target.value)}
                      className="slider"
                    />
                    <div className="range-labels">
                      <span>Low Priority</span>
                      <span>Critical</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div className="settings-section">
                  <h3>Active Integrations</h3>
                  <p className="section-desc">External data feeds and security tool connections.</p>
                  
                  <div className="integration-list">
                    <div className="integration-card active">
                      <Globe size={18} />
                      <div className="int-info">
                        <div className="int-name">Wazuh SIEM</div>
                        <div className="int-status">CONNECTOR: ACTIVE</div>
                      </div>
                    </div>
                    <div className="integration-card active">
                      <Zap size={18} />
                      <div className="int-info">
                        <div className="int-name">VirusTotal API</div>
                        <div className="int-status">CONNECTOR: ACTIVE</div>
                      </div>
                    </div>
                    <div className="integration-card inactive">
                      <Sliders size={18} />
                      <div className="int-info">
                        <div className="int-name">MISP Threat Intel</div>
                        <div className="int-status">NOT CONFIGURED</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="settings-section">
                  <h3>My Profile</h3>
                  <p className="section-desc">Your analyst identity within the SOC.</p>
                  
                  <div className="profile-display">
                    <div className="p-avatar">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                    <div className="p-details">
                      <div className="p-name">{user.first_name} {user.last_name}</div>
                      <div className="p-role">Senior SOC Analyst</div>
                    </div>
                  </div>

                  <button className="btn-secondary" style={{ width: '100%', marginTop: 'auto' }}>
                    Change Access Password
                  </button>
                </div>
              )}
            </div>

            <div className="settings-footer">
              <button className="btn-save" onClick={saveSettings}>Save Changes</button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SettingsDialog;
