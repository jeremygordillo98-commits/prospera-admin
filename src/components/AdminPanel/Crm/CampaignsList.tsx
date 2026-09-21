import React from 'react';
import { Plus, Edit3, Eye, Clock, Trash2 } from 'lucide-react';

interface CampaignsListProps {
  theme: any;
  isDark: boolean;
  isMobile: boolean;
  campaigns: any[];
  onOpenNewCampaign: () => void;
  onOpenTemplateEditor: () => void;
  onOpenServerActions: () => void;
  onEditDraft: (camp: any) => void;
  onEditScheduled: (camp: any) => void;
  onCancelScheduled: (camp: any) => void;
  onViewCampaign: (camp: any) => void;
  onDeleteCampaign: (camp: any) => void;
}

export const CampaignsList: React.FC<CampaignsListProps> = ({
  theme,
  isDark,
  isMobile,
  campaigns,
  onOpenNewCampaign,
  onOpenTemplateEditor,
  onOpenServerActions,
  onEditDraft,
  onEditScheduled,
  onCancelScheduled,
  onViewCampaign,
  onDeleteCampaign
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
      {/* Métricas KPI de Campañas */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 16 }}>
        <div style={{ ...glassStyle, padding: 20, marginBottom: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: theme.textSec }}>Total Campañas</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 900, color: theme.text }}>{campaigns.length}</span>
        </div>
        <div style={{ ...glassStyle, padding: 20, marginBottom: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: theme.textSec }}>Despachadas</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 900, color: theme.primary }}>{campaigns.filter((c: any) => c.estado === 'Enviado').length}</span>
        </div>
        <div style={{ ...glassStyle, padding: 20, marginBottom: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: theme.textSec }}>Borradores</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#64748b' }}>{campaigns.filter((c: any) => c.estado === 'Borrador').length}</span>
        </div>
      </div>

      {/* Historial y Acciones */}
      <div style={glassStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexDirection: isMobile ? 'column' : 'row', gap: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>Historial de Campañas de Correo</h3>
            <span style={{ fontSize: '0.8rem', color: theme.textSec, fontWeight: 600 }}>Auditoría y control de boletines informativos despachados</span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={onOpenServerActions}
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                color: theme.primary,
                border: '1px solid rgba(16, 185, 129, 0.2)',
                padding: '12px 24px',
                borderRadius: 14,
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.85rem'
              }}
            >
              ⚡ Ejecutar Reportes
            </button>
            <button
              onClick={onOpenTemplateEditor}
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                color: theme.text,
                border: `1px solid ${theme.border}`,
                padding: '12px 24px',
                borderRadius: 14,
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.85rem'
              }}
            >
              ⚙️ Plantillas Reportes
            </button>
            <button
              onClick={onOpenNewCampaign}
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, #00b37e)`,
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 14,
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: `0 8px 24px ${theme.primary}30`
              }}
            >
              <Plus size={16} /> Redactar Campaña
            </button>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: theme.textSec }}>
            No hay registros de campañas creadas. ¡Empiece redactando una!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: theme.text }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <th style={{ padding: '16px 12px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Creada el</th>
                  <th style={{ padding: '16px 12px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Título Interno</th>
                  <th style={{ padding: '16px 12px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Asunto Comercial</th>
                  <th style={{ padding: '16px 12px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Destinatarios</th>
                  <th style={{ padding: '16px 12px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Estado</th>
                  <th style={{ padding: '16px 12px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Despachado el</th>
                  <th style={{ padding: '16px 12px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((camp: any, idx: number) => (
                  <tr key={camp.id} style={{ borderBottom: idx === campaigns.length - 1 ? 'none' : `1px solid ${theme.border}`, transition: 'all 0.2s' }}>
                    <td style={{ padding: '16px 12px', fontSize: '0.85rem', fontWeight: 600 }}>
                      {new Date(camp.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 12px', fontWeight: 800, fontSize: '0.9rem' }}>
                      {camp.titulo.match(/(.*)📎\[(.*)\]$/)?.[1] || camp.titulo}
                    </td>
                    <td style={{ padding: '16px 12px', fontSize: '0.85rem', color: theme.textSec, fontWeight: 600 }}>
                      {camp.asunto}
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                        color: theme.text,
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontSize: '0.7rem',
                        fontWeight: 800
                      }}>
                        {camp.destinatarios === 'todos_leads' && '👤 Leads CRM'}
                        {camp.destinatarios === 'todos_pymes' && '📱 Usuarios App'}
                        {camp.destinatarios === 'manual' && '✏️ Manual'}
                        {camp.destinatarios === 'prueba' && '🧪 Prueba'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{
                        background: camp.estado === 'Enviado' ? 'rgba(34, 197, 94, 0.15)' : (camp.estado === 'Programado' ? 'rgba(59, 130, 246, 0.15)' : (camp.estado === 'Borrador' ? 'rgba(148, 163, 184, 0.15)' : 'rgba(239, 68, 68, 0.15)')),
                        color: camp.estado === 'Enviado' ? 'rgb(34, 197, 94)' : (camp.estado === 'Programado' ? 'rgb(59, 130, 246)' : (camp.estado === 'Borrador' ? 'rgb(148, 163, 184)' : 'rgb(239, 68, 68)')),
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        {camp.estado === 'Enviado' && '✓ Enviado'}
                        {camp.estado === 'Programado' && '⏰ Programado'}
                        {camp.estado === 'Borrador' && '✏ Borrador'}
                        {camp.estado === 'Error' && '✗ Error'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px', fontSize: '0.85rem', color: theme.textSec, fontWeight: 600 }}>
                      {camp.sent_at ? new Date(camp.sent_at).toLocaleString('es-EC') : (camp.scheduled_at ? `⏰ Prog: ${new Date(camp.scheduled_at).toLocaleString('es-EC')}` : 'N/A')}
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        {camp.estado === 'Borrador' && (
                          <button
                            onClick={() => onEditDraft(camp)}
                            title="Editar Borrador"
                            style={{
                              background: 'rgba(59, 130, 246, 0.1)',
                              color: 'rgb(59, 130, 246)',
                              border: 'none',
                              padding: '8px',
                              borderRadius: 8,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                        {camp.estado === 'Programado' && (
                          <>
                            <button
                              onClick={() => onViewCampaign(camp)}
                              title="Ver Destinatarios"
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: theme.text,
                                border: 'none',
                                padding: '8px',
                                borderRadius: 8,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                              }}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => onEditScheduled(camp)}
                              title="Editar Programación (se cancelará el envío actual)"
                              style={{
                                background: 'rgba(59, 130, 246, 0.1)',
                                color: 'rgb(59, 130, 246)',
                                border: 'none',
                                padding: '8px',
                                borderRadius: 8,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                              }}
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => onCancelScheduled(camp)}
                              title="Cancelar Envío Programado"
                              style={{
                                background: 'rgba(245, 158, 11, 0.1)',
                                color: 'rgb(245, 158, 11)',
                                border: 'none',
                                padding: '8px',
                                borderRadius: 8,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                              }}
                            >
                              <Clock size={14} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => onViewCampaign(camp)}
                          title="Ver Destinatarios"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: theme.text,
                            border: 'none',
                            padding: '8px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteCampaign(camp)}
                          title="Eliminar Campaña"
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: 'rgb(239, 68, 68)',
                            border: 'none',
                            padding: '8px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
