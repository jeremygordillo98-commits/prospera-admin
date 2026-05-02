'use client';

import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { SoporteAppTab } from './SoporteAppTab';
import { SoportePymesTab } from './SoportePymesTab';
import { NotificacionesTab } from './NotificacionesTab';
import { NoticiasTab } from './NoticiasTab';

type Tab = 'support' | 'pymes-support' | 'notifications' | 'news';

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'support', label: 'Soporte App', emoji: '📨' },
  { id: 'pymes-support', label: 'Soporte Pymes', emoji: '🏢' },
  { id: 'notifications', label: 'Notificaciones', emoji: '🔔' },
  { id: 'news', label: 'Noticias Landing', emoji: '🌐' },
];

export default function CommsView() {
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('support');

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '12px 18px',
    background: active ? theme.primary : 'transparent',
    color: active ? (isDark ? '#000' : '#fff') : theme.textSec,
    border: active ? 'none' : `1px solid ${theme.border}`,
    borderRadius: 12, cursor: 'pointer', fontWeight: 800,
    fontSize: '0.85rem', display: 'flex', alignItems: 'center',
    gap: 8, transition: 'all 0.2s',
  });

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={tabStyle(activeTab === t.id)}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {activeTab === 'support' && <SoporteAppTab />}
      {activeTab === 'pymes-support' && <SoportePymesTab />}
      {activeTab === 'notifications' && <NotificacionesTab />}
      {activeTab === 'news' && <NoticiasTab />}
    </div>
  );
}
