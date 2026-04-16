import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, LayoutDashboard, Bell,
  Settings as SettingsIcon, Menu, X,
  MessageSquare, TrendingUp, AlertOctagon
} from 'lucide-react';
import AlertFeed from './components/AlertFeed';
import SocCopilot from './components/SocCopilot';
import AttackGraph from './components/AttackGraph';
import Login from './components/Login';
import apiClient, { WS_BASE_URL } from './api/apiClient';
import './styles/App.css';

const AIDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('soc_token'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024);
  const [isCopilotExpanded, setIsCopilotExpanded] = useState(false);

  // Track viewport size
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w < 1024);
      // Auto-close drawer/sheet on resize up
      if (w >= 1024) setDrawerOpen(false);
      if (w >= 768) setCopilotOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchHistory = async () => {
      try {
        const res = await apiClient.get('/alerts/');
        setAlerts(res.data);
      } catch (err) {
        console.error('Failed to fetch alert history', err);
      }
    };
    fetchHistory();

    const ws = new WebSocket(`${WS_BASE_URL}/ws/alerts`);
    ws.onmessage = (event) => {
      const newAlert = JSON.parse(event.data);
      setAlerts((prev) => {
        if (prev.find((a) => a.id === newAlert.id)) return prev;
        return [newAlert, ...prev].slice(0, 20);
      });
    };
    return () => ws.close();
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('soc_token');
    setIsAuthenticated(false);
  };

  const highSeverityCount = alerts.filter((a) => a.severity >= 12).length;
  const mediumSeverityCount = alerts.filter((a) => a.severity >= 7 && a.severity < 12).length;
  const lowSeverityCount = alerts.filter((a) => a.severity < 7).length;

  // Calculate dynamic risk score (0-100)
  const riskScore = Math.min(100, (highSeverityCount * 12) + (mediumSeverityCount * 4) + (lowSeverityCount * 1));
  
  const getRiskColor = (score) => {
    if (score >= 70) return 'var(--danger)';
    if (score >= 30) return 'var(--warning)';
    return 'var(--success)';
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const username = 'SOC Analyst';
  const initials = username.split(' ').map((w) => w[0]).join('');

  return (
    <>
      {/* Mobile overlay for alert feed drawer */}
      <div
        className={`mobile-overlay ${drawerOpen ? 'drawer-open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      <div className={`app-container ${isCopilotExpanded ? 'copilot-expanded' : ''}`}>
        {/* ── HEADER ── */}
        <header className="header">
          {/* Mobile menu toggle */}
          {isTablet && (
            <button
              className="menu-toggle"
              onClick={() => setDrawerOpen((o) => !o)}
              aria-label="Toggle alert feed"
            >
              {drawerOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}

          <div className="logo-section">
            <Shield size={28} />
            <span>RedShield AI</span>
          </div>

          <nav className="header-nav">
            <div className="nav-item active">
              <LayoutDashboard size={17} />
              <span>Dashboard</span>
            </div>
            <div className="nav-item">
              <Bell size={17} />
              <span>Alerts</span>
            </div>
            <div className="nav-item">
              <SettingsIcon size={17} />
              <span>Settings</span>
            </div>
          </nav>

          <div className="header-user">
            {/* Mobile copilot toggle */}
            {isMobile && (
              <button
                className="menu-toggle"
                onClick={() => setCopilotOpen((o) => !o)}
                aria-label="Toggle copilot"
                style={{ marginRight: 4 }}
              >
                <MessageSquare size={18} />
              </button>
            )}

            <div className="header-user-info">
              <div className="username">{username}</div>
              <button className="btn-signout" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
            <div className="avatar">{initials}</div>
          </div>
        </header>
 
        {/* ── LEFT SIDEBAR — Alert Feed ── */}
        <aside className={`alert-feed-section ${drawerOpen ? 'drawer-open' : ''}`}>
          <AlertFeed />
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="main-content">
          {/* Stats row */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-value" style={{ color: getRiskColor(riskScore) }}>
                {riskScore}
              </div>
              <div className="stat-label">Daily Risk Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--danger)' }}>
                {highSeverityCount}
              </div>
              <div className="stat-label">High Severity</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--primary)' }}>
                {alerts.length}
              </div>
              <div className="stat-label">Total Alerts</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--warning)' }}>
                {highSeverityCount > 0 ? highSeverityCount : (alerts.length > 0 ? 1 : 0)}
              </div>
              <div className="stat-label">Active Threats</div>
            </div>
          </div>

          {/* Attack graph */}
          <AttackGraph alerts={alerts} />
        </main>

        {/* ── RIGHT SIDEBAR — Copilot ── */}
        <aside className={`copilot-section ${copilotOpen ? 'sheet-open' : ''}`}>
          <SocCopilot 
            isExpanded={isCopilotExpanded} 
            onToggleExpand={() => setIsCopilotExpanded(!isCopilotExpanded)} 
          />
        </aside>
      </div>
    </>
  );
};

export default AIDashboard;
