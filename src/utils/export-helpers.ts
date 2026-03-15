/**
 * UTILIDADES DE EXPORTACIÓN Y ARCHIVOS
 * Centraliza la lógica de generación de CSV, JSON y plantillas.
 */

import { Account, Category, Transaction, AppSettings } from "../services/types";

const CSV_SEP = ";";

/**
 * Función base para descargar archivos en el navegador.
 */
export const downloadFile = (content: string, fileName: string, mimeType: string = 'text/csv;charset=utf-8;') => {
  const blob = new Blob(["\uFEFF" + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Genera y descarga un respaldo completo en formato JSON.
 */
export const exportToJSON = (data: {
  accounts: Account[],
  categories: Category[],
  transactions: Transaction[],
  settings: AppSettings
}) => {
  const backupData = {
    timestamp: new Date().toISOString(),
    app: "Prospera",
    data: {
      accounts: data.accounts,
      categories: data.categories,
      transactions: data.transactions,
      settings: data.settings
    }
  };
  
  const fileName = `Prospera_Backup_${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(JSON.stringify(backupData, null, 2), fileName, 'application/json');
};

/**
 * Descarga plantillas CSV para importación masiva.
 */
export const downloadCSVTemplate = (type: 'cuentas' | 'categorias' | 'movimientos') => {
  let content = "";
  let fileName = "";

  if (type === 'cuentas') {
    content = `Nombre${CSV_SEP}SaldoInicial${CSV_SEP}EsAhorro${CSV_SEP}MetaAhorro\nBanco X${CSV_SEP}1000${CSV_SEP}si${CSV_SEP}5000`;
    fileName = 'plantilla_cuentas.csv';
  } else if (type === 'categorias') {
    content = `Nombre${CSV_SEP}Tipo${CSV_SEP}Icono${CSV_SEP}Color\nComida${CSV_SEP}gasto${CSV_SEP}🍔${CSV_SEP}#f44336`;
    fileName = 'plantilla_categorias.csv';
  } else if (type === 'movimientos') {
    content = `Fecha${CSV_SEP}Tipo${CSV_SEP}Monto${CSV_SEP}Categoria${CSV_SEP}Cuenta${CSV_SEP}Nota\n2025-01-30${CSV_SEP}gasto${CSV_SEP}15.50${CSV_SEP}Comida${CSV_SEP}Banco X${CSV_SEP}Almuerzo`;
    fileName = 'plantilla_movimientos.csv';
  }

  downloadFile(content, fileName);
};

/**
 * Genera un CSV de transacciones actuales.
 */
export const exportTransactionsToCSV = (transactions: Transaction[], accounts: Account[], categories: Category[]) => {
    let csv = `Fecha${CSV_SEP}Tipo${CSV_SEP}Monto${CSV_SEP}Categoria${CSV_SEP}Cuenta${CSV_SEP}Nota\n`;
    
    transactions.forEach(t => {
        const acc = accounts.find(a => a.id === t.accountId)?.name || 'Desconocida';
        const cat = categories.find(c => c.id === t.categoryId)?.name || 'General';
        const date = new Date(t.createdAt).toISOString().split('T')[0];
        const type = t.type === 'income' ? 'ingreso' : t.type === 'expense' ? 'gasto' : 'transferencia';
        
        csv += `${date}${CSV_SEP}${type}${CSV_SEP}${t.amount}${CSV_SEP}${cat}${CSV_SEP}${acc}${CSV_SEP}${t.note}\n`;
    });

    downloadFile(csv, `Prospera_Movimientos_${new Date().toISOString().split('T')[0]}.csv`);
};
