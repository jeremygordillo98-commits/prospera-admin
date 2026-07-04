import React from 'react';
import { Trash2, Settings, Check, Edit, CheckCircle } from 'lucide-react';

interface MaintBannerState {
    activo: boolean;
    mensaje?: string;
    texto?: string;
    tipo?: string;
}

interface SystemMaintenanceCardProps {
    retencionCampanas: number;
    setRetencionCampanas: (v: number) => void;
    retencionSoporte: number;
    setRetencionSoporte: (v: number) => void;
    isEditingMaint: boolean;
    setIsEditingMaint: (v: boolean) => void;
    handleSaveMaint: () => void;
    b2cMaint: MaintBannerState;
    setB2cMaint: React.Dispatch<React.SetStateAction<MaintBannerState>>;
    b2cBanner: MaintBannerState;
    setB2cBanner: React.Dispatch<React.SetStateAction<MaintBannerState>>;
    handleSaveB2cConfig: () => void;
    loadingB2cConfig: boolean;
    b2bMaint: MaintBannerState;
    setB2bMaint: React.Dispatch<React.SetStateAction<MaintBannerState>>;
    b2bBanner: MaintBannerState;
    setB2bBanner: React.Dispatch<React.SetStateAction<MaintBannerState>>;
    handleSaveB2bConfig: () => void;
    loadingB2bConfig: boolean;
    theme: any;
    cardStyle: any;
    isDark: boolean;
}

