import React from 'react';
import { Trash2, Loader2 } from 'lucide-react';

interface DeleteUserModalProps {
  theme: any;
  isDark: boolean;
  deleteUserModal: any;
  setDeleteUserModal: (user: any) => void;
  deletingUser: boolean;
  confirmDeleteUser: () => void;
  deleteSuccessModal: string | null;
  setDeleteSuccessModal: (msg: string | null) => void;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  theme,
  isDark,
  deleteUserModal,
  setDeleteUserModal,
  deletingUser,
  confirmDeleteUser,
  deleteSuccessModal,
  setDeleteSuccessModal
}) => {
  return (
    <>
      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE USUARIO B2C */}
      {deleteUserModal && (
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
        }} onClick={() => !deletingUser && setDeleteUserModal(null)}>
          <div style={{
            background: isDark ? '#1e293b' : '#ffffff',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 24,
            width: '100%',
            maxWidth: 460,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            padding: '32px 24px',
            color: theme.text
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              width: 52, height: 52, borderRadius: '16px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Trash2 size={26} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 900, textAlign: 'center', color: '#ef4444' }}>
              ¿Eliminar Usuario Definitivamente?
            </h3>
            <p style={{ fontSize: '0.88rem', color: theme.textSec, lineHeight: 1.5, textAlign: 'center', margin: '0 0 20px' }}>
              Esta acción eliminará de forma irreversible al usuario <strong style={{ color: theme.text }}>"{deleteUserModal.nombre_completo || deleteUserModal.email}"</strong> y purgará en cascada todas sus cuentas, transacciones, presupuestos, recordatorios y tickets de soporte.
            </p>

            <div style={{
              background: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${theme.border}`,
              borderRadius: 14,
              padding: '14px 16px',
              marginBottom: 24,
              fontSize: '0.82rem',
              color: theme.textSec,
              lineHeight: 1.6
            }}>
              <div><strong>Email:</strong> {deleteUserModal.email}</div>
              {deleteUserModal.pais && <div><strong>País:</strong> {deleteUserModal.pais}</div>}
              {deleteUserModal.celular && <div><strong>Celular:</strong> {deleteUserModal.celular}</div>}
              <div><strong>Registrado:</strong> {deleteUserModal.creado_en ? new Date(deleteUserModal.creado_en).toLocaleDateString('es-EC') : '---'}</div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setDeleteUserModal(null)}
                disabled={deletingUser}
                style={{
                  background: 'transparent',
                  border: `1px solid ${theme.border}`,
                  color: theme.textSec,
                  flex: 1,
                  padding: '12px',
                  borderRadius: 14,
                  fontWeight: 700,
                  cursor: deletingUser ? 'not-allowed' : 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={deletingUser}
                style={{
                  background: '#ef4444',
                  border: 'none',
                  color: '#ffffff',
                  flex: 1.4,
                  padding: '12px',
                  borderRadius: 14,
                  fontWeight: 800,
                  cursor: deletingUser ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {deletingUser ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Eliminando...
                  </>
                ) : (
                  'Sí, Eliminar Todo'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ÉXITO DE ELIMINACIÓN */}
      {deleteSuccessModal && (
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
        }} onClick={() => setDeleteSuccessModal(null)}>
          <div style={{
            background: isDark ? '#1e293b' : '#ffffff',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 24,
            width: '100%',
            maxWidth: 420,
            padding: '30px 24px',
            textAlign: 'center',
            color: theme.text,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '1.6rem',
              fontWeight: 900
            }}>
              ✓
            </div>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.2rem', fontWeight: 900, color: '#10b981' }}>
              Usuario Eliminado
            </h3>
            <p style={{ fontSize: '0.88rem', color: theme.textSec, lineHeight: 1.5, margin: '0 0 24px' }}>
              {deleteSuccessModal}
            </p>
            <button
              onClick={() => setDeleteSuccessModal(null)}
              style={{
                background: theme.primary,
                border: 'none',
                color: isDark ? '#000' : '#fff',
                width: '100%',
                padding: '12px',
                borderRadius: 14,
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
