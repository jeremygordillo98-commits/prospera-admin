import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { supabaseContable } from '../../../services/supabaseContable';

import CampaignRedactorModal from './CampaignRedactorModal';
import { CampaignsList } from './CampaignsList';
import { CampaignAuditingModal } from './CampaignAuditingModal';
import { TemplateEditorModal } from './TemplateEditorModal';
import { ServerActionsModal } from './ServerActionsModal';
import { TemplateStatusModal } from './TemplateStatusModal';

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

  useEffect(() => {
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
      <>
        <TemplateEditorModal
          theme={theme}
          isDark={isDark}
          isMobile={isMobile}
          selectedTemplateId={selectedTemplateId}
          setSelectedTemplateId={setSelectedTemplateId}
          templateForm={templateForm}
          setTemplateForm={setTemplateForm}
          savingTemplate={savingTemplate}
          onSaveTemplate={guardarPlantilla}
          onClose={() => setShowTemplateEditor(false)}
          onOpenServerActions={() => setIsServerActionsOpen(true)}
        />

        <ServerActionsModal
          theme={theme}
          isDark={isDark}
          isOpen={isServerActionsOpen}
          onClose={() => {
            setIsServerActionsOpen(false);
            setExecutingResult(null);
          }}
          onInvokeFunction={handleInvokeFunction}
          executingName={executingName}
          executingResult={executingResult}
        />

        <TemplateStatusModal
          theme={theme}
          isDark={isDark}
          statusModal={templateStatusModal}
          onClose={() => setTemplateStatusModal(null)}
        />
      </>
    );
  }

  return (
    <>
      <CampaignsList
        theme={theme}
        isDark={isDark}
        isMobile={isMobile}
        campaigns={campaigns}
        onOpenNewCampaign={openNewCampaign}
        onOpenTemplateEditor={() => setShowTemplateEditor(true)}
        onOpenServerActions={() => setIsServerActionsOpen(true)}
        onEditDraft={editBorrador}
        onEditScheduled={editarCampanaProgramada}
        onCancelScheduled={cancelarEnvioProgramado}
        onViewCampaign={(camp) => setSelectedCampaignRecipients(camp)}
        onDeleteCampaign={eliminarCampana}
      />

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

      {/* MODAL AUDITORÍA/DETALLES DE LA CAMPAÑA */}
      <CampaignAuditingModal
        theme={theme}
        isDark={isDark}
        isMobile={isMobile}
        selectedCampaign={selectedCampaignRecipients}
        onClose={() => setSelectedCampaignRecipients(null)}
        onEditCampaign={(campCopy) => {
          setSelectedCampaignRecipients(null);
          if (campCopy.estado === 'Programado') {
            editarCampanaProgramada(campCopy);
          } else {
            editBorrador(campCopy);
          }
        }}
      />

      {/* MODAL: ACCIONES RÁPIDAS DEL SERVIDOR */}
      <ServerActionsModal
        theme={theme}
        isDark={isDark}
        isOpen={isServerActionsOpen}
        onClose={() => {
          setIsServerActionsOpen(false);
          setExecutingResult(null);
        }}
        onInvokeFunction={handleInvokeFunction}
        executingName={executingName}
        executingResult={executingResult}
      />

      {/* MODAL: ESTADO DE GUARDADO DE PLANTILLAS */}
      <TemplateStatusModal
        theme={theme}
        isDark={isDark}
        statusModal={templateStatusModal}
        onClose={() => setTemplateStatusModal(null)}
      />
    </>
  );
}
