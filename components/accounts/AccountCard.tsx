import React, { useState } from 'react';
import { useData } from "../../context/DataContext";
import { useTheme } from "../../context/ThemeContext";
import { Account } from "../../services/types";
import { Link } from 'react-router-dom';
import { 
    IconBank, IconVault, IconReceive, IconSend, IconBalance, IconList 
} from '../dashboard/DashboardIcons';
import { formatCurrency } from '../../utils/financial-helpers';

interface AccountCardProps {
    acc: Account;
    balance: number;
    onEdit: (acc: Account) => void;
    isMobile: boolean;
}

export const AccountCard: React.FC<AccountCardProps> = ({ acc, balance, onEdit, isMobile }) => {
    const { theme } = useTheme();
    
    const type = acc.type || (acc.isSavings ? 'savings' : 'general');
    let icon = <IconBank />; 
    let color = theme.text; 
    let actionLabel = 'Historial'; 
    let actionLink = `/reports?tab=estado&accountId=${acc.id}`; 
    let iconColor = theme.text;
    
    if (type === 'savings') { 
        icon = <IconVault />; 
        color = theme.primary; 
        iconColor = theme.primary; 
    } else if (type === 'receivable') { 
        icon = <IconReceive />; 
        color = '#8b5cf6'; 
        actionLabel = 'Cobrar 💰'; 
        actionLink = '/movements'; 
        iconColor = '#8b5cf6'; 
    } else if (type === 'debt') { 
        icon = <IconSend />; 
        color = theme.danger; 
        actionLabel = 'Pagar 💸'; 
        actionLink = '/movements'; 
        iconColor = theme.danger; 
    }

    const target = acc.savingsTarget || 0;

    return (
        <div style={{
            background: theme.card, 
            backdropFilter: 'blur(12px)', 
            border: `1px solid ${theme.border}`, 
            borderRadius: 20, 
            padding: isMobile ? 18 : 24, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 16, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }} className="hover-lift">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div style={{display:'flex', gap: 14, alignItems: 'center'}}>
                    <div style={{color: iconColor, background: theme.bg, width: 54, height: 54, display:'flex', alignItems:'center', justifyContent:'center', borderRadius: 14, flexShrink: 0, border: `1px solid ${theme.border}`}}>
                        {icon}
                    </div>
                    <div>
                        <div style={{fontWeight: 800, fontSize:'1.1rem', lineHeight: 1.2, color: theme.text, maxWidth: isMobile ? 120 : 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{acc.name}</div>
                        <div style={{fontSize:'0.75rem', color: theme.textSec, marginTop: 4, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px'}}>
                            {type === 'debt' ? 'Deuda Actual' : 'Saldo Disponible'}
                        </div>
                    </div>
                </div>
                <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'1.3rem', fontWeight: 900, color}}>{formatCurrency(balance)}</div>
                    <button onClick={() => onEdit(acc)} style={{background:'transparent', border:'none', color: theme.textSec, cursor:'pointer', fontSize:'0.8rem', fontWeight: 600, padding: '4px 0', opacity: 0.7}}>Editar</button>
                </div>
            </div>

            {(type === 'savings' || type === 'debt') && target > 0 && (
                <div style={{marginTop: 4}}>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginBottom:8, fontWeight: 600}}>
                        <span style={{color: theme.textSec}}>{type === 'savings' ? 'Meta:' : 'Cupo:'} <span style={{color: theme.text}}>{formatCurrency(target)}</span></span>
                        <span style={{color: (type === 'debt' && balance/target > 0.8) ? theme.danger : theme.primary}}>{((balance / target) * 100).toFixed(0)}%</span>
                    </div>
                    <div style={{height: 6, background: theme.bg, borderRadius: 3, overflow:'hidden', border: `1px solid ${theme.border}`}}>
                        <div style={{
                            width: `${Math.min(((balance / target) * 100), 100)}%`, 
                            background: type === 'debt' ? (balance/target > 0.8 ? theme.danger : '#8b5cf6') : theme.primary, 
                            height:'100%', 
                            transition: 'width 1s ease-out',
                            borderRadius: 3
                        }} />
                    </div>
                </div>
            )}

            <div style={{display:'flex', gap: 10, marginTop: 6}}>
                <Link to={`/reconcile/${acc.id}`} style={{textDecoration:'none', flex:1, textAlign:'center', padding:'10px 0', fontSize:'0.85rem', background: theme.bg, color: theme.text, borderRadius: 10, border:`1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 700}}>
                    <IconBalance /> Conciliar
                </Link>
                <Link to={actionLink} style={{textDecoration:'none', flex:1, textAlign:'center', padding:'10px 0', fontSize:'0.9rem', background: theme.primary, color: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 700, boxShadow: `0 4px 10px ${theme.primary}30`}}>
                    {actionLabel === 'Historial' ? <IconList /> : null} {actionLabel}
                </Link>
            </div>
        </div>
    );
};
