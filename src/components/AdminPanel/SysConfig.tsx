import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { supabaseContable } from '../../services/supabaseContable';
import { 
  Sun, Moon, Activity, Database, Trash2, RefreshCw, CheckCircle, AlertTriangle, Play 
} from 'lucide-react';

export default function ConfigView() {
  const { theme, isDark, toggleTheme } = useTheme();
  const queryClient = useQueryClient();

  const [diagnosing, setDiagnosing] = useState(false);
  const [b2cStatus, setB2cStatus] = useState<{ status: string; latency: number; error: string | null } | null>(null);
  const [b2bStatus, setB2bStatus] = useState<{ status: string; latency: number; error: string | null } | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [rowCounts, setRowCounts] = useState<{
    b2c: { perfiles: number; transacciones: number; soporte_tickets: number; public_news: number };
    b2b: { perfiles: number; empresas_gestionadas: number; soporte_tickets: number; user_notifications: number };
  }>({
    b2c: { perfiles: 0, transacciones: 0, soporte_tickets: 0, public_news: 0 },
    b2b: { perfiles: 0, empresas_gestionadas: 0, soporte_tickets: 0, user_notifications: 0 }
  });

  const checkDb = async (dbClient: any) => {
    const start = performance.now();
    try {
      // Intentamos una lectura muy ligera con head: true
      const { error } = await dbClient.from('perfiles').select('id_usuario, id', { count: 'exact', head: true }).limit(1);
      const end = performance.now();
      
      // Si el error es debido a que no existe id_usuario (por ejemplo en B2C es id), no nos importa, lo que queremos saber es si responde
      if (error && error.code !== 'PGRST100' && error.message.includes('FetchError')) {
        throw error;
      }
      return { status: 'connected', latency: Math.round(end - start), error: null };
    } catch (err: any) {
      return { status: 'error', latency: 0, error: err.message || 'Error de conexión' };
    }
  };

  const runDiagnostics = async () => {
    setDiagnosing(true);
    setActionMessage(null);
    
    // Evaluar B2C
    const b2cCheck = await checkDb(supabase);
    setB2cStatus(b2cCheck);

    // Evaluar B2B
    const b2bCheck = await checkDb(supabaseContable);
    setB2bStatus(b2bCheck);

    const counts = {
      b2c: { perfiles: 0, transacciones: 0, soporte_tickets: 0, public_news: 0 },
      b2b: { perfiles: 0, empresas_gestionadas: 0, soporte_tickets: 0, user_notifications: 0 }
    };

    // Conteo B2C
    if (b2cCheck.status === 'connected') {
      try {
        const { count: perf } = await supabase.from('perfiles').select('*', { count: 'exact', head: true });
        const { count: tx } = await supabase.from('transacciones').select('*', { count: 'exact', head: true });
        const { count: tix } = await supabase.from('soporte_tickets').select('*', { count: 'exact', head: true });
        const { count: news } = await supabase.from('public_news').select('*', { count: 'exact', head: true });
        counts.b2c = { perfiles: perf || 0, transacciones: tx || 0, soporte_tickets: tix || 0, public_news: news || 0 };
      } catch (e) {
        console.error("B2C counts error", e);
      }
    }

    // Conteo B2B
    if (b2bCheck.status === 'connected') {
      try {
        const { count: perf } = await supabaseContable.from('perfiles').select('*', { count: 'exact', head: true });
        const { count: emp } = await supabaseContable.from('empresas_gestionadas').select('*', { count: 'exact', head: true });
        const { count: tix } = await supabaseContable.from('soporte_tickets').select('*', { count: 'exact', head: true });
        const { count: notif } = await supabaseContable.from('user_notifications').select('*', { count: 'exact', head: true });
        counts.b2b = { perfiles: perf || 0, empresas_gestionadas: emp || 0, soporte_tickets: tix || 0, user_notifications: notif || 0 };
      } catch (e) {
        console.error("B2B counts error", e);
      }
    }

    setRowCounts(counts);
    setDiagnosing(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const handlePurgeCache = () => {
    queryClient.clear();
    setActionMessage("Caché de consultas de React Query eliminada con éxito.");
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleCleanStorage = () => {
    let count = 0;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && !key.includes('auth-token') && !key.includes('session')) {
        localStorage.removeItem(key);
        count++;
      }
    }
    sessionStorage.clear();
    setActionMessage(`Limpieza exitosa. Se eliminaron ${count} variables de configuración local. Recargando panel...`);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const cardStyle = { 
    background: theme.card, 
    padding: '24px', 
    borderRadius: '24px', 
    border: `1px solid ${theme.border}`,
    boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.15)' : '0 10px 30px rgba(0,0,0,0.02)',
  };

  const statusBadge = (status: string | undefined, latency: number) => {
    if (status === 'connected') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>
          <CheckCircle size={16} /> Conectado ({latency}ms)
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.danger, fontWeight: 800, fontSize: '0.85rem' }}>
        <AlertTriangle size={16} /> Error de Conexión
      </div>
    );
  };

  return (
    <div style={{ paddingBottom: '60px', animation: 'fadeIn 0.4s ease' }}>
      
      {/* HEADER DE SISTEMA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
        <div>
          <h2 style={{ color: theme.text, margin: 0, fontWeight: 900, letterSpacing: '-0.5px' }}>⚙️ Configuración del Sistema</h2>
          <p style={{ color: theme.textSec, fontSize: '0.85rem', margin: '5px 0 0 0' }}>Monitoreo en tiempo real, auditoría de carga y utilidades de mantenimiento.</p>
        </div>
        <button 
          onClick={runDiagnostics} 
          disabled={diagnosing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: theme.primary + '15',
            color: theme.primary,
            border: 'none',
            padding: '10px 18px',
            borderRadius: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '0.8rem',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = `${theme.primary}25`}
          onMouseOut={(e) => e.currentTarget.style.background = `${theme.primary}15`}
        >
          <RefreshCw size={14} className={diagnosing ? 'animate-spin' : ''} />
          Refrescar Diagnóstico
        </button>
      </div>

      {actionMessage && (
        <div style={{
          background: theme.primary + '15',
          border: `1px solid ${theme.primary}30`,
          color: theme.primary,
          padding: '12px 20px',
          borderRadius: '16px',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '25px',
          animation: 'slideIn 0.2s ease'
        }}>
          ✨ {actionMessage}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
        
        {/* CARD 1: DIAGNÓSTICO DE BASES DE DATOS */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={18} style={{ color: theme.primary }} /> Estado de Conexión (Realtime)
          </h3>
          <p style={{ color: theme.textSec, fontSize: '0.8rem', margin: '0 0 20px 0' }}>
            Medición de latencia de red contra los nodos de datos del ecosistema.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: theme.bg, borderRadius: '16px', border: `1px solid ${theme.border}` }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Supabase B2C App</div>
                <div style={{ fontSize: '0.7rem', color: theme.textSec }}>Finanzas Personales</div>
              </div>
              {b2cStatus ? statusBadge(b2cStatus.status, b2cStatus.latency) : <div style={{ fontSize: '0.8rem', color: theme.textSec }}>Diagnosticando...</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: theme.bg, borderRadius: '16px', border: `1px solid ${theme.border}` }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Supabase B2B Contable</div>
                <div style={{ fontSize: '0.7rem', color: theme.textSec }}>Prospera Pymes</div>
              </div>
              {b2bStatus ? statusBadge(b2bStatus.status, b2bStatus.latency) : <div style={{ fontSize: '0.8rem', color: theme.textSec }}>Diagnosticando...</div>}
            </div>
          </div>
        </div>

        {/* CARD 2: AUDITORÍA DE REGISTROS (CARGA) */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={18} style={{ color: theme.primary }} /> Auditoría de Volumen de Tablas
          </h3>
          <p style={{ color: theme.textSec, fontSize: '0.8rem', margin: '0 0 20px 0' }}>
            Número de registros activos en las tablas operativas de la plataforma.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {/* Tablas B2C */}
            <div style={{ background: theme.bg, padding: '15px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
              <div style={{ fontWeight: 800, fontSize: '0.75rem', color: theme.primary, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Base App (B2C)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.textSec }}>Perfiles:</span>
                  <span style={{ fontWeight: 800 }}>{rowCounts.b2c.perfiles}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.textSec }}>Transacciones:</span>
                  <span style={{ fontWeight: 800 }}>{rowCounts.b2c.transacciones}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.textSec }}>Tickets Soporte:</span>
                  <span style={{ fontWeight: 800 }}>{rowCounts.b2c.soporte_tickets}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.textSec }}>Noticias:</span>
                  <span style={{ fontWeight: 800 }}>{rowCounts.b2c.public_news}</span>
                </div>
              </div>
            </div>

            {/* Tablas B2B */}
            <div style={{ background: theme.bg, padding: '15px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
              <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#8b5cf6', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Base Pymes (B2B)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.textSec }}>Contadores:</span>
                  <span style={{ fontWeight: 800 }}>{rowCounts.b2b.perfiles}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.textSec }}>Empresas:</span>
                  <span style={{ fontWeight: 800 }}>{rowCounts.b2b.empresas_gestionadas}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.textSec }}>Tickets Soporte:</span>
                  <span style={{ fontWeight: 800 }}>{rowCounts.b2b.soporte_tickets}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.textSec }}>Notificaciones:</span>
                  <span style={{ fontWeight: 800 }}>{rowCounts.b2b.user_notifications}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: PERSONALIZACIÓN */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isDark ? <Moon size={18} style={{ color: '#fbbf24' }} /> : <Sun size={18} style={{ color: '#6366f1' }} />} Personalización
          </h3>
          <p style={{ color: theme.textSec, fontSize: '0.8rem', margin: '0 0 20px 0' }}>
            Ajusta la apariencia visual del panel de administración principal.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: theme.bg, borderRadius: '16px', border: `1px solid ${theme.border}` }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Modo de Visualización</div>
              <div style={{ fontSize: '0.75rem', color: theme.textSec }}>Actual: {isDark ? 'Oscuro' : 'Claro'}</div>
            </div>
            <button 
              onClick={toggleTheme}
              style={{ 
                background: isDark ? '#fff' : '#000', 
                color: isDark ? '#000' : '#fff', 
                border: 'none', 
                padding: '10px 18px', 
                borderRadius: '12px', 
                fontWeight: 800, 
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Modo {isDark ? 'Claro' : 'Oscuro'}
            </button>
          </div>
        </div>

        {/* CARD 4: MANTENIMIENTO DE CACHÉ */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Trash2 size={18} style={{ color: theme.danger }} /> Mantenimiento & Caché
          </h3>
          <p style={{ color: theme.textSec, fontSize: '0.8rem', margin: '0 0 20px 0' }}>
            Herramientas para purgar datos temporales y optimizar el rendimiento del navegador.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', background: theme.bg, borderRadius: '16px', border: `1px solid ${theme.border}` }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>React Query Cache</div>
                <div style={{ fontSize: '0.7rem', color: theme.textSec }}>Fuerza el refresco de datos con Supabase.</div>
              </div>
              <button 
                onClick={handlePurgeCache}
                style={{
                  background: 'transparent',
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = theme.border}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Purgar Caché
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', background: theme.bg, borderRadius: '16px', border: `1px solid ${theme.border}` }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Preferencias Locales</div>
                <div style={{ fontSize: '0.7rem', color: theme.textSec }}>Limpia filtros y configuraciones del cliente.</div>
              </div>
              <button 
                onClick={handleCleanStorage}
                style={{
                  background: theme.danger + '10',
                  border: `1px solid ${theme.danger}30`,
                  color: theme.danger,
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = theme.danger + '20'}
                onMouseOut={(e) => e.currentTarget.style.background = theme.danger + '10'}
              >
                Limpiar Storage
              </button>
            </div>
          </div>
        </div>

      </div>

      <div style={{ marginTop: 50, textAlign: 'center', color: theme.textSec, fontSize: '0.75rem', fontWeight: 600 }}>
        Prospera Admin Engine v4.1.0 • 2026 Free Spirit
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}
