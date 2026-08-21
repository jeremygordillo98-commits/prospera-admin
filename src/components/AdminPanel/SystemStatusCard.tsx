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
    resendStatus?: StatusObj | null;
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
    resendStatus,
    rowCounts,
    checkExternalApis,
    handlePurgeCache,
    handleCleanStorage,
    toggleTheme,
    isDark,
    theme,
}) => {
    const renderPill = (name: string, icon: string, statusObj: StatusObj | null | undefined) => {
        const isConn = statusObj?.status === 'connected';
        const color = isConn ? '#00D68F' : statusObj?.status === 'slow' ? '#f59e0b' : '#ef4444';

        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '12px',
                background: theme.bg,
                border: `1px solid ${theme.border}`,
                fontSize: '0.78rem',
                fontWeight: 700,
                whiteSpace: 'nowrap'
            }}>
                <span>{icon}</span>
                <span style={{ color: theme.text }}>{name}</span>
                {checkingApis && !statusObj ? (
                    <span style={{ color: theme.textSec, fontSize: '0.7rem' }}>...</span>
                ) : statusObj ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto' }}>
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
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 1. BARRA DE TELEMETRÍA EN TIEMPO REAL (HUD HUD STRIP) */}
            <div style={{
                background: theme.card,
                borderRadius: '20px',
                border: `1px solid ${theme.border}`,
                padding: '20px',
                boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.03)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '8px', borderRadius: '10px', background: theme.primary + '15', color: theme.primary }}>
                            <Activity size={18} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: theme.text }}>
                                Telemetría & Conectividad del Ecosistema
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: theme.textSec }}>
                                Semáforo en tiempo real de nodos de base de datos y microservicios integrados.
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

                {/* PILLS CONTAINER */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {/* Nodos Supabase */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '12px', background: theme.bg, border: `1px solid ${theme.border}`, fontSize: '0.78rem' }}>
                        <CheckCircle size={14} style={{ color: b2cStatus?.status === 'connected' ? '#10b981' : theme.danger }} />
                        <span style={{ fontWeight: 800, color: theme.text }}>Supabase B2C</span>
                        <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.75rem' }}>{b2cStatus ? `${b2cStatus.latency}ms` : '—'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '12px', background: theme.bg, border: `1px solid ${theme.border}`, fontSize: '0.78rem' }}>
                        <CheckCircle size={14} style={{ color: b2bStatus?.status === 'connected' ? '#8b5cf6' : theme.danger }} />
                        <span style={{ fontWeight: 800, color: theme.text }}>Supabase B2B (Pymes)</span>
                        <span style={{ color: '#8b5cf6', fontWeight: 800, fontSize: '0.75rem' }}>{b2bStatus ? `${b2bStatus.latency}ms` : '—'}</span>
                    </div>

                    {/* APIs Externas */}
                    {renderPill('Brevo Email API', '📧', brevoStatus)}
                    {renderPill('Google Analytics 4', '📊', ga4Status)}
                    {renderPill('Prospera AI', '🧠', aiStatus)}
                    {renderPill('Resend Engine', '✉️', resendStatus)}
                    {renderPill('SRI en Línea', '🏛️', sriStatus)}
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
