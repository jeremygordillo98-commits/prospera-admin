import React from 'react';
import { TimeRange } from '../../utils/financial-helpers';
import { IconChevronLeft, IconChevronRight } from './DashboardIcons';

interface DashboardHeaderProps {
  isMobile: boolean;
  theme: any;
  range: TimeRange;
  setRange: (range: TimeRange) => void;
  showNav: boolean;
  handlePrev: () => void;
  handleNext: () => void;
  handleToday: () => void;
  chartTitle: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isMobile,
  theme,
  range,
  setRange,
  showNav,
  handlePrev,
  handleNext,
  handleToday,
  chartTitle
}) => {
  return (
    <>
      <div className="tour-step-flujo" style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          margin: "30px 0 20px 0", 
          flexDirection: isMobile ? 'column' : 'row', 
          gap: 15, 
          alignItems: isMobile ? 'stretch' : 'center' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ margin: 0, color: theme.text, fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 900, letterSpacing: '-0.5px' }}>Análisis de Flujo</h2>
            <div style={{ fontSize: '0.85rem', color: theme.textSec, fontWeight: 500 }}>{isMobile ? chartTitle : 'Visualización detallada de ingresos y gastos'}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
            <div style={{ display: 'flex', gap: 4, background: theme.accent, padding: 4, borderRadius: 14, overflowX: 'auto', width: isMobile ? '100%' : 'auto' }}>
              {(['week', 'month', 'year', 'all'] as TimeRange[]).map(r => (
                <button 
                    key={r} 
                    onClick={() => { setRange(r); handleToday(); }} 
                    style={{ 
                        flex: 1,
                        border: 'none', 
                        background: range === r ? theme.card : 'transparent', 
                        color: range === r ? theme.primary : theme.textSec, 
                        padding: '8px 16px', 
                        borderRadius: 10, 
                        cursor: 'pointer', 
                        fontWeight: range === r ? 800 : 600, 
                        boxShadow: range === r ? '0 4px 10px rgba(0,0,0,0.05)' : 'none', 
                        whiteSpace: 'nowrap', 
                        fontSize: '0.8rem', 
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)' 
                    }}>
                  {r === 'week' && 'Semana'}{r === 'month' && 'Mes'}{r === 'year' && 'Año'}{r === 'all' && 'Histórico'}
                </button>
              ))}
            </div>

            {showNav && !isMobile && (
                <div style={{display: 'flex', alignItems: 'center', gap: 6, background: theme.accent, padding: 4, borderRadius: 14}}>
                    <button onClick={handlePrev} style={{cursor: 'pointer', border:'none', background: theme.card, color: theme.text, display: 'flex', alignItems: 'center', padding: '8px', borderRadius: 10, boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}><IconChevronLeft /></button>
                    <div style={{ padding: '0 12px', color: theme.text, fontWeight: 800, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{chartTitle}</div>
                    <button onClick={handleNext} style={{cursor: 'pointer', border:'none', background: theme.card, color: theme.text, display: 'flex', alignItems: 'center', padding: '8px', borderRadius: 10, boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}><IconChevronRight /></button>
                </div>
            )}
        </div>
      </div>

      {isMobile && showNav && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15, marginBottom: 20 }}>
                <button onClick={handlePrev} style={{cursor: 'pointer', border:'none', background: theme.accent, color: theme.text, display: 'flex', alignItems: 'center', padding: '10px', borderRadius: 12}}><IconChevronLeft /></button>
                <div style={{ color: theme.text, fontWeight: 800, fontSize: '0.9rem' }}>{chartTitle}</div>
                <button onClick={handleNext} style={{cursor: 'pointer', border:'none', background: theme.accent, color: theme.text, display: 'flex', alignItems: 'center', padding: '10px', borderRadius: 12}}><IconChevronRight /></button>
          </div>
      )}
    </>
  );
};
