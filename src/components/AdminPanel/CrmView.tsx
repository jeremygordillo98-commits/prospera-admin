import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import ProspectsTab from './Crm/ProspectsTab';
import CampaignsTab from './Crm/CampaignsTab';
import ProformasTab from './Crm/ProformasTab';

/**
 * VENTAS B2B & CRM - CONTROLLER PRINCIPAL DE PROSPERA
 * Refactorizado en arquitectura de componentes atómicos.
 * Orquesta la navegación de pestañas y detecta el diseño responsivo móvil.
 */
export default function CrmView() {
  const { theme, isDark } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState<'prospectos' | 'campanas' | 'proformas'>('prospectos');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Escuchador de redimensionamiento para responsividad
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* HEADER CRM */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 32, 
        flexDirection: isMobile ? 'column' : 'row', 
        gap: 20 
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, letterSpacing: '-1px' }}>
            Ventas B2B & CRM
          </h2>
          <div style={{ color: theme.textSec, fontSize: '0.9rem', marginTop: 4, fontWeight: 600 }}>
            Gestión de prospectos Pymes, campañas masivas y diseñador de proformas
          </div>
        </div>
      </div>

      {/* SUB-NAVEGACIÓN DE PESTAÑAS */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 10 }}>
        {(['prospectos', 'campanas', 'proformas'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            style={{
              background: activeSubTab === tab ? theme.primary : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
              color: activeSubTab === tab ? '#fff' : theme.text,
              border: 'none',
              padding: '12px 24px',
              borderRadius: 14,
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.2s',
              boxShadow: activeSubTab === tab ? `0 8px 24px ${theme.primary}40` : 'none',
              whiteSpace: 'nowrap'
            }}
          >
            {tab === 'prospectos' && '👤 Prospectos (Leads)'}
            {tab === 'campanas' && '📨 Campañas (Brevo)'}
            {tab === 'proformas' && '📄 Generador Proformas'}
          </button>
        ))}
      </div>

      {/* RENDERIZADO REACTIVO DE SUB-MÓDULOS */}
      <div style={{ transition: 'all 0.3s ease' }}>
        {activeSubTab === 'prospectos' && (
          <ProspectsTab theme={theme} isDark={isDark} isMobile={isMobile} />
        )}

        {activeSubTab === 'campanas' && (
          <CampaignsTab theme={theme} isDark={isDark} isMobile={isMobile} />
        )}

        {activeSubTab === 'proformas' && (
          <ProformasTab theme={theme} isDark={isDark} isMobile={isMobile} />
        )}
      </div>
    </div>
  );
}
