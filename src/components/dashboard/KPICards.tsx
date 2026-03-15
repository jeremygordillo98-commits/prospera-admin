import React from 'react';
import { formatCurrency } from '../../utils/financial-helpers';
import { IconTarget } from './DashboardIcons';

interface KPICardsProps {
  isMobile: boolean;
  theme: any;
  periodStats: any;
  savingsRate: number;
}

export const KPICards: React.FC<KPICardsProps> = ({
  isMobile,
  theme,
  periodStats,
  savingsRate
}) => {
  const cardStyle = { 
    padding: isMobile ? 20 : 25, 
    borderRadius: 24, 
    background: theme.card, 
    backdropFilter: 'blur(20px)', 
    border: `1px solid ${theme.border}`, 
    height: '100%', 
    boxSizing: 'border-box' as const, 
    boxShadow: '0 15px 35px rgba(0,0,0,0.03)',
    transition: 'transform 0.3s ease'
  };

  return (
    <div className="tour-step-kpi" style={{marginBottom: 30, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20}}>
        {/* AHORRO DEL PERIODO */}
        <div style={cardStyle} className="hover-lift">
            <div style={{fontSize: '0.75rem', color: theme.textSec, fontWeight: 800, textTransform:'uppercase', letterSpacing: '1px', marginBottom: 10}}>Ahorro Neto Periodo</div>
            <div style={{fontSize: isMobile ? '1.8rem' : '2.2rem', fontWeight: 900, color: periodStats.balance >= 0 ? theme.primary : theme.danger, letterSpacing: '-1px'}}>
                {formatCurrency(periodStats.balance)}
            </div>
            <div style={{fontSize: '0.85rem', color: theme.textSec, marginTop: 5, fontWeight: 500}}>Balance del intervalo actual</div>
        </div>

        {/* TASA DE AHORRO */}
        <div style={{...cardStyle, display:'flex', alignItems:'center', justifyContent:'space-between'}} className="hover-lift">
            <div>
              <div style={{fontSize: '0.75rem', color: theme.textSec, fontWeight: 800, textTransform:'uppercase', letterSpacing: '1px', marginBottom: 10}}>Tasa de Eficiencia</div>
              <div style={{fontSize: isMobile ? '2.2rem' : '2.8rem', fontWeight: 900, color: savingsRate > 20 ? theme.primary : (savingsRate > 0 ? '#ff9800' : theme.danger), letterSpacing: '-2px'}}>
                  {savingsRate.toFixed(0)}%
              </div>
            </div>
            <div style={{
                width: 70, height: 70, borderRadius: '50%', 
                background: `conic-gradient(${theme.primary} ${savingsRate}%, ${theme.accent} 0)`, 
                display:'flex', alignItems:'center', justifyContent:'center', 
                boxShadow: `0 0 20px ${theme.primary}20`,
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <div style={{width: 54, height: 54, background: theme.card, borderRadius: '50%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <span style={{color: theme.primary, transform: 'scale(1.2)'}}><IconTarget /></span>
                </div>
            </div>
        </div>
    </div>
  );
};
