import React from 'react';
import { Activity, Database, RefreshCw, Sun, Moon, Trash2, CheckCircle, Sliders } from 'lucide-react';

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
    aiStatus?: StatusObj | null;
    ga4Status?: StatusObj | null;
    ga4ApiStatus?: StatusObj | null;
    resendStatus?: StatusObj | null;
    pushStatus?: StatusObj | null;
    vercelStatus?: StatusObj | null;
    smtpStatus?: StatusObj | null;
    r2Status?: StatusObj | null;
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
    aiStatus,
    ga4Status,
    ga4ApiStatus,
    resendStatus,
    pushStatus,
    vercelStatus,
    smtpStatus,
    r2Status,
    rowCounts,
    checkExternalApis,
    handlePurgeCache,
    handleCleanStorage,
    toggleTheme,
    isDark,
    theme,
}) => {
    const renderPill = (
        name: string,
        icon: string,
        statusObj: StatusObj | null | undefined,
        locations: string[],
        accentColor?: string
    ) => {
        const isConn = statusObj?.status === 'connected';
        const color = isConn
            ? (statusObj.latency > 900 ? '#f59e0b' : '#00D68F')
            : statusObj?.status === 'slow'
            ? '#f59e0b'
            : '#ef4444';

        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '14px',
                background: theme.bg,
                border: `1px solid ${theme.border}`,
                gap: '8px',
                flex: '1 1 calc(33.333% - 12px)',
                minWidth: '240px',
                transition: 'all 0.2s ease',
                boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.15)' : '0 2px 6px rgba(0,0,0,0.02)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1rem' }}>{icon}</span>
                        <span style={{ color: theme.text, fontWeight: 800, fontSize: '0.8rem' }}>{name}</span>
                    </div>

                    {checkingApis && !statusObj ? (
                        <span style={{ color: theme.textSec, fontSize: '0.7rem' }}>...</span>
                    ) : statusObj ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: color,
                                boxShadow: `0 0 6px ${color}`
                            }} />
                            <span style={{ color, fontSize: '0.75rem', fontWeight: 800 }}>
                                {isConn ? `${statusObj.latency}ms` : 'Error'}
                            </span>
                        </div>
                    ) : (
                        <span style={{ color: theme.textSec, fontSize: '0.7rem' }}>—</span>
                    )}
                </div>

                {/* Location Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.62rem', color: theme.textSec, fontWeight: 600, marginRight: '2px' }}>
                        En:
                    </span>
                    {locations.map((loc, idx) => (
                        <span
                            key={idx}
                            style={{
                                fontSize: '0.62rem',
                                fontWeight: 700,
                                padding: '2px 7px',
                                borderRadius: '6px',
                                background: accentColor ? `${accentColor}15` : `${theme.primary}12`,
                                color: accentColor || theme.primary,
                                border: `1px solid ${accentColor ? `${accentColor}30` : `${theme.primary}25`}`,
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {loc}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 1. BARRA DE TELEMETRÍA EN TIEMPO REAL (HUD STRIP) */}
            <div style={{
                background: theme.card,
                borderRadius: '20px',
                border: `1px solid ${theme.border}`,
                padding: '20px',
                boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.03)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '8px', borderRadius: '10px', background: theme.primary + '15', color: theme.primary }}>
                            <Activity size={18} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: theme.text }}>
                                Telemetría & Conectividad del Ecosistema
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: theme.textSec }}>
                                Semáforo en vivo de los 12 nodos, microservicios y APIs integradas en cada proyecto de Prospera.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={checkExternalApis}
                        disabled={checkingApis}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: '#f59e0b15', color: '#f59e0b',
                            border: '1px solid #f59e0b30', padding: '8px 16px', borderRadius: '12px',
                            fontWeight: 800, cursor: 'pointer', fontSize: '0.78rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <RefreshCw size={13} className={checkingApis ? 'animate-spin' : ''} />
                        {checkingApis ? 'Diagnosticando...' : 'Verificar Latencias'}
                    </button>
                </div>

                {/* PILLS / CARDS CONTAINER */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {/* 1. Supabase B2C */}
                    {renderPill('Supabase B2C (Principal)', '🟢', b2cStatus, ['App B2C', 'Admin', 'Landing'], '#10b981')}

                    {/* 2. Supabase B2B */}
                    {renderPill('Supabase B2B (Pymes)', '🟣', b2bStatus, ['Pymes Web', 'Pymes App', 'Admin'], '#8b5cf6')}

                    {/* 3. Brevo Email API */}
                    {renderPill('Brevo Email API v3', '📧', brevoStatus, ['Admin CRM', 'Pymes Web', 'Edge Functions'], '#3b82f6')}

                    {/* 4. Google Analytics 4 (Web Tag) */}
                    {renderPill('Google Analytics 4', '📊', ga4Status, ['App B2C', 'Pymes Web', 'Landing'], '#f59e0b')}

                    {/* 5. GA4 Data API v1 (Google Cloud) */}
                    {renderPill('GA4 Data API v1', '📈', ga4ApiStatus, ['Admin Realtime'], '#ea580c')}

                    {/* 6. Web Push & FCM */}
                    {renderPill('Web Push & FCM', '🔔', pushStatus, ['App B2C', 'Admin', 'Pymes App'], '#06b6d4')}

                    {/* 7. Resend Email Engine */}
                    {renderPill('Resend Engine', '✉️', resendStatus, ['Edge Functions / Cron'], '#ec4899')}

                    {/* 8. SRI en Línea */}
                    {renderPill('SRI en Línea (Ecuador)', '🏛️', sriStatus, ['Pymes Web', 'Pymes App', 'Admin'], '#14b8a6')}

                    {/* 9. Prospera AI */}
                    {renderPill('Prospera AI', '🧠', aiStatus, ['Pymes Web', 'Admin'], '#a855f7')}

                    {/* 10. Vercel Web Analytics */}
                    {renderPill('Vercel Analytics', '▲', vercelStatus, ['App B2C', 'Admin', 'Landing'], '#64748b')}

                    {/* 11. Namecheap SMTP */}
                    {renderPill('Namecheap SMTP', '📫', smtpStatus, ['@prosperafinanzas.com'], '#e11d48')}

                    {/* 12. Cloudflare R2 */}
                    {renderPill('Cloudflare R2 Storage', '☁️', r2Status, ['Pymes Web', 'Respaldo S3'], '#f97316')}
                </div>
            </div>

            {/* 2. FILA INFERIOR HORIZONTAL: AUDITORÍA Y AJUSTES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
                
                {/* AUDITORÍA DE REGISTROS (Carga) */}
                <div style={{
                    background: theme.card,
                    borderRadius: '20px',
                    border: `1px solid ${theme.border}`,
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        <div style={{ padding: '8px', borderRadius: '10px', background: theme.primary + '15', color: theme.primary }}>
                            <Database size={18} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: theme.text }}>
                                Auditoría de Volumen de Tablas
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: theme.textSec }}>
                                Registros activos acumulados en las bases operativas.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {/* Base B2C */}
                        <div style={{ background: theme.bg, padding: '12px 14px', borderRadius: '14px', border: `1px solid ${theme.border}` }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: theme.primary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                App Personales (B2C)
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem' }}>
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

                        {/* Base B2B */}
                        <div style={{ background: theme.bg, padding: '12px 14px', borderRadius: '14px', border: `1px solid ${theme.border}` }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                Prospera Pymes (B2B)
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem' }}>
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

                {/* HERRAMIENTAS & APARIENCIA */}
                <div style={{
                    background: theme.card,
                    borderRadius: '20px',
                    border: `1px solid ${theme.border}`,
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        <div style={{ padding: '8px', borderRadius: '10px', background: theme.primary + '15', color: theme.primary }}>
                            <Sliders size={18} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: theme.text }}>
                                Ajustes de Panel & Mantenimiento Local
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: theme.textSec }}>
                                Configuración de tema visual y purga de temporales.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* Theme switcher */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: theme.bg, borderRadius: '14px', border: `1px solid ${theme.border}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isDark ? <Moon size={16} style={{ color: '#fbbf24' }} /> : <Sun size={16} style={{ color: '#6366f1' }} />}
                                <span style={{ fontWeight: 800, fontSize: '0.82rem', color: theme.text }}>Apariencia Admin</span>
                            </div>
                            <button
                                onClick={toggleTheme}
                                style={{
                                    background: isDark ? '#fff' : '#000',
                                    color: isDark ? '#000' : '#fff',
                                    border: 'none',
                                    padding: '6px 14px',
                                    borderRadius: '10px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Modo {isDark ? 'Claro ☀️' : 'Oscuro 🌙'}
                            </button>
                        </div>

                        {/* React Query Cache & Local Storage */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button
                                onClick={handlePurgeCache}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                    background: theme.bg,
                                    border: `1px solid ${theme.border}`,
                                    color: theme.text,
                                    padding: '10px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <RefreshCw size={13} /> Purgar Caché
                            </button>

                            <button
                                onClick={handleCleanStorage}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                    background: theme.danger + '10',
                                    border: `1px solid ${theme.danger}30`,
                                    color: theme.danger,
                                    padding: '10px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Trash2 size={13} /> Limpiar Storage
                            </button>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};
