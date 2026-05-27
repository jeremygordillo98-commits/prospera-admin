import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { Trash2, Edit3, Plus, Clock } from 'lucide-react';
import CampaignRedactorModal from './CampaignRedactorModal';

interface CampaignsTabProps {
  theme: any;
  isDark: boolean;
  isMobile: boolean;
}

export default function CampaignsTab({ theme, isDark, isMobile }: CampaignsTabProps) {
  const [isRedactorOpen, setIsRedactorOpen] = useState(false);
  const [campaignToEdit, setCampaignToEdit] = useState<any>(null);

  // TanStack Query para obtener de forma reactiva las campañas del CRM
  const { data: campaigns = [], isLoading, refetch } = useQuery({
    queryKey: ['crm_campanas_admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_campanas')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error("Error fetching campaigns:", error);
        return [];
      }
      return data || [];
    }
  });

  const cancelarEnvioBrevo = async (campaignId: string): Promise<boolean> => {
    try {
      const { error: cancelErr } = await supabase.functions.invoke(`send-campaign?batchId=${campaignId}`, {
        method: 'DELETE'
      });
      if (cancelErr) throw cancelErr;
      return true;
    } catch (err) {
      console.error("Error al cancelar en Brevo:", err);
      return false;
    }
  };

  const cancelarEnvioProgramado = async (camp: any) => {
    if (!confirm("¿Deseas cancelar el envío programado de esta campaña? El correo se detendrá en Brevo y volverá a ser un Borrador.")) return;
    
    const ok = await cancelarEnvioBrevo(camp.id);
    if (ok) {
      const { error } = await supabase
        .from('crm_campanas')
        .update({
          estado: 'Borrador',
          scheduled_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', camp.id);
      
      if (error) {
        alert("Se canceló en Brevo pero falló al actualizar la base de datos: " + error.message);
      } else {
        alert("Envío programado cancelado correctamente. La campaña ahora es un Borrador.");
      }
      refetch();
    } else {
      alert("No se pudo cancelar el envío programado en Brevo. Por favor, intente de nuevo.");
    }
  };

  const editarCampanaProgramada = async (camp: any) => {
    if (!confirm("Para editar esta campaña programada, primero debemos cancelar el envío en Brevo. ¿Deseas continuar?")) return;
    
    const ok = await cancelarEnvioBrevo(camp.id);
    if (ok) {
      const { error } = await supabase
        .from('crm_campanas')
        .update({
          estado: 'Borrador',
          scheduled_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', camp.id);
      
      if (!error) {
        editBorrador({
          ...camp,
          estado: 'Borrador',
          scheduled_at: null
        });
      } else {
        alert("Se canceló en Brevo pero falló al actualizar la base de datos: " + error.message);
      }
      refetch();
    } else {
      alert("No se pudo cancelar el envío en Brevo. No se puede editar en este momento.");
    }
  };

  const eliminarCampana = async (camp: any) => {
    if (!confirm("¿Está seguro de que desea eliminar este registro de campaña?")) return;
    
    try {
      if (camp.estado === 'Programado') {
        const cancelOk = await cancelarEnvioBrevo(camp.id);
        if (!cancelOk) {
          if (!confirm("No se pudo cancelar la programación en Brevo. ¿Deseas eliminar el registro en la base de datos de todas formas?")) {
            return;
          }
        }
      }

      const { error } = await supabase
        .from('crm_campanas')
        .delete()
        .eq('id', camp.id);
      
      if (error) throw error;
      refetch();
      alert("Campaña eliminada exitosamente.");
    } catch (err: any) {
      console.error("Error al eliminar campaña:", err);
      alert(`Error al eliminar campaña: ${err.message || 'Error desconocido'}`);
    }
  };

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

  const openNewCampaign = () => {
    setCampaignToEdit(null);
    setIsRedactorOpen(true);
  };

  const editBorrador = (camp: any) => {
    setCampaignToEdit(camp);
    setIsRedactorOpen(true);
  };

  if (isLoading) {
    return (
      <div style={{ color: theme.textSec, textAlign: 'center', padding: 50, fontWeight: 700, letterSpacing: '1px' }}>
        CARGANDO CAMPAÑAS...
      </div>
    );
  }

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
          <button
            onClick={openNewCampaign}
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
                      {camp.titulo}
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
                            onClick={() => editBorrador(camp)}
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
                              onClick={() => editarCampanaProgramada(camp)}
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
                              onClick={() => cancelarEnvioProgramado(camp)}
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
                          onClick={() => eliminarCampana(camp)}
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

      {/* MODAL REDACTOR Y ENVIADOR HTML */}
      <CampaignRedactorModal
        isOpen={isRedactorOpen}
        onClose={() => setIsRedactorOpen(false)}
        campaignToEdit={campaignToEdit}
        onSuccess={refetch}
        theme={theme}
        isDark={isDark}
        isMobile={isMobile}
      />
    </div>
  );
}
