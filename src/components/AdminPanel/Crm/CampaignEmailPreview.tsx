import React from 'react';
import { Eye } from 'lucide-react';

interface CampaignEmailPreviewProps {
  previewHtml: string;
  isDark: boolean;
  theme: any;
}

export default function CampaignEmailPreview({ previewHtml, isDark, theme }: CampaignEmailPreviewProps) {
  return (
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
  );
}
