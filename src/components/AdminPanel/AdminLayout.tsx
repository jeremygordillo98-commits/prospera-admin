import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase';
import ControlView from './ControlView';
import CommsView from './CommsView';
import ReportsView from './ReportsView';
import ConfigView from "./SysConfig";
import { ContableManager } from './ContableManager';
import CrmView from './CrmView';
import AnaliticaView from './AnaliticaView';
import { MoreHorizontal, X, LogOut, ChevronRight } from 'lucide-react';

// --- ÍCONOS SVG PREMIUM ---
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const IconChart = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const IconActivity = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const IconMessage = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const IconLogOut = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const IconSettings = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;

const IconCalculator = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="16" y1="14" x2="16" y2="18" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" /></svg>;
const IconBriefcase = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;

export default function AdminLayout() {
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'control' | 'pymes' | 'crm' | 'analitica' | 'reportes' | 'comms' | 'config'>(() => {
    const saved = localStorage.getItem('admin_active_tab');
    return (saved && saved !== 'dashboard' ? saved : 'analitica') as any;
  });

  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    localStorage.setItem('admin_active_tab', activeTab);
  }, [activeTab]);

  const menuItems = [
    { id: 'analitica', label: 'Analítica', icon: <IconActivity /> },
    { id: 'control', label: 'Usuarios', icon: <IconUsers /> },
    { id: 'pymes', label: 'PYMEs', icon: <IconCalculator /> },
    { id: 'crm', label: 'Ventas', icon: <IconBriefcase /> },
    { id: 'reportes', label: 'Reportes', icon: <IconChart /> },
    { id: 'comms', label: 'Canales', icon: <IconMessage /> },
    { id: 'config', label: 'Sistema', icon: <IconSettings /> },
  ];

  // Elementos principales para la barra inferior en celulares
  const mobileBottomItems = [
    { id: 'analitica', label: 'Analítica', icon: <IconActivity /> },
    { id: 'pymes', label: 'PYMEs', icon: <IconCalculator /> },
    { id: 'control', label: 'Usuarios', icon: <IconUsers /> },
    { id: 'comms', label: 'Canales', icon: <IconMessage /> },
  ];

  const secondaryMobileItems = [
    { id: 'crm', label: 'Ventas & CRM', icon: <IconBriefcase />, desc: 'Prospectos, leads y campañas comerciales' },
    { id: 'reportes', label: 'Reportes Globales', icon: <IconChart />, desc: 'Métricas de retención y volumenes' },
    { id: 'config', label: 'Sistema & APIs', icon: <IconSettings />, desc: 'Mantenimiento, APIs y tarifas' },
  ];

  const getNavItemStyle = (isActive: boolean) => ({
    background: isActive ? `${theme.primary}15` : 'transparent',
    color: isActive ? theme.primary : theme.textSec,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as any);
    setShowMoreMenu(false);
  };

  return (
    <div
      className="flex flex-col min-h-screen font-sans pb-20 lg:pb-0"
      style={{
        background: theme.bg,
        color: theme.text,
      }}
    >

      {/* HEADER / TOP NAVIGATION */}
      <aside
        className="sticky top-0 z-40 w-full transition-all duration-300 ease-in-out shadow-sm shrink-0"
        style={{
          background: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div className="max-w-[1600px] mx-auto w-full px-4 py-3 lg:px-8 flex items-center justify-between gap-4">
          
          {/* LOGO & MOBILE HEADER */}
          <div className="flex items-center justify-between w-full lg:w-auto shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
                style={{
                  boxShadow: `0 8px 16px ${theme.primary}40`,
                }}
              >
                <img src="/admin-logo.png" alt="Admin" className="w-full h-full object-cover" />
              </div>
              <div className="font-extrabold text-[1.1rem] tracking-tight whitespace-nowrap">
                PROSPERA <span className="text-[0.65rem] align-middle px-2 py-0.5 rounded-full ml-1.5 font-extrabold" style={{ color: theme.primary, background: theme.primary + '15' }}>ROOT</span>
              </div>
            </div>

            {/* Logout button for smaller screens */}
            <div className="flex items-center gap-2 lg:hidden">
              <span className="text-[0.65rem] font-extrabold text-slate-400 px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700">
                v4.1
              </span>
              <button 
                onClick={handleLogout} 
                className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-none" 
                style={{ background: theme.danger + '15', color: theme.danger }}
                title="Cerrar Sesión"
              >
                <IconLogOut />
              </button>
            </div>
          </div>

          {/* DESKTOP NAVIGATION (Hidden on mobile < 1024px) */}
          <nav 
            className="hidden lg:flex flex-1 flex-row items-center justify-center gap-2 py-1.5" 
          >
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className="flex items-center gap-2 px-4 py-2.5 border-none text-[0.9rem] cursor-pointer text-left transition-all duration-300 ease-out rounded-xl nav-item-admin shrink-0"
                  style={{
                    ...getNavItemStyle(isActive),
                    fontWeight: isActive ? 800 : 600,
                  }}
                >
                  <div 
                    className="shrink-0" 
                    style={{ 
                      transform: isActive ? 'scale(1.1)' : 'scale(1)', 
                      transition: 'transform 0.2s',
                      color: isActive ? theme.primary : theme.textSec,
                    }}
                  >
                    {item.icon}
                  </div>
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* DESKTOP LOGOUT & VERSION INFO */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <div className="text-[0.65rem] font-bold tracking-widest opacity-50 whitespace-nowrap" style={{ color: theme.textSec }}>
              ADMIN CORE v4.1
            </div>
            <button 
              onClick={handleLogout} 
              className="border-none flex items-center gap-2 py-2 px-4 text-[0.9rem] font-bold cursor-pointer rounded-xl transition-all duration-200" 
              style={{ background: theme.danger + '10', color: theme.danger }} 
              onMouseOver={(e) => e.currentTarget.style.background = `${theme.danger}20`} 
              onMouseOut={(e) => e.currentTarget.style.background = `${theme.danger}10`}
            >
              <IconLogOut />
              <span>Cerrar Sesión</span>
            </button>
          </div>

        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 lg:px-16 overflow-y-auto max-w-[1600px] mx-auto w-full box-border">
        <div style={{ animation: 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          {activeTab === 'control' && <ControlView />}
          {activeTab === 'pymes' && <ContableManager />}
          {activeTab === 'crm' && <CrmView />}
          {activeTab === 'analitica' && <AnaliticaView />}
          {activeTab === 'reportes' && <ReportsView />}
          {activeTab === 'comms' && <CommsView />}
          {activeTab === 'config' && <ConfigView />}
        </div>
      </main>

      {/* 📱 BARRA DE NAVEGACIÓN INFERIOR MÓVIL (SÓLO CELULARES & TABLETS < 1024PX) */}
      <div 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t px-3 py-2 flex items-center justify-around"
        style={{
          background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: theme.border,
          boxShadow: '0 -10px 25px rgba(0,0,0,0.2)'
        }}
      >
        {mobileBottomItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className="flex flex-col items-center gap-1 border-none bg-transparent cursor-pointer py-1 px-2.5 transition-all rounded-xl border-none"
              style={{
                color: isActive ? theme.primary : theme.textSec,
              }}
            >
              <div 
                className="p-1 rounded-xl transition-all"
                style={{
                  background: isActive ? `${theme.primary}20` : 'transparent',
                  transform: isActive ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                {item.icon}
              </div>
              <span className="text-[0.68rem] font-extrabold tracking-tight whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* BOTÓN MÁS (Despliega menú táctil flotante) */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className="flex flex-col items-center gap-1 border-none bg-transparent cursor-pointer py-1 px-2.5 transition-all rounded-xl"
          style={{
            color: ['crm', 'reportes', 'config'].includes(activeTab) ? theme.primary : theme.textSec,
          }}
        >
          <div 
            className="p-1 rounded-xl transition-all"
            style={{
              background: ['crm', 'reportes', 'config'].includes(activeTab) ? `${theme.primary}20` : 'transparent',
            }}
          >
            <MoreHorizontal size={20} />
          </div>
          <span className="text-[0.68rem] font-extrabold tracking-tight whitespace-nowrap">
            Más
          </span>
        </button>
      </div>

      {/* 📱 MODAL TÁCTIL MÁS (BOTTOM SHEET MÓVIL) */}
      {showMoreMenu && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-fadeIn"
          onClick={() => setShowMoreMenu(false)}
        >
          <div 
            className="rounded-t-3xl p-6 border-t shadow-2xl space-y-5 animate-slideUp max-h-[80vh] overflow-y-auto"
            style={{
              background: theme.card,
              borderColor: theme.border,
              color: theme.text
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: theme.border }}>
              <div>
                <h3 className="font-black text-base margin-0 flex items-center gap-2">
                  <MoreHorizontal size={20} style={{ color: theme.primary }} /> Módulos Adicionales
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Selecciona el módulo del Admin al que deseas navegar</p>
              </div>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center border-none bg-slate-800 text-slate-300 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {secondaryMobileItems.map((sec) => {
                const isActive = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => handleTabChange(sec.id)}
                    className="w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer border-none"
                    style={{
                      background: isActive ? `${theme.primary}15` : theme.bg,
                      borderColor: isActive ? theme.primary : theme.border,
                      color: theme.text
                    }}
                  >
                    <div className="flex items-center gap-3.5">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: isActive ? `${theme.primary}25` : 'rgba(255,255,255,0.05)',
                          color: isActive ? theme.primary : theme.textSec
                        }}
                      >
                        {sec.icon}
                      </div>
                      <div>
                        <div className="font-extrabold text-sm">{sec.label}</div>
                        <div className="text-[0.72rem] text-slate-400 mt-0.5">{sec.desc}</div>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-500" />
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t" style={{ borderColor: theme.border }}>
              <button
                onClick={handleLogout}
                className="w-full p-3.5 rounded-2xl border-none font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444'
                }}
              >
                <LogOut size={16} /> Cerrar Sesión del Panel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(100%); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .nav-item-admin:hover { opacity: 1; background: ${theme.primary}08; }
        `}
      </style>
    </div>
  );
}
