import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { supabaseContable } from '../../../services/supabaseContable';
import { Trash2, Edit3, Plus, Clock, Eye, X, Play, Send, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import CampaignRedactorModal from './CampaignRedactorModal';

interface CampaignsTabProps {
  theme: any;
  isDark: boolean;
  isMobile: boolean;
}

export default function CampaignsTab({ theme, isDark, isMobile }: CampaignsTabProps) {
  const [isRedactorOpen, setIsRedactorOpen] = useState(false);
  const [campaignToEdit, setCampaignToEdit] = useState<any>(null);
  const [selectedCampaignRecipients, setSelectedCampaignRecipients] = useState<any>(null);

  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<'sri-sync-alertas' | 'send-weekly-report' | 'send-monthly-iva-report'>('sri-sync-alertas');
  const [templateForm, setTemplateForm] = useState({ asunto: '', contenido: '' });
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Estados para el Modal de Acciones Rápidas del Servidor
  const [isServerActionsOpen, setIsServerActionsOpen] = useState(false);
  const [executingName, setExecutingName] = useState<string | null>(null);
  const [executingResult, setExecutingResult] = useState<{ status: 'success' | 'error'; msg: string } | null>(null);

  // Estado para el Modal de Alerta de Guardado de Plantillas
  const [templateStatusModal, setTemplateStatusModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string } | null>(null);

  const handleInvokeFunction = async (displayName: string) => {
    const functionMapping: Record<string, string> = {
      'sri-sync-alertas': 'send-sri-deadline-alert',
      'send-weekly-report': 'send-weekly-report',
      'send-monthly-iva-report': 'send-monthly-iva-report',
    };

    const actualName = functionMapping[displayName];
    if (!actualName) return;

    setExecutingName(displayName);
    setExecutingResult(null);
    try {
      const { error } = await supabaseContable.functions.invoke(actualName, {
        body: actualName === 'send-sri-deadline-alert' ? { test: true } : {}
      });

      if (error) throw error;
      setExecutingResult({
        status: 'success',
        msg: `El reporte "${displayName}" se ha ejecutado y enviado correctamente mediante el servidor.`
      });
    } catch (err: any) {
      console.error(err);
      setExecutingResult({
        status: 'error',
        msg: `Error al ejecutar la función del servidor: ${err.message || String(err)}`
      });
    } finally {
      setExecutingName(null);
    }
  };

  const cargarPlantilla = async (id: string) => {
    try {
      const { data, error } = await supabaseContable
        .from('plantillas_correo_reportes')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTemplateForm({ asunto: data.asunto, contenido: data.contenido });
      } else {
        if (id === 'sri-sync-alertas') {
          setTemplateForm({
            asunto: 'Recordatorio de Vencimiento SRI — {{nombre_empresa}}',
            contenido: 'Estimado/a representante de {{nombre_empresa}},\n\nTe recordamos que la fecha límite para cumplir con tu declaración de IVA mensual correspondiente ante el SRI vence el próximo {{fecha_vencimiento}}.\n\nActualmente cuentas con {{dias_restantes}} días para registrar tu declaración de manera oportuna, evitando multas o recargos.\n\nPor favor, revisa el reporte de vencimiento SRI adjunto en este correo para más detalles.'
          });
        } else if (id === 'send-weekly-report') {
          setTemplateForm({
            asunto: 'Reporte Semanal Financiero — {{nombre_empresa}}',
            contenido: 'Estimado/a representante de {{nombre_empresa}},\n\nTe presentamos el resumen ejecutivo de la actividad financiera y contable de tu negocio para el período comprendido del {{fecha_inicio}} al {{fecha_fin}}.\n\nEn el documento PDF adjunto encontrarás el desglose de ingresos, egresos, resultado neto y saldo final de tesorería.'
          });
        } else if (id === 'send-monthly-iva-report') {
          setTemplateForm({
            asunto: 'Reporte Mensual de IVA — {{nombre_empresa}}',
            contenido: 'Estimado/a representante de {{nombre_empresa}},\n\nTu reporte mensual estimado del Impuesto al Valor Agregado (IVA) correspondiente al período de {{periodo}} ha sido calculado y ya está disponible.\n\nEn el documento PDF adjunto se detalla el balance estimado de IVA generado en ventas, deducido en compras y el neto resultante.'
          });
        }
      }
    } catch (err) {
      console.error("Error loading template:", err);
    }
  };

  const guardarPlantilla = async () => {
    setSavingTemplate(true);
    try {
      const { error } = await supabaseContable
        .from('plantillas_correo_reportes')
        .upsert({
          id: selectedTemplateId,
          asunto: templateForm.asunto,
          contenido: templateForm.contenido,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setTemplateStatusModal({
        isOpen: true,
        type: 'success',
        message: "Plantilla guardada exitosamente."
      });
    } catch (err: any) {
      console.error("Error saving template:", err);
      setTemplateStatusModal({
        isOpen: true,
        type: 'error',
        message: `Error al guardar: ${err.message || 'Error desconocido'}`
      });
    } finally {
      setSavingTemplate(false);
    }
  };

  React.useEffect(() => {
    if (showTemplateEditor) {
      cargarPlantilla(selectedTemplateId);
    }
  }, [showTemplateEditor, selectedTemplateId]);

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
      
      const campaignsList = data || [];
      const now = new Date();
      
      // Sincronizar automáticamente en la base de datos las campañas programadas cuyo tiempo ya pasó
      const updatedCampaigns = await Promise.all(
        campaignsList.map(async (camp: any) => {
          if (camp.estado === 'Programado' && camp.scheduled_at && new Date(camp.scheduled_at) <= now) {
            const { error: updateError } = await supabase
              .from('crm_campanas')
              .update({
                estado: 'Enviado',
                sent_at: camp.scheduled_at,
                updated_at: now.toISOString()
              })
              .eq('id', camp.id);
            
            if (updateError) {
              console.error(`Error al actualizar campaña programada ${camp.id} a Enviado:`, updateError);
              return camp;
            }
            
            return {
              ...camp,
              estado: 'Enviado',
              sent_at: camp.scheduled_at
            };
          }
          return camp;
        })
      );
      
      return updatedCampaigns;
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

  if (showTemplateEditor) {
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
                onClick={() => setIsServerActionsOpen(true)}
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
                onClick={() => setShowTemplateEditor(false)}
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
                onChange={e => setTemplateForm({ ...templateForm, asunto: e.target.value })}
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
                onChange={e => setTemplateForm({ ...templateForm, contenido: e.target.value })}
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
              onClick={guardarPlantilla}
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
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setIsServerActionsOpen(true)}
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
              onClick={() => setShowTemplateEditor(true)}
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
                              onClick={() => setSelectedCampaignRecipients(camp)}
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
                          onClick={() => setSelectedCampaignRecipients(camp)}
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

      {/* MODAL VISOR DE DESTINATARIOS */}
      {/* MODAL DETALLES DE LA CAMPAÑA */}
      {selectedCampaignRecipients && (() => {
        const matchInfo = selectedCampaignRecipients.titulo.match(/(.*)📎\[(.*)\]$/);
        const cleanTitleInfo = matchInfo ? matchInfo[1] : selectedCampaignRecipients.titulo;
        const attachmentsInfo = matchInfo ? matchInfo[2].split(',').map((s: string) => s.trim()) : [];
        const senderName = selectedCampaignRecipients.sender_email === 'facturacion@prosperafinanzas.com' ? 'Prospera Facturación' :
          selectedCampaignRecipients.sender_email === 'ventas@prosperafinanzas.com' ? 'Prospera Comercial' :
          selectedCampaignRecipients.sender_email === 'comunicaciones@prosperafinanzas.com' ? 'Prospera Comunicaciones' :
          'Prospera Soporte';
        const emailsList = selectedCampaignRecipients.manual_emails
          ? selectedCampaignRecipients.manual_emails.split(/[\n,;]/).map((s: string) => s.trim()).filter(Boolean)
          : (selectedCampaignRecipients.destinatarios === 'prueba' ? ['admin@prospera.com'] : []);
          
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
                  onClick={() => setSelectedCampaignRecipients(null)}
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
                
                {selectedCampaignRecipients.estado === 'Programado' && (
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
                      background: selectedCampaignRecipients.estado === 'Enviado' ? 'rgba(34, 197, 94, 0.15)' : (selectedCampaignRecipients.estado === 'Programado' ? 'rgba(59, 130, 246, 0.15)' : (selectedCampaignRecipients.estado === 'Borrador' ? 'rgba(148, 163, 184, 0.15)' : 'rgba(239, 68, 68, 0.15)')),
                      color: selectedCampaignRecipients.estado === 'Enviado' ? 'rgb(34, 197, 94)' : (selectedCampaignRecipients.estado === 'Programado' ? 'rgb(59, 130, 246)' : (selectedCampaignRecipients.estado === 'Borrador' ? 'rgb(148, 163, 184)' : 'rgb(239, 68, 68)')),
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      {selectedCampaignRecipients.estado === 'Enviado' && '✓ Enviado'}
                      {selectedCampaignRecipients.estado === 'Programado' && '⏰ Programado'}
                      {selectedCampaignRecipients.estado === 'Borrador' && '✏ Borrador'}
                      {selectedCampaignRecipients.estado === 'Error' && '✗ Error'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: theme.textSec, display: 'block', marginBottom: 4 }}>
                      Fecha
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: theme.text }}>
                      {selectedCampaignRecipients.sent_at ? new Date(selectedCampaignRecipients.sent_at).toLocaleString('es-EC') : (selectedCampaignRecipients.scheduled_at ? `⏰ Prog: ${new Date(selectedCampaignRecipients.scheduled_at).toLocaleString('es-EC')}` : 'N/A')}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: theme.textSec, display: 'block', marginBottom: 4 }}>
                      Remitente
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: theme.text }}>
                      {senderName} <span style={{ fontWeight: 500, color: theme.textSec }}>&lt;{selectedCampaignRecipients.sender_email || 'soporte@prosperafinanzas.com'}&gt;</span>
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: theme.textSec, display: 'block', marginBottom: 4 }}>
                      Asunto Comercial
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: theme.text }}>
                      {selectedCampaignRecipients.asunto}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: theme.textSec, display: 'block', marginBottom: 4 }}>
                    Destinatarios ({selectedCampaignRecipients.destinatarios === 'todos_leads' ? 'Leads CRM' : selectedCampaignRecipients.destinatarios === 'todos_pymes' ? 'Usuarios App' : selectedCampaignRecipients.destinatarios === 'manual' ? 'Lista Manual' : 'Prueba'})
                  </span>
                  {selectedCampaignRecipients.destinatarios === 'manual' || selectedCampaignRecipients.destinatarios === 'prueba' ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 100, overflowY: 'auto', padding: 8, background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)', borderRadius: 10, border: `1px solid ${theme.border}` }}>
                      {emailsList.map((email: string, i: number) => (
                        <span key={i} style={{ fontSize: '0.78rem', fontWeight: 600, color: theme.text, padding: '4px 8px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderRadius: 6 }}>
                          {email}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: theme.text }}>
                      Se envió de forma masiva a todo el grupo de {selectedCampaignRecipients.destinatarios === 'todos_leads' ? 'Leads CRM' : 'Usuarios Registrados de la App'}.
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
                    {selectedCampaignRecipients.contenido}
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
                  {(selectedCampaignRecipients.estado === 'Programado' || selectedCampaignRecipients.estado === 'Borrador') && (
                    <button
                      onClick={() => {
                        const campCopy = { ...selectedCampaignRecipients };
                        setSelectedCampaignRecipients(null);
                        if (campCopy.estado === 'Programado') {
                          editarCampanaProgramada(campCopy);
                        } else {
                          editBorrador(campCopy);
                        }
                      }}
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
                  onClick={() => setSelectedCampaignRecipients(null)}
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
      })()}
      {/* MODAL: ACCIONES RÁPIDAS DEL SERVIDOR */}
      {isServerActionsOpen && (
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
                onClick={() => {
                  setIsServerActionsOpen(false);
                  setExecutingResult(null);
                }}
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
                      onClick={() => handleInvokeFunction(fn.id)}
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
                onClick={() => {
                  setIsServerActionsOpen(false);
                  setExecutingResult(null);
                }}
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
      )}

      {/* MODAL: ESTADO DE GUARDADO DE PLANTILLAS */}
      {templateStatusModal?.isOpen && (
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
              {templateStatusModal.type === 'success' ? (
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
                {templateStatusModal.type === 'success' ? '¡Operación Exitosa!' : 'Error de Guardado'}
              </h4>

              <p style={{ color: theme.textSec, fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                {templateStatusModal.message}
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
                onClick={() => setTemplateStatusModal(null)}
                style={{
                  background: templateStatusModal.type === 'success' ? theme.primary : 'transparent',
                  border: templateStatusModal.type === 'success' ? 'none' : `1px solid ${theme.border}`,
                  color: templateStatusModal.type === 'success' ? '#fff' : theme.text,
                  padding: '10px 24px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '0.82rem',
                  width: '100%',
                  boxShadow: templateStatusModal.type === 'success' ? `0 4px 12px ${theme.primary}25` : 'none'
                }}
              >
                Entendido
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
