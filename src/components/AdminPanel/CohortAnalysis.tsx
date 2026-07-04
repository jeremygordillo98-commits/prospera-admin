import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../context/ThemeContext';
import { Loader2 } from 'lucide-react';

interface CohortData {
    month: string;
    totalUsers: number;
    retention: number[]; // Index is month offset (0, 1, 2...)
}

const formatMonthLabel = (monthKey: string, short: boolean = false) => {
    const [year, month] = monthKey.split('-');
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthName = monthNames[parseInt(month) - 1];
    return short ? `${monthName} ${year.substring(2)}` : `${monthName} ${year}`;
};

export default function CohortAnalysis() {
    const { theme, isDark } = useTheme();

    const { data: rawData, isLoading } = useQuery({
        queryKey: ['cohort_analysis'],
        queryFn: async () => {
            // 1. Fetch users (perfiles)
            const { data: perfiles } = await supabase.from('perfiles').select('id, creado_en');
            // 2. Fetch transactions
            const { data: transacciones } = await supabase.from('transacciones').select('usuario_id, fecha');

            return { perfiles: perfiles || [], transacciones: transacciones || [] };
        }
    });

    const cohorts = useMemo(() => {
        if (!rawData) return [];
        const { perfiles, transacciones } = rawData;

        // map transacciones by user
        const txByUser = new Map<string, string[]>();
        transacciones.forEach(tx => {
            const arr = txByUser.get(tx.usuario_id) || [];
            arr.push(tx.fecha);
            txByUser.set(tx.usuario_id, arr);
        });

        // Group users by signup month
        const cohortsMap = new Map<string, { total: number, users: { id: string, date: Date }[] }>();

        perfiles.forEach(p => {
            if (!p.id || !p.creado_en) return;
            const date = new Date(p.creado_en);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            const current = cohortsMap.get(monthKey) || { total: 0, users: [] };
            current.total += 1;
            current.users.push({ id: p.id, date });
            cohortsMap.set(monthKey, current);
        });

        // Sort cohorts by month
        const sortedKeys = Array.from(cohortsMap.keys()).sort();

        // Calculate maximum months offset based on today
        const maxOffset = 6; // Let's show up to 6 months

        return sortedKeys.map(key => {
            const cohort = cohortsMap.get(key)!;
            const retention = new Array(maxOffset).fill(0);

            // Calculate retention for each user
            cohort.users.forEach(u => {
                const txDates = txByUser.get(u.id) || [];
                
                // Track active months
                const activeOffsets = new Set<number>();
                txDates.forEach(txDateStr => {
                    const txDate = new Date(txDateStr);
                    const offset = (txDate.getFullYear() - u.date.getFullYear()) * 12 + (txDate.getMonth() - u.date.getMonth());
                    if (offset >= 0 && offset < maxOffset) {
                        activeOffsets.add(offset);
                    }
                });

                // Month 0 always counts if they signed up (or maybe only if they did a transaction)
                // Often Cohort Month 0 is 100% (everyone who signed up is the base), but we can measure Month 0 activity.
                // Let's measure if they actually did a transaction in month 0.
                activeOffsets.forEach(off => {
                    retention[off] += 1;
                });
            });

            return {
                month: key,
                totalUsers: cohort.total,
                retention: retention.map(r => r / cohort.total)
            };
        });
    }, [rawData]);

    const uniqueMonths = useMemo(() => {
        if (cohorts.length === 0) return [];
        const startStr = cohorts[0].month;
        const [startY, startM] = startStr.split('-').map(Number);
        
        const today = new Date();
        const endY = today.getFullYear();
        const endM = today.getMonth() + 1;
        
        const list = [];
        let y = startY;
        let m = startM;
        
        while (y < endY || (y === endY && m <= endM)) {
            list.push(`${y}-${String(m).padStart(2, '0')}`);
            m += 1;
            if (m > 12) {
                m = 1;
                y += 1;
            }
        }
        return list;
    }, [cohorts]);

    const cardStyle = {
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: '24px',
        padding: '24px',
        boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.2)' : '0 10px 40px rgba(0,0,0,0.03)',
    };

    if (isLoading) {
        return <div className="flex-center" style={{ padding: '60px' }}><Loader2 className="animate-spin text-primary" size={32} /></div>;
    }

    return (
        <div style={cardStyle} className="mt-8">
            <h4 className="mb-2 m-0 text-lg md:text-xl font-black tracking-tight flex items-center gap-2">
                📈 Análisis de Cohortes (Retención)
            </h4>
            <p className="text-[0.85rem] mb-6" style={{ color: theme.textSec }}>
                Porcentaje de usuarios que registran al menos una transacción en los meses posteriores a su registro.
            </p>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: theme.textSec, fontWeight: 800 }}>Cohorte</th>
                            <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textSec, fontWeight: 800 }}>Usuarios</th>
                            {uniqueMonths.map(m => (
                                <th key={m} style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textSec, fontWeight: 800 }}>
                                    {formatMonthLabel(m, true)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {cohorts.map((c) => (
                            <tr key={c.month}>
                                <td style={{ padding: '12px', borderBottom: `1px solid ${theme.border}`, fontWeight: 700 }}>
                                    {formatMonthLabel(c.month)}
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, fontWeight: 800 }}>{c.totalUsers}</td>
                                {uniqueMonths.map((colMonth) => {
                                    const [cY, cM] = c.month.split('-').map(Number);
                                    const [colY, colM] = colMonth.split('-').map(Number);
                                    const offset = (colY - cY) * 12 + (colM - cM);

                                    if (offset < 0 || offset >= c.retention.length) {
                                        return (
                                            <td key={colMonth} style={{ padding: '4px', borderBottom: `1px solid ${theme.border}`, textAlign: 'center', color: theme.textSec }}>
                                                -
                                            </td>
                                        );
                                    }

                                    const pct = c.retention[offset];
                                    const opacity = Math.max(0.1, pct);
                                    return (
                                        <td key={colMonth} style={{ padding: '4px', borderBottom: `1px solid ${theme.border}`, textAlign: 'center' }}>
                                            <div style={{ 
                                                padding: '8px', 
                                                background: pct > 0 ? `rgba(16, 185, 129, ${opacity})` : 'transparent',
                                                color: pct > 0 ? (pct > 0.5 && isDark ? '#fff' : theme.text) : theme.textSec,
                                                borderRadius: '8px',
                                                fontWeight: pct > 0 ? 800 : 400
                                            }}>
                                                {pct > 0 ? `${(pct * 100).toFixed(0)}%` : '-'}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        {cohorts.length === 0 && (
                            <tr>
                                <td colSpan={uniqueMonths.length + 2} style={{ padding: '24px', textAlign: 'center', color: theme.textSec }}>No hay datos suficientes.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
