import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

interface ProformaItemsTableProps {
  items: Array<{ id: string; descripcion: string; cantidad: number; precioUnitario: number }>;
  agregarItem: () => void;
  eliminarItem: (id: string) => void;
  handleItemChange: (id: string, field: 'descripcion' | 'cantidad' | 'precioUnitario', value: any) => void;
  theme: any;
  isDark: boolean;
  isMobile: boolean;
}

export default function ProformaItemsTable({
  items,
  agregarItem,
  eliminarItem,
  handleItemChange,
  theme,
  isDark,
  isMobile
}: ProformaItemsTableProps) {
  return (
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
  );
}
