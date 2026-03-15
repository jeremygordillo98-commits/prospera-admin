import React from 'react';
import { formatCurrency } from '../../utils/financial-helpers';

interface BudgetMonitorProps {
  isNewUser: boolean;
  isMobile: boolean;
  theme: any;
  globalBudget: any;
  budgetStatus: any;
  settings: any;
}

export const BudgetMonitor: React.FC<BudgetMonitorProps> = ({
  isNewUser,
  isMobile,
  theme,
  globalBudget,
  budgetStatus,
  settings
}) => {
  if (isNewUser) return null;

  return (
    <div style={{
      padding: isMobile ? 15 : 20, 
      borderRadius: 16, 
      background: theme.card, 
      backdropFilter: 'blur(12px)', 
      border: `1px solid ${theme.border}`, 
      marginBottom: 24, 
      position: 'relative', 
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
    }}>
       <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom: 10}}>
           <div>
              <h3 style={{ margin: 0, color: theme.text, fontSize: isMobile ? '1rem' : '1.1rem' }}>Ejecución del Presupuesto (Mes)</h3>
              <div style={{fontSize: '0.8rem', color: theme.textSec, marginTop: 4}}>Gastado: {formatCurrency(globalBudget.monthlySpent)} / Ideal: {formatCurrency(globalBudget.sumIdeal)}</div>
           </div>
           <div style={{display:'flex', alignItems:'baseline', gap: 5}}>
               <span style={{fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 'bold', color: budgetStatus.color, textShadow: '0 0 10px rgba(0,0,0,0.2)'}}>
                   {globalBudget.percent.toFixed(1)}%
               </span>
               {!isMobile && <span style={{fontSize: '0.8rem', color: theme.textSec}}>del Ideal</span>}
           </div>
       </div>
       
       <div style={{height: 12, width: '100%', background: theme.inputBg, borderRadius: 6, position: 'relative', overflow: 'hidden'}}>
          <div style={{ height: '100%', width: `${Math.min(globalBudget.percent, 100)}%`, background: budgetStatus.color, borderRadius: 6, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease', boxShadow: `0 0 10px ${budgetStatus.color}60` }} />
          <div style={{position: 'absolute', top:0, bottom:0, left: `${settings.alertThresholdOptimistic}%`, borderLeft: `2px dashed ${theme.primary}`, opacity: 0.6}} />
          <div style={{position: 'absolute', top:0, bottom:0, left: `${settings.alertThresholdIdeal}%`, borderLeft: '2px solid #ff9800', opacity: 0.8}} />
          <div style={{position: 'absolute', top:0, bottom:0, left: `${settings.alertThresholdPessimistic}%`, borderLeft: `2px solid ${theme.danger}`}} />
       </div>
       
       <div style={{display:'flex', justifyContent:'space-between', marginTop: 5, fontSize: '0.7rem', color: theme.textSec}}>
           <span>0%</span>
           <span style={{color: theme.primary}}>Opt ({settings.alertThresholdOptimistic}%)</span>
           <span style={{color: '#ff9800'}}>Ideal ({settings.alertThresholdIdeal}%)</span>
           <span style={{color: theme.danger}}>Máx ({settings.alertThresholdPessimistic}%)</span>
       </div>
    </div>
  );
};
