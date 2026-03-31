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

    const [counts, setCounts] = useState<any>({});

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
            .order('nombre_completo');
        
        if (!fetchError && data) {
            setAccountants(data);
            fetchUsageCounts(data);
        } else {
            console.error("Error cargando contadores:", fetchError);
        }
        setLoading(false);
    };

    const fetchUsageCounts = async (list: any[]) => {
        const newCounts: any = {};
        for (const acc of list) {
            const { count } = await supabaseContable
                .from('empresas_gestionadas')
                .select('*', { count: 'exact', head: true })
                .eq('id_usuario', acc.id_usuario);
            newCounts[acc.id_usuario] = count || 0;
        }
        setCounts(newCounts);
    };

    const updateField = async (userId: string, field: string, value: any) => {
        const { error: updateError } = await supabaseContable
            .from('perfiles')
            .update({ [field]: value })
            .eq('id_usuario', userId);
        
        if (!updateError) {
            setAccountants(prev => prev.map(a => a.id_usuario === userId ? { ...a, [field]: value } : a));
        } else {
            alert("❌ Error actualizando " + field + ": " + updateError.message);
        }
    };

    const handleResetPassword = async (email: string) => {
        const { error: resetError } = await supabaseContable.auth.resetPasswordForEmail(email);
        if (!resetError) {
            alert("📩 Correo de restauración enviado a: " + email);
        } else {
            alert("❌ Error: " + resetError.message);
        }
    };

    const updateLimit = async (userId: string, newLimit: number) => {
        const { error: updateError } = await supabaseContable
            .from('perfiles')
            .update({ limite_empresas: newLimit })
            .eq('id_usuario', userId);
        
        if (!updateError) {
            setAccountants(accountants.map(a => a.id_usuario === userId ? { ...a, limite_empresas: newLimit } : a));
            alert("✅ Límite de empresas actualizado!");
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
        (a.razon_social?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
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
                                    </div>
                                    <button 
                                        onClick={() => handleResetPassword(acc.email)}
                                        title="Restablecer Contraseña"
                                        style={{ background: theme.primary + '15', color: theme.primary, border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer' }}
                                    >
                                        <Lock size={16} />
                                    </button>
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
                                                onBlur={e => {
                                                    const val = parseInt(e.target.value);
                                                    if (val !== limit) updateField(acc.id_usuario, 'limite_empresas', val);
                                                }}
                                                style={{ ...inputStyle, width: '100%', fontWeight: 800 }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: `1px solid ${theme.border}`, fontSize: '0.85rem' }}>
                                        <span style={{ color: theme.textSec }}>Clientes en uso:</span>
                                        <span style={{ fontWeight: 800, color: usage > limit ? theme.danger : theme.text }}>{usage} / {limit}</span>
                                    </div>

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
        </div>
    );
};
