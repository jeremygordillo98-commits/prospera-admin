import React, { useMemo } from 'react';
import { useData } from "../../context/DataContext";
import { useTheme } from "../../context/ThemeContext";
import { Chart } from "react-google-charts";
import { IconWaves } from '../dashboard/DashboardIcons';

interface ReporteFlujoProps {
  startDate: string;
  endDate: string;
  isMobile: boolean;
}

export default function ReporteFlujo({ startDate, endDate, isMobile }: ReporteFlujoProps) {
  const { transactions, categories } = useData();
  const { theme, isDark } = useTheme();

  const startTs = useMemo(() => { 
      const [y, m, d] = startDate.split('-').map(Number); 
      return new Date(y, m - 1, d).getTime(); 
  }, [startDate]);
  
  const endTs = useMemo(() => { 
      const [y, m, d] = endDate.split('-').map(Number); 
      return new Date(y, m - 1, d, 23, 59, 59, 999).getTime(); 
  }, [endDate]);

  const sankeyData = useMemo(() => {
      const filtered = transactions.filter(t => t.createdAt >= startTs && t.createdAt <= endTs);
      const incomeMap = new Map<string, number>(); 
      const expenseMap = new Map<string, number>();
      let totalIncome = 0; 
      let totalExpense = 0;

      filtered.forEach(t => {
          const cat = categories.find(c => c.id === t.categoryId);
          let displayCatName = cat?.name || "Otros";
          if (cat?.parentId) { 
              const parent = categories.find(c => c.id === cat.parentId); 
              if (parent) displayCatName = parent.name; 
          }
          
          if (t.type === 'income') { 
              incomeMap.set(displayCatName, (incomeMap.get(displayCatName) || 0) + t.amount); 
              totalIncome += t.amount; 
          }
          else if (t.type === 'expense') { 
              expenseMap.set(displayCatName, (expenseMap.get(displayCatName) || 0) + t.amount); 
              totalExpense += t.amount; 
          }
      });

      const data: any[] = [["Origen", "Destino", "Monto"]];
      incomeMap.forEach((amount, name) => data.push([`🟢 ${name}`, "💰 Cartera Total", Number(amount.toFixed(2))]));
      expenseMap.forEach((amount, name) => data.push(["💰 Cartera Total", `🔴 ${name}`, Number(amount.toFixed(2))]));
      
      if (totalIncome > totalExpense) {
          data.push(["💰 Cartera Total", "💎 Ahorro Generado", Number((totalIncome - totalExpense).toFixed(2))]);
      } else if (totalExpense > totalIncome) {
          data.push(["📉 Capital Anterior", "💰 Cartera Total", Number((totalExpense - totalIncome).toFixed(2))]);
      }
      
      return data.length > 1 ? data : [];
  }, [transactions, startTs, endTs, categories]);

  return (
      <div style={{ 
          background: theme.card, padding: 24, borderRadius: 24, border: `1px solid ${theme.border}`,
          boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
          minHeight: 600
      }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#3b82f615', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconWaves />
              </div>
              <div>
                  <h3 style={{ margin: 0, color: theme.text, fontWeight: 900, fontSize: '1.4rem' }}>Dinámica de Flujo Sanguíneo</h3>
                  <p style={{ margin: 0, color: theme.textSec, fontSize: '0.85rem' }}>Rastreo de origen y destino de cada centavo</p>
              </div>
          </div>

          <div style={{ overflowX: 'auto', width: '100%' }}>
              <div style={{ minWidth: isMobile ? 600 : '100%', height: 500 }}>
                  {sankeyData.length > 0 ? (
                      <Chart 
                          chartType="Sankey" 
                          width="100%" 
                          height="100%" 
                          data={sankeyData} 
                          options={{ 
                              sankey: { 
                                  node: { 
                                      label: { 
                                          color: theme.text,
                                          fontSize: 12,
                                          bold: true,
                                          fontName: 'Inter, system-ui'
                                      },
                                      nodePadding: 24,
                                      width: 12,
                                      colors: [theme.primary, theme.danger, '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#6366f1']
                                  },
                                  link: {
                                      colorMode: 'gradient',
                                      fillOpacity: isDark ? 0.3 : 0.15
                                  }
                              } 
                          }} 
                      />
                  ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: theme.textSec, fontStyle: 'italic', background: theme.bg, borderRadius: 20 }}>
                          No hay flujos de efectivo registrados en este período.
                      </div>
                  )}
              </div>
          </div>
      </div>
  );
}
