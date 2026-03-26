import React, { useEffect, useState } from 'react';
import { supabaseContable } from '../../services/supabaseContable';
import { useTheme } from '../../context/ThemeContext';

const IconUser = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconBriefcase = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;

export const ContableManager = () => {
    const { theme, isDark } = useTheme();
    const [accountants, setAccountants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAccountants();
    }, []);

    const fetchAccountants = async () => {
        setLoading(true);
        // Usamos la tabla 'perfiles' (plural) como aparece en tu Supabase
        const { data, error } = await supabaseContable
            .from('perfiles')
            .select('*')
            .order('email');
        
        if (!error && data) {
            setAccountants(data);
        } else {
            console.error("Error cargando contadores:", error);
        }
        setLoading(false);
    };

    const updateLimit = async (userId: string, newLimit: number) => {
        const { error } = await supabaseContable
            .from('perfiles')
            .update({ limite_empresas: newLimit })
            .eq('id', userId);
        
        if (!error) {
            setAccountants(accountants.map(a => a.id === userId ? { ...a, limite_empresas: newLimit } : a));
            alert("✅ Límite actualizado!");
        } else {
            alert("❌ Error: " + error.message);
        }
    };

    const cardStyle = { 
        background: theme.card, 
        borderRadius: 20, 
        border: `1px solid ${theme.border}`, 
        padding: 24, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        marginBottom: 16
    };

    const inputStyle = { 
        padding: '10px 14px', 
        borderRadius: 10, 
        border: `1px solid ${theme.border}`, 
        background: theme.inputBg, 
        color: theme.text, 
        outline: 'none' 
    };

    const filtered = accountants.filter(a => 
        (a.nombre_completo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (a.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ marginBottom: 32 }}>
                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, letterSpacing: '-1px' }}>Gestión Contable Root</h2>
                <p style={{ color: theme.textSec, marginTop: 4 }}>Controles maestros para el módulo de Prospera Contable</p>
            </div>

            <div style={{ ...cardStyle, display: 'flex', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: theme.primary + '15', color: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔍</div>
                <input 
                    type="text" 
                    placeholder="Filtrar contadores por nombre o email..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ ...inputStyle, flex: 1, border: 'none' }}
                />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: theme.textSec, fontWeight: 700 }}>SINCRONIZANDO CON SUPABASE CONTABLE...</div>
            ) : accountants.length === 0 ? (
                <div style={{ ...cardStyle, textAlign: 'center', padding: 40, border: `2px dashed ${theme.border}` }}>
                    <p style={{ color: theme.textSec, fontWeight: 800 }}>No se encontraron perfiles contables registrados.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                    {filtered.map(acc => (
                        <div key={acc.id} style={cardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                                <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                    {acc.email?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 900, fontSize: '1.1rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{acc.nombre_completo || 'Contador'}</div>
                                    <div style={{ fontSize: '0.8rem', color: theme.textSec }}>{acc.email || 'Sin correo electrónico'}</div>
                                </div>
                            </div>

                            <div style={{ background: theme.bg, padding: 20, borderRadius: 16, border: `1px solid ${theme.border}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', fontWeight: 800 }}>
                                        <IconBriefcase /> Cupo de Clientes
                                    </div>
                                    <span style={{ background: theme.primary, color: '#000', padding: '4px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 950 }}>
                                        {acc.limite_empresas || 1}
                                    </span>
                                </div>
                                
                                <label style={{ display: 'block', fontSize: '0.65rem', color: theme.textSec, fontWeight: 900, marginBottom: 5, textTransform: 'uppercase' }}>Ajsutar capacidad</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    defaultValue={acc.limite_empresas || 1}
                                    onBlur={e => {
                                        const val = parseInt(e.target.value);
                                        if (val !== acc.limite_empresas) updateLimit(acc.id, val);
                                    }}
                                    style={{ ...inputStyle, width: '100%', fontSize: '1rem', fontWeight: 800 }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
