import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import apiClient, { parseError } from '../api/apiClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SocCopilot = ({ isExpanded, onToggleExpand }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI SOC Copilot. How can I help you investigate today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  const sessionId = 'session-123';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea: reset to auto first so shrinking works too
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [input, autoResize]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await apiClient.post('/chat/', {
        session_id: sessionId,
        query: input
      });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.response }
      ]);
    } catch (err) {
      const detailedError = parseError(err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${detailedError}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    // Send on Enter; Shift+Enter inserts a newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="card copilot-card" style={{ height: '100%', transition: 'all 0.3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexShrink: 0 }}>
        <Bot size={18} color="var(--primary)" />
        <h2 className="section-title">SOC Copilot</h2>
        
        <button 
          onClick={onToggleExpand}
          title={isExpanded ? "Shrink Chat" : "Expand Chat"}
          style={{
            marginLeft: 'auto',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            transition: 'all 0.2s'
          }}
          className="expand-btn"
        >
          {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>

        <span style={{
          width: 8, height: 8,
          borderRadius: '50%',
          background: 'var(--success)',
          boxShadow: '0 0 6px var(--success)'
        }} />
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`chat-msg ${msg.role} ${msg.role === 'assistant' ? 'assistant-msg-container' : ''}`}
          >
            <div className="chat-role">
              {msg.role === 'assistant' ? <Bot size={14} color="var(--primary)" /> : <User size={14} />}
              <span style={{ fontWeight: 700, letterSpacing: '0.05em' }}>{msg.role === 'assistant' ? 'AI FORENSIC REPORT' : 'ANALYST'}</span>
            </div>
            <div className={`chat-bubble ${msg.role}`}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg assistant assistant-msg-container">
            <div className="chat-role">
              <Bot size={14} color="var(--primary)" /> 
              <span style={{ fontWeight: 700, letterSpacing: '0.05em' }}>AI ANALYZING...</span>
            </div>
            <div className="chat-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)' }}>
              <Loader2 size={16} className="animate-spin" />
              <span style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>Streaming forensic data...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-row" style={{ alignItems: 'flex-end', marginTop: '16px' }}>
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={input}
          rows={1}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Ask Copilot… (Shift+Enter for new line)"
          style={{ resize: 'none', overflow: 'hidden', maxHeight: '160px', overflowY: 'auto' }}
        />
        <button className="btn-send" onClick={handleSend} disabled={loading}>
          <Send size={16} color="white" />
        </button>
      </div>
    </div>
  );
};

export default SocCopilot;
