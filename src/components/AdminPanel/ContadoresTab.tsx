import React from 'react';
import { Lock, Eye, Trash2 } from 'lucide-react';

interface ContadoresTabProps {
    loading: boolean;
    accountants: any[];
    filtered: any[];
    counts: Record<string, number>;
    empresas: Record<string, any[]>;
    updateField: (userId: string, field: string, value: any) => Promise<void>;
    handleResetPassword: (email: string) => Promise<void>;
    handleImpersonate: (email: string) => void;
    handleDeleteAccountantClick: (acc: any) => void;
    updateLimit: (userId: string, val: number) => Promise<void>;
    updateCompanyPermission: (companyId: string, ownerId: string, field: string, value: boolean) => Promise<void>;
    reassignCompany: (companyId: string, newOwnerId: string) => Promise<void>;
    theme: any;
    isDark: boolean;
    cardStyle: any;
    inputStyle: any;
    searchTerm: string;
    setSearchTerm: (val: string) => void;
}

const formatLastAccess = (dateStr?: string) => {
  if (!dateStr) return 'Nunca';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('es-EC', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch (e) {
    return '---';
  }
};

export const ContadoresTab: React.FC<ContadoresTabProps> = ({
    loading,
    accountants,
    filtered,
    counts,
    empresas,
    updateField,
    handleResetPassword,
    handleImpersonate,
    handleDeleteAccountantClick,
    updateLimit,
    updateCompanyPermission,
    reassignCompany,
    theme,
    isDark,
    cardStyle,
    inputStyle,
    searchTerm,
    setSearchTerm
}) => {
    return (
        <>
            <div style={{ ...cardStyle, display: 'flex', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: theme.primary + '15', color: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔍</div>
                <input 
                    type="text" 
                    placeholder="Filtrar por nombre, Razón Social, email o RUC..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ ...inputStyle, flex: 1, border: 'none' }}
                />
            </div>

            {loading && accountants.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: theme.textSec, fontWeight: 700 }}>SINCRONIZANDO CON SUPABASE PYMES...</div>
            ) : accountants.length === 0 ? (
                <div style={{ ...cardStyle, textAlign: 'center', padding: 40, border: `2px dashed ${theme.border}` }}>
                    <p style={{ color: theme.textSec, fontWeight: 800 }}>No se encontraron perfiles contables registrados.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
                    {filtered.map(acc => {
                        const usage = counts[acc.id_usuario] || 0;
                        const limit = acc.limite_empresas || 1;
                        const price = acc.precio_por_cliente || 0;
                        const totalActual = usage * price;
                        const totalProyectado = limit * price;

                        return (
                            <div key={acc.id_usuario} style={cardStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                        {acc.email?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <label style={{ fontSize: '0.65rem', color: theme.textSec, fontWeight: 900, marginBottom: 4, display: 'block' }}>NOMBRE COMPLETO</label>
                                        <input 
                                            defaultValue={acc.nombre_completo || 'Sin Nombre'}
                                            onBlur={e => { if(e.target.value !== acc.nombre_completo) updateField(acc.id_usuario, 'nombre_completo', e.target.value) }}
                                            style={{ ...inputStyle, width: '100%', fontWeight: 900, fontSize: '1.05rem' }}
                                        />
                                        <div style={{ fontSize: '0.8rem', color: theme.textSec, marginTop: 4 }}>{acc.email}</div>
                                        <div style={{ fontSize: '0.72rem', color: theme.textSec, marginTop: 4, fontWeight: 700 }}>
                                            Ingreso: {formatLastAccess(acc.ultimo_acceso)}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button 
                                            onClick={() => handleResetPassword(acc.email)}
                                            title="Restablecer Contraseña"
                                            style={{ background: theme.primary + '15', color: theme.primary, border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', transition: 'all 0.2s' }}
                                        >
                                            <Lock size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleImpersonate(acc.email)}
                                            title="Ver como Usuario"
                                            style={{ background: '#8b5cf615', color: '#8b5cf6', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', transition: 'all 0.2s' }}
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteAccountantClick(acc)}
                                            title="Eliminar Contador"
                                            style={{ background: theme.danger + '15', color: theme.danger, border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', transition: 'all 0.2s' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                    <div>
                                        <label style={{ fontSize: '0.65rem', color: theme.textSec, fontWeight: 900, marginBottom: 4, display: 'block' }}>RAZÓN SOCIAL</label>
                                        <input 
                                            defaultValue={acc.razon_social || ''}
                                            placeholder="Nombre comercial..."
                                            onBlur={e => { if(e.target.value !== acc.razon_social) updateField(acc.id_usuario, 'razon_social', e.target.value) }}
                                            style={{ ...inputStyle, width: '100%' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.65rem', color: theme.textSec, fontWeight: 900, marginBottom: 4, display: 'block' }}>RUC</label>
                                        <input 
                                            defaultValue={acc.ruc_profesional || ''}
                                            onBlur={e => { if(e.target.value !== acc.ruc_profesional) updateField(acc.id_usuario, 'ruc_profesional', e.target.value) }}
                                            style={{ ...inputStyle, width: '100%' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ background: theme.bg, padding: 16, borderRadius: 16, border: `1px solid ${theme.border}` }}>
                                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '0.65rem', color: theme.textSec, fontWeight: 900, marginBottom: 4, display: 'block' }}>REGLA DE COBRO ($)</label>
                                            <input 
                                                type="number"
                                                defaultValue={acc.precio_por_cliente || 0}
                                                onBlur={e => {
                                                    const val = parseFloat(e.target.value);
                                                    if (val !== acc.precio_por_cliente) updateField(acc.id_usuario, 'precio_por_cliente', val);
                                                }}
                                                style={{ ...inputStyle, width: '100%', fontWeight: 800, color: theme.primary }}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '0.65rem', color: theme.textSec, fontWeight: 900, marginBottom: 4, display: 'block' }}>CUPO MÁXIMO</label>
                                            <input 
                                                type="number"
                                                defaultValue={limit}
                                                min={usage}
                                                onBlur={e => {
                                                    const val = parseInt(e.target.value);
                                                    const usage = counts[acc.id_usuario] || 0;
                                                    if (val < usage) {
                                                        alert(`⚠️ El cupo mínimo permitido es ${usage} (clientes en uso).`);
                                                        e.target.value = limit.toString(); // Revertir visualmente
                                                        return;
                                                    }
                                                    if (val !== limit) updateLimit(acc.id_usuario, val);
                                                }}
                                                style={{ ...inputStyle, width: '100%', fontWeight: 800 }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: `1px solid ${theme.border}`, fontSize: '0.85rem' }}>
                                        <span style={{ color: theme.textSec }}>Clientes en uso:</span>
                                        <span style={{ fontWeight: 800, color: usage > limit ? theme.danger : theme.text }}>{usage} / {limit}</span>
                                    </div>

                                    {/* Listado de Empresas Colapsable con switches de permisos */}
                                    {usage > 0 && (
                                        <div style={{ marginTop: 2, marginBottom: 10 }}>
                                            <details style={{ cursor: 'pointer' }}>
                                                <summary style={{ fontSize: '0.78rem', color: theme.primary, fontWeight: 700, outline: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <span>📁 Ver listado de clientes y permisos</span>
                                                </summary>
                                                <div style={{ 
                                                    marginTop: 8, 
                                                    padding: '8px 12px', 
                                                    background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', 
                                                    borderRadius: 12,
                                                    border: `1px solid ${theme.border}`,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 12
                                                }}>
                                                    {(empresas[acc.id_usuario] || []).map((emp: any, idx: number, arr: any[]) => (
                                                        <div key={emp.id} style={{ 
                                                            display: 'flex', 
                                                            flexDirection: 'column',
                                                            gap: 6,
                                                            paddingBottom: idx === arr.length - 1 ? 0 : 8,
                                                            borderBottom: idx === arr.length - 1 ? 'none' : `1px solid ${theme.border}`
                                                        }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', gap: 10 }}>
                                                                 <span style={{ fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                     {emp.id_usuario === acc.id_usuario ? '🏢' : '🤝'} {emp.nombre_empresa}
                                                                     {emp.id_usuario !== acc.id_usuario && (
                                                                         <span style={{ fontSize: '0.62rem', color: theme.primary, background: theme.primary + '15', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>Colaborador</span>
                                                                     )}
                                                                 </span>
                                                                 <span style={{ color: theme.textSec, fontFamily: 'monospace', flexShrink: 0 }}>
                                                                     RUC: {emp.ruc_empresa}
                                                                 </span>
                                                            </div>
                                                            {/* Switches de Licencias y Reasignación */}
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                                                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                                    {[
                                                                        { key: 'permiso_reportes_pdf', label: '📊 Reportes' },
                                                                        { key: 'permiso_descarga_ats', label: '🧾 ATS' },
                                                                        { key: 'permiso_comunicacion_cliente', label: '✉️ Mailer' }
                                                                    ].map(p => {
                                                                        const active = !!emp[p.key];
                                                                        return (
                                                                            <button
                                                                                key={p.key}
                                                                                onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    e.stopPropagation();
                                                                                    updateCompanyPermission(emp.id, acc.id_usuario, p.key, !active);
                                                                                }}
                                                                                style={{
                                                                                    fontSize: '0.68rem',
                                                                                    padding: '4px 8px',
                                                                                    borderRadius: '6px',
                                                                                    cursor: 'pointer',
                                                                                    background: active ? theme.primary + '15' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                                                                                    color: active ? theme.primary : theme.textSec,
                                                                                    fontWeight: active ? 800 : 500,
                                                                                    border: active ? `1px solid ${theme.primary}40` : `1px solid ${theme.border}`,
                                                                                    display: 'inline-flex',
                                                                                    alignItems: 'center',
                                                                                    gap: 4
                                                                                }}
                                                                            >
                                                                                {p.label}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>

                                                                <select
                                                                    value={emp.id_usuario || ''}
                                                                    onChange={e => reassignCompany(emp.id, e.target.value)}
                                                                    onClick={e => e.stopPropagation()}
                                                                    style={{
                                                                        padding: '4px 8px',
                                                                        borderRadius: '8px',
                                                                        border: `1px solid ${theme.border}`,
                                                                        background: theme.card,
                                                                        color: theme.text,
                                                                        fontSize: '0.68rem',
                                                                        fontWeight: 700,
                                                                        cursor: 'pointer',
                                                                        outline: 'none',
                                                                        maxWidth: '140px'
                                                                    }}
                                                                >
                                                                    <option value="">Reasignar...</option>
                                                                    {accountants.map(a => (
                                                                        <option key={a.id_usuario} value={a.id_usuario}>
                                                                            {a.nombre_completo}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, fontWeight: 900, fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.65rem', color: theme.textSec }}>COBRO ACTUAL</span>
                                            <span style={{ color: theme.primary }}>${totalActual.toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                                            <span style={{ fontSize: '0.65rem', color: theme.textSec }}>COBRO ESPERADO</span>
                                            <span style={{ color: theme.textSec }}>${totalProyectado.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
};
