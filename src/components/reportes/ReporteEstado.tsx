import React, { useState, useMemo } from 'react';
import { useData } from "../../context/DataContext";
import { useTheme } from "../../context/ThemeContext";
import { Transaction } from "../../services/types";
import { 
    IconDownload, IconTransfer, IconBank, IconBalance, IconIncome, IconExpense, IconLock 
} from '../dashboard/DashboardIcons';
import { formatCurrency } from '../../utils/financial-helpers';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ReportRow extends Transaction {
  credit: number;
  debit: number;
  balance: number;
  isInitial?: boolean;
}

interface ReporteEstadoProps {
  startDate: string;
  endDate: string;
  isMobile: boolean;
}

export default function ReporteEstado({ startDate, endDate, isMobile }: ReporteEstadoProps) {
  const { transactions, accounts, categories, permissions, isAdmin, showToast } = useData();
  const { theme, isDark } = useTheme();
  const [selectedAccountId, setSelectedAccountId] = useState("all");

  const getTransferInfo = (t: Transaction) => {
    const fromAcc = accounts.find(a => a.id === t.accountId)?.name || 'Cuenta Origen';
    const toAcc = accounts.find(a => a.id === t.toAccountId)?.name || 'Cuenta Destino';
    return `De ${fromAcc} a ${toAcc}`;
  };


  const exportToExcel = () => {
    if (!permissions.reporte_estado && !isAdmin) {
        showToast("La descarga a Excel es una función PRO. Mejora tu plan.", "warning");
        return;
    }

    const data = accountReport.map(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        const parent = cat?.parentId ? categories.find(c => c.id === cat.parentId) : null;

        let catDisplay = "";
        if (t.isInitial) catDisplay = 'SALDO INICIAL';
        else if (t.type === 'transfer') catDisplay = getTransferInfo(t);
        else if (parent) catDisplay = `${parent.name} > ${cat?.name}`;
        else catDisplay = cat?.name || 'Varios';

        return {
          "Fecha": new Date(t.createdAt).toLocaleDateString(),
          "Categoría": catDisplay,
          "Detalle": (t.note || '').replace(/;/g, ' '),
          "Ingresos (+)": t.credit > 0 ? t.credit.toFixed(2) : '0.00',
          "Egresos (-)": t.debit > 0 ? t.debit.toFixed(2) : '0.00',
          "Saldo Acumulado": t.balance.toFixed(2)
        };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    ws['!cols'] = [
      { wch: 15 }, { wch: 35 }, { wch: 35 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Estado de Cuenta");
    XLSX.writeFile(wb, `Estado_Cuenta_${startDate}.xlsx`);
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
        const accName = selectedAccountId === 'all' ? 'Consolidado Total' : (accounts.find(a => a.id === selectedAccountId)?.name || 'Cuenta');

        // Header
        doc.addImage(logoImg, 'PNG', 14, 10, 40, 15);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("Estado de Cuenta", 14, 40);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`Cuenta: ${accName}`, 14, 48);
        doc.text(`Periodo: ${startDate} al ${endDate}`, 14, 53);
        doc.text(`Fecha de impresión: ${new Date().toLocaleString()}`, 14, 58);

        // Cards
        doc.setDrawColor(59, 130, 246);
        doc.setFillColor(248, 250, 252);
        const cardW = 43;
        doc.rect(14, 65, cardW, 20, 'FD');
        doc.rect(14 + cardW + 3, 65, cardW, 20, 'FD');
        doc.rect(14 + (cardW + 3)*2, 65, cardW, 20, 'FD');
        doc.rect(14 + (cardW + 3)*3, 65, cardW, 20, 'FD');

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(7);
        doc.text("SALDO INICIAL", 18, 72);
        doc.text("ENTRADAS", 18 + cardW + 3, 72);
        doc.text("SALIDAS", 18 + (cardW + 3)*2, 72);
        doc.text("SALDO FINAL", 18 + (cardW + 3)*3, 72);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`$${summary.start.toLocaleString()}`, 18, 80);
        doc.setTextColor(16, 185, 129);
        doc.text(`$${summary.credit.toLocaleString()}`, 18 + cardW + 3, 80);
        doc.setTextColor(239, 68, 68);
        doc.text(`$${summary.debit.toLocaleString()}`, 18 + (cardW + 3)*2, 80);
        doc.setTextColor(30, 41, 59);
        doc.text(`$${summary.end.toLocaleString()}`, 18 + (cardW + 3)*3, 80);

        autoTable(doc, {
          startY: 95,
          head: [["FECHA", "CATEGORÍA", "DETALLE", "ENTRADA", "SALIDA", "SALDO"]],
          body: accountReport.map(t => {
            const cat = categories.find(c => c.id === t.categoryId);
            const parent = cat?.parentId ? categories.find(c => c.id === cat.parentId) : null;
            let catDisplay = "";
            if (t.isInitial) catDisplay = 'Saldo Inicial';
            else if (t.type === 'transfer') catDisplay = getTransferInfo(t);
            else if (parent) catDisplay = `${parent.name} > ${cat?.name}`;
            else catDisplay = cat?.name || 'Varios';

            return [
              new Date(t.createdAt).toLocaleDateString(),
              catDisplay,
              t.note || '-',
              t.credit > 0 ? `$${t.credit.toFixed(2)}` : '',
              t.debit > 0 ? `$${t.debit.toFixed(2)}` : '',
              { content: `$${t.balance.toFixed(2)}`, styles: { fontStyle: 'bold' } }
            ];
          }),
          headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 9 },
          bodyStyles: { fontSize: 8, cellPadding: 3 },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
          margin: { top: 95 },
          didDrawPage: (data) => {
              doc.setFontSize(9);
              doc.setTextColor(150);
              doc.text(`Prospera Finanzas - Página ${doc.getNumberOfPages()}`, 14, doc.internal.pageSize.getHeight() - 10);
          }
        });

        doc.save(`Estado_Cuenta_${startDate}.pdf`);
    };

    logoImg.onload = renderReport;
    logoImg.onerror = renderReport;
  };

  const hasPerm = permissions.reporte_estado || isAdmin;

  const startTs = useMemo(() => {
      const [y, m, d] = startDate.split('-').map(Number);
      return new Date(y, m - 1, d).getTime();
  }, [startDate]);

  const endTs = useMemo(() => {
      const [y, m, d] = endDate.split('-').map(Number);
      return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
  }, [endDate]);

  const { accountReport, summary } = useMemo(() => {
    const targetAccountIds = selectedAccountId === 'all' ? accounts.map(a => a.id) : [selectedAccountId];
    let currentBalance = 0;

    targetAccountIds.forEach(id => {
        const acc = accounts.find(a => a.id === id);
        if (acc) currentBalance += Number(acc.initialBalance);
    });

    transactions.forEach(t => {
        if (t.createdAt < startTs) {
            const affectsOrigin = targetAccountIds.includes(t.accountId);
            const affectsDest = t.toAccountId ? targetAccountIds.includes(t.toAccountId) : false;
            if (affectsOrigin) {
                if (t.type === 'income') currentBalance += t.amount;
                else currentBalance -= t.amount;
            }
            if (affectsDest && t.type === 'transfer') currentBalance += t.amount;
        }
    });

    const startingBalance = currentBalance;
    const movementsInPeriod: ReportRow[] = [];
    let totalCredit = 0;
    let totalDebit = 0;

    const sortedInPeriod = transactions
        .filter(t => t.createdAt >= startTs && t.createdAt <= endTs)
        .sort((a, b) => a.createdAt - b.createdAt);

    for (const t of sortedInPeriod) {
        const affectsOrigin = targetAccountIds.includes(t.accountId);
        const affectsDest = t.toAccountId ? targetAccountIds.includes(t.toAccountId) : false;
        if (!affectsOrigin && !affectsDest) continue;

        let credit = 0; let debit = 0; let amountChange = 0;
        if (t.type === 'income' && affectsOrigin) { amountChange = t.amount; credit = t.amount; }
        else if (t.type === 'expense' && affectsOrigin) { amountChange = -t.amount; debit = t.amount; }
        else if (t.type === 'transfer') {
            if (affectsOrigin && affectsDest) { amountChange = 0; credit = 0; debit = 0; }
            else if (affectsOrigin) { amountChange = -t.amount; debit = t.amount; }
            else if (affectsDest) { amountChange = t.amount; credit = t.amount; }
        }
        currentBalance += amountChange;
        totalCredit += credit;
        totalDebit += debit;
        movementsInPeriod.push({ ...t, credit, debit, balance: currentBalance });
    }

    const finalReport = movementsInPeriod.reverse();
    finalReport.push({
        id: 'initial-balance', createdAt: startTs, type: 'income', amount: 0, accountId: 'system',
        note: 'Saldo inicial del periodo', isReconciled: true, credit: 0, debit: 0, balance: startingBalance, isInitial: true
    });

    return { accountReport: finalReport, summary: { start: startingBalance, end: currentBalance, credit: totalCredit, debit: totalDebit } };
  }, [transactions, accounts, selectedAccountId, startTs, endTs]);

  return (
    <div style={{ display: 'grid', gap: 24 }}>

        {/* HEADER & SELECTOR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                 <select
                    value={selectedAccountId}
                    onChange={e => setSelectedAccountId(e.target.value)}
                    style={{
                        padding: '12px 20px', borderRadius: 16, border: `1px solid ${theme.border}`,
                        background: theme.card, color: theme.text, fontSize: '1rem', fontWeight: 700,
                        outline: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                    }}
                 >
                    <option value="all">🏦 Consolidado Total</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                 </select>
            </div>
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

        {/* SUMMARY CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 16 }}>
            {[
                { label: 'Inicial', val: summary.start, color: theme.textSec, icon: <IconBalance /> },
                { label: 'Entradas', val: summary.credit, color: theme.primary, icon: <IconIncome /> },
                { label: 'Salidas', val: summary.debit, color: theme.danger, icon: <IconExpense /> },
                { label: 'Final', val: summary.end, color: theme.text, icon: <IconBank /> }
            ].map((item, i) => (
                <div key={i} style={{ background: theme.card, padding: 20, borderRadius: 24, border: `1px solid ${theme.border}`, textAlign: 'center' }}>
                     <div style={{ color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
                         {item.icon} {item.label}
                     </div>
                     <div style={{ fontSize: '1.25rem', fontWeight: 900, color: theme.text }}>{formatCurrency(item.val)}</div>
                </div>
            ))}
        </div>

        {/* TRANSACTION LIST */}
        <div style={{ background: theme.card, borderRadius: 24, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontWeight: 800 }}>Historial de Movimientos</h4>
                <div style={{ fontSize: '0.8rem', color: theme.textSec, fontWeight: 600 }}>{accountReport.length - 1} movimientos</div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: theme.bg, fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', fontWeight: 800 }}>
                            <th style={{ padding: '16px 24px' }}>Fecha</th>
                            <th style={{ padding: '16px 24px' }}>Categoría</th>
                            <th style={{ padding: '16px 24px' }}>Detalle</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right' }}>Entrada</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right' }}>Salida</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right' }}>Saldo Acum.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accountReport.map((t, idx) => {
                            const cat = categories.find(c => c.id === t.categoryId);
                            const parent = cat?.parentId ? categories.find(c => c.id === cat.parentId) : null;
                            const isInitial = t.isInitial;

                            let catDisplay = "";
                            if (isInitial) catDisplay = 'Saldo inicial';
                            else if (t.type === 'transfer') catDisplay = getTransferInfo(t);
                            else if (parent) catDisplay = `${parent.name} > ${cat?.name}`;
                            else catDisplay = cat?.name || 'Varios';

                            return (
                                <tr key={t.id + idx} style={{
                                    borderBottom: `1px solid ${theme.border}`,
                                    background: isInitial ? theme.bg : 'transparent',
                                    opacity: isInitial ? 0.7 : 1
                                }}>
                                    <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: theme.textSec }}>
                                        {new Date(t.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 10, background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: `1px solid ${theme.border}` }}>
                                                {isInitial ? '🚩' : (t.type === 'transfer' ? <IconTransfer /> : (parent?.icon || cat?.icon || '🏷️'))}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: theme.text }}>
                                                    {catDisplay}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: theme.textSec }}>
                                        {t.note || '-'}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 700, color: theme.primary }}>
                                        {t.credit > 0 ? `+${formatCurrency(t.credit)}` : ''}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 700, color: theme.danger }}>
                                        {t.debit > 0 ? `-${formatCurrency(t.debit)}` : ''}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 800, fontSize: '1.05rem', color: theme.text }}>
                                        {formatCurrency(t.balance)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}
