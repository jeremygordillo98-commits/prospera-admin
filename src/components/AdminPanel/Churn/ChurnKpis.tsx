import React from 'react';
import { ShieldAlert, UserX, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ChurnKpisProps {
  theme: any;
  isDark: boolean;
  kpis: {
    total: number;
    criticos: number;
    enRiesgo: number;
    activos: number;
    rate: number;
  };
}

export const ChurnKpis: React.FC<ChurnKpisProps> = ({ theme, isDark, kpis }) => {
  const cardStyle = {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: '20px',
    padding: '20px',
    boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.2)' : '0 10px 30px rgba(0,0,0,0.02)',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '25px' }}>
      
      {/* KPI: Tasa de Churn Global */}
      <div style={{ ...cardStyle, borderLeft: '4px solid #ef4444' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ color: theme.textSec, fontSize: '0.72rem', fontWeight: 900 }}>TASA DE CHURN ESTIMADA</span>
          <ShieldAlert size={18} style={{ color: '#ef4444' }} />
        </div>
        <div style={{ fontSize: '1.7rem', fontWeight: 900, color: theme.text }}>
          {kpis.rate.toFixed(1)}%
        </div>
        <div style={{ fontSize: '0.75rem', color: theme.textSec, marginTop: '4px' }}>
          {kpis.criticos} de {kpis.total} cuentas inactivas &gt;14d
        </div>
      </div>

      {/* KPI: Críticos (>14d) */}
      <div style={{ ...cardStyle, borderLeft: '4px solid #f87171' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ color: theme.textSec, fontSize: '0.72rem', fontWeight: 900 }}>RIESGO CRÍTICO (&gt;14 DÍAS)</span>
          <UserX size={18} style={{ color: '#f87171' }} />
        </div>
        <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#ef4444' }}>
          {kpis.criticos}
        </div>
        <div style={{ fontSize: '0.75rem', color: theme.textSec, marginTop: '4px' }}>
          Requieren re-engagement urgente
        </div>
      </div>

      {/* KPI: En Riesgo (8-14d) */}
      <div style={{ ...cardStyle, borderLeft: '4px solid #f59e0b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ color: theme.textSec, fontSize: '0.72rem', fontWeight: 900 }}>EN ALERTA (8-14 DÍAS)</span>
          <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
        </div>
        <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#f59e0b' }}>
          {kpis.enRiesgo}
        </div>
        <div style={{ fontSize: '0.75rem', color: theme.textSec, marginTop: '4px' }}>
          Seguimiento preventivo
        </div>
      </div>

      {/* KPI: Activos (<=7d) */}
      <div style={{ ...cardStyle, borderLeft: `4px solid ${theme.primary}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ color: theme.textSec, fontSize: '0.72rem', fontWeight: 900 }}>CUENTAS ACTIVAS (≤7 DÍAS)</span>
          <CheckCircle2 size={18} style={{ color: theme.primary }} />
        </div>
        <div style={{ fontSize: '1.7rem', fontWeight: 900, color: theme.primary }}>
          {kpis.activos}
        </div>
        <div style={{ fontSize: '0.75rem', color: theme.textSec, marginTop: '4px' }}>
          Operación saludable
        </div>
      </div>
    </div>
  );
};
