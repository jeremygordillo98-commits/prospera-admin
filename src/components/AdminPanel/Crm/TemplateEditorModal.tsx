import React from 'react';

interface TemplateEditorModalProps {
  theme: any;
  isDark: boolean;
  isMobile: boolean;
  selectedTemplateId: 'sri-sync-alertas' | 'send-weekly-report' | 'send-monthly-iva-report';
  setSelectedTemplateId: (id: 'sri-sync-alertas' | 'send-weekly-report' | 'send-monthly-iva-report') => void;
  templateForm: { asunto: string; contenido: string };
  setTemplateForm: React.Dispatch<React.SetStateAction<{ asunto: string; contenido: string }>>;
  savingTemplate: boolean;
  onSaveTemplate: () => void;
  onClose: () => void;
  onOpenServerActions: () => void;
}

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  theme,
  isDark,
  isMobile,
  selectedTemplateId,
  setSelectedTemplateId,
  templateForm,
  setTemplateForm,
  savingTemplate,
  onSaveTemplate,
  onClose,
  onOpenServerActions
}) => {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      <div style={glassStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexDirection: isMobile ? 'column' : 'row', gap: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>Configuración de Mensajes Automáticos</h3>
            <span style={{ fontSize: '0.8rem', color: theme.textSec, fontWeight: 600 }}>Personaliza el asunto y texto de los correos que envían los reportes PDF automáticos</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onOpenServerActions}
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                color: theme.primary,
                border: '1px solid rgba(16, 185, 129, 0.2)',
                padding: '10px 20px',
                borderRadius: 12,
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              ⚡ Ejecutar Reportes
            </button>
            <button
              onClick={onClose}
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                color: theme.text,
                border: `1px solid ${theme.border}`,
                padding: '10px 20px',
                borderRadius: 12,
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Volver a Campañas
            </button>
          </div>
        </div>

        {/* Selector de reporte */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 6 }}>
          {[
            { id: 'sri-sync-alertas', label: '📅 Alerta SRI' },
            { id: 'send-weekly-report', label: '📊 Reporte Semanal' },
            { id: 'send-monthly-iva-report', label: '🧾 Reporte IVA Mensual' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplateId(t.id as any)}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: selectedTemplateId === t.id ? 'none' : `1px solid ${theme.border}`,
                background: selectedTemplateId === t.id ? theme.primary : 'transparent',
                color: selectedTemplateId === t.id ? '#fff' : theme.textSec,
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec, marginBottom: 6 }}>Asunto del Correo</label>
            <input
              type="text"
              value={templateForm.asunto}
              onChange={e => setTemplateForm(prev => ({ ...prev, asunto: e.target.value }))}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${theme.border}`,
                borderRadius: 12,
                padding: '12px 14px',
                color: theme.text,
                fontSize: '0.9rem',
                fontWeight: 600,
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec, marginBottom: 6 }}>Contenido del Correo (Cuerpo en Texto Plano)</label>
            <textarea
              rows={8}
              value={templateForm.contenido}
              onChange={e => setTemplateForm(prev => ({ ...prev, contenido: e.target.value }))}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${theme.border}`,
                borderRadius: 12,
                padding: '12px 14px',
                color: theme.text,
                fontSize: '0.9rem',
                fontWeight: 600,
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Ayuda de tags */}
          <div style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', border: `1px solid ${theme.border}`, borderRadius: 12, padding: 14 }}>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: theme.primary, marginBottom: 6 }}>Variables Dinámicas Disponibles:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: '0.75rem', fontWeight: 700, color: theme.textSec }}>
              <span><code>{"{{nombre_empresa}}"}</code></span>
              <span><code>{"{{ruc_empresa}}"}</code></span>
              {selectedTemplateId === 'sri-sync-alertas' && (
                <>
                  <span><code>{"{{fecha_vencimiento}}"}</code></span>
                  <span><code>{"{{dias_restantes}}"}</code></span>
                </>
              )}
              {selectedTemplateId === 'send-weekly-report' && (
                <>
                  <span><code>{"{{fecha_inicio}}"}</code></span>
                  <span><code>{"{{fecha_fin}}"}</code></span>
                  <span><code>{"{{ingresos}}"}</code></span>
                  <span><code>{"{{egresos}}"}</code></span>
                  <span><code>{"{{resultado_neto}}"}</code></span>
                  <span><code>{"{{saldo_tesoreria}}"}</code></span>
                </>
              )}
              {selectedTemplateId === 'send-monthly-iva-report' && (
                <>
                  <span><code>{"{{periodo}}"}</code></span>
                  <span><code>{"{{iva_ventas}}"}</code></span>
                  <span><code>{"{{iva_compras}}"}</code></span>
                  <span><code>{"{{iva_neto}}"}</code></span>
                  <span><code>{"{{estado_fiscal}}"}</code></span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onSaveTemplate}
            disabled={savingTemplate}
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, #00b37e)`,
              color: '#fff',
              border: 'none',
              padding: '14px 28px',
              borderRadius: 12,
              fontWeight: 900,
              cursor: savingTemplate ? 'not-allowed' : 'pointer',
              boxShadow: `0 6px 20px ${theme.primary}20`
            }}
          >
            {savingTemplate ? 'Guardando...' : 'Guardar Cambios de Plantilla'}
          </button>
        </div>
      </div>
    </div>
  );
};