export const SystemMaintenanceCard: React.FC<SystemMaintenanceCardProps> = ({
    retencionCampanas,
    setRetencionCampanas,
    retencionSoporte,
    setRetencionSoporte,
    isEditingMaint,
    setIsEditingMaint,
    handleSaveMaint,
    b2cMaint,
    setB2cMaint,
    b2cBanner,
    setB2cBanner,
    handleSaveB2cConfig,
    loadingB2cConfig,
    b2bMaint,
    setB2bMaint,
    b2bBanner,
    setB2bBanner,
    handleSaveB2bConfig,
    loadingB2bConfig,
    theme,
    cardStyle,
    isDark
}) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
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

            {/* CARD DE CONTROL REMOTO DE PROSPERA APP (B2C) */}
            <div style={{ ...cardStyle, width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Settings size={18} style={{ color: theme.primary }} /> Control Remoto de Prospera App (B2C)
                </h3>
                <button 
                  onClick={handleSaveB2cConfig}
                  disabled={loadingB2cConfig}
                  style={{
                    background: theme.primary,
                    color: isDark ? '#000' : '#fff',
                    border: 'none',
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
                  <CheckCircle size={14} /> {loadingB2cConfig ? 'GUARDANDO...' : 'GUARDAR APP (B2C)'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                {/* MANTENIMIENTO APP */}
                <div style={{ background: theme.bg, padding: '20px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>🛠️ Modo Mantenimiento</span>
                    <button
                      onClick={() => setB2cMaint((prev: MaintBannerState) => ({ ...prev, activo: !prev.activo }))}
                      style={{
                        width: 44, height: 22, borderRadius: 999,
                        background: b2cMaint.activo ? theme.primary : theme.border,
                        border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s', padding: 0
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: 2, left: b2cMaint.activo ? 24 : 2,
                        width: 18, height: 18, borderRadius: '50%', background: '#fff',
                        transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: theme.textSec, margin: '0 0 10px 0' }}>
                    Muestra pantalla de fuera de servicio y bloquea temporalmente el acceso de usuarios B2C.
                  </p>
                  <input
                    type="text"
                    value={b2cMaint.mensaje || ''}
                    onChange={e => setB2cMaint((prev: MaintBannerState) => ({ ...prev, mensaje: e.target.value }))}
                    placeholder="Mensaje de mantenimiento..."
                    style={{
                      width: '100%', background: theme.card, color: theme.text,
                      border: `1px solid ${theme.border}`, borderRadius: '8px',
                      padding: '8px 12px', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* BANNER GLOBAL APP */}
                <div style={{ background: theme.bg, padding: '20px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>🔔 Banner de Anuncio</span>
                    <button
                      onClick={() => setB2cBanner((prev: MaintBannerState) => ({ ...prev, activo: !prev.activo }))}
                      style={{
                        width: 44, height: 22, borderRadius: 999,
                        background: b2cBanner.activo ? theme.primary : theme.border,
                        border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s', padding: 0
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: 2, left: b2cBanner.activo ? 24 : 2,
                        width: 18, height: 18, borderRadius: '50%', background: '#fff',
                        transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={b2cBanner.texto || ''}
                      onChange={e => setB2cBanner((prev: MaintBannerState) => ({ ...prev, texto: e.target.value }))}
                      placeholder="Texto del banner..."
                      style={{
                        flex: 1, background: theme.card, color: theme.text,
                        border: `1px solid ${theme.border}`, borderRadius: '8px',
                        padding: '8px 12px', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                    <select
                      value={b2cBanner.tipo || 'info'}
                      onChange={e => setB2cBanner((prev: MaintBannerState) => ({ ...prev, tipo: e.target.value }))}
                      style={{
                        background: theme.card, color: theme.text,
                        border: `1px solid ${theme.border}`, borderRadius: '8px',
                        padding: '8px', fontSize: '0.8rem', outline: 'none', cursor: 'pointer'
                      }}
                    >
                      <option value="info">Info (Azul)</option>
                      <option value="warning">Alerta (Amarillo)</option>
                      <option value="success">Éxito (Verde)</option>
                      <option value="danger">Crítico (Rojo)</option>
                    </select>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: theme.textSec, margin: 0 }}>
                    Aviso fijado en el header superior de la aplicación B2C.
                  </p>
                </div>
              </div>
            </div>

            {/* CARD DE CONTROL REMOTO DE PROSPERA PYMES (B2B) */}
            <div style={{ ...cardStyle, width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Settings size={18} style={{ color: '#8b5cf6' }} /> Control Remoto de Prospera Pymes (B2B)
                </h3>
                <button 
                  onClick={handleSaveB2bConfig}
                  disabled={loadingB2bConfig}
                  style={{
                    background: '#8b5cf6',
                    color: '#fff',
                    border: 'none',
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
                  <CheckCircle size={14} /> {loadingB2bConfig ? 'GUARDANDO...' : 'GUARDAR PYMES (B2B)'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                {/* MANTENIMIENTO PYMES */}
                <div style={{ background: theme.bg, padding: '20px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>🛠️ Modo Mantenimiento</span>
                    <button
                      onClick={() => setB2bMaint((prev: MaintBannerState) => ({ ...prev, activo: !prev.activo }))}
                      style={{
                        width: 44, height: 22, borderRadius: 999,
                        background: b2bMaint.activo ? '#8b5cf6' : theme.border,
                        border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s', padding: 0
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: 2, left: b2bMaint.activo ? 24 : 2,
                        width: 18, height: 18, borderRadius: '50%', background: '#fff',
                        transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: theme.textSec, margin: '0 0 10px 0' }}>
                    Muestra pantalla de fuera de servicio y bloquea temporalmente el acceso de contadores.
                  </p>
                  <input
                    type="text"
                    value={b2bMaint.mensaje || ''}
                    onChange={e => setB2bMaint((prev: MaintBannerState) => ({ ...prev, mensaje: e.target.value }))}
                    placeholder="Mensaje de mantenimiento..."
                    style={{
                      width: '100%', background: theme.card, color: theme.text,
                      border: `1px solid ${theme.border}`, borderRadius: '8px',
                      padding: '8px 12px', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* BANNER GLOBAL PYMES */}
                <div style={{ background: theme.bg, padding: '20px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>🔔 Banner de Anuncio</span>
                    <button
                      onClick={() => setB2bBanner((prev: MaintBannerState) => ({ ...prev, activo: !prev.activo }))}
                      style={{
                        width: 44, height: 22, borderRadius: 999,
                        background: b2bBanner.activo ? '#8b5cf6' : theme.border,
                        border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s', padding: 0
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: 2, left: b2bBanner.activo ? 24 : 2,
                        width: 18, height: 18, borderRadius: '50%', background: '#fff',
                        transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={b2bBanner.texto || ''}
                      onChange={e => setB2bBanner((prev: MaintBannerState) => ({ ...prev, texto: e.target.value }))}
                      placeholder="Texto del banner..."
                      style={{
                        flex: 1, background: theme.card, color: theme.text,
                        border: `1px solid ${theme.border}`, borderRadius: '8px',
                        padding: '8px 12px', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                    <select
                      value={b2bBanner.tipo || 'info'}
                      onChange={e => setB2bBanner((prev: MaintBannerState) => ({ ...prev, tipo: e.target.value }))}
                      style={{
                        background: theme.card, color: theme.text,
                        border: `1px solid ${theme.border}`, borderRadius: '8px',
                        padding: '8px', fontSize: '0.8rem', outline: 'none', cursor: 'pointer'
                      }}
                    >
                      <option value="info">Info (Azul)</option>
                      <option value="warning">Alerta (Amarillo)</option>
                      <option value="success">Éxito (Verde)</option>
                      <option value="danger">Crítico (Rojo)</option>
                    </select>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: theme.textSec, margin: 0 }}>
                    Aviso fijado en el header superior de Prospera Pymes.
                  </p>
                </div>
              </div>
            </div>

        </div>
    );
};
