import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface Cliente {
  nombre: string;
  ruc: string;
  email: string;
  celular: string;
  validezDias: number;
}

export interface Item {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

/**
 * Motor de generación física de PDF de Proforma Comercial de Prospera.
 * Lógica matemática aislada para dibujo en mm y envoltura de textos anti-superposición.
 */
export function generarPDFDocument(
  cliente: Cliente,
  items: Item[],
  descuento: number,
  ivaRate: number,
  proformaNum: string,
  logoBase64: string | null
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Colores institucionales de Prospera (Verde Esmeralda premium)
  const primaryColor = [0, 149, 106]; // #00956A
  const darkGray = [30, 41, 59]; // slate-800
  const lightGray = [100, 116, 139]; // slate-500
  const accentGreen = [240, 253, 244]; // bg-green-50

  // --- CABECERA DE MARCA ---
  if (logoBase64) {
    // Dibujar logotipo horizontal real de Prospera (proporción 1.23:1 corregida)
    doc.addImage(logoBase64, 'PNG', 20, 11, 22, 18);
  } else {
    // Logotipo estilizado de Prospera (Fallback)
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.roundedRect(20, 15, 12, 12, 3, 3, 'F');
    
    // P de Prospera blanca
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('P', 24.5, 23.5);

    // Texto de cabecera Prospera
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PROSPERA', 35, 21);
    
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('FINANZAS SIMPLES PARA PYMES', 35, 25.5);
  }

  // Info del emisor (Prospera Corp) a la derecha
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('PROSPERA ECUADOR S.A.S.', 135, 19);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setFontSize(8);
  doc.text('Email: soporte@prosperapymes.com', 135, 24);
  doc.text('WhatsApp: +593 98 831 3486', 135, 29);

  // Separador
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(20, 36, 190, 36);

  // --- INFORMACIÓN DE LA PROFORMA ---
  const fechaEmision = new Date().toLocaleDateString('es-EC');
  const fechaValidez = new Date(Date.now() + cliente.validezDias * 24 * 60 * 60 * 1000).toLocaleDateString('es-EC');

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PROFORMA COMERCIAL', 20, 46);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('No. Proforma:', 20, 52);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(proformaNum, 48, 52);

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Fecha Emisión:', 20, 57);
  doc.setFont('helvetica', 'normal');
  doc.text(fechaEmision, 48, 57);

  doc.setFont('helvetica', 'bold');
  doc.text('Validez Oferta:', 20, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(`${cliente.validezDias} días (hasta ${fechaValidez})`, 48, 62);

  // --- CLIENTE ---
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(110, 41, 80, 24, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(110, 41, 80, 24, 2, 2, 'S');

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE:', 114, 46);

  doc.setFontSize(8.5);
  doc.text(cliente.nombre || 'Consumidor Final', 114, 51);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text(`RUC/C.I: ${cliente.ruc || '9999999999999'}`, 114, 55);
  doc.text(`Email: ${cliente.email || 'N/A'}`, 114, 59);
  doc.text(`Celular: ${cliente.celular || 'N/A'}`, 114, 63);

  // --- TABLA DE CONCEPTOS ---
  const headers = [['#', 'Concepto / Servicio', 'Cant.', 'Precio Unit.', 'Subtotal']];
  const body = items.map((item, index) => {
    const sub = item.cantidad * item.precioUnitario;
    return [
      (index + 1).toString(),
      item.descripcion || 'Concepto sin descripción',
      item.cantidad.toString(),
      `$${item.precioUnitario.toFixed(2)}`,
      `$${sub.toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: 72,
    head: headers,
    body: body,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 149, 106],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 90 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' }
    },
    styles: {
      fontSize: 8.5,
      font: 'helvetica',
      cellPadding: 4,
      lineColor: [226, 232, 240]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  // Obtener la posición Y final de la tabla
  let finalY = (doc as any).lastAutoTable.finalY + 8;

  // Si la posición Y final está muy abajo, agregar nueva página
  if (finalY > 230) {
    doc.addPage();
    finalY = 20;
  }

  // --- TOTALES Y CÁLCULOS ---
  const startXTotales = 120;
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(9);
  
  // Subtotal
  const subtotal = items.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);
  const descVal = subtotal * (descuento / 100);
  const subTotalDesc = subtotal - descVal;
  const ivaVal = subTotalDesc * (ivaRate / 100);
  const totalNeto = subTotalDesc + ivaVal;

  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', startXTotales, finalY);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${subtotal.toFixed(2)}`, 190, finalY, { align: 'right' });
  
  // Descuento
  if (descuento > 0) {
    finalY += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(`Descuento (${descuento}%):`, startXTotales, finalY);
    doc.setFont('helvetica', 'bold');
    doc.text(`-$${descVal.toFixed(2)}`, 190, finalY, { align: 'right' });
  }

  // IVA
  finalY += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(`IVA (${ivaRate}%):`, startXTotales, finalY);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${ivaVal.toFixed(2)}`, 190, finalY, { align: 'right' });

  // Total Neto
  finalY += 6;
  doc.setFillColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  doc.roundedRect(startXTotales - 2, finalY - 4.5, 72, 7, 1.5, 1.5, 'F');
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(startXTotales - 2, finalY - 4.5, 72, 7, 1.5, 1.5, 'S');
  
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL NETO:', startXTotales, finalY);
  doc.text(`$${totalNeto.toFixed(2)}`, 190, finalY, { align: 'right' });

  // --- BANCO Y TÉRMINOS ---
  finalY += 15;
  if (finalY > 240) {
    doc.addPage();
    finalY = 20;
  }

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('INSTRUCCIONES DE PAGO:', 20, finalY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  const pagoText = 'Para recibir los datos de transferencia específicos y registrar su pago, por favor póngase en contacto directo con nuestro equipo a través de correo electrónico (soporte@prosperapymes.com) o WhatsApp (+593 98 831 3486).';
  doc.text(pagoText, 20, finalY + 5, { maxWidth: 80 });
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Cuentas y Métodos Disponibles:', 20, finalY + 19);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text('• Bancos: Pichincha, Produbanco, Guayaquil', 20, finalY + 24);
  doc.text('• Digitales: De Una, Peigo, Pyphone', 20, finalY + 28);

  // --- POLÍTICAS ---
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('TÉRMINOS Y CONDICIONES:', 110, finalY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text('1. Esta cotización tiene fines estrictamente comerciales.', 110, finalY + 5, { maxWidth: 80 });
  doc.text('2. El pago inicial del 100% activa el servicio contratado.', 110, finalY + 12, { maxWidth: 80 });
  doc.text('3. Los precios incluyen el impuesto al valor agregado (IVA).', 110, finalY + 19, { maxWidth: 80 });
  doc.text('4. Soporte técnico incluido según plan de servicio.', 110, finalY + 26, { maxWidth: 80 });

  // --- FIRMA Y FOOTER ---
  let firmaY = finalY + 45; // Más espacio vertical para la firma física
  if (firmaY > 270) {
    doc.addPage();
    firmaY = 40;
  }

  // Línea de firma
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.5);
  doc.line(75, firmaY, 135, firmaY);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(8.5);
  doc.text('Firma Autorizada', 105, firmaY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text('Departamento de Operaciones - Prospera', 105, firmaY + 9, { align: 'center' });

  return doc;
}
