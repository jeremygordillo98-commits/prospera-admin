import React, { useEffect, useState } from 'react';
import { supabaseContable } from '../../services/supabaseContable';
import { useTheme } from '../../context/ThemeContext';
import { Lock, Mail, Loader2, LogOut, ChevronRight } from 'lucide-react';

const IconBriefcase = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;

export const ContableManager = () => {
    const { theme, isDark } = useTheme();
    const [accountants, setAccountants] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Auth Pymes
    const [session, setSession] = useState<any>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        setAuthLoading(true);
        const { data: { session: currentSession } } = await supabaseContable.auth.getSession();
        setSession(currentSession);
        if (currentSession) fetchAccountants();
        setAuthLoading(false);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data, error: loginError } = await supabaseContable.auth.signInWithPassword({
                email,
                password
            });
            if (loginError) throw loginError;
            setSession(data.session);
            fetchAccountants();
        } catch (err: any) {
            setError(err.message === 'Invalid login credentials' ? 'Credenciales de Pymes inválidas.' : err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAccountants = async () => {
        setLoading(true);
        const { data, error: fetchError } = await supabaseContable
            .from('perfiles')
            .select('*')
            .order('email');
        
        if (!fetchError && data) {
            setAccountants(data);
        } else {
            console.error("Error cargando contadores:", fetchError);
        }
        setLoading(false);
    };

    const updateLimit = async (userId: string, newLimit: number) => {
        const { error: updateError } = await supabaseContable
            .from('perfiles')
            .update({ limite_empresas: newLimit })
            .eq('id', userId);
        
        if (!updateError) {
            setAccountants(accountants.map(a => a.id === userId ? { ...a, limite_empresas: newLimit } : a));
            alert("✅ Límite actualizado!");
        } else {
            alert("❌ Error: " + updateError.message);
        }
    };

    const handleLogout = async () => {
        await supabaseContable.auth.signOut();
        setSession(null);
        setAccountants([]);
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
        padding: '12px 16px', 
        borderRadius: 12, 
        border: `1px solid ${theme.border}`, 
        background: theme.inputBg, 
        color: theme.text, 
        outline: 'none',
        fontSize: '0.9rem'
    };

    const filtered = accountants.filter(a => 
        (a.nombre_completo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (a.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (a.ruc_profesional?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    if (authLoading) {
        return <div className="flex-center" style={{ height: '60vh' }}><Loader2 className="animate-spin" color={theme.primary} /></div>;
    }

    if (!session) {
        return (
            <div style={{ maxWidth: 440, margin: '60px auto', animation: 'fadeIn 0.5s ease' }}>
                <div style={{ ...cardStyle, textAlign: 'center' }}>
                    <div style={{ width: 60, height: 60, borderRadius: 16, background: theme.primary + '15', color: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <Lock size={28} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 8 }}>Acceso Maestro Pymes</h2>
                    <p style={{ color: theme.textSec, fontSize: '0.9rem', marginBottom: 32 }}>Inicia sesión con tu cuenta administradora de Prospera Pymes para desbloquear los controles.</p>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, marginBottom: 6, display: 'block' }}>EMAIL DE ADMIN PYMES</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                <input 
                                    type="email" 
                                    required 
                                    style={{ ...inputStyle, width: '100%', paddingLeft: 42 }}
                                    placeholder="ejemplo@prospera.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={{ textAlign: 'left' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, marginBottom: 6, display: 'block' }}>CONTRASEÑA</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                <input 
                                    type="password" 
                                    required 
                                    style={{ ...inputStyle, width: '100%', paddingLeft: 42 }}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div style={{ fontSize: '0.8rem', color: theme.danger, fontWeight: 700, background: theme.danger + '10', padding: 12, borderRadius: 10 }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn btn-primary" 
                            style={{ padding: '14px', width: '100%', justifyContent: 'center', marginTop: 8 }}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <>Entrar al Panel Pymes <ChevronRight size={18} /></>}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, letterSpacing: '-1px' }}>Gestión de Usuarios Pymes</h2>
                    <p style={{ color: theme.textSec, marginTop: 4 }}>Control maestro de perfiles contables para el módulo Prospera Pymes</p>
                </div>
                <button 
                    onClick={handleLogout}
                    style={{ background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textSec, borderRadius: 12, padding: '8px 16px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                    <LogOut size={14} /> Salir de Pymes
                </button>
            </div>

            <div style={{ ...cardStyle, display: 'flex', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: theme.primary + '15', color: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔍</div>
                <input 
                    type="text" 
                    placeholder="Filtrar por nombre, email o RUC..." 
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                    {filtered.map(acc => (
                        <div key={acc.id} style={cardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                                <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                    {acc.email?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 900, fontSize: '1.1rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{acc.nombre_completo || 'Sin Nombre'}</div>
                                    <div style={{ fontSize: '0.8rem', color: theme.textSec }}>{acc.email}</div>
                                    <div style={{ fontSize: '0.75rem', color: theme.primary, fontWeight: 700, marginTop: 4 }}>RUC: {acc.ruc_profesional || '---'}</div>
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
