import React from 'react';
import { useTheme } from "../../context/ThemeContext";
import { useData } from "../../context/DataContext";
import { IconSearch } from '../dashboard/DashboardIcons';

interface TransactionFiltersProps {
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    startDate: string;
    setStartDate: (v: string) => void;
    endDate: string;
    setEndDate: (v: string) => void;
    filterCategory: string;
    setFilterCategory: (v: string) => void;
    filterAccount: string;
    setFilterAccount: (v: string) => void;
    isMobile: boolean;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
    searchTerm, setSearchTerm, startDate, setStartDate, endDate, setEndDate,
    filterCategory, setFilterCategory, filterAccount, setFilterAccount, isMobile
}) => {
    const { theme } = useTheme();
    const { categories, accounts } = useData();

    const inputStyle = { 
        padding: "12px", borderRadius: "10px", border: `1px solid ${theme.border}`, 
        background: theme.card, color: theme.text, fontSize: "0.9rem", outline: 'none'
    };

    return (
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: theme.textSec }}><IconSearch /></span>
                <input 
                    placeholder="Buscar movimientos..." 
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: 40, width: '100%' }} 
                />
            </div>
            
            <div style={{ display: 'flex', gap: 10, flex: isMobile ? 'none' : 1 }}>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                    <option value="">Todas las categorías</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
                <select value={filterAccount} onChange={e => setFilterAccount(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                    <option value="">Todas las cuentas</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: theme.card, padding: '4px 12px', borderRadius: 10, border: `1px solid ${theme.border}` }}>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ border: 'none', background: 'transparent', color: theme.text, fontSize: '0.85rem' }} />
                <span style={{ color: theme.textSec }}>➝</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ border: 'none', background: 'transparent', color: theme.text, fontSize: '0.85rem' }} />
            </div>
        </div>
    );
};
