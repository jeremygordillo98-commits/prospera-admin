import React from 'react';
import { Mail, X, Edit3, Eye, Loader2, Send } from 'lucide-react';
import { ChurnAccount } from '../ChurnPreventionTab';
import { generateCampaignHtml } from '../Crm/campaignHelpers';

interface ReengagementModalProps {
  theme: any;
  isDark: boolean;
  selectedAccount: ChurnAccount | null;
  onClose: () => void;
  selectedSender: string;
  setSelectedSender: (sender: string) => void;
  selectedTemplate: string;
  onSelectTemplate: (templateKey: string) => void;
  emailSubject: string;
  setEmailSubject: (subject: string) => void;
  emailPlainText: string;
  setEmailPlainText: React.Dispatch<React.SetStateAction<string>>;
  previewMode: 'preview' | 'editor';
  setPreviewMode: (mode: 'preview' | 'editor') => void;
  isSending: boolean;
  actionFeedback: { type: 'success' | 'error'; message: string } | null;
  onSend: () => void;
}

export const ReengagementModal: React.FC<ReengagementModalProps> = ({
  theme,
  isDark,
  selectedAccount,
  onClose,
  selectedSender,
  setSelectedSender,
  selectedTemplate,
  onSelectTemplate,
  emailSubject,
  setEmailSubject,
  emailPlainText,
  setEmailPlainText,
  previewMode,
  setPreviewMode,
  isSending,
  actionFeedback,
  onSend
}) => {
  if (!selectedAccount) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: '24px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '26px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        animation: 'slideIn 0.25s ease'
      }}>
        {/* Header Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: theme.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={20} style={{ color: theme.primary }} /> Reactivación Individual
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: theme.textSec }}>
              Para: <strong>{selectedAccount.nombre}</strong> ({selectedAccount.email}) &bull; <span style={{ color: '#ef4444', fontWeight: 800 }}>{selectedAccount.diasInactivo} días inactivo</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: theme.textSec, cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Selector de Plantilla y Remitente */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, marginBottom: '6px' }}>
              PLANTILLA BASE
            </label>
            <select
              value={selectedTemplate}
              onChange={e => onSelectTemplate(e.target.value)}
              style={{
                width: '100%',
                background: isDark ? '#0f172a' : '#f8fafc',
                border: `1px solid ${theme.border}`,
                borderRadius: '10px',
                padding: '9px 12px',
                color: theme.text,
                fontSize: '0.82rem',
                fontWeight: 700,
                outline: 'none'
              }}
            >
              <option value="reengagement_app">📱 Reactivación App B2C</option>
              <option value="reengagement_pymes">🏢 Reactivación Pymes B2B</option>
              <option value="ventas_app">🎯 Ventas App B2C</option>
              <option value="ventas_pymes">🎯 Ventas Pymes B2B</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, marginBottom: '6px' }}>
              REMITENTE OFICIAL
            </label>
            <select
              value={selectedSender}
              onChange={e => setSelectedSender(e.target.value)}
              style={{
                width: '100%',
                background: isDark ? '#0f172a' : '#f8fafc',
                border: `1px solid ${theme.border}`,
                borderRadius: '10px',
                padding: '9px 12px',
                color: theme.text,
                fontSize: '0.82rem',
                fontWeight: 700,
                outline: 'none'
              }}
            >
              <option value="soporte@prosperafinanzas.com">soporte@prosperafinanzas.com (Soporte)</option>
              <option value="ventas@prosperafinanzas.com">ventas@prosperafinanzas.com (Comercial)</option>
              <option value="comunicaciones@prosperafinanzas.com">comunicaciones@prosperafinanzas.com (Comunicaciones)</option>
              <option value="facturacion@prosperafinanzas.com">facturacion@prosperafinanzas.com (Facturación)</option>
            </select>
          </div>
        </div>

        {/* Asunto */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, marginBottom: '6px' }}>
            ASUNTO DEL CORREO
          </label>
          <input
            type="text"
            value={emailSubject}
            onChange={e => setEmailSubject(e.target.value)}
            style={{
              width: '100%',
              background: isDark ? '#0f172a' : '#f8fafc',
              border: `1px solid ${theme.border}`,
              borderRadius: '10px',
              padding: '9px 12px',
              color: theme.text,
              fontSize: '0.85rem',
              fontWeight: 700,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Redactor Limpio / Vista Previa Toggle */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.textSec }}>
                {previewMode === 'editor' ? 'MENSAJE (TEXTO LIMPIO SIN CÓDIGO)' : 'VISTA PREVIA INSTITUCIONAL'}
              </label>
            </div>
            <div style={{ display: 'flex', background: isDark ? '#0f172a' : '#f1f5f9', padding: '3px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
              <button
                type="button"
                onClick={() => setPreviewMode('editor')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  border: 'none',
                  background: previewMode === 'editor' ? theme.primary : 'transparent',
                  color: previewMode === 'editor' ? '#fff' : theme.textSec,
                  cursor: 'pointer'
                }}
              >
                <Edit3 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Redactor
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('preview')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  border: 'none',
                  background: previewMode === 'preview' ? theme.primary : 'transparent',
                  color: previewMode === 'preview' ? '#fff' : theme.textSec,
                  cursor: 'pointer'
                }}
              >
                <Eye size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Vista Previa
              </button>
            </div>
          </div>

          {previewMode === 'editor' ? (
            <div>
              <textarea
                rows={7}
                value={emailPlainText}
                onChange={e => setEmailPlainText(e.target.value)}
                placeholder="Escribe el mensaje en párrafos limpios..."
                style={{
                  width: '100%',
                  background: isDark ? '#0f172a' : '#f8fafc',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: theme.text,
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: theme.textSec }}>Tags rápidos:</span>
                <button
                  type="button"
                  onClick={() => setEmailPlainText((prev: string) => prev + ' {{nombre}}')}
                  style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: '6px', padding: '2px 6px', fontSize: '0.7rem', color: theme.primary, cursor: 'pointer' }}
                >
                  + {"{{nombre}}"}
                </button>
                <button
                  type="button"
                  onClick={() => setEmailPlainText((prev: string) => prev + ' {{dias}}')}
                  style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: '6px', padding: '2px 6px', fontSize: '0.7rem', color: theme.primary, cursor: 'pointer' }}
                >
                  + {"{{dias}}"}
                </button>
              </div>
            </div>
          ) : (
            <div 
              style={{
                background: '#ffffff',
                color: '#1e293b',
                borderRadius: '12px',
                padding: '12px',
                border: `1px solid ${theme.border}`,
                maxHeight: '260px',
                overflowY: 'auto'
              }}
              dangerouslySetInnerHTML={{ __html: generateCampaignHtml(emailPlainText, selectedTemplate) }}
            />
          )}
        </div>

        {/* Feedback Alert */}
        {actionFeedback && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '18px',
            fontSize: '0.82rem',
            fontWeight: 700,
            background: actionFeedback.type === 'success' ? '#10b98120' : '#ef444420',
            color: actionFeedback.type === 'success' ? '#10b981' : '#ef4444',
            border: `1px solid ${actionFeedback.type === 'success' ? '#10b981' : '#ef4444'}40`
          }}>
            {actionFeedback.message}
          </div>
        )}

        {/* Botones de Acción */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            disabled={isSending}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: `1px solid ${theme.border}`,
              background: 'transparent',
              color: theme.textSec,
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>

          <button
            onClick={onSend}
            disabled={isSending}
            style={{
              padding: '10px 22px',
              borderRadius: '10px',
              border: 'none',
              background: theme.primary,
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: isSending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: `0 4px 15px ${theme.primary}40`,
              opacity: isSending ? 0.7 : 1
            }}
          >
            {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {isSending ? 'Despachando...' : 'Enviar Correo Ahora'}
          </button>
        </div>
      </div>
    </div>
  );
};
