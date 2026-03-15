import React from 'react';
import { useTheme } from "../../context/ThemeContext";
import { formatCurrency } from "../../utils/financial-helpers";

interface TransactionSummaryProps {
    income: number;
    expense: number;
    isMobile: boolean;
}

export const TransactionSummary: React.FC<TransactionSummaryProps> = ({ income, expense, isMobile }) => {
    const { theme } = useTheme();
    const net = income - expense;

    const itemStyle = { flex: 1, textAlign: 'center' as const };
    const labelStyle = { fontSize: '0.75rem', color: theme.textSec, fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 4 };
    const valueStyle = (color: string) => ({ fontSize: '1.2rem', fontWeight: 900, color });

    return (
        <div style={{ 
            display: 'flex', gap: 20, padding: 20, background: theme.card, 
            borderRadius: 16, border: `1px solid ${theme.border}`, marginBottom: 24,
            boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
        }}>
            <div style={itemStyle}>
                <div style={labelStyle}>Ingresos</div>
                <div style={valueStyle(theme.primary)}>{formatCurrency(income)}</div>
            </div>
            <div style={{ width: 1, background: theme.border }} />
            <div style={itemStyle}>
                <div style={labelStyle}>Gastos</div>
                <div style={valueStyle(theme.danger)}>{formatCurrency(expense)}</div>
            </div>
            {!isMobile && (
                <>
                    <div style={{ width: 1, background: theme.border }} />
                    <div style={itemStyle}>
                        <div style={labelStyle}>Balance Neto</div>
                        <div style={valueStyle(net >= 0 ? theme.primary : theme.danger)}>
                            {formatCurrency(net)}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
