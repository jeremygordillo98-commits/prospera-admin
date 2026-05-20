import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../context/ThemeContext';

export default function CrmView() {
  const { theme, isDark } = useTheme();
  const [leads, setLeads] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeSubTab, setActiveSubTab] = useState<'prospectos' | 'campanas' | 'proformas'>('prospectos');

  const { data: fetchedLeads, isLoading: loading } = useQuery({
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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (fetchedLeads) {
      setLeads(fetchedLeads);
    }
  }, [fetchedLeads]);

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

  if (loading) return <div style={{ color: theme.textSec, textAlign: 'center', padding: 100, fontWeight: 700, letterSpacing: '1px' }}>SINCRONIZANDO CRM...</div>;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* HEADER CRM */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexDirection: isMobile ? 'column' : 'row', gap: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, letterSpacing: '-1px' }}>Ventas B2B & CRM</h2>
          <div style={{ color: theme.textSec, fontSize: '0.9rem', marginTop: 4, fontWeight: 600 }}>Gestión de prospectos Pymes, campañas y proformas</div>
        </div>
      </div>

      {/* SUB-NAVEGACIÓN */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 10 }}>
        {['prospectos', 'campanas', 'proformas'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab as any)}
            style={{
              background: activeSubTab === tab ? theme.primary : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
              color: activeSubTab === tab ? '#fff' : theme.text,
              border: 'none',
              padding: '12px 24px',
              borderRadius: 14,
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.2s',
              boxShadow: activeSubTab === tab ? `0 8px 24px ${theme.primary}40` : 'none',
              whiteSpace: 'nowrap'
            }}
          >
            {tab === 'prospectos' && '👤 Prospectos (Leads)'}
            {tab === 'campanas' && '📨 Campañas (Brevo)'}
            {tab === 'proformas' && '📄 Generador Proformas'}
          </button>
        ))}
      </div>

      {/* VISTA: PROSPECTOS */}
      {activeSubTab === 'prospectos' && (
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
      )}

      {/* VISTA: CAMPAÑAS (PLACEHOLDER) */}
      {activeSubTab === 'campanas' && (
        <div style={{ ...glassStyle, textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🚀</div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.5rem', fontWeight: 900 }}>Motor de Correos en Construcción</h3>
          <p style={{ color: theme.textSec, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
            Pronto podrás conectar tu API de <b>Brevo</b> aquí para redactar, guardar borradores y programar correos automatizados tanto a prospectos como a usuarios activos.
          </p>
        </div>
      )}

      {/* VISTA: PROFORMAS (PLACEHOLDER) */}
      {activeSubTab === 'proformas' && (
        <div style={{ ...glassStyle, textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>📄</div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.5rem', fontWeight: 900 }}>Generador de Proformas PDF</h3>
          <p style={{ color: theme.textSec, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
            Aquí diseñaremos un editor visual para que ingreses los datos del cliente y los costos, y el sistema renderizará un <b>PDF oficial con el logo de Prospera</b> al instante para descargar y enviar por correo.
          </p>
        </div>
      )}

    </div>
  );
}
