import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabase';
import { Send } from 'lucide-react';
import { EMAIL_TEMPLATES } from './templates';

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
  const [campanaForm, setCampanaForm] = useState({
    id: '',
    titulo: '',
    asunto: '',
    contenido: '',
    destinatarios: 'prueba' as 'prueba' | 'todos_leads' | 'todos_pymes' | 'manual',
    manualEmails: '',
    testEmail: ''
  });
  
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
        testEmail: ''
      });
    } else {
      setCampanaForm({
        id: '',
        titulo: '',
        asunto: '',
        contenido: '',
        destinatarios: 'prueba',
        manualEmails: '',
        testEmail: ''
      });
    }
  }, [campaignToEdit, isOpen]);

  if (!isOpen) return null;

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
        // Consultar leads desde Supabase
        const { data: leadsData, error: leadsErr } = await supabase
          .from('pymes_leads')
          .select('email, nombre');
        if (leadsErr) throw leadsErr;
        listadoDestinatarios = (leadsData || [])
          .filter(l => l.email)
          .map(l => ({ email: l.email, nombre: l.nombre || 'Cliente' }));
      } else if (campanaForm.destinatarios === 'todos_pymes') {
        // Consultar usuarios de Prospera App (B2C) desde perfiles
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
        destinatarios: campanaForm.destinatarios,
        estado: esBorrador ? 'Borrador' : 'Enviado',
        sent_at: esBorrador ? null : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let campaignId = campanaForm.id;

      if (campaignId) {
        // Actualizar borrador
        const { error: updErr } = await supabase
          .from('crm_campanas')
          .update(campaignData)
          .eq('id', campaignId);
        if (updErr) throw updErr;
      } else {
        // Crear nueva
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

        for (let i = 0; i < listadoDestinatarios.length; i++) {
          const dest = listadoDestinatarios[i];
          setCampaignProgress({ current: i + 1, total: listadoDestinatarios.length });

          // Reemplazar tokens dinámicos en el cuerpo html
          const finalHtml = campanaForm.contenido
            .replace(/\{\{nombre\}\}/g, dest.nombre)
            .replace(/\{\{email\}\}/g, dest.email);

          try {
            const { error: sendErr } = await supabase.functions.invoke('send-campaign', {
              body: {
                to: dest.email,
                subject: campanaForm.asunto.replace(/\{\{nombre\}\}/g, dest.nombre),
                htmlContent: finalHtml,
                sender: {
                  name: "Prospera Finanzas",
                  email: "soporte@prosperafinanzas.com"
                }
              }
            });

            if (sendErr) throw sendErr;
          } catch (err) {
            console.error(`Fallo al enviar correo a ${dest.email}:`, err);
            errorsCount++;
          }
        }

        if (errorsCount > 0) {
          // Si hubo errores parciales o totales, actualizar el estado
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

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: 20
    }}>
      <div style={{
        background: isDark ? '#1e293b' : '#ffffff',
        border: `1px solid ${theme.border}`,
        borderRadius: 24,
        width: '100%',
        maxWidth: 800,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
      }}>
        {/* Cabecera del Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', borderBottom: `1px solid ${theme.border}` }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>{campanaForm.id ? 'Editar Borrador de Campaña' : 'Redactar Nueva Campaña'}</h3>
            <span style={{ fontSize: '0.8rem', color: theme.textSec, fontWeight: 600 }}>Configure el contenido y despache sus correos</span>
          </div>
          <button
            onClick={onClose}
            disabled={sendingCampaign}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.textSec,
              fontSize: '1.5rem',
              cursor: sendingCampaign ? 'not-allowed' : 'pointer',
              fontWeight: 700
            }}
          >
            ×
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Progreso del envío */}
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
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec, marginBottom: 6 }}>Lista de Correos (Separados por coma o salto de línea)</label>
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

          {/* Cuerpo del correo con plantilla / Editor */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec }}>Cuerpo del Mensaje (Soporta HTML)</label>
              <span style={{ fontSize: '0.7rem', color: theme.primary, fontWeight: 800 }}>Etiquetas disponibles: {"{{nombre}}"} | {"{{email}}"}</span>
            </div>
            <textarea
              rows={8}
              placeholder="Escriba su mensaje aquí... <p>Hola {{nombre}},</p><p>...</p>"
              disabled={sendingCampaign}
              value={campanaForm.contenido}
              onChange={(e) => setCampanaForm({ ...campanaForm, contenido: e.target.value })}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${theme.border}`,
                borderRadius: 16,
                padding: 16,
                color: theme.text,
                fontSize: '0.9rem',
                fontWeight: 600,
                outline: 'none',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Biblioteca de Plantillas Premium */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textSec }}>
              Biblioteca de Plantillas Premium (Ventas & Boletines)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              {EMAIL_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  disabled={sendingCampaign}
                  onClick={() => {
                    setCampanaForm({
                      ...campanaForm,
                      contenido: tmpl.content,
                      asunto: tmpl.subject
                    });
                  }}
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                    border: `1px solid ${theme.border}`,
                    borderRadius: 14,
                    padding: 14,
                    textAlign: 'left',
                    cursor: sendingCampaign ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    boxShadow: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!sendingCampaign) {
                      e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
                      e.currentTarget.style.borderColor = theme.primary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!sendingCampaign) {
                      e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)';
                      e.currentTarget.style.borderColor = theme.border;
                    }
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: theme.text }}>
                    {tmpl.name}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: theme.textSec, fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    Asunto: {tmpl.subject}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pie del Modal */}
        <div style={{ padding: '24px 32px', borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', gap: 16, flexDirection: isMobile ? 'column' : 'row' }}>
          <button
            type="button"
            onClick={() => enviarCampana(true)}
            disabled={sendingCampaign}
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              color: theme.text,
              border: `1px solid ${theme.border}`,
              padding: '12px 24px',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: sendingCampaign ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              width: isMobile ? '100%' : 'auto'
            }}
          >
            ✏️ Guardar como Borrador
          </button>

          <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={sendingCampaign}
              style={{
                background: 'transparent',
                color: theme.textSec,
                border: 'none',
                padding: '12px 20px',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: sendingCampaign ? 'not-allowed' : 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => enviarCampana(false)}
              disabled={sendingCampaign}
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, #00b37e)`,
                color: '#fff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: 12,
                fontWeight: 900,
                fontSize: '0.85rem',
                cursor: sendingCampaign ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: `0 6px 20px ${theme.primary}20`
              }}
            >
              {sendingCampaign ? (
                <>
                  <svg className="animate-spin" style={{ width: 14, height: 14, color: '#fff' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Despachando...
                </>
              ) : (
                <>
                  <Send size={15} /> Enviar Campaña
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
