import React from 'react';
import { Loader2 } from 'lucide-react';

interface ImpersonateModalProps {
    isOpen: boolean;
    email: string;
    actionLink?: string;
    loading: boolean;
    error?: string;
    onClose: () => void;
    onGenerate: () => void;
    theme: any;
    isDark: boolean;
}

export const ImpersonateModal: React.FC<ImpersonateModalProps> = ({
    isOpen,
    email,
    actionLink,
    loading,
    error,
    onClose,
    onGenerate,
    theme,
    isDark
}) => {
    if (!isOpen) return null;

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
      }} onClick={() => !loading && onClose()}>
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
            background: error 
              ? 'rgba(239, 68, 68, 0.15)' 
              : (actionLink ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)'),
            color: error 
              ? 'rgb(239, 68, 68)' 
              : (actionLink ? 'rgb(16, 185, 129)' : 'rgb(139, 92, 246)'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '1.8rem',
            fontWeight: 'bold'
          }}>
            {error ? '✗' : (actionLink ? '✓' : '🎭')}
          </div>

          <h3 style={{ margin: '0 0 8px', fontSize: '1.3rem', fontWeight: 900 }}>
            {error 
              ? 'Error de Conexión' 
              : (actionLink ? 'Sesión Lista' : 'Impersonar Usuario')}
          </h3>

          <p style={{ margin: '0 0 24px', fontSize: '0.9rem', color: theme.textSec, lineHeight: 1.5 }}>
            {error ? (
              `Ocurrió un error al generar el enlace de acceso: ${error}`
            ) : actionLink ? (
              `El enlace de acceso para ${email} se generó con éxito. Haz clic abajo para ingresar.`
            ) : (
              `Estás a punto de generar un acceso de administrador temporal para la cuenta de ${email}. Cualquier cambio afectará la información real en producción.`
            )}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {error ? (
              <button
                onClick={onClose}
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
            ) : actionLink ? (
              <>
                <button
                  onClick={() => {
                    window.open(actionLink, '_blank');
                    onClose();
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
                  onClick={onClose}
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
                  onClick={onGenerate}
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: '#fff',
                    border: 'none',
                    width: '100%',
                    padding: '14px',
                    borderRadius: 14,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Generando enlace...
                    </>
                  ) : (
                    'Generar Acceso e Ingresar'
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={loading}
                  style={{
                    background: 'transparent',
                    color: theme.textSec,
                    border: `1px solid ${theme.border}`,
                    width: '100%',
                    padding: '12px',
                    borderRadius: 14,
                    cursor: loading ? 'not-allowed' : 'pointer',
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
