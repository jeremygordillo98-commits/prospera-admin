import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase'; // <-- Importación necesaria para cerrar sesión
import ControlView from './ControlView';
import CommsView from './CommsView';
import DashboardView from './DashboardView';
import ReportsView from './ReportsView';
import ConfigView from "./SysConfig";
import { ContableManager } from './ContableManager';

// --- ÍCONOS SVG PREMIUM ---
const IconDashboard = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>;
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const IconChart = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const IconMessage = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const IconLogOut = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const IconSettings = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
const IconChevronLeft = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>;
const IconChevronRight = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>;

const IconCalculator = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="16" y1="14" x2="16" y2="18" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" /></svg>;

export default function AdminLayout() {
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'control' | 'contable' | 'reportes' | 'comms' | 'config'>('control');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Métricas', icon: <IconDashboard /> },
    { id: 'control', label: 'Usuarios', icon: <IconUsers /> },
    { id: 'contable', label: 'Contable', icon: <IconCalculator /> },
    { id: 'reportes', label: 'Reportes', icon: <IconChart /> },
    { id: 'comms', label: 'Canales', icon: <IconMessage /> },
    { id: 'config', label: 'Sistema', icon: <IconSettings /> },
  ];

  const getNavItemStyle = (isActive: boolean) => ({
    background: isActive
      ? `linear-gradient(90deg, ${theme.primary}15 0%, transparent 100%)`
      : 'transparent',
    borderLeft: isActive ? `4px solid ${theme.primary}` : '4px solid transparent',
    color: isActive ? theme.primary : theme.textSec,
    opacity: isActive ? 1 : 0.7,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div
      className="flex flex-col lg:flex-row min-h-screen font-sans"
      style={{
        background: theme.bg,
        color: theme.text,
      }}
    >

      {/* SIDEBAR / HEADER */}
      <aside
        className={`flex flex-col sticky top-0 z-50 shrink-0 transition-all duration-300 ease-in-out lg:h-screen lg:border-b-0 shadow-sm lg:shadow-none ${isMobile ? "w-full" : isCollapsed ? "w-[80px]" : "w-[260px]"
          }`}
        style={{
          background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: isMobile ? 'none' : `1px solid ${theme.border}`,
          borderBottom: isMobile ? `1px solid ${theme.border}` : 'none',
        }}
      >

        {/* LOGO SECCIÓN */}
        <div className="py-4 px-5 lg:py-8 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
              style={{
                boxShadow: `0 8px 16px ${theme.primary}40`,
              }}>
              <img src="/admin-logo.png" alt="Admin" className="w-full h-full object-cover" />
            </div>
            {!isCollapsed && (
              <div className="font-extrabold text-[1.1rem] tracking-tight whitespace-nowrap overflow-hidden">
                PROSPERA <span className="text-[0.65rem] align-middle px-2 py-0.5 rounded-full ml-1.5 font-extrabold" style={{ color: theme.primary, background: theme.primary + '15' }}>ROOT</span>
              </div>
            )}
          </div>

          {isMobile && (
            <button onClick={handleLogout} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-none" style={{ background: theme.danger + '15', color: theme.danger }}>
              <IconLogOut />
            </button>
          )}
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible px-2.5 pb-2.5 lg:px-0 lg:py-2.5 gap-2 lg:gap-0" style={{ scrollbarWidth: 'none' }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              title={isCollapsed ? item.label : ""}
              className={isMobile
                ? "flex flex-col items-center gap-1 p-2.5 border-none rounded-xl text-[0.7rem] font-extrabold flex-1 min-w-[80px] transition-all duration-200"
                : `flex items-center w-full py-3.5 border-none text-[0.9rem] cursor-pointer text-left transition-all duration-300 ease-out lg:rounded-r-xl lg:my-0.5 nav-item-admin ${isCollapsed ? "justify-center px-0" : "gap-3 px-5"
                }`}
              style={isMobile ? {
                background: activeTab === item.id ? theme.primary + '15' : 'transparent',
                color: activeTab === item.id ? theme.primary : theme.textSec,
              } : { ...getNavItemStyle(activeTab === item.id), fontWeight: activeTab === item.id ? 800 : 600 }}
            >
              <div className="shrink-0" style={{ transform: activeTab === item.id ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s' }}>
                {item.icon}
              </div>
              {(!isCollapsed || isMobile) && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
            </button>
          ))}
        </nav>

        {!isMobile && (
          <div className={`p-4 transition-all duration-300 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full mb-4 border-none flex items-center gap-3 py-2.5 px-3 text-[0.7rem] font-extrabold cursor-pointer rounded-xl transition-all duration-200 hover:opacity-100 opacity-60"
              style={{ background: theme.primary + '10', color: theme.primary, justifyContent: isCollapsed ? 'center' : 'flex-start' }}
            >
              {isCollapsed ? <IconChevronRight /> : <><IconChevronLeft /> COLAPSAR</>}
            </button>

            <button onClick={handleLogout} className={`w-full border-none flex items-center py-3.5 text-[0.9rem] font-bold cursor-pointer rounded-xl transition-all duration-200 ${isCollapsed ? "justify-center px-0" : "gap-3 px-4"}`} style={{ background: theme.danger + '10', color: theme.danger }} onMouseOver={(e) => e.currentTarget.style.background = `${theme.danger}20`} onMouseOut={(e) => e.currentTarget.style.background = `${theme.danger}10`}>
              <IconLogOut /> {!isCollapsed && "Cerrar Sesión"}
            </button>
            {!isCollapsed && (
              <div className="text-[0.65rem] text-center mt-5 font-bold tracking-widest opacity-50" style={{ color: theme.textSec }}>
                ADMIN CORE v4.0
              </div>
            )}
          </div>
        )}
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-6 lg:p-10 lg:px-16 overflow-y-auto max-w-[1600px] mx-auto w-full box-border">
        <div style={{ animation: 'slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'control' && <ControlView />}
          {activeTab === 'contable' && <ContableManager />}
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
