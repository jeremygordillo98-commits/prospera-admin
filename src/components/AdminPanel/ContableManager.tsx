import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabaseContable } from '../../services/supabaseContable';
import { useTheme } from '../../context/ThemeContext';
import { Lock, Mail, Loader2, LogOut, ChevronRight } from 'lucide-react';
import { EliminacionesTab } from './EliminacionesTab';
import { StorageMonitorTab } from './StorageMonitorTab';
import { SriCalendarioTab } from './SriCalendarioTab';
import PlantillaCuentasTab from './PlantillaCuentasTab';
import EdgeFunctionLogsTab from './EdgeFunctionLogsTab';
import RoiCalculatorTab from './RoiCalculatorTab';

import { ContadoresTab } from './ContadoresTab';
import { EmpresasTab } from './EmpresasTab';
import { ImpersonateModal } from './ImpersonateModal';

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

export const ContableManager = () => {
    const { theme, isDark } = useTheme();
    const [accountants, setAccountants] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSubTab, setActiveSubTab] = useState<'contadores' | 'empresas' | 'eliminaciones' | 'storage' | 'calendario' | 'plantilla-cuentas' | 'logs-functions' | 'calculadora-roi'>('contadores');
    const [companySearchTerm, setCompanySearchTerm] = useState('');
    
    // Auth Pymes
    const [session, setSession] = useState<any>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [counts, setCounts] = useState<any>({});
    const [empresas, setEmpresas] = useState<Record<string, any[]>>({});
    const [allCompanies, setAllCompanies] = useState<any[]>([]);
    const [colaboradoresGlobal, setColaboradoresGlobal] = useState<any[]>([]);
    const [impersonateModal, setImpersonateModal] = useState<{
        isOpen: boolean;
        email: string;
        actionLink?: string;
        loading: boolean;
        error?: string;
    } | null>(null);
    const [deleteAccountantModal, setDeleteAccountantModal] = useState<any | null>(null);
    const [deleteSuccessModal, setDeleteSuccessModal] = useState<string | null>(null);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        setAuthLoading(true);
        const { data: { session: currentSession } } = await supabaseContable.auth.getSession();
        setSession(currentSession);
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
        } catch (err: any) {
            setError(err.message === 'Invalid login credentials' ? 'Credenciales de Pymes inválidas.' : err.message);
        } finally {
            setLoading(false);
        }
    };

    const { data: queryData, isLoading: isFetchingAcc, refetch } = useQuery({
        queryKey: ['accountantsData'],
        enabled: !!session,
        queryFn: async () => {
            const { data, error: fetchError } = await supabaseContable
                .from('perfiles')
                .select('*')
                .order('nombre_completo');
            if (fetchError) throw fetchError;

            const profiles = (data || []).filter(p => p.rol !== 'admin');
            const newCounts: any = {};
            const newEmpresas: any = {};
            for (const acc of profiles) {
                const { data: empData } = await supabaseContable
                    .from('empresas_gestionadas')
                    .select('id, nombre_empresa, ruc_empresa, permiso_reportes_pdf, permiso_descarga_ats, permiso_comunicacion_cliente')
                    .eq('id_usuario', acc.id_usuario);
                newCounts[acc.id_usuario] = empData?.length || 0;
                newEmpresas[acc.id_usuario] = empData || [];
            }

            const { data: allCompanies, error: errAll } = await supabaseContable
                .from('empresas_gestionadas')
                .select('*')
                .order('nombre_empresa');

            const { data: colabData } = await supabaseContable
                .from('colaboradores_empresa')
                .select('*');

            return { profiles, counts: newCounts, empresas: newEmpresas, allCompanies: allCompanies || [], colaboradores: colabData || [] };
        }
    });

    useEffect(() => {
        if (queryData) {
            setAccountants(queryData.profiles);
            setCounts(queryData.counts);
            setEmpresas(queryData.empresas || {});
            setAllCompanies(queryData.allCompanies || []);
            setColaboradoresGlobal(queryData.colaboradores || []);
        }
    }, [queryData]);

    const handleAddColaborador = async (companyId: string, userId: string) => {
        if (!userId) return;
        const user = accountants.find(a => a.id_usuario === userId);
        if (!user) return;
        
        setLoading(true);
        try {
            const { error } = await supabaseContable.from('colaboradores_empresa').insert({
                id_empresa: companyId,
                id_usuario: userId,
                email_invitado: user.email,
                rol: 'colaborador'
            });
            if (error) {
                if (error.code === '23505' || error.message.includes('unique')) alert('Este usuario ya es colaborador.');
                else throw error;
            } else {
                alert('Colaborador asignado correctamente.');
                await refetch();
            }
        } catch (err: any) {
            alert('Error al asignar colaborador: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveColaborador = async (colabId: string) => {
        if (!window.confirm("¿Seguro de remover este colaborador?")) return;
        setLoading(true);
        try {
            const { error } = await supabaseContable.from('colaboradores_empresa').delete().eq('id', colabId);
            if (error) throw error;
            await refetch();
        } catch (err: any) {
            alert('Error al remover colaborador: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(isFetchingAcc);
    }, [isFetchingAcc]);

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
        if (window.confirm(`⚠️ ¿Enviar correo de restablecimiento a ${email}?`)) {
            const { error } = await supabaseContable.auth.resetPasswordForEmail(email, { redirectTo: 'https://prospera-pymes.vercel.app/profile' });
            if (error) alert('❌ Error: ' + error.message);
            else alert('✅ Correo enviado a ' + email);
        }
    };

    const handleImpersonate = (email: string) => {
        setImpersonateModal({ isOpen: true, email, loading: false });
    };

    const handleDeleteAccountantClick = (acc: any) => {
        const usage = counts[acc.id_usuario] || 0;
        if (usage > 0) {
            alert(`⚠️ No se puede eliminar a este contador porque todavía tiene ${usage} empresa(s) asignada(s). Primero debes eliminar o reasignar sus empresas.`);
            return;
        }
        setDeleteAccountantModal(acc);
    };

    const confirmDeleteAccountant = async () => {
        if (!deleteAccountantModal) return;
        const acc = deleteAccountantModal;
        setDeleteAccountantModal(null);
        setLoading(true);
        try {
            // 1. Eliminar colaboraciones asociadas
            const { error: colabErr } = await supabaseContable
                .from('colaboradores_empresa')
                .delete()
                .eq('id_usuario', acc.id_usuario);
            if (colabErr) throw colabErr;

            // 2. Eliminar perfil de la tabla 'perfiles'
            const { error: profileErr } = await supabaseContable
                .from('perfiles')
                .delete()
                .eq('id_usuario', acc.id_usuario);
            if (profileErr) throw profileErr;

            setDeleteSuccessModal(`El perfil de "${acc.nombre_completo || acc.email}" ha sido eliminado exitosamente.`);
            await refetch();
        } catch (err: any) {
            alert(`❌ Error al eliminar contador: ${err.message || err}`);
        } finally {
            setLoading(false);
        }
    };

    const updateLimit = async (userId: string, newLimit: number) => {
        const usage = counts[userId] || 0;
        if (newLimit < usage) {
            alert(`⚠️ No puedes establecer un cupo menor a la cantidad de clientes actuales (${usage}).`);
            return;
        }
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

    const reassignCompany = async (companyId: string, newOwnerId: string) => {
        if (!newOwnerId) return;
        if (!window.confirm("¿Estás seguro de reasignar esta empresa a otro contador?")) return;
        
        setLoading(true);
        try {
            const { error: updateError } = await supabaseContable
                .from('empresas_gestionadas')
                .update({ id_usuario: newOwnerId })
                .eq('id', companyId);
                
            if (updateError) throw updateError;
            
            alert("✅ Empresa reasignada con éxito!");
            await refetch();
        } catch (err: any) {
            alert("❌ Error al reasignar: " + (err.message || err));
        } finally {
            setLoading(false);
        }
    };

    const updateCompanyPermission = async (companyId: string, ownerId: string, field: string, value: boolean) => {
        setLoading(true);
        try {
            const { error: updateError } = await supabaseContable
                .from('empresas_gestionadas')
                .update({ [field]: value })
                .eq('id', companyId);
                
            if (updateError) throw updateError;
            
            // Actualizar estado localmente
            setEmpresas(prev => {
                const list = prev[ownerId] || [];
                return {
                    ...prev,
                    [ownerId]: list.map(emp => emp.id === companyId ? { ...emp, [field]: value } : emp)
                };
            });
            setAllCompanies(prev => prev.map(c => c.id === companyId ? { ...c, [field]: value } : c));
        } catch (err: any) {
            alert("❌ Error al actualizar permiso: " + (err.message || err));
        } finally {
            setLoading(false);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
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

            {/* Selector de sub-pestañas */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: `1px solid ${theme.border}`, paddingBottom: 16, flexWrap: 'wrap' }}>
                {[
                  { id: 'contadores', label: 'Gestión de Contadores', emoji: '💼' },
                  { id: 'empresas', label: 'Clientes (Empresas)', emoji: '🏢' },
                  { id: 'eliminaciones', label: 'Eliminaciones', emoji: '🗑️' },
                  { id: 'storage', label: 'Storage', emoji: '📦' },
                  { id: 'calendario', label: 'Calendario SRI', emoji: '📅' },
                  { id: 'plantilla-cuentas', label: 'Plantilla Cuentas', emoji: '📋' },
                  { id: 'logs-functions', label: 'Logs Funciones', emoji: '⚙️' },
                  { id: 'calculadora-roi', label: 'Calculadora ROI', emoji: '🧮' },
                ].map(tab => {
                  const active = activeSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSubTab(tab.id as any)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: 12,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        transition: 'all 0.2s',
                        background: active ? theme.primary : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                        color: active ? (isDark ? '#000' : '#fff') : theme.textSec,
                        boxShadow: active ? `0 4px 15px ${theme.primary}30` : 'none'
                      }}
                    >
                      {tab.emoji} {tab.label}
                    </button>
                  );
                })}
            </div>

            {activeSubTab === 'contadores' ? (
                <ContadoresTab
                    loading={loading}
                    accountants={accountants}
                    filtered={filtered}
                    counts={counts}
                    empresas={empresas}
                    updateField={updateField}
                    handleResetPassword={handleResetPassword}
                    handleImpersonate={handleImpersonate}
                    handleDeleteAccountantClick={handleDeleteAccountantClick}
                    updateLimit={updateLimit}
                    updateCompanyPermission={updateCompanyPermission}
                    reassignCompany={reassignCompany}
                    theme={theme}
                    isDark={isDark}
                    cardStyle={cardStyle}
                    inputStyle={inputStyle}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />
            ) : activeSubTab === 'empresas' ? (
                <EmpresasTab
                    allCompanies={allCompanies}
                    accountants={accountants}
                    colaboradoresGlobal={colaboradoresGlobal}
                    companySearchTerm={companySearchTerm}
                    setCompanySearchTerm={setCompanySearchTerm}
                    handleAddColaborador={handleAddColaborador}
                    handleRemoveColaborador={handleRemoveColaborador}
                    updateCompanyPermission={updateCompanyPermission}
                    reassignCompany={reassignCompany}
                    theme={theme}
                    isDark={isDark}
                    cardStyle={cardStyle}
                    inputStyle={inputStyle}
                />
            ) : null}

            {activeSubTab === 'eliminaciones' && <EliminacionesTab />}
            {activeSubTab === 'storage' && <StorageMonitorTab />}
            {activeSubTab === 'calendario' && <SriCalendarioTab />}
            {activeSubTab === 'plantilla-cuentas' && <PlantillaCuentasTab />}
            {activeSubTab === 'logs-functions' && <EdgeFunctionLogsTab />}
            {activeSubTab === 'calculadora-roi' && <RoiCalculatorTab />}

            {/* MODAL DE IMPERSONACIÓN PREMIUM */}
            <ImpersonateModal
                isOpen={!!(impersonateModal && impersonateModal.isOpen)}
                email={impersonateModal?.email || ''}
                actionLink={impersonateModal?.actionLink}
                loading={!!impersonateModal?.loading}
                error={impersonateModal?.error}
                onClose={() => setImpersonateModal(null)}
                onGenerate={async () => {
                    if (!impersonateModal) return;
                    setImpersonateModal(prev => prev ? { ...prev, loading: true } : null);
                    try {
                        const { data, error } = await supabaseContable.functions.invoke('impersonate-user', {
                            body: { email: impersonateModal.email }
                        });
                        if (error) {
                            console.error("Error completo de Edge Function:", error);
                            let detailMsg = "";
                            try {
                                const text = await error.context?.text();
                                if (text) {
                                    const parsed = JSON.parse(text);
                                    detailMsg = parsed.error || parsed.message;
                                }
                            } catch (e) {
                                console.error("No se pudo parsear el error context:", e);
                            }
                            throw new Error(detailMsg || error.message || "Error al invocar Edge Function");
                        }
                        if (data?.action_link) {
                            setImpersonateModal(prev => prev ? { ...prev, loading: false, actionLink: data.action_link } : null);
                        } else {
                            throw new Error('No se recibió enlace de retorno.');
                        }
                    } catch (err: any) {
                        setImpersonateModal(prev => prev ? { ...prev, loading: false, error: err.message || 'Error en Edge Function' } : null);
                    }
                }}
                theme={theme}
                isDark={isDark}
            />

            {/* MODAL PERSONALIZADO DE CONFIRMACIÓN DE ELIMINACIÓN DE CONTADOR */}
            {deleteAccountantModal && (
              <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2147483647,
                padding: 16
              }} onClick={() => setDeleteAccountantModal(null)}>
                <div style={{
                  background: isDark ? '#1e293b' : '#ffffff',
                  border: `1px solid ${theme.border}`,
                  borderRadius: 24,
                  width: '100%',
                  maxWidth: 440,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                  overflow: 'hidden',
                  padding: '32px 24px',
                  color: theme.text
                }} onClick={e => e.stopPropagation()}>
                  
                  {/* Localhost header style from mockup */}
                  <div style={{
                    textAlign: 'left',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: isDark ? '#e2e8f0' : '#1e293b',
                    marginBottom: 20
                  }}>
                    localhost:5175 dice
                  </div>

                  {/* Warning and question */}
                  <div style={{
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    color: theme.text,
                    lineHeight: '1.5',
                    marginBottom: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⚠️</span>
                      <span style={{ fontWeight: 700 }}>
                        ¿Estás seguro de que deseas eliminar al contador "{deleteAccountantModal.nombre_completo || deleteAccountantModal.email}"?
                      </span>
                    </div>
                    <div style={{ paddingLeft: 22, color: theme.textSec }}>
                      Esta acción eliminará su perfil de la base de datos de Prospera Pymes.
                    </div>
                  </div>

                  {/* Actions (Pill style buttons from mockup) */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 28 }}>
                    <button
                      onClick={confirmDeleteAccountant}
                      style={{
                        background: '#7c3040', // Burgundy color
                        color: '#ffffff',
                        border: '2px solid #7c3040',
                        padding: '10px 28px',
                        borderRadius: 24,
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        transition: 'all 0.2s',
                        outline: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() => setDeleteAccountantModal(null)}
                      style={{
                        background: '#fbcfe8', // Pink background
                        color: '#7c3040',      // Burgundy text
                        border: 'none',
                        padding: '10px 28px',
                        borderRadius: 24,
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        transition: 'all 0.2s',
                        outline: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL PERSONALIZADO DE ÉXITO DE ELIMINACIÓN DE CONTADOR */}
            {deleteSuccessModal && (
              <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2147483647,
                padding: 16
              }} onClick={() => setDeleteSuccessModal(null)}>
                <div style={{
                  background: isDark ? '#1e293b' : '#ffffff',
                  border: `1px solid ${theme.border}`,
                  borderRadius: 24,
                  width: '100%',
                  maxWidth: 440,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                  overflow: 'hidden',
                  padding: '32px 24px',
                  color: theme.text
                }} onClick={e => e.stopPropagation()}>
                  
                  {/* Localhost header style from mockup */}
                  <div style={{
                    textAlign: 'left',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: isDark ? '#e2e8f0' : '#1e293b',
                    marginBottom: 20
                  }}>
                    localhost:5175 dice
                  </div>

                  {/* Success message from mockup */}
                  <div style={{
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    color: theme.text,
                    lineHeight: '1.5',
                    marginBottom: 24,
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>✅</span>
                    <span>
                      {deleteSuccessModal}
                    </span>
                  </div>

                  {/* Actions (Pill style button on the right) */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
                    <button
                      onClick={() => setDeleteSuccessModal(null)}
                      style={{
                        background: '#7c3040', // Burgundy color
                        color: '#ffffff',
                        border: '2px solid #7c3040',
                        padding: '10px 28px',
                        borderRadius: 24,
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        transition: 'all 0.2s',
                        outline: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      Aceptar
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
    );
};
