import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useTheme } from '../context/ThemeContext'; 

export default function UpdatePassword() {
  const { theme, isDark } = useTheme();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Añadido para mejor UX
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  // --- RESPONSIVE CHECK ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 480);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 480);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
    }
    if (password.length < 6) {
      return setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: '¡Contraseña actualizada! Entrando a tu cuenta...' });
      
      // Limpiamos el hash de la URL por seguridad
      window.history.replaceState(null, '', window.location.pathname);
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    }
    setLoading(false);
  };

  // Iconos SVG para el ojito (mantenemos tu estilo)
  const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F172A', padding: isMobile ? '15px' : '20px', position: 'relative', overflow: 'hidden' }}>
      
      {/* ORBES DE LUZ DECORATIVOS */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px', background: theme.primary + '15', borderRadius: '50%', filter: 'blur(100px)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', background: '#7c3bed10', borderRadius: '50%', filter: 'blur(120px)', zIndex: 0 }}></div>

      <div style={{ 
          width: '100%', 
          maxWidth: '440px', 
          background: theme.card, 
          padding: isMobile ? '40px 24px' : '50px', 
          borderRadius: '32px', 
          border: `1px solid ${theme.border}`, 
          textAlign: 'center', 
          boxShadow: isDark ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 25px 50px -12px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(30px)',
          position: 'relative',
          zIndex: 1,
          animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{ fontSize: isMobile ? '3rem' : '3.5rem', marginBottom: '20px', filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.2))' }}>🛡️</div>
        <h2 style={{ color: theme.text, marginBottom: '8px', marginTop: 0, fontSize: '1.8rem', fontWeight: 900 }}>Nueva Clave</h2>
        <p style={{ color: theme.textSec, marginBottom: '40px', fontSize: '1rem', fontWeight: 500 }}>Asegura tu imperio financiero</p>

        {message && (
          <div style={{ 
              padding: '16px', 
              borderRadius: '16px', 
              marginBottom: '30px', 
              fontSize: '0.95rem', 
              fontWeight: 600,
              background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 214, 143, 0.1)', 
              color: message.type === 'error' ? '#ef4444' : theme.primary, 
              border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 214, 143, 0.2)'}`,
              animation: 'shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Escoge una clave fuerte" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={{ 
                    width: '100%', 
                    padding: '16px 20px', 
                    borderRadius: '16px', 
                    border: `1px solid ${theme.border}`, 
                    background: theme.inputBg, 
                    color: theme.text, 
                    outline: 'none', 
                    boxSizing: 'border-box', 
                    paddingRight: '50px',
                    fontSize: '1rem',
                    transition: 'all 0.3s'
                }} 
                required 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: theme.textSec, display: 'flex', alignItems: 'center', padding: 0 }}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <input 
            type="password" 
            placeholder="Repite la clave" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            style={{ 
                width: '100%', 
                padding: '16px 20px', 
                borderRadius: '16px', 
                border: `1px solid ${theme.border}`, 
                background: theme.inputBg, 
                color: theme.text, 
                outline: 'none', 
                boxSizing: 'border-box',
                fontSize: '1rem',
                transition: 'all 0.3s'
            }} 
            required 
          />

          <button 
              type="submit" 
              disabled={loading} 
              style={{ 
                  width: '100%', 
                  padding: '18px', 
                  backgroundColor: theme.primary, 
                  color: isDark ? '#000' : '#fff', 
                  border: 'none', 
                  borderRadius: '16px', 
                  fontWeight: 900, 
                  cursor: loading ? 'wait' : 'pointer', 
                  opacity: loading ? 0.7 : 1, 
                  transition: 'all 0.3s', 
                  fontSize: '1.1rem', 
                  boxSizing: 'border-box',
                  boxShadow: `0 12px 25px ${theme.primary}40`,
                  marginTop: '10px'
              }}
              onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {loading ? 'Sincronizando...' : 'Actualizar e Ingresar'}
          </button>
        </form>
      </div>

      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
          }
          input:focus {
            border-color: ${theme.primary} !important;
            box-shadow: 0 0 0 4px ${theme.primary}20 !important;
          }
        `}
      </style>
    </div>
  );
}
