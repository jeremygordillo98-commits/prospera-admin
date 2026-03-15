import React, { useMemo, useState } from 'react';
import { useData } from "../../context/DataContext";
import { useTheme } from "../../context/ThemeContext";
import { IconSparkles as IconFlame } from '../dashboard/DashboardIcons';
import { formatCurrency } from '../../utils/financial-helpers';

interface ReporteCalendarioProps {
  startDate: string;
  endDate: string;
  isMobile: boolean;
}

export default function ReporteCalendario({ startDate, endDate, isMobile }: ReporteCalendarioProps) {
  const { transactions } = useData();
  const { theme, isDark } = useTheme();
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const startTs = useMemo(() => { 
      const [y, m, d] = startDate.split('-').map(Number); 
      return new Date(y, m - 1, d).getTime(); 
  }, [startDate]);
  
  const endTs = useMemo(() => { 
      const [y, m, d] = endDate.split('-').map(Number); 
      return new Date(y, m - 1, d, 23, 59, 59, 999).getTime(); 
  }, [endDate]);

  const { calendarData, maxDailyExpense } = useMemo(() => {
      const daysMap = new Map<string, {inc: number, exp: number}>();
      const start = new Date(startTs); 
      const end = new Date(endTs);
      let maxExp = 1;
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          daysMap.set(d.toDateString(), {inc: 0, exp: 0}); 
      }
      
      transactions.forEach(t => {
          if (t.createdAt >= startTs && t.createdAt <= endTs) {
              const key = new Date(t.createdAt).toDateString();
              if (daysMap.has(key)) {
                  const curr = daysMap.get(key)!;
                  if(t.type === 'income') curr.inc += t.amount; 
                  if(t.type === 'expense') curr.exp += t.amount;
                  if (curr.exp > maxExp) maxExp = curr.exp; 
              }
          }
      });
      
      return { 
          calendarData: Array.from(daysMap.entries()).map(([date, val]) => ({ 
              date: new Date(date), 
              key: date,
              ...val 
          })), 
          maxDailyExpense: maxExp 
      };
  }, [transactions, startTs, endTs]);

  const getIntensityColor = (expense: number) => {
      if (expense === 0) return isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
      const intensity = Math.min(expense / maxDailyExpense, 1);
      
      // Usamos un degradado de naranja a rojo purpurina
      if (intensity < 0.25) return isDark ? 'rgba(249, 115, 22, 0.2)' : 'rgba(249, 115, 22, 0.1)';
      if (intensity < 0.5) return isDark ? 'rgba(249, 115, 22, 0.4)' : 'rgba(249, 115, 22, 0.3)';
      if (intensity < 0.75) return isDark ? 'rgba(239, 68, 68, 0.6)' : 'rgba(239, 68, 68, 0.5)';
      return theme.danger;
  };

  return (
      <div style={{ 
          background: theme.card, padding: 24, borderRadius: 24, border: `1px solid ${theme.border}`,
          boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
      }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${theme.danger}15`, color: theme.danger, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconFlame />
                  </div>
                  <div>
                      <h3 style={{ margin: 0, color: theme.text, fontWeight: 900, fontSize: '1.4rem' }}>Mapa de Calor de Egresos</h3>
                      <p style={{ margin: 0, color: theme.textSec, fontSize: '0.85rem' }}>Detección visual de fugas y picos de gasto</p>
                  </div>
              </div>

              {/* LEYENDA */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: theme.bg, padding: '8px 16px', borderRadius: 12, border: `1px solid ${theme.border}` }}>
                  <span style={{ fontSize: '0.7rem', color: theme.textSec, fontWeight: 700, textTransform: 'uppercase' }}>Frio</span>
                  {[0.1, 0.4, 0.7, 1].map((level, i) => (
                      <div key={i} style={{ width: 14, height: 14, borderRadius: 3, background: getIntensityColor(maxDailyExpense * level) }} />
                  ))}
                  <span style={{ fontSize: '0.7rem', color: theme.textSec, fontWeight: 700, textTransform: 'uppercase' }}>Fuego</span>
              </div>
          </div>

          <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(auto-fill, minmax(85px, 1fr))', 
              gap: 12 
          }}>
              {calendarData.map((d) => {
                  const isHovered = hoveredDay === d.key;
                  const bgColor = getIntensityColor(d.exp);
                  const isHot = d.exp > (maxDailyExpense * 0.7);

                  return (
                      <div 
                        key={d.key}
                        onMouseEnter={() => setHoveredDay(d.key)}
                        onMouseLeave={() => setHoveredDay(null)}
                        style={{ 
                            background: isHovered ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') : bgColor,
                            border: isHovered ? `2px solid ${theme.primary}` : `1px solid ${isHot ? theme.danger : theme.border}`,
                            borderRadius: 16,
                            padding: '12px 8px',
                            textAlign: 'center',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            transform: isHovered ? 'scale(1.05) translateY(-4px)' : 'none',
                            boxShadow: isHovered ? `0 10px 20px ${theme.primary}20` : 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            minHeight: isMobile ? 80 : 90,
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                      >
                          {isHot && !isHovered && (
                              <div style={{ position: 'absolute', top: -10, right: -10, width: 30, height: 30, background: 'rgba(255,255,255,0.2)', transform: 'rotate(45deg)' }} />
                          )}

                          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: (isHot && !isHovered) ? '#fff' : theme.textSec, textTransform: 'uppercase', marginBottom: 4 }}>
                              {d.date.toLocaleDateString(undefined, { weekday: 'short' }).replace('.', '')}
                          </div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: (isHot && !isHovered) ? '#fff' : theme.text, marginBottom: 4 }}>
                              {d.date.getDate()}
                          </div>
                          
                          {(isHovered || d.exp > 0) && (
                              <div style={{ 
                                  fontSize: '0.75rem', 
                                  fontWeight: 800, 
                                  color: (isHot && !isHovered) ? '#fff' : (d.exp > 0 ? theme.danger : theme.textSec),
                                  animation: isHovered ? 'fadeIn 0.2s' : 'none'
                              }}>
                                  {d.exp > 0 ? formatCurrency(d.exp) : '$0'}
                              </div>
                          )}
                      </div>
                  )
              })}
          </div>

          <style>{`
              @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(5px); }
                  to { opacity: 1; transform: translateY(0); }
              }
          `}</style>
      </div>
  );
}
