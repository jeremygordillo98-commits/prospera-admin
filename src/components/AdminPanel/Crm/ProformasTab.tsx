import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabase';
import { generarPDFDocument } from './proformaPdfGenerator';
import { FileText } from 'lucide-react';
import ProformaFormFields from './ProformaFormFields';
import ProformaItemsTable from './ProformaItemsTable';
import ProformaPreviewSheet from './ProformaPreviewSheet';

interface ProformasTabProps {
  theme: any;
  isDark: boolean;
  isMobile: boolean;
}

export default function ProformasTab({ theme, isDark, isMobile }: ProformasTabProps) {
  // Creador de Proformas State
  const [cliente, setCliente] = useState({
    nombre: '',
    ruc: '',
    email: '',
    celular: '',
    validezDias: 15
  });

  const [items, setItems] = useState<Array<{ id: string; descripcion: string; cantidad: number; precioUnitario: number }>>([
    { id: '1', descripcion: 'Suscripción Anual Prospera Pymes Premium', cantidad: 1, precioUnitario: 350.00 }
  ]);

  const [descuento, setDescuento] = useState(0);
  const [ivaRate, setIvaRate] = useState(15); // IVA ajustable (Ecuador 15% por defecto)
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [proformaIndex, setProformaIndex] = useState<number>(() => {
    const saved = localStorage.getItem('prospera_proforma_index');
    return saved ? Number(saved) : 1;
  });

  // Convertir el logo local a Base64 en memoria al cargar
  useEffect(() => {
    const convertUriToBase64 = async (url: string) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.error("Error loading logo image:", err);
        return null;
      }
    };

    convertUriToBase64('/logo-horizontal.png').then((base64) => {
      if (base64) {
        setLogoBase64(base64);
      }
    });
  }, []);

  const agregarItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), descripcion: '', cantidad: 1, precioUnitario: 0 }
    ]);
  };

  const eliminarItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: 'descripcion' | 'cantidad' | 'precioUnitario', value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          [field]: field === 'descripcion' ? value : Number(value)
        };
      }
      return item;
    }));
  };

  // Cálculos automáticos de cotización
  const subtotal = items.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);
  const descVal = subtotal * (descuento / 100);
  const subTotalDesc = subtotal - descVal;
  const ivaVal = subTotalDesc * (ivaRate / 100);
  const totalNeto = subTotalDesc + ivaVal;

  const exportarPDF = () => {
    const proformaNum = `PR-${String(proformaIndex).padStart(5, '0')}`;
    const doc = generarPDFDocument(cliente, items, descuento, ivaRate, proformaNum, logoBase64);
    doc.save(`Proforma_${cliente.nombre.replace(/\s+/g, '_') || 'Cliente'}_${proformaNum}.pdf`);
    
    // Incrementar secuencia automáticamente
    const nextIndex = proformaIndex + 1;
    setProformaIndex(nextIndex);
    localStorage.setItem('prospera_proforma_index', String(nextIndex));
  };

  const enviarProformaEmail = async () => {
    if (!cliente.email) {
      alert("Por favor, ingrese el correo electrónico del cliente para poder realizar el envío.");
      return;
    }

    setSendingEmail(true);
    try {
      const proformaNum = `PR-${String(proformaIndex).padStart(5, '0')}`;
      const doc = generarPDFDocument(cliente, items, descuento, ivaRate, proformaNum, logoBase64);
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      
      const clienteNombre = cliente.nombre || 'Cliente';
      const fileName = `Proforma_${clienteNombre.replace(/\s+/g, '_')}_${proformaNum}.pdf`;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #00956A; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">PROSPERA</h2>
            <span style="font-size: 11px; color: #00956A; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Finanzas Simples para Pymes</span>
          </div>
          
          <p>Estimado/a <strong>${clienteNombre}</strong>,</p>
          
          <p>Es un auténtico placer saludarle de parte de todo el equipo de <strong>Prospera</strong>. Agradecemos sinceramente su interés en nuestras soluciones financieras y contables diseñadas para automatizar y optimizar la gestión de su negocio.</p>
          
          <p>Adjunto a este correo encontrará formalmente detallada la <strong>Proforma Comercial No. ${proformaNum}</strong> que cotizamos según lo conversado, con una validez vigente de <strong>${cliente.validezDias} días</strong>.</p>
          
          <p><strong>¿Cómo proceder con el pago y activación?</strong></p>
          <ul style="padding-left: 20px;">
            <li>Puede realizar su transferencia electrónica utilizando cualquiera de nuestras cuentas asociadas enlistadas en el documento PDF adjunto.</li>
            <li>Para reportar y registrar su comprobante de pago de forma inmediata, simplemente responda a este correo o escríbanos por WhatsApp al <strong>+593 98 831 3486</strong>.</li>
          </ul>
          
          <p>Quedamos plenamente a su disposición para aclarar cualquier duda o adaptar la propuesta a sus necesidades operativas.</p>
          
          <p style="margin-top: 30px;">Atentamente,<br /><strong>Departamento de Operaciones</strong><br />Prospera Ecuador S.A.S.</p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          
          <div style="text-align: center; font-size: 11px; color: #94a3b8;">
            <p>Este correo electrónico fue generado automáticamente por Prospera CRM.</p>
            <p>soporte@prosperapymes.com | +593 98 831 3486</p>
          </div>
        </div>
      `;

      const { error } = await supabase.functions.invoke('send-campaign', {
        body: {
          to: cliente.email,
          subject: `Proforma Comercial Prospera — ${clienteNombre}`,
          htmlContent: htmlContent,
          sender: {
            name: "Prospera Finanzas",
            email: "soporte@prosperafinanzas.com"
          },
          attachment: {
            base64: pdfBase64,
            name: fileName
          }
        }
      });

      if (error) throw error;
      
      alert(`¡Proforma ${proformaNum} enviada con éxito al correo ${cliente.email}!`);

      // Incrementar secuencia automáticamente
      const nextIndex = proformaIndex + 1;
      setProformaIndex(nextIndex);
      localStorage.setItem('prospera_proforma_index', String(nextIndex));
    } catch (err: any) {
      console.error("Error al enviar proforma:", err);
      alert(`Error al enviar la proforma: ${err.message || 'Error desconocido'}`);
    } finally {
      setSendingEmail(false);
    }
  };

  const glassStyle = {
    background: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: 24,
    border: `1px solid ${theme.border}`,
    padding: isMobile ? 20 : 30,
    marginBottom: 24,
    boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.2)' : '0 10px 30px rgba(0,0,0,0.03)'
  };

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      {/* EDITOR (COL 1) */}
      <div style={{ ...glassStyle, flex: 1.2, marginBottom: 0 }}>
        {/* Header del Editor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, borderBottom: `1px solid ${theme.border}`, paddingBottom: 16 }}>
          <div style={{ background: theme.primary + '15', padding: 8, borderRadius: 12, color: theme.primary }}>
            <FileText size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>Datos de Cotización</h3>
            <span style={{ fontSize: '0.8rem', color: theme.textSec, fontWeight: 600 }}>Cree una oferta comercial estructurada</span>
          </div>
        </div>

        {/* Datos del Cliente */}
        <ProformaFormFields
          cliente={cliente}
          setCliente={setCliente}
          proformaIndex={proformaIndex}
          setProformaIndex={setProformaIndex}
          theme={theme}
          isDark={isDark}
          isMobile={isMobile}
        />

        {/* Conceptos de Cobro */}
        <ProformaItemsTable
          items={items}
          agregarItem={agregarItem}
          eliminarItem={eliminarItem}
          handleItemChange={handleItemChange}
          theme={theme}
          isDark={isDark}
          isMobile={isMobile}
        />
      </div>

      {/* PREVISUALIZACIÓN (COL 2) */}
      <ProformaPreviewSheet
        cliente={cliente}
        items={items}
        descuento={descuento}
        setDescuento={setDescuento}
        ivaRate={ivaRate}
        setIvaRate={setIvaRate}
        proformaIndex={proformaIndex}
        subtotal={subtotal}
        descVal={descVal}
        ivaVal={ivaVal}
        totalNeto={totalNeto}
        enviarProformaEmail={enviarProformaEmail}
        exportarPDF={exportarPDF}
        sendingEmail={sendingEmail}
        theme={theme}
        isDark={isDark}
        isMobile={isMobile}
        glassStyle={glassStyle}
      />
    </div>
  );
}
