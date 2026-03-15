import React, { useState, useMemo } from 'react';
import { useData } from "../../context/DataContext";
import { useTheme } from "../../context/ThemeContext";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
    IconCompare, IconTrending, IconBalance, IconChart 
} from '../dashboard/DashboardIcons';
import { formatCurrency } from '../../utils/financial-helpers';

interface ReporteComparativoProps {
  isMobile: boolean;
}

const IconArrowUp = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>;
const IconArrowDown = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>;

export default function ReporteComparativo({ isMobile }: ReporteComparativoProps) {
  const { transactions, categories } = useData();
  const { theme, isDark } = useTheme();

  const [compMonthA, setCompMonthA] = useState(() => new Date().toISOString().slice(0, 7)); 
  const [compMonthB, setCompMonthB] = useState(() => {
      const d = new Date(); 
      d.setMonth(d.getMonth() - 1); 
      return d.toISOString().slice(0, 7);
  });

  const comparisonData = useMemo(() => {
      const getMonthExpenses = (monthStr: string) => {
          const [y, m] = monthStr.split('-').map(Number);
          const start = new Date(y, m - 1, 1).getTime();
          const end = new Date(y, m, 0, 23, 59, 59).getTime();
          const map = new Map<string, number>();
          let total = 0;
          
          transactions.forEach(t => {
              if (t.type === 'expense' && t.createdAt >= start && t.createdAt <= end) {
                  const cat = categories.find(c => c.id === t.categoryId);
                  const groupId = cat?.parentId || cat?.id || 'unknown';
                  map.set(groupId, (map.get(groupId) || 0) + t.amount);
                  total += t.amount;
              }
          });
          return { map, total };
      };

      const dataA = getMonthExpenses(compMonthA); 
      const dataB = getMonthExpenses(compMonthB);
      const allCatIds = Array.from(new Set([...dataA.map.keys(), ...dataB.map.keys()]));
      
      const list = allCatIds.map(id => {
          const valA = dataA.map.get(id) || 0; 
          const valB = dataB.map.get(id) || 0; 
          const diff = valA - valB; 
          const name = categories.find(c => c.id === id)?.name || "Otros";
          
          return { id, name, valA, valB, diff };
      }).sort((a,b) => b.valA - a.valA);
      
      return { 
          list, 
          totalA: dataA.total, 
          totalB: dataB.total, 
          diff: dataA.total - dataB.total 
      };
  }, [transactions, compMonthA, compMonthB, categories]);

  const chartData = useMemo(() => {
      return comparisonData.list.slice(0, 8).map(item => ({
          name: item.name,
          'Mes A': item.valA,
          'Mes B': item.valB
      }));
  }, [comparisonData]);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
        
        {/* SELECTORES DE MES */}
        <div style={{ 
            display: 'flex', gap: 20, flexWrap: 'wrap', 
            background: theme.card, padding: 24, borderRadius: 24, border: `1px solid ${theme.border}`
        }}>
            <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, marginBottom: 8, textTransform: 'uppercase' }}>Periodo Principal (A)</label>
                <input type="month" value={compMonthA} onChange={e => setCompMonthA(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 900, color: theme.textSec }}>VS</div>
            <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, marginBottom: 8, textTransform: 'uppercase' }}>Periodo Comparar (B)</label>
                <input type="month" value={compMonthB} onChange={e => setCompMonthB(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, outline: 'none' }} />
            </div>
        </div>

        {/* KPI SUMMARY */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
            {[
                { label: 'Gasto Mes A', val: comparisonData.totalA, icon: <IconChart />, color: theme.text },
                { label: 'Gasto Mes B', val: comparisonData.totalB, icon: <IconBalance />, color: theme.textSec },
                { 
                    label: 'Variación', 
                    val: comparisonData.diff, 
                    icon: <IconTrending />, 
                    color: comparisonData.diff > 0 ? theme.danger : theme.primary,
                    showDiff: true
                }
            ].map((kpi, i) => (
                <div key={i} style={{ background: theme.card, padding: 20, borderRadius: 24, border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: theme.textSec, fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 12 }}>
                        {kpi.icon} {kpi.label}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: kpi.color }}>
                        {kpi.showDiff && comparisonData.diff > 0 ? '+' : ''}{formatCurrency(kpi.val)}
                    </div>
                </div>
            ))}
        </div>

        {/* CHART VISUALIZATION */}
        <div style={{ background: theme.card, padding: 24, borderRadius: 24, border: `1px solid ${theme.border}`, minHeight: 400 }}>
            <h4 style={{ margin: 0, marginBottom: 30, fontWeight: 900 }}>Análisis Visual Comparativo</h4>
            <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.border} opacity={0.5} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.textSec, fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.textSec, fontSize: 10 }} />
                        <Tooltip 
                            contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12 }}
                            itemStyle={{ fontWeight: 'bold' }}
                            formatter={(v) => formatCurrency(Number(v))}
                        />
                        <Legend iconType="circle" />
                        <Bar name="Mes A" dataKey="Mes A" fill={theme.primary} radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar name="Mes B" dataKey="Mes B" fill={theme.textSec} radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* DETAILED TABLE */}
        <div style={{ background: theme.card, borderRadius: 24, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
            <div style={{ padding: 20, borderBottom: `1px solid ${theme.border}` }}>
                <h4 style={{ margin: 0, fontWeight: 900 }}>Desglose por Categoría</h4>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: theme.bg, color: theme.textSec, fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                            <th style={{ padding: '16px 24px', textAlign: 'left' }}>Categoría</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right' }}>Mes A</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right' }}>Mes B</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right' }}>Dif. Nominal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comparisonData.list.map((c, i) => (
                            <tr key={i} style={{ borderBottom: `1px solid ${theme.border}` }}>
                                <td style={{ padding: '16px 24px', fontWeight: 700, color: theme.text }}>{c.name}</td>
                                <td style={{ padding: '16px 24px', textAlign: 'right', color: theme.text }}>{formatCurrency(c.valA)}</td>
                                <td style={{ padding: '16px 24px', textAlign: 'right', color: theme.textSec }}>{formatCurrency(c.valB)}</td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <div style={{ 
                                        display: 'inline-flex', alignItems: 'center', gap: 6, 
                                        fontWeight: 800, color: c.diff > 0 ? theme.danger : (c.diff < 0 ? theme.primary : theme.textSec)
                                    }}>
                                        {c.diff > 0 ? <IconArrowUp /> : c.diff < 0 ? <IconArrowDown /> : null}
                                        {formatCurrency(Math.abs(c.diff))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

    </div>
  );
}
