import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabase';
import { generarPDFDocument } from './proformaPdfGenerator';
import { 
  PlusCircle, Trash2, Mail, Download, Sparkles, FileText, 
  User, Hash, Percent, Phone, Calendar 
} from 'lucide-react';

interface ProformasTabProps {
  theme: any;
  isDark: boolean;
  isMobile: boolean;
}

export default function ProformasTab({ theme, isDark, isMobile }: ProformasTabProps) {
  // Creador de Proformas
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
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 28 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec, marginBottom: 6 }}>Cliente / Razón Social</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: theme.textSec, display: 'flex' }}><User size={16} /></span>
              <input
                type="text"
                placeholder="Ej. Juan Pérez / XYZ Corp"
                value={cliente.nombre}
                onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                  padding: '12px 12px 12px 40px',
                  color: theme.text,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec, marginBottom: 6 }}>RUC / Cédula</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: theme.textSec, display: 'flex' }}><Hash size={16} /></span>
              <input
                type="text"
                placeholder="Ej. 1793123456001"
                value={cliente.ruc}
                onChange={(e) => setCliente({ ...cliente, ruc: e.target.value })}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                  padding: '12px 12px 12px 40px',
                  color: theme.text,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec, marginBottom: 6 }}>Email del Cliente</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: theme.textSec, display: 'flex' }}><Mail size={16} /></span>
              <input
                type="email"
                placeholder="cliente@empresa.com"
                value={cliente.email}
                onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                  padding: '12px 12px 12px 40px',
                  color: theme.text,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec, marginBottom: 6 }}>Celular / WhatsApp</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: theme.textSec, display: 'flex' }}><Phone size={16} /></span>
              <input
                type="text"
                placeholder="Ej. +593 96 123 4567"
                value={cliente.celular}
                onChange={(e) => setCliente({ ...cliente, celular: e.target.value })}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                  padding: '12px 12px 12px 40px',
                  color: theme.text,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec, marginBottom: 6 }}>Validez de la Oferta (días)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: theme.textSec, display: 'flex' }}><Calendar size={16} /></span>
              <select
                value={cliente.validezDias}
                onChange={(e) => setCliente({ ...cliente, validezDias: Number(e.target.value) })}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: isDark ? '#1e293b' : '#fff',
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                  padding: '12px 12px 12px 40px',
                  color: theme.text,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value={7}>7 días</option>
                <option value={15}>15 días (Recomendado)</option>
                <option value={30}>30 días</option>
                <option value={60}>60 días</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec, marginBottom: 6 }}>Secuencia Proforma</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: theme.textSec, display: 'flex' }}><Hash size={16} /></span>
              <input
                type="number"
                min="1"
                placeholder="1"
                value={proformaIndex}
                onChange={(e) => {
                  const val = Math.max(1, Number(e.target.value));
                  setProformaIndex(val);
                  localStorage.setItem('prospera_proforma_index', String(val));
                }}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                  padding: '12px 12px 12px 40px',
                  color: theme.text,
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Conceptos de Cobro */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.text }}>Conceptos y Precios</h4>
            <button
              type="button"
              onClick={agregarItem}
              style={{
                background: theme.primary + '15',
                color: theme.primary,
                border: 'none',
                padding: '8px 16px',
                borderRadius: 10,
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s'
              }}
            >
              <PlusCircle size={15} /> Agregar Fila
            </button>
          </div>

          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', border: `1px dashed ${theme.border}`, borderRadius: 16, color: theme.textSec, fontSize: '0.85rem' }}>
              No ha agregado ningún concepto aún. Presione "Agregar Fila".
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: 10,
                    alignItems: isMobile ? 'stretch' : 'center',
                    background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                    border: `1px solid ${theme.border}`,
                    borderRadius: 14,
                    padding: 12
                  }}
                >
                  <div style={{ flex: 3 }}>
                    <input
                      type="text"
                      placeholder="Descripción del concepto/servicio..."
                      value={item.descripcion}
                      onChange={(e) => handleItemChange(item.id, 'descripcion', e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: `1px solid ${theme.border}`,
                        color: theme.text,
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        padding: '6px 0',
                        outline: 'none'
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: 10, flex: 2 }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.7rem', color: theme.textSec, fontWeight: 700, display: 'block', marginBottom: 2 }}>Cant.</span>
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => handleItemChange(item.id, 'cantidad', e.target.value)}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          background: isDark ? '#0f172a' : '#fff',
                          border: `1px solid ${theme.border}`,
                          borderRadius: 8,
                          color: theme.text,
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          padding: '6px 8px',
                          textAlign: 'center',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ flex: 1.5 }}>
                      <span style={{ fontSize: '0.7rem', color: theme.textSec, fontWeight: 700, display: 'block', marginBottom: 2 }}>P. Unit ($)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.precioUnitario}
                        onChange={(e) => handleItemChange(item.id, 'precioUnitario', e.target.value)}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          background: isDark ? '#0f172a' : '#fff',
                          border: `1px solid ${theme.border}`,
                          borderRadius: 8,
                          color: theme.text,
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          padding: '6px 8px',
                          textAlign: 'right',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => eliminarItem(item.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: 'rgb(239, 68, 68)',
                          border: 'none',
                          padding: '8px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          height: 34
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Descuentos e IVA */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, paddingTop: 16, borderTop: `1px solid ${theme.border}` }}>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec, marginBottom: 8 }}>
              <span>Descuento Comercial</span>
              <span style={{ color: theme.primary }}>{descuento}%</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: theme.textSec }}><Percent size={16} /></span>
              <input
                type="range"
                min="0"
                max="50"
                value={descuento}
                onChange={(e) => setDescuento(Number(e.target.value))}
                style={{ flex: 1, accentColor: theme.primary, cursor: 'pointer' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec, marginBottom: 8 }}>
              <span>IVA Regulable (Ecuador)</span>
              <span style={{ color: theme.primary }}>{ivaRate}%</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: theme.textSec }}><Hash size={16} /></span>
              <input
                type="number"
                min="0"
                max="30"
                value={ivaRate}
                onChange={(e) => setIvaRate(Math.max(0, Number(e.target.value)))}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                  padding: '8px 12px',
                  color: theme.text,
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* PREVISUALIZACIÓN (COL 2) */}
      <div style={{ ...glassStyle, flex: 0.8, background: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255,255,255,0.7)', border: `1px solid ${theme.primary}30`, display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 0 }}>
        {/* Header del Previsualizador */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.border}`, paddingBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={18} style={{ color: theme.primary }} /> Vista Previa
            </h3>
            <span style={{ fontSize: '0.75rem', color: theme.textSec, fontWeight: 600 }}>Maqueta interactiva del PDF</span>
          </div>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: theme.primary, background: theme.primary + '15', padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            OFICIAL
          </span>
        </div>

        {/* Hoja de Cotización Representativa */}
        <div style={{ background: isDark ? '#0f172a' : '#fff', border: `1px solid ${theme.border}`, borderRadius: 16, padding: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', flex: 1 }}>
          {/* Logo y Encabezado de la maqueta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src="/logo-horizontal.png" alt="Prospera Logo" style={{ height: 18, objectFit: 'contain' }} />
              </div>
              <span style={{ fontSize: '0.55rem', fontWeight: 800, color: theme.primary, display: 'block', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                PROFORMA No. PR-{String(proformaIndex).padStart(5, '0')}
              </span>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.6rem', color: theme.textSec, fontWeight: 600 }}>
              <div style={{ fontWeight: 800, color: isDark ? '#fff' : '#000' }}>PROSPERA ECUADOR S.A.S.</div>
              <div>RUC: 1793123456001</div>
            </div>
          </div>

          <div style={{ borderBottom: `1px solid ${theme.border}`, marginBottom: 12 }} />

          {/* Información del Cliente en la maqueta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 16, fontSize: '0.65rem' }}>
            <div>
              <div style={{ color: theme.textSec, fontWeight: 700, marginBottom: 2 }}>CLIENTE:</div>
              <div style={{ fontWeight: 800, color: isDark ? '#fff' : '#000' }}>{cliente.nombre || 'Consumidor Final'}</div>
              <div style={{ color: theme.textSec }}>RUC: {cliente.ruc || '9999999999999'}</div>
              <div style={{ color: theme.textSec }}>Email: {cliente.email || 'N/A'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: theme.textSec, fontWeight: 700, marginBottom: 2 }}>DETALLE:</div>
              <div style={{ fontWeight: 700 }}>Validez: <span style={{ color: theme.primary }}>{cliente.validezDias} días</span></div>
              <div style={{ color: theme.textSec }}>Emisión: {new Date().toLocaleDateString('es-EC')}</div>
            </div>
          </div>

          {/* Tabla representativa de conceptos */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', background: isDark ? '#1e293b' : '#f8fafc', padding: '6px 8px', borderRadius: 8, fontSize: '0.6rem', fontWeight: 800, color: theme.textSec, textTransform: 'uppercase', marginBottom: 4 }}>
              <span>Concepto</span>
              <span style={{ textAlign: 'center' }}>Cant.</span>
              <span style={{ textAlign: 'right' }}>Subtotal</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 120, overflowY: 'auto' }}>
              {items.map((item, idx) => (
                <div key={item.id || idx} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', padding: '6px 8px', borderBottom: idx === items.length - 1 ? 'none' : `1px solid ${theme.border}40`, fontSize: '0.65rem', fontWeight: 600 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.descripcion || 'Sin descripción'}</span>
                  <span style={{ textAlign: 'center' }}>{item.cantidad}</span>
                  <span style={{ textAlign: 'right', fontWeight: 700 }}>${(item.cantidad * item.precioUnitario).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bloque de Totales en la maqueta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderTop: `1px solid ${theme.border}`, paddingTop: 10, fontSize: '0.65rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.textSec }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 700 }}>${subtotal.toFixed(2)}</span>
            </div>
            {descuento > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgb(239, 68, 68)' }}>
                <span>Descuento ({descuento}%)</span>
                <span style={{ fontWeight: 700 }}>-${descVal.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.textSec }}>
              <span>IVA ({ivaRate}%)</span>
              <span style={{ fontWeight: 700 }}>${ivaVal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: theme.primary, background: theme.primary + '10', padding: '6px 8px', borderRadius: 6, fontSize: '0.75rem', marginTop: 4 }}>
              <span>Total Neto</span>
              <span>${totalNeto.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Acciones de Proforma */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            type="button"
            onClick={enviarProformaEmail}
            disabled={items.length === 0 || sendingEmail}
            style={{
              background: items.length === 0 ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${theme.primary}, #00b37e)`,
              color: items.length === 0 ? theme.textSec : '#fff',
              border: 'none',
              padding: '16px 20px',
              borderRadius: 14,
              fontWeight: 900,
              fontSize: '0.95rem',
              cursor: (items.length === 0 || sendingEmail) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: (items.length === 0 || sendingEmail) ? 'none' : `0 8px 24px ${theme.primary}30`,
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              opacity: sendingEmail ? 0.8 : 1
            }}
          >
            {sendingEmail ? (
              <>
                <svg className="animate-spin" style={{ width: 16, height: 16, color: '#fff', marginRight: 8 }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Enviando Correo...
              </>
            ) : (
              <>
                <Mail size={18} /> Enviar por Correo
              </>
            )}
          </button>

          <button
            type="button"
            onClick={exportarPDF}
            disabled={items.length === 0 || sendingEmail}
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              color: items.length === 0 ? theme.textSec : theme.text,
              border: `1px solid ${theme.border}`,
              padding: '14px 20px',
              borderRadius: 14,
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: (items.length === 0 || sendingEmail) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            <Download size={18} /> Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
