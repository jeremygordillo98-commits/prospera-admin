import React from 'react';
import { Rocket, X, Edit3, Eye, Loader2 } from 'lucide-react';
import { ChurnAccount } from '../ChurnPreventionTab';
import { generateCampaignHtml } from '../Crm/campaignHelpers';

interface MassReengagementModalProps {
  theme: any;
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
  massAudience: 'critico' | 'riesgo' | 'inactivos_todos' | 'b2b_inactivos' | 'b2c_inactivos';
  setMassAudience: (aud: 'critico' | 'riesgo' | 'inactivos_todos' | 'b2b_inactivos' | 'b2c_inactivos') => void;
  massTargetAccounts: ChurnAccount[];
  kpis: {
    criticos: number;
    enRiesgo: number;
  };
  massTemplate: string;
  onSelectMassTemplate: (templateKey: string) => void;
  massSender: string;
  setMassSender: (sender: string) => void;
  massSubject: string;
  setMassSubject: (subject: string) => void;
  massPlainText: string;
  setMassPlainText: React.Dispatch<React.SetStateAction<string>>;
  massPreviewMode: 'preview' | 'editor';
  setMassPreviewMode: (mode: 'preview' | 'editor') => void;
  isMassSending: boolean;
  massProgress: { current: number; total: number; success: number; failed: number } | null;
  massFeedback: { type: 'success' | 'error' | 'info'; message: string } | null;
  onSendMassBlast: () => void;
}

