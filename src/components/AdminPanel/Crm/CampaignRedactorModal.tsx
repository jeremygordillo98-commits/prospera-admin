import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../services/supabase';
import { Send, Eye, Paperclip, Trash2, FileText, AlertCircle, Loader2, ArrowLeft, Clock, Calendar } from 'lucide-react';

interface CampaignRedactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignToEdit?: any; // Objeto de campaña para editar borrador
  onSuccess: () => void; // Callback para refrescar tabla histórica
  theme: any;
  isDark: boolean;
  isMobile: boolean;
}

const DEFAULT_PLAIN_TEXTS: Record<string, { name: string; subject: string; text: string }> = {
  ventas_pymes: {
    name: 'Ventas Pymes',
    subject: 'Optimiza la tesorería de tu negocio hoy con Prospera Pymes 🚀',
    text: `Estimado/a,\n\n¿Pasas demasiadas horas cuadrando cuentas y registrando movimientos contables de forma manual? Es momento de dar el siguiente paso en la gestión de tu negocio.\n\nCon Prospera Pymes, centralizas la facturación de tu empresa, automatizas las conciliaciones bancarias en segundos y obtienes reportes patrimoniales y gráficos de flujo en tiempo real.\n\nÚnete a los cientos de empresarios que ya han ahorrado más de 15 horas semanales en papeleo administrativo, ganando tiempo valioso para hacer crecer sus ventas.\n\nUn saludo cordial,\nÁrea de Relaciones y Clientes\nProspera Finanzas`
  },
  ventas_app: {
    name: 'Ventas App',
    subject: 'Toma el control absoluto de tus finanzas personales con Prospera APP 📱',
    text: `Estimado/a,\n\nLlegó el momento de despedirse de las hojas de cálculo complejas y los dolores de cabeza a fin de mes. Toma las riendas de tu dinero hoy mismo.\n\nProspera APP te ayuda a registrar tus gastos diarios en un clic, establecer presupuestos mensuales inteligentes con alertas automatizadas y alcanzar tus metas de ahorro de forma divertida y sin esfuerzo.\n\nDescubre lo fácil que es crear hábitos financieros saludables cuando tienes analíticas automatizadas y gráficos de calor en la palma de tu mano.\n\nUn saludo cordial,\nÁrea de Relaciones y Clientes\nProspera Finanzas`
  },
  boletin_pymes: {
    name: 'Boletín Pymes',
    subject: 'Actualización Importante de Servicios - Prospera Pymes 📢',
    text: `Estimado/a,\n\nQueremos informarte sobre las nuevas mejoras integradas en tu plataforma contable Prospera Pymes para optimizar la administración de tu negocio:\n\n• Conciliación Bancaria Veloz: Nuevo algoritmo de cruce automático que procesa extractos bancarios un 50% más rápido.\n• Soporte Contable Multitasa: Módulo de IVA reestructurado y completamente adaptable a regulaciones vigentes.\n• Seguridad Blindada: Sistema de encriptación mejorado para resguardar tus reportes financieros corporativos.\n\nNuestro equipo de desarrollo trabaja continuamente para ofrecerte una herramienta intuitiva que reduzca el trabajo contable de tu empresa, garantizando que dediques más tiempo al crecimiento estratégico de tu negocio.\n\nUn saludo cordial,\nÁrea de Relaciones y Clientes\nProspera Finanzas`
  },
  boletin_app: {
    name: 'Novedades App',
    subject: 'Tips de Ahorro y Novedades de Prospera APP 💡',
    text: `Estimado/a,\n\nEn Prospera APP nos apasiona acompañarte en tu camino hacia la libertad financiera. Hoy queremos compartirte 3 recomendaciones simples para aumentar tus ahorros este mes utilizando tu app:\n\n1. Define límites mensuales: Configura montos tope en tus categorías de gastos recurrentes (restaurantes, transporte, entretenimiento).\n2. Programa tus recordatorios: Evita pagar multas o recargos activando alertas de facturas en tu calendario integrado.\n3. Analiza tu flujo: Revisa el gráfico de calor de gastos semanales para detectar fugas de dinero innecesarias.\n\nRecuerda que cada pequeño ahorro acumulado hoy se convierte en la base sólida de tus metas patrimoniales del mañana. ¡Sigue adelante con tu registro diario!\n\nUn saludo cordial,\nÁrea de Relaciones y Clientes\nProspera Finanzas`
  }
};

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
    scheduledDate: ''
  });

  const [activeTemplate, setActiveTemplate] = useState('ventas_pymes');
  const [filesList, setFilesList] = useState<File[]>([]);
  const [filesBase64, setFilesBase64] = useState<Array<{ content: string; name: string }>>([]);
  const [previewHtml, setPreviewHtml] = useState('');
  
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [campaignProgress, setCampaignProgress] = useState<{ current: number; total: number } | null>(null);

  // Inicializar el formulario si se recibe una campaña para editar (borrador)
  useEffect(() => {
    if (campaignToEdit) {
      setCampanaForm({
        id: campaignToEdit.id || '',
        titulo: campaignToEdit.titulo || '',
        asunto: campaignToEdit.asunto || '',
        contenido: campaignToEdit.contenido || '',
        destinatarios: (campaignToEdit.destinatarios as any) || 'prueba',
        manualEmails: campaignToEdit.destinatarios === 'manual' ? (campaignToEdit.titulo.includes('(') ? '' : campaignToEdit.manualEmails || '') : '',
        testEmail: '',
        programado: !!campaignToEdit.scheduled_at,
        scheduledDate: campaignToEdit.scheduled_at ? new Date(campaignToEdit.scheduled_at).toISOString().slice(0, 16) : ''
      });
      if (campaignToEdit.plantilla_id) {
        setActiveTemplate(campaignToEdit.plantilla_id);
      }
    } else {
      setCampanaForm({
        id: '',
        titulo: '',
        asunto: '',
        contenido: '',
        destinatarios: 'prueba',
        manualEmails: '',
        testEmail: '',
        programado: false,
        scheduledDate: ''
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

  // HTML Email Layout Generator
  const generateCampaignHtml = (bodyText: string, templateId: string) => {
    const paragraphs = bodyText
      .split('\n')
      .map(p => p.trim() ? `<p style="margin-bottom: 16px; line-height: 1.6;">${p}</p>` : '')
      .join('');

    const isPymes = templateId.includes('pymes');
    const titleColor = isPymes ? '#00956A' : '#3b82f6';
    const headerTitle = isPymes ? 'PROSPERA PYMES' : 'PROSPERA APP';
    const subHeader = isPymes 
      ? 'Tesorería y Automatización Contable' 
      : 'Finanzas Personales Simples';
    
    // CTA Button
    let ctaSection = '';
    if (templateId === 'ventas_pymes') {
      ctaSection = `
        <div style="text-align: center; margin: 28px 0;">
          <a href="https://pymes.prosperafinanzas.com" style="background: linear-gradient(135deg, #00956A, #00b37e); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 800; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(0, 149, 106, 0.25); display: inline-block;">Registrar mi Empresa Gratis</a>
        </div>
      `;
    } else if (templateId === 'ventas_app') {
      ctaSection = `
        <div style="text-align: center; margin: 28px 0;">
          <a href="https://app.prosperafinanzas.com" style="background: linear-gradient(135deg, #3b82f6, #60a5fa); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 800; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25); display: inline-block;">Descargar App y Registrarme</a>
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" maxWidth="600px" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); max-width: 600px; border: 1px solid #e2e8f0;">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 32px; background-color: #ffffff; border-bottom: 1px solid #f1f5f9; text-align: center;">
                    <h2 style="color: ${titleColor}; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${headerTitle}</h2>
                    <span style="font-size: 11px; color: ${titleColor}; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">${subHeader}</span>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 32px; font-size: 1rem; color: #1e293b; line-height: 1.6;">
                    ${paragraphs}
                    ${ctaSection}
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8;">
                    <p style="margin: 0 0 6px;">Este correo electrónico fue generado de forma segura a través de Prospera CRM.</p>
                    <p style="margin: 0;">soporte@prosperafinanzas.com | +593 98 831 3486</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `.trim();
  };

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
      alert("Error al procesar los archivos adjuntos.");
    }
    e.target.value = '';
  };

  const removeFile = (idx: number) => {
    setFilesList(prev => prev.filter((_, i) => i !== idx));
    setFilesBase64(prev => prev.filter((_, i) => i !== idx));
  };

  const enviarCampana = async (esBorrador: boolean = false) => {
    if (!campanaForm.titulo || !campanaForm.asunto || !campanaForm.contenido) {
      alert("Por favor, rellene el título, asunto y contenido del correo.");
      return;
    }

    if (campanaForm.destinatarios === 'prueba' && !campanaForm.testEmail) {
      alert("Por favor, ingrese el correo electrónico de prueba.");
      return;
    }

    if (campanaForm.destinatarios === 'manual' && !campanaForm.manualEmails) {
      alert("Por favor, ingrese al menos un correo electrónico en el campo manual.");
      return;
    }

    if (sizeLimitExceeded) {
      alert("La suma de todos los archivos adjuntos no puede exceder el límite de 5MB.");
      return;
    }

    setSendingCampaign(true);
    setCampaignProgress(null);

    try {
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
      const campaignData = {
        titulo: campanaForm.titulo,
        asunto: campanaForm.asunto,
        contenido: campanaForm.contenido,
        plantilla_id: activeTemplate,
        destinatarios: campanaForm.destinatarios,
        estado: esBorrador ? 'Borrador' : (campanaForm.programado ? 'Programado' : 'Enviado'),
        scheduled_at: (campanaForm.programado && campanaForm.scheduledDate) ? new Date(campanaForm.scheduledDate).toISOString() : null,
        sent_at: (esBorrador || campanaForm.programado) ? null : new Date().toISOString(),
        updated_at: new Date().toISOString()
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
                  name: "Prospera Finanzas",
                  email: "soporte@prosperafinanzas.com"
                },
                attachment: filesBase64.length > 0 ? filesBase64 : undefined,
                scheduledAt: scheduledTime
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
          
          alert(`Campaña procesada. Se enviaron con éxito ${listadoDestinatarios.length - errorsCount} de ${listadoDestinatarios.length} correos.`);
        } else {
          alert(`¡Campaña masiva enviada con éxito total a los ${listadoDestinatarios.length} destinatarios!`);
        }
      } else {
        alert("Borrador de campaña guardado exitosamente.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error al procesar campaña:", err);
      alert(`Error al procesar la campaña: ${err.message || 'Error desconocido'}`);
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
        <div className="custom-scrollbar" style={{ 
          width: '60%', 
          padding: '32px', 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 20, 
          borderRight: `1px solid ${theme.border}`,
          boxSizing: 'border-box'
        }}>
          
          {/* Progress bar */}
          {sendingCampaign && campaignProgress && (
            <div style={{ background: theme.primary + '15', border: `1px solid ${theme.primary}30`, borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, color: theme.primary }}>
                <span>Procesando envíos de la campaña...</span>
                <span>{campaignProgress.current} de {campaignProgress.total} ({Math.round((campaignProgress.current / campaignProgress.total) * 100)}%)</span>
              </div>
              <div style={{ width: '100%', height: 6, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: theme.primary, width: `${(campaignProgress.current / campaignProgress.total) * 100}%`, transition: 'width 0.2s' }}></div>
              </div>
            </div>
          )}

          {/* Library Template Preset Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec, marginBottom: 8 }}>
              Elegir Plantilla Base (Precarga el Asunto y Mensaje)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              {Object.keys(DEFAULT_PLAIN_TEXTS).map((key) => {
                const isSelected = activeTemplate === key;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={sendingCampaign}
                    onClick={() => setActiveTemplate(key)}
                    style={{
                      ...btnStyle,
                      padding: 10,
                      fontSize: '0.78rem',
                      borderRadius: 10,
                      cursor: 'pointer',
                      borderColor: isSelected ? theme.primary : theme.border,
                      background: isSelected ? theme.primary + '15' : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'),
                      color: isSelected ? theme.primary : theme.text,
                      fontWeight: 700,
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    {key === 'ventas_pymes' && '🎯 Ventas Pymes'}
                    {key === 'ventas_app' && '📱 Ventas APP'}
                    {key === 'boletin_pymes' && '📢 Boletín Pymes'}
                    {key === 'boletin_app' && '💡 Novedades APP'}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
            {/* Título de control */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec, marginBottom: 6 }}>Título Administrativo (Control Interno)</label>
              <input
                type="text"
                placeholder="Ej. Campaña Reactivación de Leads Mayo"
                disabled={sendingCampaign}
                value={campanaForm.titulo}
                onChange={(e) => setCampanaForm({ ...campanaForm, titulo: e.target.value })}
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

            {/* Asunto comercial */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec, marginBottom: 6 }}>Asunto del Correo (Subject que recibe el cliente)</label>
              <input
                type="text"
                placeholder="Ej. ¡Llegó la herramienta para automatizar tu contabilidad! 🚀"
                disabled={sendingCampaign}
                value={campanaForm.asunto}
                onChange={(e) => setCampanaForm({ ...campanaForm, asunto: e.target.value })}
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
          </div>

          {/* Selector de Destinatarios */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec, marginBottom: 6 }}>Público Destinatario</label>
              <select
                value={campanaForm.destinatarios}
                disabled={sendingCampaign}
                onChange={(e) => setCampanaForm({ ...campanaForm, destinatarios: e.target.value as any })}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: isDark ? '#1e293b' : '#fff',
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                  padding: '12px 14px',
                  color: theme.text,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="prueba">🧪 Correo Único de Prueba</option>
                <option value="manual">✏️ Lista de Correos Personalizados</option>
                <option value="todos_leads">👤 Todos los Leads CRM (B2B)</option>
                <option value="todos_pymes">📱 Todos los Usuarios App (B2C)</option>
              </select>
            </div>

            {/* Sub-campos dinámicos según selección */}
            <div>
              {campanaForm.destinatarios === 'prueba' && (
                <>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec, marginBottom: 6 }}>Correo de Prueba</label>
                  <input
                    type="email"
                    placeholder="tu_correo@ejemplo.com"
                    disabled={sendingCampaign}
                    value={campanaForm.testEmail}
                    onChange={(e) => setCampanaForm({ ...campanaForm, testEmail: e.target.value })}
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
                </>
              )}

              {campanaForm.destinatarios === 'manual' && (
                <>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec, marginBottom: 6 }}>Lista de Correos (Separados por comas)</label>
                  <textarea
                    rows={1}
                    placeholder="mail1@empresa.com, mail2@empresa.com"
                    disabled={sendingCampaign}
                    value={campanaForm.manualEmails}
                    onChange={(e) => setCampanaForm({ ...campanaForm, manualEmails: e.target.value })}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      border: `1px solid ${theme.border}`,
                      borderRadius: 12,
                      padding: '10px 14px',
                      color: theme.text,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      outline: 'none',
                      resize: 'vertical',
                      height: 44
                    }}
                  />
                </>
              )}

              {campanaForm.destinatarios === 'todos_leads' && (
                <div style={{ background: theme.primary + '10', border: `1px solid ${theme.primary}20`, borderRadius: 12, padding: 12, fontSize: '0.8rem', color: theme.text, fontWeight: 700, display: 'flex', alignItems: 'center', height: '100%', boxSizing: 'border-box' }}>
                  📢 Se enviará a todos los Leads comerciales registrados (B2B).
                </div>
              )}

              {campanaForm.destinatarios === 'todos_pymes' && (
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 12, padding: 12, fontSize: '0.8rem', color: theme.text, fontWeight: 700, display: 'flex', alignItems: 'center', height: '100%', boxSizing: 'border-box' }}>
                  📢 Se enviará a todos los usuarios registrados en Prospera App (B2C).
                </div>
              )}
            </div>
          </div>

          {/* Cuerpo del correo / Editor de Texto Plano */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 250 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec }}>Mensaje (Escribe el contenido en texto plano limpio)</label>
              <span style={{ fontSize: '0.7rem', color: theme.primary, fontWeight: 800 }}>Etiquetas: {"{{nombre}}"} | {"{{email}}"}</span>
            </div>
            <textarea
              placeholder="Escriba su mensaje aquí en texto plano..."
              disabled={sendingCampaign}
              value={campanaForm.contenido}
              onChange={(e) => setCampanaForm({ ...campanaForm, contenido: e.target.value })}
              style={{
                width: '100%',
                flex: 1,
                boxSizing: 'border-box',
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${theme.border}`,
                borderRadius: 16,
                padding: 16,
                color: theme.text,
                fontSize: '0.95rem',
                fontWeight: 600,
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'none',
                minHeight: 200
              }}
            />
          </div>

          {/* Programador de Envío */}
          <div style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', border: `1px solid ${theme.border}`, padding: 16, borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                id="progCheckAdmin"
                checked={campanaForm.programado}
                disabled={sendingCampaign}
                onChange={e => setCampanaForm({ ...campanaForm, programado: e.target.checked })}
                style={{ cursor: 'pointer', width: 18, height: 18 }}
              />
              <label htmlFor="progCheckAdmin" style={{ fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: theme.text }}><Clock size={16} style={{ color: theme.primary }} /> Programar esta campaña para el futuro</label>
            </div>
            {campanaForm.programado && (
              <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                <Calendar size={16} style={{ color: theme.textSec }} />
                <input
                  type="datetime-local"
                  disabled={sendingCampaign}
                  value={campanaForm.scheduledDate}
                  onChange={e => setCampanaForm({ ...campanaForm, scheduledDate: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: 10, border: `1px solid ${theme.border}`, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', color: theme.text, outline: 'none', fontWeight: 600 }}
                />
              </div>
            )}
          </div>

          {/* Subir Adjuntos Masivos en Memoria (Zero-Storage) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: theme.textSec, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Paperclip size={14} /> Archivos Adjuntos (Catálogos, Presentaciones, PDF)
              </label>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: sizeLimitExceeded ? '#ef4444' : theme.textSec }}>
                Total: {(totalAttachmentsSize / (1024 * 1024)).toFixed(2)} MB / 5.00 MB
              </span>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <button
                type="button"
                disabled={sendingCampaign}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  ...btnStyle,
                  cursor: 'pointer',
                  borderRadius: 10,
                  padding: '8px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: theme.text
                }}
              >
                + Adjuntar Archivos
              </button>
              <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
            </div>

            {filesList.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filesList.map((file, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', border: `1px solid ${theme.border}`, padding: '10px 14px', borderRadius: 10, fontSize: '0.82rem' }}>
                    <FileText size={16} style={{ color: theme.textSec, marginRight: 10 }} />
                    <span style={{ flex: 1, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: theme.text }}>{file.name}</span>
                    <span style={{ color: theme.textSec, marginRight: 14 }}>{(file.size / 1024).toFixed(1)} KB</span>
                    <button
                      type="button"
                      disabled={sendingCampaign}
                      onClick={() => removeFile(i)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {sizeLimitExceeded && (
              <div style={{ display: 'flex', gap: 10, color: '#ef4444', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: 12, borderRadius: 12, fontSize: '0.8rem', marginTop: 10 }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <p style={{ margin: 0 }}><strong>Límite Excedido:</strong> El peso total de los archivos no debe superar los 5.00 MB.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Real-time Interactive Preview (40% width) */}
        <div style={{ 
          width: '40%', 
          background: isDark ? '#0f172a' : '#f1f5f9', 
          display: 'flex', 
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden',
          borderLeft: `1px solid ${theme.border}`
        }}>
          <div style={{ 
            padding: '12px 24px', 
            background: isDark ? '#1e293b' : '#ffffff', 
            borderBottom: `1px solid ${theme.border}`, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            flexShrink: 0
          }}>
            <Eye size={16} style={{ color: theme.primary }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.text }}>
              Previsualización en Tiempo Real
            </span>
          </div>
          
          <div style={{ flex: 1, padding: 16, overflow: 'hidden' }}>
            <iframe
              title="Live Mailer Preview"
              srcDoc={previewHtml}
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12, background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
