import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Activity, MessageSquare, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const WarRoomPage = ({ alerts }) => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: '## 🚨 WAR ROOM INITIATED\nI am compiling the global incident timeline. High severity anomalous activity detected on standard ports. Ready for analyst inputs and remediation commands.' 
    }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    
    // Simulate AI Scribe response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `**Action Logged:** Analyst noted "${input}".\n\n*Updating global timeline based on this context...*` 
      }]);
    }, 1000);
    
    setInput('');
  };

  const highSeverityAlerts = alerts.filter(a => a.severity >= 7);

  return (
    <div className="war-room-container" style={{
      gridArea: 'main', 
      display: 'grid', 
      gridTemplateColumns: 'minmax(300px, 1fr) minmax(400px, 1.2fr)',
      gap: 'var(--gap)',
      height: '100%',
      minHeight: 0
    }}>
      {/* Left Pane: Global Incident Timeline */}
      <div className="card timeline-pane" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={20} color="var(--danger)" />
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Global Incident Timeline</h2>
        </div>
        
        <div className="timeline-feed" style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
          {highSeverityAlerts.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>No critical incidents to display.</div>
          ) : (
            highSeverityAlerts.map((alert, idx) => (
              <div key={alert.id} style={{
                position: 'relative',
                paddingLeft: '24px',
                paddingBottom: '20px',
                borderLeft: idx !== highSeverityAlerts.length - 1 ? '2px solid var(--border)' : '2px solid transparent'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '-6px',
                  top: 0,
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: alert.severity >= 12 ? 'var(--danger)' : 'var(--warning)',
                  boxShadow: `0 0 10px ${alert.severity >= 12 ? 'var(--danger)' : 'var(--warning)'}`
                }} />
                
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontFamily: 'monospace' }}>
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {alert.rule_description}
                </div>
                {alert.ai_analysis && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '6px' }}>
                    {alert.ai_analysis.split('\n')[0]}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane: AI Scribe / Collab Chat */}
      <div className="card chat-pane" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} color="var(--primary)" />
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>AI Scribe & War Room Chat</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 700 }}>
            <CheckCircle2 size={14} /> RECORDING
          </div>
        </div>
        
        <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {msg.role === 'assistant' ? <><Bot size={12}/> AI SCRIBE</> : <><User size={12} /> ANALYST</>}
              </div>
              <div style={{
                background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: 'white',
                padding: '10px 14px',
                borderRadius: '8px',
                maxWidth: '90%',
                fontSize: '0.9rem',
                border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none'
              }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Log an action or ask the AI Scribe..."
            style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', padding: '12px', color: 'white', borderRadius: 'var(--radius-sm)' }}
          />
          <button 
            onClick={handleSend}
            style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarRoomPage;
