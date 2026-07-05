import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../services/supabase';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import { DEFAULT_PLAIN_TEXTS, generateCampaignHtml } from './campaignHelpers';
import CampaignEditorFields from './CampaignEditorFields';
import CampaignEmailPreview from './CampaignEmailPreview';

interface CampaignRedactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignToEdit?: any; // Objeto de campaña para editar borrador
  onSuccess: () => void; // Callback para refrescar tabla histórica
  theme: any;
  isDark: boolean;
  isMobile: boolean;
}

export default function CampaignRedactorModal({
  isOpen,
  onClose,
  campaignToEdit,
  onSuccess,
  theme,
  isDark,
  isMobile
}: CampaignRedactorModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [campanaForm, setCampanaForm] = useState({
    id: '',
    titulo: '',
    asunto: '',
    contenido: '',
    destinatarios: 'prueba' as 'prueba' | 'todos_leads' | 'todos_pymes' | 'manual',
    manualEmails: '',
    testEmail: '',
    programado: false,
    scheduledDate: '',
    senderEmail: 'soporte@prosperafinanzas.com',
    autoAttachReport: ''
  });

  const [activeTemplate, setActiveTemplate] = useState('ventas_pymes');
  const [previousAttachments, setPreviousAttachments] = useState<string[]>([]);
  const [filesList, setFilesList] = useState<File[]>([]);
  const [filesBase64, setFilesBase64] = useState<Array<{ content: string; name: string }>>([]);
  const [previewHtml, setPreviewHtml] = useState('');
  
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [campaignProgress, setCampaignProgress] = useState<{ current: number; total: number } | null>(null);
  const [customAlert, setCustomAlert] = useState<{ type: 'success' | 'error' | 'info'; title: string; message: string; onClose?: () => void } | null>(null);

  // Inicializar el formulario si se recibe una campaña para editar (borrador)
  useEffect(() => {
    if (campaignToEdit) {
      const match = campaignToEdit.titulo.match(/(.*)📎\[(.*)\]$/);
      const cleanTitle = match ? match[1] : campaignToEdit.titulo;
      const previousAtts = match ? match[2].split(',').map((s: any) => s.trim()) : [];
      setPreviousAttachments(previousAtts);

      setCampanaForm({
        id: campaignToEdit.id || '',
        titulo: cleanTitle || '',
        asunto: campaignToEdit.asunto || '',
        contenido: campaignToEdit.contenido || '',
        destinatarios: (campaignToEdit.destinatarios as any) || 'prueba',
        manualEmails: campaignToEdit.destinatarios === 'manual' ? (campaignToEdit.titulo.includes('(') ? '' : campaignToEdit.manual_emails || '') : '',
        testEmail: campaignToEdit.destinatarios === 'prueba' ? campaignToEdit.manual_emails || '' : '',
        programado: !!campaignToEdit.scheduled_at,
        scheduledDate: campaignToEdit.scheduled_at ? new Date(campaignToEdit.scheduled_at).toISOString().slice(0, 16) : '',
        senderEmail: campaignToEdit.sender_email || 'soporte@prosperafinanzas.com',
        autoAttachReport: campaignToEdit.auto_attach_report || ''
      });
      if (campaignToEdit.plantilla_id) {
        setActiveTemplate(campaignToEdit.plantilla_id);
      }
    } else {
      setPreviousAttachments([]);
      setCampanaForm({
        id: '',
        titulo: '',
        asunto: '',
        contenido: '',
        destinatarios: 'prueba',
        manualEmails: '',
        testEmail: '',
        programado: false,
        scheduledDate: '',
        senderEmail: 'soporte@prosperafinanzas.com',
        autoAttachReport: ''
      });
      setFilesList([]);
      setFilesBase64([]);
    }
  }, [campaignToEdit, isOpen]);

  // Load default template text
  useEffect(() => {
    if (isOpen && !campaignToEdit && !campanaForm.id) {
      const tmpl = DEFAULT_PLAIN_TEXTS[activeTemplate];
      if (tmpl) {
        setCampanaForm(prev => ({
          ...prev,
          contenido: tmpl.text,
          asunto: tmpl.subject,
          titulo: `Campaña - ${tmpl.name}`,
          programado: false,
          scheduledDate: ''
        }));
      }
    }
  }, [activeTemplate, isOpen]);

  // Real-time Preview Compilation
  useEffect(() => {
    if (isOpen) {
      setPreviewHtml(generateCampaignHtml(campanaForm.contenido, activeTemplate));
    }
  }, [campanaForm.contenido, activeTemplate, isOpen]);

  if (!isOpen) return null;

  // Validator for cumulative size (5MB limit)
  const totalAttachmentsSize = filesList.reduce((acc, f) => acc + f.size, 0);
  const sizeLimitExceeded = totalAttachmentsSize > 5 * 1024 * 1024; // 5MB

  // Base64 file uploader
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = [...filesList, ...files];
    setFilesList(newFiles);

    const encodedPromises = files.map(file => {
      return new Promise<{ content: string; name: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const rawBase64 = (reader.result as string).split(',')[1];
          resolve({ content: rawBase64, name: file.name });
        };
        reader.onerror = error => reject(error);
      });
    });

    try {
      const results = await Promise.all(encodedPromises);
      setFilesBase64(prev => [...prev, ...results]);
    } catch (err) {
      setCustomAlert({
        type: 'error',
        title: 'Error de Adjuntos',
        message: 'Error al procesar los archivos adjuntos.'
      });
    }
    e.target.value = '';
  };

  const removeFile = (idx: number) => {
    setFilesList(prev => prev.filter((_, i) => i !== idx));
    setFilesBase64(prev => prev.filter((_, i) => i !== idx));
  };

  const enviarCampana = async (esBorrador: boolean = false) => {
    if (!campanaForm.titulo || !campanaForm.asunto || !campanaForm.contenido) {
      setCustomAlert({
        type: 'error',
        title: 'Campos Incompletos',
        message: 'Por favor, rellene el título, asunto y contenido del correo.'
      });
      return;
    }

    if (campanaForm.destinatarios === 'prueba' && !campanaForm.testEmail) {
      setCustomAlert({
        type: 'error',
        title: 'Correo de Prueba Requerido',
        message: 'Por favor, ingrese el correo electrónico de prueba.'
      });
      return;
    }

    if (campanaForm.destinatarios === 'manual' && !campanaForm.manualEmails) {
      setCustomAlert({
        type: 'error',
        title: 'Correos Manuales Requeridos',
        message: 'Por favor, ingrese al menos un correo electrónico en el campo manual.'
      });
      return;
    }

    if (sizeLimitExceeded) {
      setCustomAlert({
        type: 'error',
        title: 'Límite de Peso Excedido',
        message: 'La suma de todos los archivos adjuntos no puede exceder el límite de 5MB.'
      });
      return;
    }

    setSendingCampaign(true);
    setCampaignProgress(null);

    try {
      // Obtener el usuario logueado para replyTo
      const { data: { user } } = await supabase.auth.getUser();
      const adminEmail = user?.email || 'soporte@prosperafinanzas.com';
      const adminName = user?.user_metadata?.nombre_completo || 'Administrador Prospera';

      // 1. Obtener lista de destinatarios (correo, nombre)
      let listadoDestinatarios: Array<{ email: string; nombre: string }> = [];

      if (campanaForm.destinatarios === 'prueba') {
        listadoDestinatarios = [{ email: campanaForm.testEmail, nombre: 'Administrador de Pruebas' }];
      } else if (campanaForm.destinatarios === 'manual') {
        const emailsRaw = campanaForm.manualEmails.split(/[\n,;]/);
        listadoDestinatarios = emailsRaw
          .map(e => e.trim())
          .filter(e => e && e.includes('@'))
          .map(e => ({ email: e, nombre: e.split('@')[0] }));
      } else if (campanaForm.destinatarios === 'todos_leads') {
        const { data: leadsData, error: leadsErr } = await supabase
          .from('pymes_leads')
          .select('email, nombre');
        if (leadsErr) throw leadsErr;
        listadoDestinatarios = (leadsData || [])
          .filter(l => l.email)
          .map(l => ({ email: l.email, nombre: l.nombre || 'Cliente' }));
      } else if (campanaForm.destinatarios === 'todos_pymes') {
        const { data: profilesData, error: profilesErr } = await supabase
          .from('perfiles')
          .select('email, nombre_completo');
        if (profilesErr) throw profilesErr;
        listadoDestinatarios = (profilesData || [])
          .filter(p => p.email)
          .map(p => ({ email: p.email, nombre: p.nombre_completo || 'Usuario Prospera' }));
      }

      if (!esBorrador && listadoDestinatarios.length === 0) {
        throw new Error("No se encontraron destinatarios válidos para el envío.");
      }

      // 2. Guardar o actualizar registro de la campaña en base de datos
      let attachmentNames = '';
      if (filesList.length > 0) {
        attachmentNames = filesList.map(f => f.name).join(', ');
      } else if (previousAttachments.length > 0) {
        attachmentNames = previousAttachments.join(', ');
      }
      const dbTitulo = attachmentNames ? `${campanaForm.titulo}📎[${attachmentNames}]` : campanaForm.titulo;

      const campaignData: any = {
        titulo: dbTitulo,
        asunto: campanaForm.asunto,
        contenido: campanaForm.contenido,
        plantilla_id: activeTemplate,
        destinatarios: campanaForm.destinatarios,
        manual_emails: campanaForm.destinatarios === 'manual' ? campanaForm.manualEmails : (campanaForm.destinatarios === 'prueba' ? campanaForm.testEmail : null),
        estado: esBorrador ? 'Borrador' : (campanaForm.programado ? 'Programado' : 'Enviado'),
        scheduled_at: (campanaForm.programado && campanaForm.scheduledDate) ? new Date(campanaForm.scheduledDate).toISOString() : null,
        sent_at: (esBorrador || campanaForm.programado) ? null : new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender_email: campanaForm.senderEmail,
        auto_attach_report: campanaForm.autoAttachReport || null
      };

      let campaignId = campanaForm.id;

      if (campaignId) {
        const { error: updErr } = await supabase
          .from('crm_campanas')
          .update(campaignData)
          .eq('id', campaignId);
        if (updErr) throw updErr;
      } else {
        const { data: insData, error: insErr } = await supabase
          .from('crm_campanas')
          .insert([campaignData])
          .select('id')
          .single();
        if (insErr) throw insErr;
        campaignId = insData.id;
      }

      // 3. Si no es borrador, despachar los correos
      if (!esBorrador) {
        setCampaignProgress({ current: 0, total: listadoDestinatarios.length });
        let errorsCount = 0;

        const scheduledTime = (campanaForm.programado && campanaForm.scheduledDate) 
          ? new Date(campanaForm.scheduledDate).toISOString() 
          : undefined;

        for (let i = 0; i < listadoDestinatarios.length; i++) {
          const dest = listadoDestinatarios[i];
          setCampaignProgress({ current: i + 1, total: listadoDestinatarios.length });

          const plainWithTokens = campanaForm.contenido
            .replace(/\{\{nombre\}\}/g, dest.nombre)
            .replace(/\{\{email\}\}/g, dest.email);

          const finalHtml = generateCampaignHtml(plainWithTokens, activeTemplate);

          try {
            const { error: sendErr } = await supabase.functions.invoke('send-campaign', {
              body: {
                to: dest.email,
                subject: campanaForm.asunto.replace(/\{\{nombre\}\}/g, dest.nombre),
                htmlContent: finalHtml,
                sender: {
                  name: campanaForm.senderEmail === 'facturacion@prosperafinanzas.com' ? 'Prospera Facturación' :
                        campanaForm.senderEmail === 'ventas@prosperafinanzas.com' ? 'Prospera Comercial' :
                        campanaForm.senderEmail === 'comunicaciones@prosperafinanzas.com' ? 'Prospera Comunicaciones' :
                        'Prospera Soporte',
                  email: campanaForm.senderEmail
                },
                replyTo: {
                  email: "prosperaapp.soporte@gmail.com",
                  name: adminName
                },
                attachment: filesBase64.length > 0 ? filesBase64 : undefined,
                scheduledAt: scheduledTime,
                batchId: campaignId,
                autoAttachReport: campanaForm.autoAttachReport || undefined
              }
            });

            if (sendErr) throw sendErr;
          } catch (err) {
            console.error(`Fallo al enviar correo a ${dest.email}:`, err);
            errorsCount++;
          }
        }

        if (errorsCount > 0) {
          const finalState = errorsCount === listadoDestinatarios.length ? 'Error' : 'Enviado';
          await supabase
            .from('crm_campanas')
            .update({ 
              estado: finalState,
              titulo: `${campanaForm.titulo} (${listadoDestinatarios.length - errorsCount}/${listadoDestinatarios.length} enviados)`
            })
            .eq('id', campaignId);
          
          setCustomAlert({
            type: 'success',
            title: 'Campaña Procesada',
            message: `Se enviaron con éxito ${listadoDestinatarios.length - errorsCount} de ${listadoDestinatarios.length} correos.`,
            onClose: () => {
              onSuccess();
              onClose();
            }
          });
        } else {
          setCustomAlert({
            type: 'success',
            title: '¡Envío Exitoso!',
            message: `¡Campaña masiva enviada con éxito total a los ${listadoDestinatarios.length} destinatarios!`,
            onClose: () => {
              onSuccess();
              onClose();
            }
          });
        }
      } else {
        setCustomAlert({
          type: 'success',
          title: 'Guardado',
          message: 'Borrador de campaña guardado exitosamente.',
          onClose: () => {
            onSuccess();
            onClose();
          }
        });
      }
    } catch (err: any) {
      console.error("Error al procesar campaña:", err);
      setCustomAlert({
        type: 'error',
        title: 'Error al Procesar',
        message: `Error al procesar la campaña: ${err.message || 'Error desconocido'}`
      });
    } finally {
      setSendingCampaign(false);
      setCampaignProgress(null);
    }
  };

  const btnStyle = { background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${theme.border}` };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: isDark ? '#0f172a' : '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 2147483647,
      overflow: 'hidden'
    }}>
      {/* Top Workspace Bar */}
      <header style={{ 
        padding: '16px 32px', 
        borderBottom: `1px solid ${theme.border}`, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        background: isDark ? '#1e293b' : '#ffffff',
        flexShrink: 0 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button 
            onClick={onClose} 
            disabled={sendingCampaign}
            style={{ 
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${theme.border}`,
              color: theme.text,
              padding: '8px 16px', 
              borderRadius: 10, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              fontWeight: 700,
              cursor: sendingCampaign ? 'not-allowed' : 'pointer'
            }}
          >
            <ArrowLeft size={16} /> Volver a Campañas
          </button>
          <div style={{ width: 1, height: 24, background: theme.border }}></div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: theme.text }}>
              {campanaForm.id ? 'Editar Borrador de Campaña' : 'Redactor de Campañas Masivas'}
            </h2>
            <p style={{ margin: 0, fontSize: '0.78rem', color: theme.textSec }}>Redacción en texto plano con previsualización premium interactiva en tiempo real</p>
          </div>
        </div>

        {/* Action buttons top right */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            type="button" 
            onClick={() => enviarCampana(true)} 
            disabled={sendingCampaign} 
            style={{ 
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: 12, 
              height: 40, 
              padding: '0 20px', 
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Guardar Borrador
          </button>
          
          <button 
            type="button" 
            onClick={() => enviarCampana(false)} 
            disabled={sendingCampaign || sizeLimitExceeded} 
            style={{ 
              background: `linear-gradient(135deg, ${theme.primary}, #00b37e)`,
              color: '#fff',
              border: 'none',
              borderRadius: 12, 
              height: 40, 
              padding: '0 24px', 
              fontWeight: 900, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              cursor: (sendingCampaign || sizeLimitExceeded) ? 'not-allowed' : 'pointer',
              boxShadow: `0 6px 20px ${theme.primary}20`
            }}
          >
            {sendingCampaign ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Despachando...
              </>
            ) : (
              <>
                <Send size={16} /> {campanaForm.programado ? 'Programar Envío' : 'Enviar Campaña'}
              </>
            )}
          </button>
        </div>
      </header>

      {/* Split Screen Workspace Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* LEFT COLUMN: Redactor Form (60% width) */}
        <div style={{ width: '60%', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* Progress bar */}
          {sendingCampaign && campaignProgress && (
            <div style={{ margin: '32px 32px 0 32px', background: theme.primary + '15', border: `1px solid ${theme.primary}30`, borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, color: theme.primary }}>
                <span>Procesando envíos de la campaña...</span>
                <span>{campaignProgress.current} de {campaignProgress.total} ({Math.round((campaignProgress.current / campaignProgress.total) * 100)}%)</span>
              </div>
              <div style={{ width: '100%', height: 6, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: theme.primary, width: `${(campaignProgress.current / campaignProgress.total) * 100}%`, transition: 'width 0.2s' }}></div>
              </div>
            </div>
          )}

          <CampaignEditorFields
            campanaForm={campanaForm}
            setCampanaForm={setCampanaForm}
            activeTemplate={activeTemplate}
            setActiveTemplate={setActiveTemplate}
            filesList={filesList}
            totalAttachmentsSize={totalAttachmentsSize}
            sizeLimitExceeded={sizeLimitExceeded}
            sendingCampaign={sendingCampaign}
            handleFileChange={handleFileChange}
            removeFile={removeFile}
            fileInputRef={fileInputRef}
            theme={theme}
            isDark={isDark}
            isMobile={isMobile}
            btnStyle={btnStyle}
            previousAttachments={previousAttachments}
            setPreviousAttachments={setPreviousAttachments}
          />
        </div>

        {/* RIGHT COLUMN: Live Real-time Interactive Preview (40% width) */}
        <CampaignEmailPreview
          previewHtml={previewHtml}
          isDark={isDark}
          theme={theme}
        />

      </div>

      {/* MODAL DE NOTIFICACIÓN PREMIUM */}
      {customAlert && (
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
        }}>
          <div style={{
            background: isDark ? '#1e293b' : '#ffffff',
            border: `1px solid ${theme.border}`,
            borderRadius: 20,
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden',
            textAlign: 'center',
            padding: '32px 24px'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: customAlert.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: customAlert.type === 'success' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '1.8rem',
              fontWeight: 'bold'
            }}>
              {customAlert.type === 'success' ? '✓' : '✗'}
            </div>
            
            <h4 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: 900, color: theme.text }}>
              {customAlert.title}
            </h4>
            
            <p style={{ margin: '0 0 24px', fontSize: '0.9rem', color: theme.textSec, lineHeight: 1.5 }}>
              {customAlert.message}
            </p>
            
            <button 
              onClick={() => {
                setCustomAlert(null);
                if (customAlert.onClose) customAlert.onClose();
              }}
              style={{
                background: customAlert.type === 'success' ? `linear-gradient(135deg, ${theme.primary}, #00b37e)` : 'rgb(239, 68, 68)',
                color: '#fff',
                border: 'none',
                width: '100%',
                padding: '12px',
                borderRadius: 12,
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.95rem',
                boxShadow: customAlert.type === 'success' ? `0 4px 15px ${theme.primary}25` : 'none'
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
