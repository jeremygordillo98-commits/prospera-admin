import React from 'react';
import { Clock, Calendar, Paperclip, FileText, Trash2, AlertCircle } from 'lucide-react';
import { DEFAULT_PLAIN_TEXTS } from './campaignHelpers';

interface CampaignEditorFieldsProps {
  campanaForm: {
    id: string;
    titulo: string;
    asunto: string;
    contenido: string;
    destinatarios: 'prueba' | 'todos_leads' | 'todos_pymes' | 'manual';
    manualEmails: string;
    testEmail: string;
    programado: boolean;
    scheduledDate: string;
  };
  setCampanaForm: React.Dispatch<React.SetStateAction<{
    id: string;
    titulo: string;
    asunto: string;
    contenido: string;
    destinatarios: 'prueba' | 'todos_leads' | 'todos_pymes' | 'manual';
    manualEmails: string;
    testEmail: string;
    programado: boolean;
    scheduledDate: string;
  }>>;
  activeTemplate: string;
  setActiveTemplate: (template: string) => void;
  filesList: File[];
  totalAttachmentsSize: number;
  sizeLimitExceeded: boolean;
  sendingCampaign: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (idx: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  theme: any;
  isDark: boolean;
  isMobile: boolean;
  btnStyle: any;
}

export default function CampaignEditorFields({
  campanaForm,
  setCampanaForm,
  activeTemplate,
  setActiveTemplate,
  filesList,
  totalAttachmentsSize,
  sizeLimitExceeded,
  sendingCampaign,
  handleFileChange,
  removeFile,
  fileInputRef,
  theme,
  isDark,
  isMobile,
  btnStyle
}: CampaignEditorFieldsProps) {
  return (
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
            onChange={(e) => setCampanaForm(prev => ({ ...prev, titulo: e.target.value }))}
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
            onChange={(e) => setCampanaForm(prev => ({ ...prev, asunto: e.target.value }))}
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
            onChange={(e) => setCampanaForm(prev => ({ ...prev, destinatarios: e.target.value as any }))}
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
                onChange={(e) => setCampanaForm(prev => ({ ...prev, testEmail: e.target.value }))}
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
                onChange={(e) => setCampanaForm(prev => ({ ...prev, manualEmails: e.target.value }))}
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
          onChange={(e) => setCampanaForm(prev => ({ ...prev, contenido: e.target.value }))}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            flex: 1,
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
            onChange={e => setCampanaForm(prev => ({ ...prev, programado: e.target.checked }))}
            style={{ cursor: 'pointer', width: 18, height: 18 }}
          />
          <label htmlFor="progCheckAdmin" style={{ fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: theme.text }}>
            <Clock size={16} style={{ color: theme.primary }} /> Programar esta campaña para el futuro
          </label>
        </div>
        {campanaForm.programado && (
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <Calendar size={16} style={{ color: theme.textSec }} />
            <input
              type="datetime-local"
              disabled={sendingCampaign}
              value={campanaForm.scheduledDate}
              onChange={e => setCampanaForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
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
  );
}
