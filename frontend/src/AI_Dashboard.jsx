import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Bell,
  Settings as SettingsIcon, Menu, X,
  MessageSquare, ChevronRight, Swords
} from 'lucide-react';
import AlertFeed from './components/AlertFeed';
import SocCopilot from './components/SocCopilot';
import AttackGraph from './components/AttackGraph';
import AlertsListPage from './components/AlertsListPage';
import SettingsDialog from './components/SettingsDialog';
import WarRoomPage from './components/WarRoomPage';
import Login from './components/Login';
import apiClient, { WS_BASE_URL } from './api/apiClient';
import './styles/App.css';

const DashboardHome = ({ alerts, riskScore, highSeverityCount, getRiskColor }) => (
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
    <div style={{ marginTop: 'var(--gap)' }}>
      <AttackGraph alerts={alerts} />
    </div>
  </main>
);

const AIDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('soc_token'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024);
  const [isCopilotExpanded, setIsCopilotExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Track viewport size
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w < 1024);
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
    localStorage.removeItem('soc_first_name');
    localStorage.removeItem('soc_last_name');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const highSeverityCount = alerts.filter((a) => a.severity >= 12).length;
  const mediumSeverityCount = alerts.filter((a) => a.severity >= 7 && a.severity < 12).length;
  const lowSeverityCount = alerts.filter((a) => a.severity < 7).length;

  const riskScore = Math.min(100, (highSeverityCount * 12) + (mediumSeverityCount * 4) + (lowSeverityCount * 1));
  
  const getRiskColor = (score) => {
    if (score >= 70) return 'var(--danger)';
    if (score >= 30) return 'var(--warning)';
    return 'var(--success)';
  };

  const rawFirst = localStorage.getItem('soc_first_name');
  const rawLast = localStorage.getItem('soc_last_name');
  const userFirstName = (rawFirst && rawFirst !== 'null') ? rawFirst : 'SOC';
  const userLastName = (rawLast && rawLast !== 'null') ? rawLast : 'Analyst';
  const fullName = `${userFirstName} ${userLastName}`;
  const initials = `${userFirstName[0] || ''}${userLastName[0] || ''}`.toUpperCase();

  return (
    <>
      <div
        className={`mobile-overlay ${drawerOpen ? 'drawer-open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      <div className={`app-container ${isCopilotExpanded ? 'copilot-expanded' : ''} ${location.pathname === '/war-room' ? 'no-copilot' : ''}`}>
        <header className="header">
          {isTablet && (
            <button
              className="menu-toggle"
              onClick={() => setDrawerOpen((o) => !o)}
              aria-label="Toggle alert feed"
            >
              {drawerOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}

          <Link to="/" className="logo-section" style={{ textDecoration: 'none' }}>
            <Shield size={28} />
            <span>RedShield AI</span>
          </Link>

          <nav className="header-nav">
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={17} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/alerts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Bell size={17} />
              <span>Alerts</span>
            </NavLink>
            <NavLink to="/war-room" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Swords size={17} />
              <span>War Room</span>
            </NavLink>
            <button className="nav-item" onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', font: 'inherit' }}>
              <SettingsIcon size={17} />
              <span>Settings</span>
            </button>
          </nav>

          <div className="header-user">
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
              <div className="username">{fullName}</div>
              <button className="btn-signout" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
            <div className="avatar">{initials}</div>
          </div>
        </header>

        <aside className={`alert-feed-section ${drawerOpen ? 'drawer-open' : ''}`}>
          <AlertFeed />
        </aside>

        <Routes>
          <Route path="/" element={
            <DashboardHome 
              alerts={alerts} 
              riskScore={riskScore} 
              highSeverityCount={highSeverityCount} 
              getRiskColor={getRiskColor} 
            />
          } />
          <Route path="/alerts" element={<AlertsListPage alerts={alerts} />} />
          <Route path="/war-room" element={<WarRoomPage alerts={alerts} />} />
        </Routes>
        {location.pathname !== '/war-room' && (
          <aside className={`copilot-section ${copilotOpen ? 'sheet-open' : ''}`}>
            <SocCopilot 
              isExpanded={isCopilotExpanded} 
              onToggleExpand={() => setIsCopilotExpanded(!isCopilotExpanded)} 
            />
          </aside>
        )}
      </div>

      <SettingsDialog 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        user={{ first_name: userFirstName, last_name: userLastName }}
      />
    </>
  );
};

export default AIDashboard;
