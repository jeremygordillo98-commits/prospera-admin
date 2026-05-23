import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';

interface ProspectsTabProps {
  theme: any;
  isDark: boolean;
  isMobile: boolean;
}

export default function ProspectsTab({ theme, isDark, isMobile }: ProspectsTabProps) {
  // Consultar leads desde Supabase de forma reactiva
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['pymes_leads_admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pymes_leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error("Error fetching leads:", error);
        return [];
      }
      return data || [];
    }
  });

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

  if (isLoading) {
    return (
      <div style={{ color: theme.textSec, textAlign: 'center', padding: 50, fontWeight: 700, letterSpacing: '1px' }}>
        CARGANDO PROSPECTOS...
      </div>
    );
  }

  return (
    <div style={glassStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>Bandeja de Entrada de Leads</h3>
        <span style={{ background: theme.primary + '20', color: theme.primary, padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 800 }}>
          {leads.length} Total
        </span>
      </div>

      {leads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: theme.textSec }}>
          No hay prospectos capturados aún. ¡Revisa tu Landing Page!
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: theme.text }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                <th style={{ padding: '16px 12px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Fecha</th>
                <th style={{ padding: '16px 12px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Nombre</th>
                <th style={{ padding: '16px 12px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Rol</th>
                <th style={{ padding: '16px 12px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Contacto</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, idx) => (
                <tr key={lead.id} style={{ borderBottom: idx === leads.length - 1 ? 'none' : `1px solid ${theme.border}`, transition: 'all 0.2s' }}>
                  <td style={{ padding: '16px 12px', fontSize: '0.85rem', fontWeight: 600 }}>
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 12px', fontWeight: 800, fontSize: '0.95rem' }}>
                    {lead.nombre}
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', padding: '4px 10px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800 }}>
                      {lead.rol}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', color: theme.textSec, fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <a href={`mailto:${lead.email}`} style={{ color: theme.primary, textDecoration: 'none', fontWeight: 600 }}>{lead.email}</a>
                      {lead.celular && (
                        <a href={`https://wa.me/${lead.celular.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, color: '#25D366', fontSize: '0.75rem', fontWeight: 800 }}>
                          💬 {lead.celular}
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
