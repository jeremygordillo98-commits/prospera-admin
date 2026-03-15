import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  isDark: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose, isDark }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for transition
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '100px'})`,
      opacity: visible ? 1 : 0,
      background: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(15px)',
      WebkitBackdropFilter: 'blur(15px)',
      color: isDark ? '#f8fafc' : '#0f172a',
      padding: '14px 28px',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
      borderLeft: `5px solid ${colors[type]}`,
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      maxWidth: '92vw',
      width: 'max-content'
    }}>
      <div style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: colors[type],
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 900,
        boxShadow: `0 0 15px ${colors[type]}40`
      }}>
        {type === 'success' && '✓'}
        {type === 'error' && '✕'}
        {type === 'warning' && '!'}
        {type === 'info' && 'i'}
      </div>
      <span style={{ fontWeight: 600, fontSize: '0.95rem', letterSpacing: '-0.3px' }}>{message}</span>
    </div>
  );
};
