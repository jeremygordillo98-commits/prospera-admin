import React from 'react';
import { X, Play, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface ServerActionsModalProps {
  theme: any;
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
  onInvokeFunction: (displayName: string) => void;
  executingName: string | null;
  executingResult: { status: 'success' | 'error'; msg: string } | null;
}

export const ServerActionsModal: React.FC<ServerActionsModalProps> = ({
  theme,
  isDark,
  isOpen,
  onClose,
  onInvokeFunction,
  executingName,
  executingResult
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease',
      padding: '16px'
    }}>
      <div style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: '24px',
        width: '100%',
        maxWidth: '560px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <header style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: theme.text }}>
            ⚡ Acciones Rápidas del Servidor
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.textSec,
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </header>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: theme.textSec, fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>
            Fuerza la ejecución manual de los reportes y envíos automáticos configurados en el servidor:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { id: 'sri-sync-alertas', label: 'Alertas de Vencimiento SRI', sched: 'Diario (7:00 AM)', emoji: '📅' },
              { id: 'send-weekly-report', label: 'Reporte Semanal Financiero', sched: 'Lunes (8:00 AM)', emoji: '📊' },
              { id: 'send-monthly-iva-report', label: 'Reporte Mensual de IVA', sched: 'Día 1 (8:00 AM)', emoji: '🧾' }
            ].map(fn => (
              <div key={fn.id} style={{
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                border: `1px solid ${theme.border}`,
                borderRadius: '16px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '1.1rem' }}>{fn.emoji}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: theme.text }}>{fn.label}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: theme.textSec, fontWeight: 700, textTransform: 'uppercase' }}>
                    Prog: {fn.sched}
                  </span>
                </div>

                <button
                  onClick={() => onInvokeFunction(fn.id)}
                  disabled={executingName !== null}
                  style={{
                    background: executingName === fn.id ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    color: theme.primary,
                    padding: '8px 16px',
                    borderRadius: '10px',
                    cursor: executingName !== null ? 'not-allowed' : 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    opacity: executingName !== null && executingName !== fn.id ? 0.5 : 1
                  }}
                >
                  {executingName === fn.id ? (
                    <>
                      <RefreshCw size={12} className="spin-icon" style={{ animation: 'spin-custom 1s linear infinite' }} />
                      Ejecutando...
                    </>
                  ) : (
                    <>
                      <Play size={12} />
                      Ejecutar
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          {executingResult && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              background: executingResult.status === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: executingResult.status === 'success' ? theme.primary : '#EF4444',
              border: `1px solid ${executingResult.status === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              animation: 'fadeIn 0.3s ease'
            }}>
              {executingResult.status === 'success' ? <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 1 }} /> : <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />}
              <span>{executingResult.msg}</span>
            </div>
          )}
        </div>

        <footer style={{
          padding: '16px 24px',
          borderTop: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'flex-end',
          background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.005)'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: `1px solid ${theme.border}`,
              color: theme.text,
              padding: '8px 18px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.8rem'
            }}
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
};
