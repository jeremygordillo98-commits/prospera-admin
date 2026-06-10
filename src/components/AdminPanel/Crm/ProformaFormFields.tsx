import React from 'react';
import { User, Hash, Mail, Phone, Calendar } from 'lucide-react';

interface ProformaFormFieldsProps {
  cliente: {
    nombre: string;
    ruc: string;
    email: string;
    celular: string;
    validezDias: number;
  };
  setCliente: React.Dispatch<React.SetStateAction<any>>;
  proformaIndex: number;
  setProformaIndex: (index: number) => void;
  theme: any;
  isDark: boolean;
  isMobile: boolean;
}

export default function ProformaFormFields({
  cliente,
  setCliente,
  proformaIndex,
  setProformaIndex,
  theme,
  isDark,
  isMobile
}: ProformaFormFieldsProps) {
  return (
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
  );
}
