import React, { useState, useEffect } from 'react';
import { Shield, LayoutDashboard, Settings as SettingsIcon, Bell } from 'lucide-react';
import AlertFeed from './components/AlertFeed';
import SocCopilot from './components/SocCopilot';
import AttackGraph from './components/AttackGraph';
import Login from './components/Login';
import './styles/App.css';

const AIDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('soc_token'));

  useEffect(() => {
    if (!isAuthenticated) return;

    // Fetch history for graph
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:8000/alerts/');
        const data = await response.json();
        setAlerts(data);
      } catch (err) {
        console.error("Failed to fetch graph history", err);
      }
    };
    fetchHistory();

    const ws = new WebSocket('ws://localhost:8000/ws/alerts');
    ws.onmessage = (event) => {
      const newAlert = JSON.parse(event.data);
      setAlerts((prev) => {
        if (prev.find(a => a.id === newAlert.id)) return prev;
        return [newAlert, ...prev].slice(0, 20);
      });
    };
    return () => ws.close();
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('soc_token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }


  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-section">
          <Shield size={32} />
          <span>SOC COPILOT</span>
        </div>
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <LayoutDashboard size={20} />
            <span style={{ fontWeight: 600 }}>Dashboard</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <Bell size={20} />
            <span>Alerts</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <SettingsIcon size={20} />
            <span>Settings</span>
          </div>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>SOC Analyst</div>
            <button 
              onClick={handleLogout}
              style={{ 
                fontSize: '0.7rem', 
                color: 'var(--accent)', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline'
              }}
            >
              Sign Out
            </button>
          </div>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'var(--primary)', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: 'white'
          }}>SA</div>
        </div>

      </header>

      <aside className="alert-feed-section">
        <AlertFeed />
      </aside>

      <main className="main-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', height: '200px' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>84</div>
            <div style={{ color: 'var(--text-muted)' }}>Daily Risk Score</div>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--danger)' }}>12</div>
            <div style={{ color: 'var(--text-muted)' }}>High Severity Alerts</div>
          </div>
        </div>
        <AttackGraph alerts={alerts} />
      </main>

      <aside className="copilot-section">
        <SocCopilot />
      </aside>
    </div>
  );
};

export default AIDashboard;
