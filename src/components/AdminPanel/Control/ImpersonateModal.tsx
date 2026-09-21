import React from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../../services/supabase';

interface ImpersonateModalProps {
  theme: any;
  isDark: boolean;
  impersonateModal: {
    isOpen: boolean;
    email: string;
    actionLink?: string;
    loading: boolean;
    error?: string;
  } | null;
  setImpersonateModal: React.Dispatch<React.SetStateAction<{
    isOpen: boolean;
    email: string;
    actionLink?: string;
    loading: boolean;
    error?: string;
  } | null>>;
}

export const ImpersonateModal: React.FC<ImpersonateModalProps> = ({
  theme,
  isDark,
  impersonateModal,
  setImpersonateModal
}) => {
  if (!impersonateModal || !impersonateModal.isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2147483647,
      padding: 16
    }} onClick={() => !impersonateModal.loading && setImpersonateModal(null)}>
      <div style={{
        background: isDark ? '#1e293b' : '#ffffff',
        border: `1px solid ${theme.border}`,
        borderRadius: 24,
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
        padding: '32px 24px',
        textAlign: 'center',
        color: theme.text
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header Icon */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: impersonateModal.error 
            ? 'rgba(239, 68, 68, 0.15)' 
            : (impersonateModal.actionLink ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)'),
          color: impersonateModal.error 
            ? 'rgb(239, 68, 68)' 
            : (impersonateModal.actionLink ? 'rgb(16, 185, 129)' : 'rgb(139, 92, 246)'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '1.8rem',
          fontWeight: 'bold'
        }}>
          {impersonateModal.error ? '✗' : (impersonateModal.actionLink ? '✓' : '🎭')}
        </div>

        <h3 style={{ margin: '0 0 8px', fontSize: '1.3rem', fontWeight: 900 }}>
          {impersonateModal.error 
            ? 'Error de Conexión' 
            : (impersonateModal.actionLink ? 'Sesión Lista' : 'Impersonar Usuario')}
        </h3>

        <p style={{ margin: '0 0 24px', fontSize: '0.9rem', color: theme.textSec, lineHeight: 1.5 }}>
          {impersonateModal.error ? (
            `Ocurrió un error al generar el enlace de acceso: ${impersonateModal.error}`
          ) : impersonateModal.actionLink ? (
            `El enlace de acceso para ${impersonateModal.email} se generó con éxito. Haz clic abajo para ingresar.`
          ) : (
            `Estás a punto de generar un acceso de administrador temporal para la cuenta de ${impersonateModal.email}. Cualquier cambio afectará la información real en producción.`
          )}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {impersonateModal.error ? (
            <button
              onClick={() => setImpersonateModal(null)}
              style={{
                background: 'rgb(239, 68, 68)',
                color: '#fff',
                border: 'none',
                width: '100%',
                padding: '14px',
                borderRadius: 14,
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.95rem'
              }}
            >
              Cerrar
            </button>
          ) : impersonateModal.actionLink ? (
            <>
              <button
                onClick={() => {
                  window.open(impersonateModal.actionLink, '_blank');
                  setImpersonateModal(null);
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  border: 'none',
                  width: '100%',
                  padding: '14px',
                  borderRadius: 14,
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)'
                }}
              >
                Ingresar a la Cuenta
              </button>
              <button
                onClick={() => setImpersonateModal(null)}
                style={{
                  background: 'transparent',
                  color: theme.textSec,
                  border: `1px solid ${theme.border}`,
                  width: '100%',
                  padding: '12px',
                  borderRadius: 14,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={async () => {
                  setImpersonateModal(prev => prev ? { ...prev, loading: true } : null);
                  try {
                    const { data, error } = await supabase.functions.invoke('impersonate-user', {
                      body: { email: impersonateModal.email }
                    });
                    if (error) throw error;
                    if (data?.action_link) {
                      setImpersonateModal(prev => prev ? { ...prev, loading: false, actionLink: data.action_link } : null);
                    } else {
                      throw new Error('No se recibió enlace de retorno.');
                    }
                  } catch (err: any) {
                    setImpersonateModal(prev => prev ? { ...prev, loading: false, error: err.message || 'Error en Edge Function' } : null);
                  }
                }}
                disabled={impersonateModal.loading}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: '#fff',
                  border: 'none',
                  width: '100%',
                  padding: '14px',
                  borderRadius: 14,
                  cursor: impersonateModal.loading ? 'not-allowed' : 'pointer',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {impersonateModal.loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Generando enlace...
                  </>
                ) : (
                  'Generar Acceso e Ingresar'
                )}
              </button>
              <button
                onClick={() => setImpersonateModal(null)}
                disabled={impersonateModal.loading}
                style={{
                  background: 'transparent',
                  color: theme.textSec,
                  border: `1px solid ${theme.border}`,
                  width: '100%',
                  padding: '12px',
                  borderRadius: 14,
                  cursor: impersonateModal.loading ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
