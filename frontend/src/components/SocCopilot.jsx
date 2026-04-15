import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import axios from 'axios';

const SocCopilot = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI SOC Copilot. How can I help you investigate today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const sessionId = "session-123"; // Mock session

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/chat/', {
        session_id: sessionId,
        query: input
      });
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Could not reach the AI backend.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card copilot-section" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
        <Bot size={20} color="var(--primary)" />
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>SOC Copilot</h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', padding: '10px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            marginBottom: '1rem', 
            textAlign: msg.role === 'user' ? 'right' : 'left',
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{msg.role}</span>
            </div>
            <div style={{ 
              display: 'inline-block',
              padding: '8px 12px',
              borderRadius: '12px',
              background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
              fontSize: '0.9rem',
              maxWidth: '85%',
              lineHeight: '1.4'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={14} className="animate-spin" />
            <span style={{ fontSize: '0.8rem' }}>AI thinking...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Copilot..."
          style={{ 
            flex: 1, 
            background: 'rgba(0,0,0,0.2)', 
            border: '1px solid var(--border)', 
            borderRadius: '8px', 
            padding: '8px 12px',
            color: 'white',
            outline: 'none'
          }}
        />
        <button 
          onClick={handleSend}
          style={{ 
            background: 'var(--primary)', 
            border: 'none', 
            borderRadius: '8px', 
            padding: '8px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          disabled={loading}
        >
          <Send size={18} color="white" />
        </button>
      </div>
    </div>
  );
};

export default SocCopilot;
