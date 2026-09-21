import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface TemplateStatusModalProps {
  theme: any;
  isDark: boolean;
  statusModal: { isOpen: boolean; type: 'success' | 'error'; message: string } | null;
  onClose: () => void;
}

export const TemplateStatusModal: React.FC<TemplateStatusModalProps> = ({
  theme,
  isDark,
  statusModal,
  onClose
}) => {
  if (!statusModal?.isOpen) return null;

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
      zIndex: 1100,
      animation: 'fadeIn 0.2s ease',
      padding: '16px'
    }}>
      <div style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: '24px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14 }}>
          {statusModal.type === 'success' ? (
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              color: theme.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={32} />
            </div>
          ) : (
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertCircle size={32} />
            </div>
          )}

          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: theme.text }}>
            {statusModal.type === 'success' ? '¡Operación Exitosa!' : 'Error de Guardado'}
          </h4>

          <p style={{ color: theme.textSec, fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
            {statusModal.message}
          </p>
        </div>

        <footer style={{
          padding: '14px 20px',
          borderTop: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'center',
          background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.005)'
        }}>
          <button
            onClick={onClose}
            style={{
              background: statusModal.type === 'success' ? theme.primary : 'transparent',
              border: statusModal.type === 'success' ? 'none' : `1px solid ${theme.border}`,
              color: statusModal.type === 'success' ? '#fff' : theme.text,
              padding: '10px 24px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 900,
              fontSize: '0.82rem',
              width: '100%',
              boxShadow: statusModal.type === 'success' ? `0 4px 12px ${theme.primary}25` : 'none'
            }}
          >
            Entendido
          </button>
        </footer>
      </div>
    </div>
  );
};
