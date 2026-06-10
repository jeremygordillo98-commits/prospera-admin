import React from 'react';
import { Sparkles, Percent, Hash, Mail, Download } from 'lucide-react';

interface ProformaPreviewSheetProps {
  cliente: {
    nombre: string;
    ruc: string;
    email: string;
    celular: string;
    validezDias: number;
  };
  items: Array<{ id: string; descripcion: string; cantidad: number; precioUnitario: number }>;
  descuento: number;
  setDescuento: (desc: number) => void;
  ivaRate: number;
  setIvaRate: (rate: number) => void;
  proformaIndex: number;
  subtotal: number;
  descVal: number;
  ivaVal: number;
  totalNeto: number;
  enviarProformaEmail: () => void;
  exportarPDF: () => void;
  sendingEmail: boolean;
  theme: any;
  isDark: boolean;
  isMobile: boolean;
  glassStyle: any;
}

export default function ProformaPreviewSheet({
  cliente,
  items,
  descuento,
  setDescuento,
  ivaRate,
  setIvaRate,
  proformaIndex,
  subtotal,
  descVal,
  ivaVal,
  totalNeto,
  enviarProformaEmail,
  exportarPDF,
  sendingEmail,
  theme,
  isDark,
  isMobile,
  glassStyle
}: ProformaPreviewSheetProps) {
  return (
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

      {/* Descuentos e IVA sliders en la parte inferior de la maqueta */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14, padding: '16px 20px', border: `1px solid ${theme.border}`, borderRadius: 16, background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.005)' }}>
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec, marginBottom: 6 }}>
            <span>Descuento Aplicado</span>
            <span style={{ color: theme.primary }}>{descuento}%</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: theme.textSec, display: 'flex' }}><Percent size={14} /></span>
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
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec, marginBottom: 6 }}>
            <span>Tasa IVA (%)</span>
            <span style={{ color: theme.primary }}>{ivaRate}%</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: theme.textSec, display: 'flex' }}><Hash size={14} /></span>
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
                borderRadius: 10,
                padding: '6px 10px',
                color: theme.text,
                fontSize: '0.82rem',
                fontWeight: 700,
                outline: 'none'
              }}
            />
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
  );
}
