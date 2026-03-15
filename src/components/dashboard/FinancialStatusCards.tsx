import React from 'react';
import { formatCurrency } from '../../utils/financial-helpers';
import { IconBank, IconWallet, IconVault, IconReceive, IconSend } from './DashboardIcons';

interface FinancialStatusCardsProps {
  isMobile: boolean;
  theme: any;
  financialStatus: any;
}

export const FinancialStatusCards: React.FC<FinancialStatusCardsProps> = ({
  isMobile,
  theme,
  financialStatus
}) => {
  const cardStyle = { 
    padding: isMobile ? 24 : 32, 
    borderRadius: 32, 
    background: theme.card, 
    backdropFilter: 'blur(30px)', 
    border: `1px solid ${theme.border}`, 
    height: '100%', 
    boxSizing: 'border-box' as const, 
    boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
    position: 'relative' as const,
    overflow: 'hidden'
  };

  const glowStyle = (color: string) => ({
    position: 'absolute' as const,
    top: '-20%',
    right: '-10%',
    width: '150px',
    height: '150px',
    background: color,
    filter: 'blur(60px)',
    opacity: 0.15,
    zIndex: 0
  });

  return (
    <>
      <div className="tour-dashboard" style={{ marginBottom: 30, display: "grid", gridTemplateColumns: isMobile ? '1fr' : "repeat(2, 1fr)", gap: 24 }}>
        {/* TARJETA LIQUIDEZ */}
        <div className="tour-step-liquidez" style={{...cardStyle, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default', background: `linear-gradient(135deg, ${theme.card}, ${theme.bg})`}}>
          <div style={glowStyle(theme.primary)}></div>
          <div style={{display:'flex', alignItems:'center', gap: 12, marginBottom: 15, position:'relative', zIndex: 1}}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: theme.primary + '15', display:'flex', alignItems:'center', justifyContent:'center', color: theme.primary }}>
                <IconWallet />
              </div>
              <div style={{ fontSize: '0.85rem', color: theme.textSec, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Dinero Disponible</div>
          </div>
          <div style={{ fontSize: isMobile ? '2.2rem' : '2.8rem', fontWeight: 900, color: theme.text, letterSpacing: '-1.5px', position:'relative', zIndex: 1 }}>{formatCurrency(financialStatus.liquidity)}</div>
          <div style={{ fontSize: '0.85rem', color: theme.primary, fontWeight: 700, marginTop: 8, opacity: 0.8, position:'relative', zIndex: 1 }}>Total Liquidez en Cuentas</div>
        </div>

        {/* TARJETA PATRIMONIO */}
        <div className="tour-step-patrimonio" style={{...cardStyle, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', background: `linear-gradient(135deg, ${theme.card}, ${theme.bg})`}}>
          <div style={glowStyle(financialStatus.netWorth >= 0 ? theme.primary : theme.danger)}></div>
          <div style={{display:'flex', alignItems:'center', gap: 12, marginBottom: 15, position:'relative', zIndex: 1}}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: (financialStatus.netWorth >= 0 ? theme.primary : theme.danger) + '15', display:'flex', alignItems:'center', justifyContent:'center', color: financialStatus.netWorth >= 0 ? theme.primary : theme.danger }}>
                <IconBank />
              </div>
              <div style={{ fontSize: '0.85rem', color: theme.textSec, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Patrimonio Neto</div>
          </div>
          <div style={{ fontSize: isMobile ? '2.2rem' : '2.8rem', fontWeight: 900, color: financialStatus.netWorth >= 0 ? theme.primary : theme.danger, letterSpacing: '-1.5px', position:'relative', zIndex: 1 }}>{formatCurrency(financialStatus.netWorth)}</div>
          <div style={{ fontSize: '0.85rem', color: theme.textSec, fontWeight: 700, marginTop: 8, opacity: 0.8, position:'relative', zIndex: 1 }}>Activos menos Pasivos</div>
        </div>
      </div>

      <div style={{ marginBottom: 35, display: isMobile ? 'flex' : "grid", gridTemplateColumns: isMobile ? undefined : "repeat(3, 1fr)", gap: 20, overflowX: isMobile ? 'auto' : 'visible', paddingBottom: isMobile ? 15 : 0, WebkitOverflowScrolling: 'touch' }}>
          {/* AHORROS */}
          <div className="tour-step-ahorros" style={{...cardStyle, padding: 24, minWidth: isMobile ? 240 : 'auto', flexShrink: 0, border: `1px solid ${theme.primary}20`}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div>
                  <div style={{fontSize:'0.75rem', color: theme.primary, textTransform:'uppercase', fontWeight: 900, letterSpacing: '1px', marginBottom: 5}}>En Bóveda</div>
                  <div style={{display:'flex', alignItems:'center', gap: 8, fontSize:'1.1rem', fontWeight: 800, color: theme.text}}><IconVault color={theme.primary}/> Ahorros</div>
                </div>
                <div style={{ fontSize: '1.8rem', opacity: 0.3 }}>🐷</div>
              </div>
              <div style={{fontSize:'1.8rem', marginTop: 15, fontWeight: 900, color: theme.text, letterSpacing: '-1px'}}>{formatCurrency(financialStatus.savings)}</div>
          </div>

          {/* POR COBRAR */}
          <div style={{...cardStyle, padding: 24, minWidth: isMobile ? 240 : 'auto', flexShrink: 0, border: '1px solid #8b5cf630'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div>
                  <div style={{fontSize:'0.75rem', color: '#8b5cf6', textTransform:'uppercase', fontWeight: 900, letterSpacing: '1px', marginBottom: 5}}>Activos</div>
                  <div style={{display:'flex', alignItems:'center', gap: 8, fontSize:'1.1rem', fontWeight: 800, color: theme.text}}><IconReceive color="#8b5cf6"/> Por Cobrar</div>
                </div>
                <div style={{ fontSize: '1.8rem', opacity: 0.3 }}>📈</div>
              </div>
              <div style={{fontSize:'1.8rem', marginTop: 15, fontWeight: 900, color: '#8b5cf6', letterSpacing: '-1px'}}>{formatCurrency(financialStatus.receivables)}</div>
          </div>

          {/* POR PAGAR */}
          <div style={{...cardStyle, padding: 24, minWidth: isMobile ? 240 : 'auto', flexShrink: 0, border: `1px solid ${theme.danger}30`}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div>
                  <div style={{fontSize:'0.75rem', color: theme.danger, textTransform:'uppercase', fontWeight: 900, letterSpacing: '1px', marginBottom: 5}}>Pasivos</div>
                  <div style={{display:'flex', alignItems:'center', gap: 8, fontSize:'1.1rem', fontWeight: 800, color: theme.text}}><IconSend color={theme.danger}/> Por Pagar</div>
                </div>
                <div style={{ fontSize: '1.8rem', opacity: 0.3 }}>📉</div>
              </div>
              <div style={{fontSize:'1.8rem', marginTop: 15, fontWeight: 900, color: theme.danger, letterSpacing: '-1px'}}>{formatCurrency(financialStatus.debt)}</div>
          </div>
      </div>
    </>
  );
};