export const MassReengagementModal: React.FC<MassReengagementModalProps> = ({
  theme,
  isDark,
  isOpen,
  onClose,
  massAudience,
  setMassAudience,
  massTargetAccounts,
  kpis,
  massTemplate,
  onSelectMassTemplate,
  massSender,
  setMassSender,
  massSubject,
  setMassSubject,
  massPlainText,
  setMassPlainText,
  massPreviewMode,
  setMassPreviewMode,
  isMassSending,
  massProgress,
  massFeedback,
  onSendMassBlast
}) => {
  if (!isOpen) return null;

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
        maxWidth: '720px',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '28px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.45)',
        animation: 'slideIn 0.25s ease'
      }}>
        {/* Header Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: theme.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Rocket size={22} style={{ color: '#ef4444' }} /> Envío Masivo de Reactivación (Blast)
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: theme.textSec }}>
              Despacho simultáneo de correos a cuentas inactivas con personalización automática por usuario.
            </p>
          </div>
          <button 
            onClick={() => { if (!isMassSending) onClose(); }}
            style={{ background: 'none', border: 'none', color: theme.textSec, cursor: isMassSending ? 'not-allowed' : 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Selector de Segmento Destinatario */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, marginBottom: '6px' }}>
            AUDIENCIA OBJETIVO ({massTargetAccounts.length} CUENTAS IDENTIFICADAS)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setMassAudience('critico')}
              style={{
                padding: '8px 10px',
                borderRadius: '10px',
                border: `1px solid ${massAudience === 'critico' ? '#ef4444' : theme.border}`,
                background: massAudience === 'critico' ? '#ef444420' : 'transparent',
                color: massAudience === 'critico' ? '#ef4444' : theme.text,
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              🔴 Críticos &gt;14d ({kpis.criticos})
            </button>

            <button
              type="button"
              onClick={() => setMassAudience('riesgo')}
              style={{
                padding: '8px 10px',
                borderRadius: '10px',
                border: `1px solid ${massAudience === 'riesgo' ? '#f59e0b' : theme.border}`,
                background: massAudience === 'riesgo' ? '#f59e0b20' : 'transparent',
                color: massAudience === 'riesgo' ? '#f59e0b' : theme.text,
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              🟡 En Alerta 8-14d ({kpis.enRiesgo})
            </button>

            <button
              type="button"
              onClick={() => setMassAudience('inactivos_todos')}
              style={{
                padding: '8px 10px',
                borderRadius: '10px',
                border: `1px solid ${massAudience === 'inactivos_todos' ? theme.primary : theme.border}`,
                background: massAudience === 'inactivos_todos' ? `${theme.primary}20` : 'transparent',
                color: massAudience === 'inactivos_todos' ? theme.primary : theme.text,
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              ⚠️ Todos &gt;7d ({kpis.criticos + kpis.enRiesgo})
            </button>

            <button
              type="button"
              onClick={() => setMassAudience('b2b_inactivos')}
              style={{
                padding: '8px 10px',
                borderRadius: '10px',
                border: `1px solid ${massAudience === 'b2b_inactivos' ? '#10b981' : theme.border}`,
                background: massAudience === 'b2b_inactivos' ? '#10b98120' : 'transparent',
                color: massAudience === 'b2b_inactivos' ? '#10b981' : theme.text,
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              🏢 Solo Pymes B2B
            </button>

            <button
              type="button"
              onClick={() => setMassAudience('b2c_inactivos')}
              style={{
                padding: '8px 10px',
                borderRadius: '10px',
                border: `1px solid ${massAudience === 'b2c_inactivos' ? '#3b82f6' : theme.border}`,
                background: massAudience === 'b2c_inactivos' ? '#3b82f620' : 'transparent',
                color: massAudience === 'b2c_inactivos' ? '#3b82f6' : theme.text,
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              📱 Solo App B2C
            </button>
          </div>
        </div>

        {/* Selector de Plantilla y Remitente */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, marginBottom: '6px' }}>
              ADAPTACIÓN DE PLANTILLA
            </label>
            <select
              value={massTemplate}
              onChange={e => onSelectMassTemplate(e.target.value)}
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
              <option value="auto">✨ Automática según Segmento (App o Pymes)</option>
              <option value="reengagement_app">📱 Reactivación App B2C</option>
              <option value="reengagement_pymes">🏢 Reactivación Pymes B2B</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, marginBottom: '6px' }}>
              CASILLA OFICIAL DE REMITENTE
            </label>
            <select
              value={massSender}
              onChange={e => setMassSender(e.target.value)}
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

        {/* Asunto Masivo */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, marginBottom: '6px' }}>
            ASUNTO DEL CORREO
          </label>
          <input
            type="text"
            value={massSubject}
            onChange={e => setMassSubject(e.target.value)}
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
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.textSec }}>
              {massPreviewMode === 'editor' ? 'MENSAJE LIMPIO (SIN HTML)' : 'VISTA PREVIA DE EJEMPLO'}
            </label>
            <div style={{ display: 'flex', background: isDark ? '#0f172a' : '#f1f5f9', padding: '3px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
              <button
                type="button"
                onClick={() => setMassPreviewMode('editor')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  border: 'none',
                  background: massPreviewMode === 'editor' ? theme.primary : 'transparent',
                  color: massPreviewMode === 'editor' ? '#fff' : theme.textSec,
                  cursor: 'pointer'
                }}
              >
                <Edit3 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Redactor
              </button>
              <button
                type="button"
                onClick={() => setMassPreviewMode('preview')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  border: 'none',
                  background: massPreviewMode === 'preview' ? theme.primary : 'transparent',
                  color: massPreviewMode === 'preview' ? '#fff' : theme.textSec,
                  cursor: 'pointer'
                }}
              >
                <Eye size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Vista Previa
              </button>
            </div>
          </div>

          {massPreviewMode === 'editor' ? (
            <div>
              <textarea
                rows={7}
                value={massPlainText}
                onChange={e => setMassPlainText(e.target.value)}
                placeholder="Escribe el mensaje de reactivación..."
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
                <span style={{ fontSize: '0.72rem', color: theme.textSec }}>Insertar variables:</span>
                <button
                  type="button"
                  onClick={() => setMassPlainText((prev: string) => prev + ' {{nombre}}')}
                  style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: '6px', padding: '2px 6px', fontSize: '0.7rem', color: theme.primary, cursor: 'pointer' }}
                >
                  + {"{{nombre}}"}
                </button>
                <button
                  type="button"
                  onClick={() => setMassPlainText((prev: string) => prev + ' {{dias}}')}
                  style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: '6px', padding: '2px 6px', fontSize: '0.7rem', color: theme.primary, cursor: 'pointer' }}
                >
                  + {"{{dias}}"}
                </button>
                <button
                  type="button"
                  onClick={() => setMassPlainText((prev: string) => prev + ' {{app}}')}
                  style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: '6px', padding: '2px 6px', fontSize: '0.7rem', color: theme.primary, cursor: 'pointer' }}
                >
                  + {"{{app}}"}
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
              dangerouslySetInnerHTML={{ 
                __html: generateCampaignHtml(
                  massPlainText
                    .replace(/\{\{nombre\}\}/g, massTargetAccounts[0]?.nombre || 'Usuario')
                    .replace(/\{\{dias\}\}/g, String(massTargetAccounts[0]?.diasInactivo || 15))
                    .replace(/\{\{app\}\}/g, massTargetAccounts[0]?.tipo === 'B2B' ? 'Prospera Pymes' : 'Prospera APP'), 
                  massTemplate === 'auto' ? (massTargetAccounts[0]?.tipo === 'B2B' ? 'reengagement_pymes' : 'reengagement_app') : massTemplate
                ) 
              }}
            />
          )}
        </div>

        {/* Progreso en Tiempo Real */}
        {isMassSending && massProgress && (
          <div style={{ marginBottom: '18px', padding: '14px', background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, color: theme.text, marginBottom: '6px' }}>
              <span>Despachando lote: {massProgress.current} de {massProgress.total}</span>
              <span>{Math.round((massProgress.current / massProgress.total) * 100)}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: isDark ? '#1e293b' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${(massProgress.current / massProgress.total) * 100}%`, 
                  background: 'linear-gradient(90deg, #ef4444, #10b981)',
                  transition: 'width 0.3s ease'
                }} 
              />
            </div>
            <div style={{ display: 'flex', gap: '14px', marginTop: '8px', fontSize: '0.72rem', color: theme.textSec }}>
              <span style={{ color: '#10b981', fontWeight: 700 }}>✅ Entregados: {massProgress.success}</span>
              {massProgress.failed > 0 && <span style={{ color: '#ef4444', fontWeight: 700 }}>❌ Fallidos: {massProgress.failed}</span>}
            </div>
          </div>
        )}

        {/* Feedback Masivo */}
        {massFeedback && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '18px',
            fontSize: '0.82rem',
            fontWeight: 700,
            background: massFeedback.type === 'success' ? '#10b98120' : '#3b82f620',
            color: massFeedback.type === 'success' ? '#10b981' : '#3b82f6',
            border: `1px solid ${massFeedback.type === 'success' ? '#10b981' : '#3b82f6'}40`
          }}>
            {massFeedback.message}
          </div>
        )}

        {/* Botones de Acción Masiva */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            disabled={isMassSending}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: `1px solid ${theme.border}`,
              background: 'transparent',
              color: theme.textSec,
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: isMassSending ? 'not-allowed' : 'pointer'
            }}
          >
            {massFeedback ? 'Cerrar' : 'Cancelar'}
          </button>

          <button
            onClick={onSendMassBlast}
            disabled={isMassSending || massTargetAccounts.length === 0}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #ef4444, #f97316)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 900,
              cursor: (isMassSending || massTargetAccounts.length === 0) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
              opacity: (isMassSending || massTargetAccounts.length === 0) ? 0.7 : 1
            }}
          >
            {isMassSending ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
            {isMassSending ? 'Despachando Campaña...' : `Despachar a ${massTargetAccounts.length} Cuentas`}
          </button>
        </div>
      </div>
    </div>
  );
};
