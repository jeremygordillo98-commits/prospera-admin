import React, { useMemo } from 'react';
import { useData } from "../../context/DataContext";
import { useTheme } from "../../context/ThemeContext";
import { 
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
    BarChart, Bar, XAxis, YAxis, Legend 
} from 'recharts';
import { 
    IconDownload, IconCrystalBall, IconFolder, IconPieChart, IconChart, IconLock 
} from '../dashboard/DashboardIcons';
import { formatCurrency } from '../../utils/financial-helpers';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface CategoryNode {
  id: string;
  name: string;
  icon: string;
  total: number;
  own: number;
  children: CategoryNode[];
}

interface ReporteResultadosProps {
  startDate: string;
  endDate: string;
  isMobile: boolean;
}

export default function ReporteResultados({ startDate, endDate, isMobile }: ReporteResultadosProps) {
  const { transactions, categories, permissions, isAdmin, showToast } = useData();
  const { theme, isDark } = useTheme();

  const exportToExcel = () => {
    if (!permissions.reporte_estado && !isAdmin) {
        showToast("La descarga a Excel es una función PRO. Mejora tu plan.", "warning");
        return;
    }

    const data: any[] = [];
    stats.catList.forEach(p => {
        data.push({ "Categoría": `${p.icon} ${p.name} (Total)`, "Monto ($)": p.total.toFixed(2) });
        p.children.forEach(c => {
            data.push({ "Categoría": `   ↳ ${c.icon} ${c.name}`, "Monto ($)": c.total.toFixed(2) });
        });
    });

    data.push({ "Categoría": "", "Monto ($)": "" });
    data.push({ "Categoría": "RESUMEN", "Monto ($)": "" });
    data.push({ "Categoría": "Ingresos", "Monto ($)": stats.income.toFixed(2) });
    data.push({ "Categoría": "Egresos", "Monto ($)": stats.expense.toFixed(2) });
    data.push({ "Categoría": "Neto", "Monto ($)": stats.net.toFixed(2) });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    
    // Ancho de columnas
    ws['!cols'] = [{ wch: 40 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(wb, ws, "Resultados");
    XLSX.writeFile(wb, `Reporte_Resultados_${startDate}.xlsx`);
  };

  const exportToPDF = () => {
    if (!permissions.reporte_estado && !isAdmin) {
        showToast("La impresión de reportes es una función PRO. Mejora tu plan.", "warning");
        return;
    }

    const doc = new jsPDF();
    const logoImg = new Image();
    logoImg.src = '/logo-obscuro.png';

    const renderReport = () => {
        // Logo y Header
        doc.addImage(logoImg, 'PNG', 14, 10, 40, 15);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("Resumen de Resultados", 14, 40);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`Periodo: ${startDate} al ${endDate}`, 14, 48);
        doc.text(`Fecha de impresión: ${new Date().toLocaleString()}`, 14, 53);

        // Cards de Resumen
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(0.5);
        doc.setFillColor(248, 250, 252);
        doc.rect(14, 60, 55, 25, 'FD'); // Ingresos
        doc.rect(73, 60, 55, 25, 'FD'); // Egresos
        doc.rect(132, 60, 64, 25, 'FD'); // Neto

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(9);
        doc.text("TOTAL INGRESOS", 18, 67);
        doc.text("TOTAL EGRESOS", 77, 67);
        doc.text("BALANCE NETO", 136, 67);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129); // Verde
        doc.text(`$${stats.income.toLocaleString()}`, 18, 77);
        doc.setTextColor(239, 68, 68); // Rojo
        doc.text(`$${stats.expense.toLocaleString()}`, 77, 77);
        doc.setTextColor(30, 41, 59);
        doc.text(`$${stats.net.toLocaleString()}`, 136, 77);

        // Tabla de Categorías
        const tableData: any[] = [];
        stats.catList.forEach(p => {
            tableData.push([p.name, `$${p.total.toFixed(2)}`, "100%"]);
            p.children.forEach(c => {
                tableData.push([`   ↳ ${c.name}`, `$${c.total.toFixed(2)}`, `${((c.total/p.total)*100).toFixed(1)}%`]);
            });
        });

        autoTable(doc, {
          startY: 95,
          head: [["CATEGORÍA", "MONTO ($)", "% DEL PADRE"]],
          body: tableData,
          headStyles: { fillColor: [30, 41, 59], textColor: [248, 250, 252], fontStyle: 'bold' },
          bodyStyles: { fontSize: 9, cellPadding: 4 },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          margin: { top: 95 },
          didDrawPage: (data) => {
              doc.setFontSize(9);
              doc.setTextColor(150);
              doc.text(`Prospera Finanzas - Página ${doc.getNumberOfPages()}`, 14, doc.internal.pageSize.getHeight() - 10);
          }
        });
        
        doc.save(`Reporte_Resultados_${startDate}.pdf`);
    };

    logoImg.onload = renderReport;
    logoImg.onerror = renderReport;
  };

  const startTs = useMemo(() => { 
      const [y, m, d] = startDate.split('-').map(Number); 
      return new Date(y, m - 1, d).getTime(); 
  }, [startDate]);
  
  const endTs = useMemo(() => { 
      const [y, m, d] = endDate.split('-').map(Number); 
      return new Date(y, m - 1, d, 23, 59, 59, 999).getTime(); 
  }, [endDate]);
  
  const { stats, projection, pieData, barData } = useMemo(() => {
    const filtered = transactions.filter(t => t.createdAt >= startTs && t.createdAt <= endTs);
    let income = 0; let expense = 0; 

    const tempMap = new Map<string, { own: number, children: Map<string, number> }>();
    categories.forEach(c => { if (!c.parentId) tempMap.set(c.id, { own: 0, children: new Map() }); });

    filtered.forEach(t => {
      if (t.type === 'income') income += t.amount;
      if (t.type === 'expense') {
        expense += t.amount;
        const cat = categories.find(c => c.id === t.categoryId);
        if (cat) {
            const parentId = cat.parentId || cat.id;
            const entry = tempMap.get(parentId);
            if (entry) {
                if (cat.parentId) entry.children.set(cat.id, (entry.children.get(cat.id) || 0) + t.amount);
                else entry.own += t.amount;
            }
        }
      }
    });

    const catList: CategoryNode[] = [];
    const pData: any[] = [];

    tempMap.forEach((val, key) => {
        const cat = categories.find(c => c.id === key);
        let childrenTotal = 0;
        const childrenNodes: CategoryNode[] = [];
        val.children.forEach((childAmount, childId) => {
            const childCat = categories.find(c => c.id === childId);
            childrenTotal += childAmount;
            childrenNodes.push({ id: childId, name: childCat?.name || "Otros", icon: childCat?.icon || "🏷️", total: childAmount, own: childAmount, children: [] });
        });
        const total = val.own + childrenTotal;
        if (total > 0) {
            const name = cat?.name || "Otros";
            catList.push({ id: key, name, icon: cat?.icon || "📂", total, own: val.own, children: childrenNodes.sort((a,b) => b.total - a.total) });
            pData.push({ name, value: total });
        }
    });

    const daysInPeriod = (endTs - startTs) / (1000 * 60 * 60 * 24) + 1;
    const nowTs = Date.now();
    let daysPassed = Math.max(1, Math.min(daysInPeriod, (nowTs - startTs) / (1000 * 60 * 60 * 24)));
    
    const projectedExpense = (expense / daysPassed) * daysInPeriod;
    const maxBar = Math.max(income, projectedExpense, expense) || 1;

    const bData = [
        { name: 'Balance del Período', Ingresos: income, Egresos: expense, Proyectado: projectedExpense }
    ];

    return { 
        stats: { income, expense, net: income - expense, catList: catList.sort((a,b) => b.total - a.total) },
        projection: { expense: projectedExpense, diff: projectedExpense - expense, pctExpense: (expense/maxBar)*100, pctProjected: (projectedExpense/maxBar)*100, pctIncome: (income/maxBar)*100 },
        pieData: pData.sort((a,b) => b.value - a.value),
        barData: bData
    };
  }, [transactions, startTs, endTs, categories]);

  const COLORS = [theme.primary, '#8b5cf6', '#3b82f6', '#f59e0b', '#ec4899', theme.danger, '#10b981', '#6366f1'];

  const hasPerm = permissions.reporte_estado || isAdmin;

  return (
    <div style={{ display: 'grid', gap: 24 }}>
        
        {/* CABECERA CON ACCIONES */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
             <h3 style={{ margin: 0, color: theme.text, fontSize: '1.25rem', fontWeight: 800 }}>Resumen de Resultados</h3>
             <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={exportToPDF} style={{ 
                    background: theme.card, color: theme.text, border: `1px solid ${theme.border}`, padding: '10px 20px', 
                    borderRadius: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'all 0.2s', opacity: hasPerm ? 1 : 0.6
                }}>
                    {hasPerm ? <span style={{fontSize:'1.2rem'}}>🖨️</span> : <IconLock />} Imprimir
                </button>
                <button onClick={exportToExcel} style={{ 
                    background: hasPerm ? theme.primary : theme.textSec, 
                    color: '#fff', border: 'none', padding: '10px 20px', 
                    borderRadius: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: hasPerm ? `0 8px 20px ${theme.primary}40` : 'none',
                    transition: 'all 0.2s', opacity: hasPerm ? 1 : 0.6
                }}>
                    {hasPerm ? <IconDownload /> : <IconLock />} Descargar Excel
                </button>
             </div>
        </div>

        {/* PROYECCIÓN INTELIGENTE */}
        <div style={{ 
            background: theme.card, padding: 24, borderRadius: 24, border: `1px solid ${theme.border}`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#8b5cf620', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconCrystalBall />
                </div>
                <div>
                    <h4 style={{ margin: 0, color: theme.text, fontWeight: 800 }}>Proyección a fin de mes</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: theme.textSec }}>Basado en tu ritmo de gasto actual</p>
                </div>
            </div>

            <div style={{ position: 'relative', height: 40, background: theme.bg, borderRadius: 20, overflow: 'hidden', border: `1px solid ${theme.border}`, marginBottom: 16 }}>
                <div style={{ position:'absolute', left: 0, top: 0, height: '100%', width: `${Math.min(projection.pctIncome, 100)}%`, borderRight: `3px dashed ${theme.primary}`, zIndex: 1 }} />
                <div style={{ position:'absolute', left: 0, top: 0, height: '100%', width: `${Math.min(projection.pctProjected, 100)}%`, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', zIndex: 0 }} />
                <div style={{ position:'absolute', left: 0, top: 0, height: '100%', width: `${Math.min(projection.pctExpense, 100)}%`, background: projection.expense > stats.income ? theme.danger : theme.primary, transition: 'width 1s ease-out' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
                 <div>
                     <div style={{ fontSize: '0.75rem', color: theme.textSec, fontWeight: 700, textTransform: 'uppercase' }}>Consumo Real</div>
                     <div style={{ fontSize: '1.2rem', fontWeight: 900, color: theme.text }}>{formatCurrency(stats.expense)}</div>
                 </div>
                 <div>
                     <div style={{ fontSize: '0.75rem', color: theme.textSec, fontWeight: 700, textTransform: 'uppercase' }}>Proyección Final</div>
                     <div style={{ fontSize: '1.2rem', fontWeight: 900, color: projection.expense > stats.income ? theme.danger : theme.text }}>{formatCurrency(projection.expense)}</div>
                 </div>
                 <div>
                     <div style={{ fontSize: '0.75rem', color: theme.textSec, fontWeight: 700, textTransform: 'uppercase' }}>Ingresos Esperados</div>
                     <div style={{ fontSize: '1.2rem', fontWeight: 900, color: theme.primary }}>{formatCurrency(stats.income)}</div>
                 </div>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }}>
            {/* GRÁFICOS */}
            <div style={{ display: 'grid', gap: 24 }}>
                <div style={{ background: theme.card, padding: 24, borderRadius: 24, border: `1px solid ${theme.border}` }}>
                    <h4 style={{ margin: 0, marginBottom: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <IconPieChart /> Gastos por Categoría
                    </h4>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} 
                                    paddingAngle={5} dataKey="value" stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(v: any) => formatCurrency(Number(v))}
                                    contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, color: theme.text }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ background: theme.card, padding: 24, borderRadius: 24, border: `1px solid ${theme.border}` }}>
                    <h4 style={{ margin: 0, marginBottom: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <IconChart /> Comparativa Neta
                    </h4>
                    <div style={{ height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <XAxis dataKey="name" hide />
                                <YAxis hide />
                                <Tooltip 
                                    formatter={(v: any) => formatCurrency(Number(v))}
                                    contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, color: theme.text }}
                                />
                                <Bar dataKey="Ingresos" fill={theme.primary} radius={[10, 10, 0, 0]} />
                                <Bar dataKey="Egresos" fill={theme.danger} radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* LISTADO DETALLADO */}
            <div style={{ background: theme.card, padding: 24, borderRadius: 24, border: `1px solid ${theme.border}` }}>
                <h4 style={{ margin: 0, marginBottom: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <IconFolder /> Desglose Detallado
                </h4>
                <div style={{ display: 'grid', gap: 12 }}>
                    {stats.catList.map(cat => (
                        <div key={cat.id} style={{ borderBottom: `1px solid ${theme.border}`, paddingBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
                                    <span style={{ fontWeight: 800, color: theme.text }}>{cat.name}</span>
                                </div>
                                <span style={{ fontWeight: 900, color: theme.text }}>{formatCurrency(cat.total)}</span>
                            </div>
                            <div style={{ height: 6, background: theme.bg, borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ 
                                    width: `${(cat.total / stats.expense) * 100}%`, 
                                    height: '100%', background: theme.primary, opacity: 0.6, 
                                    borderRadius: 3 
                                }} />
                            </div>
                            {cat.children.length > 0 && (
                                <div style={{ marginTop: 8, paddingLeft: 24, display: 'grid', gap: 6 }}>
                                    {cat.children.map(child => (
                                        <div key={child.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: theme.textSec }}>
                                            <span>↳ {child.icon} {child.name}</span>
                                            <span style={{ fontWeight: 600 }}>{formatCurrency(child.total)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}
