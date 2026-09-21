import React from 'react';
import { ShieldAlert, Loader2, Mail } from 'lucide-react';
import { ChurnAccount } from '../ChurnPreventionTab';

interface ChurnAccountsTableProps {
  theme: any;
  isDark: boolean;
  isLoading: boolean;
  filteredAccounts: ChurnAccount[];
  paginatedAccounts: ChurnAccount[];
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  onOpenIndividualModal: (account: ChurnAccount) => void;
}

export const ChurnAccountsTable: React.FC<ChurnAccountsTableProps> = ({
  theme,
  isDark,
  isLoading,
  filteredAccounts,
  paginatedAccounts,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalPages,
  onOpenIndividualModal
}) => {
  const cardStyle = {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: '20px',
    padding: '20px',
    boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.2)' : '0 10px 30px rgba(0,0,0,0.02)',
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: theme.textSec }}>
        <Loader2 className="animate-spin" size={32} style={{ color: theme.primary, marginBottom: '12px' }} />
        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Analizando patrones de actividad y churn...</div>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: theme.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} style={{ color: '#ef4444' }} /> Auditoría de Cuentas ({filteredAccounts.length})
        </h4>
        <span style={{ fontSize: '0.75rem', color: theme.textSec }}>
          Umbral de Churn: <strong>14 días</strong>
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: theme.textSec, fontWeight: 800 }}>USUARIO / ENTIDAD</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textSec, fontWeight: 800 }}>SEGMENTO</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textSec, fontWeight: 800 }}>ÚLTIMA ACTIVIDAD</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textSec, fontWeight: 800 }}>INACTIVIDAD</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textSec, fontWeight: 800 }}>ESTADO</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', borderBottom: `1px solid ${theme.border}`, color: theme.textSec, fontWeight: 800 }}>ACCIÓN RÁPIDA</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAccounts.map(account => {
              const isCritico = account.estado === 'critico';
              const isRiesgo = account.estado === 'riesgo';
              const statusBg = isCritico ? 'rgba(239, 68, 68, 0.15)' : isRiesgo ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)';
              const statusColor = isCritico ? '#ef4444' : isRiesgo ? '#f59e0b' : '#10b981';
              const statusLabel = isCritico ? '🔴 Crítico' : isRiesgo ? '🟡 En Riesgo' : '🟢 Activo';

              return (
                <tr key={account.id} style={{ borderBottom: `1px solid ${theme.border}20` }}>
                  <td style={{ padding: '12px', color: theme.text }}>
                    <div style={{ fontWeight: 800 }}>{account.nombre}</div>
                    <div style={{ fontSize: '0.75rem', color: theme.textSec }}>{account.email}</div>
                    {account.infoExtra && (
                      <div style={{ fontSize: '0.7rem', color: theme.textSec, marginTop: '2px', opacity: 0.8 }}>
                        {account.infoExtra}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      background: account.tipo === 'B2B' ? '#10b98120' : '#3b82f620',
                      color: account.tipo === 'B2B' ? '#10b981' : '#3b82f6'
                    }}>
                      {account.tipo === 'B2B' ? '🏢 Pymes' : '📱 App'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', color: theme.textSec, fontSize: '0.78rem' }}>
                    {new Date(account.ultimaActividad).toLocaleDateString('es-EC')}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 800, color: statusColor }}>
                    {account.diasInactivo} días
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      background: statusBg,
                      color: statusColor
                    }}>
                      {statusLabel}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={() => onOpenIndividualModal(account)}
                      style={{
                        background: isCritico ? '#ef4444' : isRiesgo ? '#f59e0b' : theme.primary,
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Mail size={13} />
                      Reactivar
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredAccounts.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '35px', textAlign: 'center', color: theme.textSec }}>
                  No se encontraron cuentas que coincidan con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CONTROLES DE PAGINACIÓN */}
      {filteredAccounts.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: `1px solid ${theme.border}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: theme.textSec }}>
            <span>
              Mostrando <strong>{(currentPage - 1) * pageSize + 1}</strong> a <strong>{Math.min(currentPage * pageSize, filteredAccounts.length)}</strong> de <strong>{filteredAccounts.length}</strong> cuentas
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Por pág:</span>
              <select
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                style={{
                  background: isDark ? '#0f172a' : '#f1f5f9',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  padding: '4px 8px',
                  color: theme.text,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: 'transparent',
                color: currentPage === 1 ? theme.textSec + '50' : theme.text,
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              &larr; Anterior
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  padding: '6px 10px',
                  minWidth: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  background: currentPage === pageNum ? theme.primary : 'transparent',
                  color: currentPage === pageNum ? '#ffffff' : theme.textSec,
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: 'transparent',
                color: currentPage === totalPages ? theme.textSec + '50' : theme.text,
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Siguiente &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
