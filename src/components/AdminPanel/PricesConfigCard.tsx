import React from 'react';
import { Settings, Check, Edit } from 'lucide-react';
import { PreciosConfig } from '../../context/DataContext';

interface PricesConfigCardProps {
    preciosEdit: PreciosConfig;
    isEditingPrecios: boolean;
    setIsEditingPrecios: (v: boolean) => void;
    handlePrecioChange: (key: keyof PreciosConfig, value: string) => void;
    handleSavePrecios: () => void;
    theme: any;
    cardStyle: any;
    isDark: boolean;
}

export const PricesConfigCard: React.FC<PricesConfigCardProps> = ({
    preciosEdit,
    isEditingPrecios,
    setIsEditingPrecios,
    handlePrecioChange,
    handleSavePrecios,
    theme,
    cardStyle,
    isDark
}) => {
    return (
        <div style={{ ...cardStyle, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Settings size={18} style={{ color: theme.primary }} /> Estructura de Precios (Tarifas Globales)
            </h3>
            <button 
              onClick={() => {
                if (isEditingPrecios) handleSavePrecios();
                else setIsEditingPrecios(true);
              }}
              style={{
                background: isEditingPrecios ? theme.primary : theme.bg,
                color: isEditingPrecios ? (isDark ? '#000' : '#fff') : theme.text,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                padding: '8px 16px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {isEditingPrecios ? <><Check size={14} /> GUARDAR</> : <><Edit size={14} /> AJUSTAR TARIFAS</>}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* GRUPO BÁSICO */}
            <div style={{ background: theme.bg, padding: '20px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
              <div style={{ width: '40px', height: '4px', background: '#3b82f6', borderRadius: '4px', marginBottom: '12px' }}></div>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '0.8rem', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fase Iniciación</h4>
              {[
                { label: 'Presupuestos', key: 'presupuestos' },
                { label: 'Recordatorios', key: 'recordatorios' }
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${theme.border}`, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.label}</span>
                  {isEditingPrecios ? (
                    <input 
                      type="number" 
                      step="0.01" 
                      value={preciosEdit[item.key as keyof PreciosConfig] || 0} 
                      onChange={(e) => handlePrecioChange(item.key as keyof PreciosConfig, e.target.value)} 
                      style={{
                        width: '70px',
                        background: theme.card,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '8px',
                        padding: '5px 8px',
                        fontSize: '0.85rem',
                        textAlign: 'right',
                        fontWeight: 800,
                        outline: 'none'
                      }}
                    />
                  ) : (
                    <b style={{ fontSize: '0.95rem', fontWeight: 800 }}>${preciosEdit[item.key as keyof PreciosConfig]?.toFixed(2)}</b>
                  )}
                </div>
              ))}
            </div>

            {/* GRUPO PRO */}
            <div style={{ background: theme.bg, padding: '20px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
              <div style={{ width: '40px', height: '4px', background: '#10b981', borderRadius: '4px', marginBottom: '12px' }}></div>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '0.8rem', fontWeight: 900, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fase Analítica</h4>
              {[
                { label: 'Conciliación', key: 'conciliacion' },
                { label: 'Subcategorías', key: 'subcategorias' },
                { label: 'Reportes Pro', key: 'reporte_patrimonio' }
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${theme.border}`, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.label}</span>
                  {isEditingPrecios ? (
                    <input 
                      type="number" 
                      step="0.01" 
                      value={preciosEdit[item.key as keyof PreciosConfig] || 0} 
                      onChange={(e) => handlePrecioChange(item.key as keyof PreciosConfig, e.target.value)} 
                      style={{
                        width: '70px',
                        background: theme.card,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '8px',
                        padding: '5px 8px',
                        fontSize: '0.85rem',
                        textAlign: 'right',
                        fontWeight: 800,
                        outline: 'none'
                      }}
                    />
                  ) : (
                    <b style={{ fontSize: '0.95rem', fontWeight: 800 }}>${preciosEdit[item.key as keyof PreciosConfig]?.toFixed(2)}</b>
                  )}
                </div>
              ))}
            </div>

            {/* GRUPO ULTRA */}
            <div style={{ background: theme.bg, padding: '20px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
              <div style={{ width: '40px', height: '4px', background: '#c084fc', borderRadius: '4px', marginBottom: '12px' }}></div>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '0.8rem', fontWeight: 900, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fase Avanzada</h4>
              {[
                { label: 'IA Integral', key: 'chat' },
                { label: 'Ingreso Mágico', key: 'magic' },
                { label: 'Insights IA', key: 'insights' }
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${theme.border}`, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.label}</span>
                  {isEditingPrecios ? (
                    <input 
                      type="number" 
                      step="0.01" 
                      value={preciosEdit[item.key as keyof PreciosConfig] || 0} 
                      onChange={(e) => handlePrecioChange(item.key as keyof PreciosConfig, e.target.value)} 
                      style={{
                        width: '70px',
                        background: theme.card,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '8px',
                        padding: '5px 8px',
                        fontSize: '0.85rem',
                        textAlign: 'right',
                        fontWeight: 800,
                        outline: 'none'
                      }}
                    />
                  ) : (
                    <b style={{ fontSize: '0.95rem', fontWeight: 800 }}>${preciosEdit[item.key as keyof PreciosConfig]?.toFixed(2)}</b>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
    );
};
