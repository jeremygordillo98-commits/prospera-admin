import React, { useMemo } from 'react';
import { useData } from "../../context/DataContext";
import { useTheme } from "../../context/ThemeContext";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { formatCurrency } from '../../utils/financial-helpers';

interface ReportePatrimonioProps {
  startDate: string;
  endDate: string;
  isMobile: boolean;
}

export default function ReportePatrimonio({ startDate, endDate, isMobile }: ReportePatrimonioProps) {
  const { transactions, accounts } = useData();
  const { theme, isDark } = useTheme();

  const startTs = useMemo(() => { 
      const [y, m, d] = startDate.split('-').map(Number); 
      return new Date(y, m - 1, d).getTime(); 
  }, [startDate]);
  
  const endTs = useMemo(() => { 
      const [y, m, d] = endDate.split('-').map(Number); 
      return new Date(y, m - 1, d, 23, 59, 59, 999).getTime(); 
  }, [endDate]);

  const chartData = useMemo(() => {
    let runningBalance = 0;
    
    accounts.forEach(a => {
      const type = (a as any).type || (a.isSavings ? 'savings' : 'general');
      if (type === 'debt') runningBalance -= Number(a.initialBalance); 
      else runningBalance += Number(a.initialBalance);
    });
    
    transactions.forEach(t => { 
      if (t.createdAt < startTs) { 
        if (t.type === 'income') runningBalance += t.amount; 
        else if (t.type === 'expense') runningBalance -= t.amount; 
      } 
    });

    const dayMap = new Map<string, number>();
    transactions.filter(t => t.createdAt >= startTs && t.createdAt <= endTs).forEach(t => {
      const dayKey = new Date(t.createdAt).toISOString().split('T')[0];
      let change = 0;
      if (t.type === 'income') change = t.amount; 
      if (t.type === 'expense') change = -t.amount;
      dayMap.set(dayKey, (dayMap.get(dayKey) || 0) + change);
    });

    const data: any[] = [];
    const current = new Date(startTs); 
    const end = new Date(endTs);

    while (current <= end) {
      const dayStr = current.toISOString().split('T')[0];
      runningBalance += dayMap.get(dayStr) || 0;
      data.push({
          date: dayStr,
          rawDate: new Date(current),
          formattedDate: current.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
          patrimonio: runningBalance
      });
      current.setDate(current.getDate() + 1);
    }
    
    return data;
  }, [transactions, accounts, startTs, endTs]);

  const latestWorth = chartData.length > 0 ? chartData[chartData.length - 1].patrimonio : 0;
  const initialWorth = chartData.length > 0 ? chartData[0].patrimonio : 0;
  const growth = latestWorth - initialWorth;
  const growthPct = initialWorth !== 0 ? (growth / Math.abs(initialWorth)) * 100 : 0;

  return (
    <div style={{ display: 'grid', gap: 24 }}>
        
        {/* KPI CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 20 }}>
            <div style={{ background: theme.card, padding: 24, borderRadius: 24, border: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: '0.8rem', color: theme.textSec, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Patrimonio Neto Actual</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: theme.text }}>{formatCurrency(latestWorth)}</div>
            </div>
            <div style={{ background: theme.card, padding: 24, borderRadius: 24, border: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: '0.8rem', color: theme.textSec, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Crecimiento del Periodo</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: growth >= 0 ? theme.primary : theme.danger }}>
                    {growth >= 0 ? '+' : ''}{formatCurrency(growth)}
                </div>
            </div>
            <div style={{ background: theme.card, padding: 24, borderRadius: 24, border: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: '0.8rem', color: theme.textSec, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Variación %</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: growthPct >= 0 ? theme.primary : theme.danger }}>
                    {growthPct >= 0 ? '+' : ''}{growthPct.toFixed(1)}%
                </div>
            </div>
        </div>

        {/* CHART CHANNEL */}
        <div style={{ 
            background: theme.card, padding: 24, borderRadius: 24, border: `1px solid ${theme.border}`,
            minHeight: 450
        }}>
            <h4 style={{ margin: 0, marginBottom: 30, fontWeight: 800 }}>Evolución Temporal del Patrimonio</h4>
            <div style={{ width: '100%', height: 350 }}>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPat" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={theme.primary} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={theme.primary} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis 
                                dataKey="formattedDate" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: theme.textSec, fontSize: 10 }}
                                interval={isMobile ? 5 : 2}
                            />
                            <YAxis 
                                hide 
                                domain={['auto', 'auto']}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.border} opacity={0.5} />
                            <Tooltip 
                                formatter={(v: any) => [formatCurrency(Number(v)), 'Patrimonio']}
                                labelStyle={{ color: theme.text, fontWeight: 'bold', marginBottom: 4 }}
                                contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12 }}
                                labelFormatter={(label, items) => items[0]?.payload?.date}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="patrimonio" 
                                stroke={theme.primary} 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorPat)" 
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: theme.textSec }}>
                        Sin datos suficientes para graficar
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
