'use client';

import { useEffect } from 'react';
import './Toast.css';

export default function Toast({ title, message, icon = '✅', duration = 5000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="toast">
      <div className="toast-icon">{icon}</div>
      <div className="toast-content">
        <div className="toast-title">{title}</div>
        <div className="toast-desc">{message}</div>
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
    </div>
  );
}
