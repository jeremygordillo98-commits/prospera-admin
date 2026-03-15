import React from 'react'; // Re-saved
import { useTheme } from '../../context/ThemeContext';

const IconSun = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="18.36" x2="5.64" y2="19.78"/><line x1="18.36" y1="4.22" x2="19.78" y2="5.64"/></svg>;
const IconMoon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;

export default function ConfigView() {
  const { theme, isDark, toggleTheme } = useTheme();

  const cardStyle = { 
      background: theme.card, 
      padding: 30, 
      borderRadius: 24, 
      border: `1px solid ${theme.border}`,
      maxWidth: 600,
      margin: '0 auto'
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
        <h2 style={{ marginBottom: 30, fontWeight: 800 }}>Configuración del Sistema</h2>
        
        <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 700 }}>Personalización</h3>
            <p style={{ color: theme.textSec, fontSize: '0.9rem', marginBottom: 30 }}>
                Ajusta la apariencia visual de tu panel de administración. Los cambios se aplicarán instantáneamente.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', background: theme.bg, borderRadius: 16, border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    <div style={{ color: isDark ? '#fbbf24' : '#6366f1' }}>
                        {isDark ? <IconMoon /> : <IconSun />}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>Modo de Visualización</div>
                        <div style={{ fontSize: '0.8rem', color: theme.textSec }}>Actual: {isDark ? 'Oscuro' : 'Claro'}</div>
                    </div>
                </div>
                <button 
                  onClick={toggleTheme}
                  style={{ 
                    background: isDark ? '#fff' : '#000', 
                    color: isDark ? '#000' : '#fff', 
                    border: 'none', 
                    padding: '10px 20px', 
                    borderRadius: 12, 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Cambiar a Modo {isDark ? 'Claro' : 'Oscuro'}
                </button>
            </div>
        </div>

        <div style={{ marginTop: 40, textAlign: 'center', color: theme.textSec, fontSize: '0.8rem' }}>
            Prospera Admin Engine v3.5.2 • 2026 Free Spirit
        </div>
    </div>
  );
}
