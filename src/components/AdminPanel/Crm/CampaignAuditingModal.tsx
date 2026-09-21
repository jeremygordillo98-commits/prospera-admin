import React from 'react';

interface CampaignAuditingModalProps {
  theme: any;
  isDark: boolean;
  isMobile: boolean;
  selectedCampaign: any;
  onClose: () => void;
  onEditCampaign: (camp: any) => void;
}

export const CampaignAuditingModal: React.FC<CampaignAuditingModalProps> = ({
  theme,
  isDark,
  isMobile,
  selectedCampaign,
  onClose,
  onEditCampaign
}) => {
  if (!selectedCampaign) return null;

  const matchInfo = selectedCampaign.titulo.match(/(.*)📎\[(.*)\]$/);
  const cleanTitleInfo = matchInfo ? matchInfo[1] : selectedCampaign.titulo;
  const attachmentsInfo = matchInfo ? matchInfo[2].split(',').map((s: string) => s.trim()) : [];
  const senderName = selectedCampaign.sender_email === 'facturacion@prosperafinanzas.com' ? 'Prospera Facturación' :
    selectedCampaign.sender_email === 'ventas@prosperafinanzas.com' ? 'Prospera Comercial' :
    selectedCampaign.sender_email === 'comunicaciones@prosperafinanzas.com' ? 'Prospera Comunicaciones' :
    'Prospera Soporte';
  const emailsList = selectedCampaign.manual_emails
    ? selectedCampaign.manual_emails.split(/[\n,;]/).map((s: string) => s.trim()).filter(Boolean)
    : (selectedCampaign.destinatarios === 'prueba' ? ['admin@prospera.com'] : []);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999999,
      padding: 16
    }}>
      <div style={{
        background: isDark ? '#1e293b' : '#ffffff',
        border: `1px solid ${theme.border}`,
        borderRadius: 20,
        width: '100%',
        maxWidth: 600,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh'
      }}>
        <header style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
          flexShrink: 0
        }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: theme.text }}>Detalles de la Campaña</h4>
            <span style={{ fontSize: '0.8rem', color: theme.textSec, fontWeight: 600 }}>{cleanTitleInfo}</span>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.textSec,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </header>

        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
          {selectedCampaign.estado === 'Programado' && (
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 12, padding: 12, fontSize: '0.82rem', color: theme.text, fontWeight: 600 }}>
              ⚠️ <strong>Nota:</strong> Esta campaña está programada para enviarse en el futuro. Si decides editarla, se cancelará su programación automática en Brevo y volverá a ser un Borrador para que la puedas ajustar y volver a programar.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: theme.textSec, display: 'block', marginBottom: 4 }}>
                Estado
              </span>
              <span style={{
                background: selectedCampaign.estado === 'Enviado' ? 'rgba(34, 197, 94, 0.15)' : (selectedCampaign.estado === 'Programado' ? 'rgba(59, 130, 246, 0.15)' : (selectedCampaign.estado === 'Borrador' ? 'rgba(148, 163, 184, 0.15)' : 'rgba(239, 68, 68, 0.15)')),
                color: selectedCampaign.estado === 'Enviado' ? 'rgb(34, 197, 94)' : (selectedCampaign.estado === 'Programado' ? 'rgb(59, 130, 246)' : (selectedCampaign.estado === 'Borrador' ? 'rgb(148, 163, 184)' : 'rgb(239, 68, 68)')),
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: '0.7rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}>
                {selectedCampaign.estado === 'Enviado' && '✓ Enviado'}
                {selectedCampaign.estado === 'Programado' && '⏰ Programado'}
                {selectedCampaign.estado === 'Borrador' && '✏ Borrador'}
                {selectedCampaign.estado === 'Error' && '✗ Error'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: theme.textSec, display: 'block', marginBottom: 4 }}>
                Fecha
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: theme.text }}>
                {selectedCampaign.sent_at ? new Date(selectedCampaign.sent_at).toLocaleString('es-EC') : (selectedCampaign.scheduled_at ? `⏰ Prog: ${new Date(selectedCampaign.scheduled_at).toLocaleString('es-EC')}` : 'N/A')}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: theme.textSec, display: 'block', marginBottom: 4 }}>
                Remitente
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: theme.text }}>
                {senderName} <span style={{ fontWeight: 500, color: theme.textSec }}>&lt;{selectedCampaign.sender_email || 'soporte@prosperafinanzas.com'}&gt;</span>
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: theme.textSec, display: 'block', marginBottom: 4 }}>
                Asunto Comercial
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: theme.text }}>
                {selectedCampaign.asunto}
              </span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: theme.textSec, display: 'block', marginBottom: 4 }}>
              Destinatarios ({selectedCampaign.destinatarios === 'todos_leads' ? 'Leads CRM' : selectedCampaign.destinatarios === 'todos_pymes' ? 'Usuarios App' : selectedCampaign.destinatarios === 'manual' ? 'Lista Manual' : 'Prueba'})
            </span>
            {selectedCampaign.destinatarios === 'manual' || selectedCampaign.destinatarios === 'prueba' ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 100, overflowY: 'auto', padding: 8, background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)', borderRadius: 10, border: `1px solid ${theme.border}` }}>
                {emailsList.map((email: string, i: number) => (
                  <span key={i} style={{ fontSize: '0.78rem', fontWeight: 600, color: theme.text, padding: '4px 8px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderRadius: 6 }}>
                    {email}
                  </span>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: theme.text }}>
                Se envió de forma masiva a todo el grupo de {selectedCampaign.destinatarios === 'todos_leads' ? 'Leads CRM' : 'Usuarios Registrados de la App'}.
              </span>
            )}
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: theme.textSec, display: 'block', marginBottom: 6 }}>
              Archivos Adjuntos
            </span>
            {attachmentsInfo.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {attachmentsInfo.map((name: string, i: number) => (
                  <span key={i} style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.primary, background: theme.primary + '10', border: `1px solid ${theme.primary}20`, padding: '6px 12px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    📎 {name}
                  </span>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: '0.85rem', color: theme.textSec, fontStyle: 'italic' }}>Ninguno</span>
            )}
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: theme.textSec, display: 'block', marginBottom: 6 }}>
              Mensaje Redactado
            </span>
            <div style={{
              maxHeight: 180,
              overflowY: 'auto',
              padding: 14,
              background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
              borderRadius: 12,
              border: `1px solid ${theme.border}`,
              fontSize: '0.85rem',
              whiteSpace: 'pre-wrap',
              color: theme.text,
              fontFamily: 'monospace',
              lineHeight: 1.5
            }}>
              {selectedCampaign.contenido}
            </div>
          </div>
        </div>

        <footer style={{
          padding: '16px 24px',
          borderTop: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
          flexShrink: 0
        }}>
          <div>
            {(selectedCampaign.estado === 'Programado' || selectedCampaign.estado === 'Borrador') && (
              <button
                onClick={() => onEditCampaign(selectedCampaign)}
                style={{
                  background: 'rgba(59, 130, 246, 0.12)',
                  color: 'rgb(59, 130, 246)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  padding: '10px 20px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s'
                }}
              >
                ✏️ Editar Campaña
              </button>
            )}
          </div>
          <button 
            onClick={onClose}
            style={{
              background: theme.primary,
              color: '#fff',
              border: 'none',
              padding: '10px 22px',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
};
