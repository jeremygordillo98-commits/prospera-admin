import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExecutiveReportData {
  reportDate: string;
  periodLabel: string;
  totalUsersB2C: number;
  totalContadoresB2B: number;
  totalEmpresasB2B: number;
  xmlsThisMonth: number;
  mrrB2C: number;
  mrrB2B: number;
  mrrTotal: number;
  arpuB2C: number;
  arpuB2B: number;
  totalChurnRisk: number;
  churnRatePercent: number;
  b2bAdoption: {
    pdf: number;
    ats: number;
    mailer: number;
  };
  b2cAdoption: {
    pro: number;
    ia: number;
  };
  allAccountsAudit: Array<{
    nombre: string;
    email: string;
    tipo: 'B2C' | 'B2B';
    diasInactivo: number;
    estado: string;
  }>;
}

/**
 * Genera el documento PDF formal de Reporte Ejecutivo Consolidado de Prospera.
 */
export function generarReporteEjecutivoPDF(
  data: ExecutiveReportData,
  logoBase64: string | null
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [0, 149, 106]; // #00956A (Verde Esmeralda)
  const darkNavy = [15, 23, 42]; // slate-900
  const slateText = [71, 85, 105]; // slate-600
  const lightBg = [248, 250, 252]; // slate-50

  // --- PÁGINA 1 ---

  // 1. CABECERA CON LOGO Y DATOS CORPORATIVOS
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 15, 12, 45, 12.8);
    } catch {
      drawFallbackLogo(doc, primaryColor, darkNavy);
    }
  } else {
    drawFallbackLogo(doc, primaryColor, darkNavy);
  }

  // Info institucional a la derecha
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PROSPERA ECUADOR S.A.S.', 195, 16, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text('Panel de Control Central & Business Intelligence', 195, 20.5, { align: 'right' });
  doc.text(`Fecha de Emisión: ${data.reportDate}`, 195, 25, { align: 'right' });
  doc.text('Confidencial — Uso Interno Gerencial', 195, 29.5, { align: 'right' });

  // Línea divisoria elegante
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.6);
  doc.line(15, 34, 195, 34);

  // Título del Reporte
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(15, 38, 4, 14, 1, 1, 'F');

  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('INFORME EJECUTIVO DE SALUD & ECOSISTEMA', 23, 44);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text(`Período Evaluado: ${data.periodLabel} | Auditoría Global B2C & B2B`, 23, 50);

  // 2. RESUMEN EJECUTIVO (4 KPI BOXES)
  const boxY = 56;
  const boxWidth = 42;
  const boxHeight = 22;
  const gap = 3;

  // Box 1: Total Usuarios Combinados
  drawKpiBox(doc, 15, boxY, boxWidth, boxHeight, 'TOTAL ECOSISTEMA', `${data.totalUsersB2C + data.totalContadoresB2B}`, 'Usuarios & Contadores', primaryColor);
  // Box 2: MRR Consolidado
  drawKpiBox(doc, 15 + (boxWidth + gap), boxY, boxWidth, boxHeight, 'MRR CONSOLIDADO', `$${data.mrrTotal.toFixed(2)}`, 'Mensual Proyectado', [16, 185, 129]);
  // Box 3: Empresas Pymes
  drawKpiBox(doc, 15 + (boxWidth + gap) * 2, boxY, boxWidth, boxHeight, 'EMPRESAS PYMES', `${data.totalEmpresasB2B}`, `${data.xmlsThisMonth} XMLs mes SRI`, [59, 130, 246]);
  // Box 4: Churn Risk
  drawKpiBox(doc, 15 + (boxWidth + gap) * 3, boxY, boxWidth, boxHeight, 'RIESGO DE CHURN (>14d)', `${data.churnRatePercent.toFixed(1)}%`, `${data.totalChurnRisk} cuentas inactivas`, [239, 68, 68]);

  // 3. TABLA CONSOLIDADA DE MÉTRICAS OPERATIVAS
  let currentY = boxY + boxHeight + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('1. Métricas Consolidadas del Negocio', 15, currentY);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Dimensión / Indicador', 'Prospera App (B2C)', 'Prospera Pymes (B2B)', 'Total Ecosistema']],
    body: [
      ['Usuarios / Cuentas Registradas', `${data.totalUsersB2C}`, `${data.totalContadoresB2B} contadores`, `${data.totalUsersB2C + data.totalContadoresB2B}`],
      ['Unidades de Negocio Gestionadas', 'Finanzas Personales', `${data.totalEmpresasB2B} empresas`, `${data.totalEmpresasB2B} entidades`],
      ['Ingreso Recurrente Mensual (MRR)', `$${data.mrrB2C.toFixed(2)}`, `$${data.mrrB2B.toFixed(2)}`, `$${data.mrrTotal.toFixed(2)}`],
      ['Ingreso Promedio por Usuario (ARPU)', `$${data.arpuB2C.toFixed(2)} / usuario`, `$${data.arpuB2B.toFixed(2)} / contador`, `$${((data.mrrTotal) / Math.max(1, (data.totalUsersB2C + data.totalContadoresB2B))).toFixed(2)} / usuario`],
      ['Comprobantes SRI / Movimientos Mes', 'Transacciones App', `${data.xmlsThisMonth} facturas XML`, 'Procesamiento en la nube'],
      ['Cuentas en Riesgo de Churn (>14d)', `${data.allAccountsAudit.filter(c => c.tipo === 'B2C' && c.diasInactivo > 14).length} usuarios`, `${data.allAccountsAudit.filter(c => c.tipo === 'B2B' && c.diasInactivo > 14).length} contadores`, `${data.totalChurnRisk} (${data.churnRatePercent.toFixed(1)}%)`]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor as [number, number, number],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: darkNavy as [number, number, number]
    },
    alternateRowStyles: {
      fillColor: lightBg as [number, number, number]
    },
    margin: { left: 15, right: 15 }
  });

  // 4. DESGLOSE DE ADOPCIÓN DE MÓDULOS (B2B Y B2C)
  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('2. Adopción de Funcionalidades & Módulos Premium', 15, currentY);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Módulo / Funcionalidad', 'Plataforma', 'Cuentas Activas', 'Tasa de Penetración']],
    body: [
      ['Reportes PDF Profesionales & Balances', 'Prospera Pymes (B2B)', `${data.b2bAdoption.pdf} empresas`, `${data.totalEmpresasB2B > 0 ? ((data.b2bAdoption.pdf / data.totalEmpresasB2B) * 100).toFixed(1) : 0}%`],
      ['Generador & Descarga ATS del SRI', 'Prospera Pymes (B2B)', `${data.b2bAdoption.ats} empresas`, `${data.totalEmpresasB2B > 0 ? ((data.b2bAdoption.ats / data.totalEmpresasB2B) * 100).toFixed(1) : 0}%`],
      ['Mailer & Comunicados con Clientes', 'Prospera Pymes (B2B)', `${data.b2bAdoption.mailer} empresas`, `${data.totalEmpresasB2B > 0 ? ((data.b2bAdoption.mailer / data.totalEmpresasB2B) * 100).toFixed(1) : 0}%`],
      ['Módulos IA (Chat, Magic, Insights)', 'Prospera App (B2C)', `${data.b2cAdoption.ia} usuarios`, `${data.totalUsersB2C > 0 ? ((data.b2cAdoption.ia / data.totalUsersB2C) * 100).toFixed(1) : 0}%`],
      ['Subcategorías & Conciliación Pro', 'Prospera App (B2C)', `${data.b2cAdoption.pro} usuarios`, `${data.totalUsersB2C > 0 ? ((data.b2cAdoption.pro / data.totalUsersB2C) * 100).toFixed(1) : 0}%`],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: darkNavy as [number, number, number]
    },
    alternateRowStyles: {
      fillColor: lightBg as [number, number, number]
    },
    margin: { left: 15, right: 15 }
  });

  // --- PÁGINA 2: AUDITORÍA DE USUARIOS Y ESTADO DE ACTIVIDAD ---
  doc.addPage();

  // Cabecera Página 2
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('3. Auditoría de Usuarios & Estado de Actividad del Ecosistema', 15, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text('Listado integral de usuarios (App B2C) y contadores (Pymes B2B) con su tiempo de inactividad y estado de salud.', 15, 23);

  const accountRows = data.allAccountsAudit.map(c => [
    c.nombre || 'Usuario Registrado',
    c.email || 'N/A',
    c.tipo,
    `${c.diasInactivo} días`,
    c.estado
  ]);

  if (accountRows.length === 0) {
    accountRows.push(['No se registran usuarios en el sistema.', 'N/A', 'N/A', '0 días', '[Activo] Sin datos']);
  }

  autoTable(doc, {
    startY: 27,
    head: [['Nombre / Razón Social', 'Correo Electrónico', 'Tipo', 'Inactividad', 'Estado de Salud']],
    body: accountRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: darkNavy as [number, number, number],
      overflow: 'linebreak'
    },
    columnStyles: {
      0: { cellWidth: 42 },
      1: { cellWidth: 55 },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 45 }
    },
    alternateRowStyles: {
      fillColor: lightBg as [number, number, number]
    },
    margin: { left: 15, right: 15 }
  });

  // @ts-ignore
  const p2FinalY = doc.lastAutoTable.finalY + 8;

  // 4. CONCLUSIONES Y RECOMENDACIONES ESTRATÉGICAS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('4. Recomendaciones Estratégicas & Acciones de Retención', 15, p2FinalY);

  const recommendations = [
    '• Re-engagement B2B: Ejecutar campaña de correo por Brevo dirigida a contadores con empresas sin movimiento en los últimos 14 días.',
    '• Activación B2C: Notificar mediante Push y correo a usuarios con presupuestos inactivos ofreciendo tips de ahorro o nuevos reportes.',
    '• Soporte Proactivo: Revisar los tickets abiertos en Soporte App/Pymes para asegurar tiempos de respuesta inferiores a 2 horas.',
    '• Adopción ATS SRI: Recordar a los contadores los calendarios tributarios según el noveno dígito del RUC antes del cierre mensual.'
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);

  let recY = p2FinalY + 5;
  recommendations.forEach(rec => {
    doc.text(rec, 17, recY);
    recY += 4.8;
  });

  // Box de Firma / Validación
  const signY = Math.max(recY + 6, 245);
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, signY, 180, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('CERTIFICACIÓN DE AUDITORÍA AUTOMATIZADA', 20, signY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text('Este documento fue generado dinámicamente por el motor de Business Intelligence de Prospera Admin.', 20, signY + 12);
  doc.text(`ID de Ejecución: REP-${Date.now().toString().slice(-8)} | Base de Datos: Supabase Dual B2C/B2B Verificada`, 20, signY + 17);

  // --- PIE DE PÁGINA EN AMBAS PÁGINAS ---
  const totalPages = 2;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(15, 283, 195, 283);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Prospera Ecuador S.A.S. | prosperafinanzas.com | Sistema Integrado de Inteligencia Financiera', 15, 288);
    doc.text(`Página ${i} de ${totalPages}`, 195, 288, { align: 'right' });
  }

  return doc;
}

function drawFallbackLogo(doc: jsPDF, primaryColor: number[], darkNavy: number[]) {
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(15, 12, 10, 10, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('P', 18.5, 19);

  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PROSPERA', 28, 18);

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('BUSINESS INTELLIGENCE', 28, 22);
}

function drawKpiBox(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  value: string,
  subtext: string,
  accentColor: number[]
) {
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(x, y, w, h, 2, 2, 'FD');

  // Línea de acento superior
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(x, y, w, 1.5, 'F');

  // Título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(title, x + 3, y + 6);

  // Valor principal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(value, x + 3, y + 13);

  // Subtexto
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(100, 116, 139);
  doc.text(subtext, x + 3, y + 18);
}
