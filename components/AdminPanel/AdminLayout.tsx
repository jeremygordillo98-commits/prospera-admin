import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase'; // <-- Importación necesaria para cerrar sesión
import ControlView from './ControlView';
import CommsView from './CommsView';
import DashboardView from './DashboardView'; 
import ReportsView from './ReportsView';
import ConfigView from "./SysConfig";

// --- ÍCONOS SVG PREMIUM ---
const IconDashboard = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>;
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconChart = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IconMessage = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IconLogOut = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconSettings = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;

export default function AdminLayout() {
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'control' | 'reportes' | 'comms' | 'config'>('control');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Métricas', icon: <IconDashboard /> },
    { id: 'control', label: 'Usuarios', icon: <IconUsers /> },
    { id: 'reportes', label: 'Reportes', icon: <IconChart /> },
    { id: 'comms', label: 'Canales', icon: <IconMessage /> },
    { id: 'config', label: 'Sistema', icon: <IconSettings /> },
  ];

  const getNavItemStyle = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    padding: '14px 20px',
    background: isActive 
      ? `linear-gradient(90deg, ${theme.primary}15 0%, transparent 100%)` 
      : 'transparent',
    border: 'none',
    borderLeft: isActive ? `4px solid ${theme.primary}` : '4px solid transparent',
    color: isActive ? theme.primary : theme.textSec,
    fontSize: '0.9rem',
    fontWeight: isActive ? 800 : 600,
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: isMobile ? '0' : '0 12px 12px 0',
    margin: isMobile ? '0' : '2px 0',
    opacity: isActive ? 1 : 0.7,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      minHeight: '100vh', 
      background: theme.bg, 
      color: theme.text,
      fontFamily: "'Inter', sans-serif"
    }}>
      
      {/* SIDEBAR / HEADER */}
      <aside style={{ 
        width: isMobile ? '100%' : '260px',
        background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: isMobile ? 'none' : `1px solid ${theme.border}`,
        borderBottom: isMobile ? `1px solid ${theme.border}` : 'none',
        display: 'flex',
        flexDirection: 'column',
        position: isMobile ? 'sticky' : 'sticky',
        top: 0,
        height: isMobile ? 'auto' : '100vh',
        zIndex: 1000,
        flexShrink: 0,
        boxShadow: isMobile ? '0 4px 20px rgba(0,0,0,0.05)' : 'none'
      }}>
        
        {/* LOGO SECCIÓN */}
        <div style={{ 
          padding: isMobile ? '16px 20px' : '32px 24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <div style={{ 
                  width: 36, height: 36, 
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #10b981)', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#fff', 
                  fontWeight: 900, 
                  fontSize: '1.2rem',
                  boxShadow: `0 8px 16px ${theme.primary}40`
                }}>P</div>
                <div style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.5px' }}>
                  PROSPERA <span style={{ color: theme.primary, fontSize: '0.65rem', verticalAlign: 'middle', background: theme.primary + '15', padding: '2px 8px', borderRadius: '20px', marginLeft: '6px', fontWeight: 800 }}>ROOT</span>
                </div>
            </div>

            {isMobile && (
                <button onClick={handleLogout} style={{ background: theme.danger + '15', border: 'none', color: theme.danger, width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <IconLogOut />
                </button>
            )}
        </div>

        {/* NAVEGACIÓN */}
        <nav style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: isMobile ? 'row' : 'column',
          overflowX: isMobile ? 'auto' : 'visible',
          padding: isMobile ? '0 10px 10px' : '10px 0',
          gap: isMobile ? '8px' : '0',
          scrollbarWidth: 'none'
        }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              style={isMobile ? {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
                padding: '10px 15px',
                background: activeTab === item.id ? theme.primary + '15' : 'transparent',
                border: 'none',
                borderRadius: '12px',
                color: activeTab === item.id ? theme.primary : theme.textSec,
                fontSize: '0.7rem',
                fontWeight: 800,
                flex: 1,
                minWidth: '80px',
                transition: 'all 0.2s'
              } : getNavItemStyle(activeTab === item.id)}
            >
              <div style={{ transform: activeTab === item.id ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s' }}>
                {item.icon}
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {!isMobile && (
          <div style={{ padding: '24px' }}>
            <button onClick={handleLogout} style={{ width: '100%', background: theme.danger + '10', border: 'none', color: theme.danger, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', borderRadius: '14px', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = `${theme.danger}20`} onMouseOut={(e) => e.currentTarget.style.background = `${theme.danger}10`}>
                <IconLogOut /> Cerrar Sesión
            </button>
            <div style={{ fontSize: '0.65rem', color: theme.textSec, textAlign: 'center', marginTop: 20, opacity: 0.5, fontWeight: 700, letterSpacing: '1px' }}>
              ADMIN CORE v4.0
            </div>
          </div>
        )}
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ 
        flex: 1, 
        padding: isMobile ? '24px 16px' : '40px 60px', 
        overflowY: 'auto',
        maxWidth: '1600px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
          <div style={{ animation: 'slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'control' && <ControlView />}
            {activeTab === 'reportes' && <ReportsView />}
            {activeTab === 'comms' && <CommsView />}
            {activeTab === 'config' && <ConfigView />}
          </div>
      </main>

      <style>
        {`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          aside nav::-webkit-scrollbar { display: none; }
          .nav-item-admin:hover { opacity: 1; background: ${theme.primary}08; }
        `}
      </style>
    </div>
  );
}
