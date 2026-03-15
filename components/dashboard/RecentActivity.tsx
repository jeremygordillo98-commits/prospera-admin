import React from 'react';
import { formatCurrency } from '../../utils/financial-helpers';
import { IconTransfer } from './DashboardIcons';

interface RecentActivityProps {
  isMobile: boolean;
  theme: any;
  transactions: any[];
  categories: any[];
  accounts: any[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  isMobile,
  theme,
  transactions,
  categories,
  accounts
}) => {
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div style={{marginTop: 24}}>
        <h3 style={{color: theme.text, fontSize: '1.2rem'}}>Actividad Reciente</h3>
        <div style={{background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: 'hidden'}}>
          {recentTransactions.map((t, i) => {
              const cat = categories.find(c => c.id === t.categoryId);
              const accountName = accounts.find(a => a.id === t.accountId)?.name || 'Cuenta';
              return (
                  <div key={t.id} style={{
                      padding: '12px 15px', 
                      borderBottom: i === recentTransactions.length - 1 ? 'none' : `1px solid ${theme.border}`,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'background 0.2s'
                  }}>
                      <div style={{display:'flex', alignItems:'center', gap: 12}}>
                          <div style={{fontSize: '1.2rem', width: 40, height: 40, background: theme.accent, color: theme.textSec, borderRadius: '50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0}}>
                              {t.type === 'transfer' ? <IconTransfer /> : (cat?.icon || '❓')}
                          </div>
                          <div style={{overflow: 'hidden'}}>
                              <div style={{fontWeight: 'bold', fontSize: '0.9rem', color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: isMobile ? 140 : 'auto'}}>{t.type === 'transfer' ? 'Transferencia' : (cat?.name || 'Sin categoría')}</div>
                              <div style={{fontSize: '0.75rem', color: theme.textSec}}>{accountName} • {new Date(t.createdAt).toLocaleDateString()}</div>
                          </div>
                      </div>
                      <div style={{fontWeight: 'bold', fontSize: '0.9rem', color: t.type === 'income' ? theme.primary : (t.type === 'expense' ? theme.danger : theme.text)}}>
                          {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                      </div>
                  </div>
              )
          })}
        </div>
    </div>
  );
};
