import React from 'react';
import { Activity, Database, RefreshCw, Sun, Moon, Trash2 } from 'lucide-react';

interface StatusObj {
    status: string;
    latency: number;
    error: string | null;
}

interface SystemStatusCardProps {
    b2cStatus: StatusObj | null;
    b2bStatus: StatusObj | null;
    checkingApis: boolean;
    brevoStatus: StatusObj | null;
    sriStatus: StatusObj | null;
    rowCounts: {
        b2c: { perfiles: number; transacciones: number; soporte_tickets: number; public_news: number };
        b2b: { perfiles: number; empresas_gestionadas: number; soporte_tickets: number; user_notifications: number };
    };
    checkExternalApis: () => void;
    handlePurgeCache: () => void;
    handleCleanStorage: () => void;
    toggleTheme: () => void;
    isDark: boolean;
    theme: any;
    cardStyle: any;
    statusBadge: (status: string | undefined, latency: number) => React.ReactNode;
}

export const SystemStatusCard: React.FC<SystemStatusCardProps> = ({
    b2cStatus,
    b2bStatus,
    checkingApis,
    brevoStatus,
    sriStatus,
    rowCounts,
    checkExternalApis,
    handlePurgeCache,
    handleCleanStorage,
    toggleTheme,
    isDark,
    theme,
    cardStyle,
    statusBadge
}) => {
    return (
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

            {/* CARD 3: ESTADO DE APIS EXTERNAS */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Activity size={18} style={{ color: '#f59e0b' }} /> Estado de APIs Externas
                </h3>
                <button
                  onClick={checkExternalApis}
                  disabled={checkingApis}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: '#f59e0b15', color: '#f59e0b',
                    border: 'none', padding: '7px 14px', borderRadius: '10px',
                    fontWeight: 800, cursor: 'pointer', fontSize: '0.75rem',
                  }}
                >
                  <RefreshCw size={12} className={checkingApis ? 'animate-spin' : ''} />
                  {checkingApis ? 'Verificando...' : 'Verificar'}
                </button>
              </div>
              <p style={{ color: theme.textSec, fontSize: '0.8rem', margin: '0 0 20px 0' }}>
                Semáforo en tiempo real de los servicios externos usados por el ecosistema.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Brevo */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: theme.bg, borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>📧 Brevo (Email API)</div>
                    <div style={{ fontSize: '0.7rem', color: theme.textSec }}>Campañas, proformas y notificaciones automáticas</div>
                  </div>
                  {checkingApis && !brevoStatus ? (
                    <div style={{ fontSize: '0.75rem', color: theme.textSec }}>Verificando...</div>
                  ) : brevoStatus ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: brevoStatus.status === 'connected' ? '#00D68F' : brevoStatus.status === 'slow' ? '#f59e0b' : '#ef4444',
                        boxShadow: `0 0 8px ${brevoStatus.status === 'connected' ? '#00D68F' : brevoStatus.status === 'slow' ? '#f59e0b' : '#ef4444'}`,
                      }} />
                      <span style={{ fontWeight: 700, fontSize: '0.8rem', color: brevoStatus.status === 'connected' ? '#00D68F' : brevoStatus.status === 'slow' ? '#f59e0b' : '#ef4444' }}>
                        {brevoStatus.status === 'connected' ? `Activo · ${brevoStatus.latency}ms` : brevoStatus.error || 'Error'}
                      </span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: theme.textSec }}>— Sin verificar</div>
                  )}
                </div>

                {/* SRI */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: theme.bg, borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>🏛️ SRI en Línea</div>
                    <div style={{ fontSize: '0.7rem', color: theme.textSec }}>Portal de declaraciones del Servicio de Rentas Internas</div>
                  </div>
                  {checkingApis && !sriStatus ? (
                    <div style={{ fontSize: '0.75rem', color: theme.textSec }}>Verificando...</div>
                  ) : sriStatus ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: sriStatus.status === 'connected' ? '#00D68F' : sriStatus.status === 'slow' ? '#f59e0b' : '#ef4444',
                        boxShadow: `0 0 8px ${sriStatus.status === 'connected' ? '#00D68F' : sriStatus.status === 'slow' ? '#f59e0b' : '#ef4444'}`,
                      }} />
                      <span style={{ fontWeight: 700, fontSize: '0.8rem', color: sriStatus.status === 'connected' ? '#00D68F' : sriStatus.status === 'slow' ? '#f59e0b' : '#ef4444' }}>
                        {sriStatus.status === 'connected' ? `Activo · ${sriStatus.latency}ms` : sriStatus.error || 'Error'}
                      </span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: theme.textSec }}>— Sin verificar</div>
                  )}
                </div>
              </div>
            </div>

            {/* CARD 4: PERSONALIZACIÓN */}
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

            {/* CARD 5: MANTENIMIENTO DE CACHÉ */}
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
    );
};
