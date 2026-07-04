import React from 'react';

interface EmpresasTabProps {
    allCompanies: any[];
    accountants: any[];
    colaboradoresGlobal: any[];
    companySearchTerm: string;
    setCompanySearchTerm: (val: string) => void;
    handleAddColaborador: (companyId: string, userId: string) => Promise<void>;
    handleRemoveColaborador: (colabId: string) => Promise<void>;
    updateCompanyPermission: (companyId: string, ownerId: string, field: string, value: boolean) => Promise<void>;
    reassignCompany: (companyId: string, newOwnerId: string) => Promise<void>;
    theme: any;
    isDark: boolean;
    cardStyle: any;
    inputStyle: any;
}

export const EmpresasTab: React.FC<EmpresasTabProps> = ({
    allCompanies,
    accountants,
    colaboradoresGlobal,
    companySearchTerm,
    setCompanySearchTerm,
    handleAddColaborador,
    handleRemoveColaborador,
    updateCompanyPermission,
    reassignCompany,
    theme,
    isDark,
    cardStyle,
    inputStyle
}) => {
    return (
        <>
            <div style={{ ...cardStyle, display: 'flex', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: theme.primary + '15', color: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔍</div>
                <input 
                    type="text" 
                    placeholder="Buscar empresa por nombre, RUC o contador..." 
                    value={companySearchTerm}
                    onChange={e => setCompanySearchTerm(e.target.value)}
                    style={{ ...inputStyle, flex: 1, border: 'none' }}
                />
            </div>

            {allCompanies.length === 0 ? (
                <div style={{ ...cardStyle, textAlign: 'center', padding: 40, border: `2px dashed ${theme.border}` }}>
                    <p style={{ color: theme.textSec, fontWeight: 800 }}>No hay empresas registradas.</p>
                </div>
            ) : (
                <div style={{ ...cardStyle, overflowX: 'auto', padding: 0, borderRadius: 20, border: `1px solid ${theme.border}` }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${theme.border}`, background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 900, color: theme.textSec, letterSpacing: '1px' }}>EMPRESA</th>
                                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 900, color: theme.textSec, letterSpacing: '1px' }}>RUC</th>
                                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 900, color: theme.textSec, letterSpacing: '1px' }}>LOGO</th>
                                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 900, color: theme.textSec, letterSpacing: '1px' }}>CONTADOR ASOCIADO</th>
                                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 900, color: theme.textSec, letterSpacing: '1px', textAlign: 'center' }}>PERMISOS</th>
                                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 900, color: theme.textSec, letterSpacing: '1px' }}>COLABORADORES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allCompanies.filter(c => {
                                const owner = accountants.find(a => a.id_usuario === c.id_usuario);
                                const search = companySearchTerm.toLowerCase();
                                return (
                                    (c.nombre_empresa || '').toLowerCase().includes(search) ||
                                    (c.ruc_empresa || '').toLowerCase().includes(search) ||
                                    (owner?.nombre_completo || '').toLowerCase().includes(search) ||
                                    (owner?.email || '').toLowerCase().includes(search)
                                );
                            }).map((c, idx) => {
                                const ownerProfile = accountants.find(a => a.id_usuario === c.id_usuario);
                                const hasLogo = !!c.logo_url;
                                
                                return (
                                    <tr key={c.id} style={{ borderBottom: `1px solid ${theme.border}`, background: idx % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)') }}>
                                        <td style={{ padding: '16px 20px', fontWeight: 800, color: theme.text }}>
                                            🏢 {c.nombre_empresa}
                                        </td>
                                        <td style={{ padding: '16px 20px', fontFamily: 'monospace', color: theme.textSec }}>
                                            {c.ruc_empresa || 'N/A'}
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            {hasLogo ? (
                                                <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '4px 8px', borderRadius: '6px', background: '#10b98115', color: '#10b981', border: '1px solid #10b98130' }}>
                                                    ✓ Con Logo
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '4px 8px', borderRadius: '6px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: theme.textSec, border: `1px solid ${theme.border}` }}>
                                                    ✗ Sin Logo
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            {ownerProfile ? (
                                                <div>
                                                    <div style={{ fontWeight: 750, fontSize: '0.85rem' }}>{ownerProfile.nombre_completo}</div>
                                                    <div style={{ fontSize: '0.75rem', color: theme.textSec }}>{ownerProfile.email}</div>
                                                </div>
                                            ) : (
                                                <span style={{ color: theme.danger, fontWeight: 700, fontSize: '0.82rem' }}>⚠️ ID Huérfano: {c.id_usuario}</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                                {[
                                                    { key: 'permiso_reportes_pdf', label: '📊 Reportes' },
                                                    { key: 'permiso_descarga_ats', label: '🧾 ATS' },
                                                    { key: 'permiso_comunicacion_cliente', label: '✉️ Mailer' }
                                                ].map(p => {
                                                    const active = !!c[p.key];
                                                    return (
                                                        <span
                                                            key={p.key}
                                                            style={{
                                                                fontSize: '0.68rem',
                                                                padding: '4px 8px',
                                                                borderRadius: '6px',
                                                                background: active ? theme.primary + '15' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                                                                color: active ? theme.primary : theme.textSec,
                                                                fontWeight: active ? 800 : 500,
                                                                border: active ? `1px solid ${theme.primary}30` : `1px solid ${theme.border}`,
                                                                opacity: active ? 1 : 0.4,
                                                                userSelect: 'none'
                                                            }}
                                                        >
                                                            {p.label}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                {colaboradoresGlobal.filter(col => col.id_empresa === c.id).map(col => (
                                                    <div key={col.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', padding: '4px 8px', borderRadius: 6 }}>
                                                        <span style={{ fontSize: '0.75rem' }}>{col.email_invitado}</span>
                                                        <button onClick={() => handleRemoveColaborador(col.id)} style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>✕</button>
                                                    </div>
                                                ))}
                                                <select
                                                    onChange={e => {
                                                        handleAddColaborador(c.id, e.target.value);
                                                        e.target.value = '';
                                                    }}
                                                    style={{
                                                        padding: '6px',
                                                        borderRadius: '6px',
                                                        border: `1px solid ${theme.border}`,
                                                        background: theme.card,
                                                        color: theme.text,
                                                        fontSize: '0.75rem',
                                                        outline: 'none',
                                                    }}
                                                >
                                                    <option value="">+ Añadir Colaborador...</option>
                                                    {accountants.filter(a => a.id_usuario !== c.id_usuario).map(a => (
                                                        <option key={a.id_usuario} value={a.id_usuario}>
                                                            {a.nombre_completo} ({a.email})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
};
