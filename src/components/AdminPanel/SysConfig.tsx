import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { supabaseContable } from '../../services/supabaseContable';
import { useData, PreciosConfig } from '../../context/DataContext';
import { 
  Sun, Moon, Activity, Database, Trash2, RefreshCw, CheckCircle, AlertTriangle, Play, Edit, Check, Settings
} from 'lucide-react';

export default function ConfigView() {
  const { theme, isDark, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const { precios: preciosDB, updatePrecios } = useData();

  const [diagnosing, setDiagnosing] = useState(false);
  const [b2cStatus, setB2cStatus] = useState<{ status: string; latency: number; error: string | null } | null>(null);
  const [b2bStatus, setB2bStatus] = useState<{ status: string; latency: number; error: string | null } | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // --- CONFIGURACIÓN DE PRECIOS ---
  const [preciosEdit, setPreciosEdit] = useState<PreciosConfig>(preciosDB);
  const [isEditingPrecios, setIsEditingPrecios] = useState(false);

  useEffect(() => {
    setPreciosEdit(preciosDB);
  }, [preciosDB]);

  // --- POLÍTICAS DE MANTENIMIENTO ---
  const [retencionCampanas, setRetencionCampanas] = useState<number>(15);
  const [retencionSoporte, setRetencionSoporte] = useState<number>(30);
  const [isEditingMaint, setIsEditingMaint] = useState(false);

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

  const loadMaintConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('precios_config')
        .select('*')
        .in('id', ['maint_campanas_retencion', 'maint_soporte_retencion']);
      
      if (data) {
        const campanasObj = data.find(c => c.id === 'maint_campanas_retencion');
        const soporteObj = data.find(c => c.id === 'maint_soporte_retencion');
        if (campanasObj) setRetencionCampanas(campanasObj.valor);
        if (soporteObj) setRetencionSoporte(soporteObj.valor);
      }
    } catch (e) {
      console.error("Error loading maintenance configs:", e);
    }
  };

  const handleSaveMaint = async () => {
    try {
      const updates = [
        { id: 'maint_campanas_retencion', valor: retencionCampanas },
        { id: 'maint_soporte_retencion', valor: retencionSoporte }
      ];
      const { error } = await supabase.from('precios_config').upsert(updates);
      if (error) throw error;
      setActionMessage("Políticas de mantenimiento guardadas con éxito.");
      setIsEditingMaint(false);
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      console.error("Error saving maintenance configs:", err);
      setActionMessage("Error al guardar políticas de mantenimiento: " + err.message);
      setTimeout(() => setActionMessage(null), 3500);
    }
  };

  const handlePrecioChange = (key: keyof PreciosConfig, value: string) => {
    setPreciosEdit(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const handleSavePrecios = async () => {
    try {
      await updatePrecios(preciosEdit);
      setIsEditingPrecios(false);
      setActionMessage("Estructura de precios guardada con éxito.");
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      console.error("Error saving prices:", err);
      setActionMessage("Error al guardar tarifas: " + err.message);
      setTimeout(() => setActionMessage(null), 3500);
    }
  };

  useEffect(() => {
    runDiagnostics();
    loadMaintConfigs();
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

      {/* SECCIÓN DE CONFIGURACIONES OPERATIVAS */}
      <div style={{ marginTop: '45px', marginBottom: '25px' }}>
        <h2 style={{ color: theme.text, margin: 0, fontWeight: 900, letterSpacing: '-0.5px' }}>💼 Configuraciones de Negocio</h2>
        <p style={{ color: theme.textSec, fontSize: '0.85rem', margin: '5px 0 0 0' }}>Gestión de tarifas del ecosistema y reglas de retención automática de datos.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* CARD DE PRECIOS */}
        <div style={{ ...cardStyle, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Settings size={18} style={{ color: theme.primary }} /> Estructura de Precios (Tarifas Globales)
            </h3>
            <button 
              onClick={() => {
                if (isEditingPrecios) handleSavePrecios();
                else setIsEditingPrecios(true);
              }}
              style={{
                background: isEditingPrecios ? theme.primary : theme.bg,
                color: isEditingPrecios ? (isDark ? '#000' : '#fff') : theme.text,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                padding: '8px 16px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {isEditingPrecios ? <><Check size={14} /> GUARDAR</> : <><Edit size={14} /> AJUSTAR TARIFAS</>}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* GRUPO BÁSICO */}
            <div style={{ background: theme.bg, padding: '20px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
              <div style={{ width: '40px', height: '4px', background: '#3b82f6', borderRadius: '4px', marginBottom: '12px' }}></div>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '0.8rem', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fase Iniciación</h4>
              {[
                { label: 'Presupuestos', key: 'presupuestos' },
                { label: 'Recordatorios', key: 'recordatorios' }
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${theme.border}`, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.label}</span>
                  {isEditingPrecios ? (
                    <input 
                      type="number" 
                      step="0.01" 
                      value={preciosEdit[item.key as keyof PreciosConfig]} 
                      onChange={(e) => handlePrecioChange(item.key as keyof PreciosConfig, e.target.value)} 
                      style={{
                        width: '70px',
                        background: theme.card,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '8px',
                        padding: '5px 8px',
                        fontSize: '0.85rem',
                        textAlign: 'right',
                        fontWeight: 800,
                        outline: 'none'
                      }}
                    />
                  ) : (
                    <b style={{ fontSize: '0.95rem', fontWeight: 800 }}>${preciosEdit[item.key as keyof PreciosConfig]?.toFixed(2)}</b>
                  )}
                </div>
              ))}
            </div>

            {/* GRUPO PRO */}
            <div style={{ background: theme.bg, padding: '20px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
              <div style={{ width: '40px', height: '4px', background: '#10b981', borderRadius: '4px', marginBottom: '12px' }}></div>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '0.8rem', fontWeight: 900, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fase Analítica</h4>
              {[
                { label: 'Conciliación', key: 'conciliacion' },
                { label: 'Subcategorías', key: 'subcategorias' },
                { label: 'Reportes Pro', key: 'reporte_patrimonio' }
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${theme.border}`, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.label}</span>
                  {isEditingPrecios ? (
                    <input 
                      type="number" 
                      step="0.01" 
                      value={preciosEdit[item.key as keyof PreciosConfig]} 
                      onChange={(e) => handlePrecioChange(item.key as keyof PreciosConfig, e.target.value)} 
                      style={{
                        width: '70px',
                        background: theme.card,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '8px',
                        padding: '5px 8px',
                        fontSize: '0.85rem',
                        textAlign: 'right',
                        fontWeight: 800,
                        outline: 'none'
                      }}
                    />
                  ) : (
                    <b style={{ fontSize: '0.95rem', fontWeight: 800 }}>${preciosEdit[item.key as keyof PreciosConfig]?.toFixed(2)}</b>
                  )}
                </div>
              ))}
            </div>

            {/* GRUPO ULTRA */}
            <div style={{ background: theme.bg, padding: '20px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
              <div style={{ width: '40px', height: '4px', background: '#c084fc', borderRadius: '4px', marginBottom: '12px' }}></div>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '0.8rem', fontWeight: 900, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fase Avanzada</h4>
              {[
                { label: 'IA Integral', key: 'chat' },
                { label: 'Ingreso Mágico', key: 'magic' },
                { label: 'Insights IA', key: 'insights' }
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${theme.border}`, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.label}</span>
                  {isEditingPrecios ? (
                    <input 
                      type="number" 
                      step="0.01" 
                      value={preciosEdit[item.key as keyof PreciosConfig]} 
                      onChange={(e) => handlePrecioChange(item.key as keyof PreciosConfig, e.target.value)} 
                      style={{
                        width: '70px',
                        background: theme.card,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '8px',
                        padding: '5px 8px',
                        fontSize: '0.85rem',
                        textAlign: 'right',
                        fontWeight: 800,
                        outline: 'none'
                      }}
                    />
                  ) : (
                    <b style={{ fontSize: '0.95rem', fontWeight: 800 }}>${preciosEdit[item.key as keyof PreciosConfig]?.toFixed(2)}</b>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD DE POLÍTICAS DE MANTENIMIENTO */}
        <div style={{ ...cardStyle, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Trash2 size={18} style={{ color: theme.danger }} /> Políticas de Mantenimiento (Mantenimiento Automático)
            </h3>
            <button 
              onClick={() => {
                if (isEditingMaint) handleSaveMaint();
                else setIsEditingMaint(true);
              }}
              style={{
                background: isEditingMaint ? theme.primary : theme.bg,
                color: isEditingMaint ? (isDark ? '#000' : '#fff') : theme.text,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                padding: '8px 16px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {isEditingMaint ? <><Check size={14} /> GUARDAR</> : <><Edit size={14} /> EDITAR POLÍTICAS</>}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* RETENCIÓN DE CAMPAÑAS */}
            <div style={{ background: theme.bg, padding: '20px', borderRadius: '20px', border: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Retención de Campañas</div>
                <div style={{ fontSize: '0.75rem', color: theme.textSec, marginTop: '4px', maxWidth: '240px' }}>
                  Las campañas enviadas o con error se eliminarán automáticamente tras estos días.
                </div>
              </div>
              <div>
                {isEditingMaint ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input 
                      type="number" 
                      min="1" 
                      value={retencionCampanas} 
                      onChange={(e) => setRetencionCampanas(parseInt(e.target.value) || 0)} 
                      style={{
                        width: '60px',
                        background: theme.card,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '8px',
                        padding: '6px',
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        fontWeight: 800,
                        outline: 'none'
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', color: theme.textSec, fontWeight: 700 }}>días</span>
                  </div>
                ) : (
                  <b style={{ fontSize: '1.1rem', fontWeight: 800, color: theme.primary }}>{retencionCampanas} días</b>
                )}
              </div>
            </div>

            {/* RETENCIÓN DE SOPORTE */}
            <div style={{ background: theme.bg, padding: '20px', borderRadius: '20px', border: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Retención de Soporte</div>
                <div style={{ fontSize: '0.75rem', color: theme.textSec, marginTop: '4px', maxWidth: '240px' }}>
                  Los tickets de soporte cerrados se depurarán de la base de datos tras cumplirse este lapso.
                </div>
              </div>
              <div>
                {isEditingMaint ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input 
                      type="number" 
                      min="1" 
                      value={retencionSoporte} 
                      onChange={(e) => setRetencionSoporte(parseInt(e.target.value) || 0)} 
                      style={{
                        width: '60px',
                        background: theme.card,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '8px',
                        padding: '6px',
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        fontWeight: 800,
                        outline: 'none'
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', color: theme.textSec, fontWeight: 700 }}>días</span>
                  </div>
                ) : (
                  <b style={{ fontSize: '1.1rem', fontWeight: 800, color: theme.primary }}>{retencionSoporte} días</b>
                )}
              </div>
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
