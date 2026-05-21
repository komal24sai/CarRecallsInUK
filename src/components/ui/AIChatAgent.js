'use client';

import { useState, useRef, useEffect } from 'react';

export default function AIChatAgent({ isUnlocked, context, onUnlockClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello! I am your AI Automotive Forensic Analyst. I have analyzed this vehicle's MOT history, defects, and market value. What would you like to know?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    if (!isUnlocked) {
      onUnlockClick?.();
      return;
    }

    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context })
      });
      
      const data = await res.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error analyzing the data.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Connection failed. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "What is the biggest risk with this car?",
    "Is the asking price fair?",
    "What should I ask the dealer?"
  ];

  return (
    <>
      {/* Floating Action Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '30px',
          background: 'linear-gradient(135deg, var(--accent-yellow) 0%, #F59E0B 100%)',
          boxShadow: '0 8px 32px rgba(246, 224, 94, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 50,
          transition: 'transform 0.2s, box-shadow 0.2s',
          transform: isOpen ? 'scale(0.9)' : 'scale(1)',
        }}
      >
        <span style={{ fontSize: '1.8rem' }}>🤖</span>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '6rem',
          right: '2rem',
          width: '380px',
          height: '600px',
          maxHeight: '80vh',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {/* Header */}
          <div style={{
            padding: '1.25rem',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#48BB78', boxShadow: '0 0 10px #48BB78' }}></div>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--text-primary)' }}>AI Forensic Agent</h3>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            position: 'relative'
          }}>
            {/* Paywall Blur Layer */}
            {!isUnlocked && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(13,15,20,0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</span>
                <h4 style={{ color: '#FFF', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>AI Agent Locked</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                  Unlock the full report to ask the AI specific questions about this vehicle's history, value, and hidden risks.
                </p>
                <button 
                  onClick={onUnlockClick}
                  style={{
                    background: 'var(--accent-yellow)',
                    color: '#000',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Unlock Full Report
                </button>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: msg.role === 'user' ? 'var(--accent-blue)' : 'var(--bg-primary)',
                color: msg.role === 'user' ? '#FFF' : 'var(--text-primary)',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
                borderBottomRightRadius: msg.role === 'user' ? '2px' : '8px',
                borderBottomLeftRadius: msg.role === 'assistant' ? '2px' : '8px',
                fontSize: '0.95rem',
                lineHeight: '1.5'
              }}>
                {/* Simple markdown parsing for bold text */}
                <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
              </div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', background: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <span className="dot-typing">Analyzing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div style={{ padding: '0 1.25rem 0.5rem 1.25rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none', filter: isUnlocked ? 'none' : 'blur(2px)' }}>
            {quickPrompts.map((prompt, idx) => (
              <button 
                key={idx}
                onClick={() => handleSend(prompt)}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '0.5rem 0.8rem',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap',
                  cursor: isUnlocked ? 'pointer' : 'default',
                  transition: 'background 0.2s, color 0.2s'
                }}
                onMouseOver={e => isUnlocked && (e.currentTarget.style.color = 'var(--accent-yellow)')}
                onMouseOut={e => isUnlocked && (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', background: 'var(--bg-primary)' }}>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              disabled={!isUnlocked || isLoading}
              placeholder="Ask about this vehicle..."
              style={{
                flex: 1,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                outline: 'none',
                opacity: isUnlocked ? 1 : 0.5
              }}
            />
            <button 
              onClick={() => handleSend()}
              disabled={!isUnlocked || isLoading || !input.trim()}
              style={{
                background: 'var(--accent-yellow)',
                border: 'none',
                width: '45px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (isUnlocked && input.trim()) ? 'pointer' : 'not-allowed',
                opacity: (isUnlocked && input.trim()) ? 1 : 0.5
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
