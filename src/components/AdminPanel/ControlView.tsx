import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../context/ThemeContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Loader2 } from 'lucide-react';

import { UserDetailsSidebar } from './UserDetailsSidebar';
import { ControlFiltersHeader } from './ControlFiltersHeader';

const IconKey = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>;
const IconSettings = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconEye = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;

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

export default function ControlView() {
  const { theme, isDark } = useTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('todos');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [impersonateModal, setImpersonateModal] = useState<{
    isOpen: boolean;
    email: string;
    actionLink?: string;
    loading: boolean;
    error?: string;
  } | null>(null);

  const { data: fetchedUsers, isLoading: loading } = useQuery({
    queryKey: ['usuariosAdmin'],
    queryFn: async () => {
      const { data, error } = await supabase.from('perfiles').select('*').order('creado_en', { ascending: false });
      if (error) throw error;
      return (data || []).filter(u => u.rol !== 'admin');
    }
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (fetchedUsers) {
      setUsers(fetchedUsers);
    }
  }, [fetchedUsers]);

  const handleResetPassword = async (email: string) => {
    if (window.confirm(`⚠️ ¿Enviar correo de restablecimiento a ${email}?`)) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://prospera-finanzas.vercel.app/profile' });
      if (error) alert('❌ Error: ' + error.message);
      else alert('✅ Correo enviado a ' + email);
    }
  };

  const handleImpersonate = (email: string) => {
    setImpersonateModal({ isOpen: true, email, loading: false });
  };

  const togglePermission = async (userId: string, field: string, currentValue: boolean) => {
    const newValue = !currentValue;
    setUsers(users.map(u => u.id === userId ? { ...u, [field]: newValue } : u));
    if (selectedUser && selectedUser.id === userId) setSelectedUser({ ...selectedUser, [field]: newValue });
    await supabase.from('perfiles').update({ [field]: newValue }).eq('id', userId);
  };

  const getLoyaltyInfo = (u: any) => {
    const created = new Date(u.creado_en).getTime();
    const now = new Date().getTime();
    const days = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    
    if (days < 30) return { label: 'PRUEBA', color: '#3b82f6', bg: '#3b82f615', border: '#3b82f630', days };
    if (days < 90) return { label: 'NIVEL ORO', color: '#f59e0b', bg: '#f59e0b15', border: '#f59e0b30', days };
    return { label: 'PLATINO', color: '#10b981', bg: '#10b98115', border: '#10b98130', days };
  };

  const getUserStatus = (u: any) => {
    const ultraCount = (u.permiso_chat ? 1 : 0) + (u.permiso_magic ? 1 : 0) + (u.permiso_insights ? 1 : 0) + (u.permiso_reporte_comparativo ? 1 : 0) + (u.permiso_reporte_calor ? 1 : 0);
    if (ultraCount > 0) return { label: `ULTRA`, color: '#c084fc', bg: '#c084fc20', border: '#c084fc40' }; 
    const proCount = (u.permiso_conciliacion ? 1 : 0) + (u.permiso_subcategorias ? 1 : 0) + (u.permiso_reporte_patrimonio ? 1 : 0) + (u.permiso_reporte_estado ? 1 : 0) + (u.permiso_reporte_flujo ? 1 : 0);
    if (proCount > 0) return { label: `PRO`, color: '#10b981', bg: '#10b98120', border: '#10b98140' };
    return { label: `BÁSICO`, color: '#3b82f6', bg: '#3b82f620', border: '#3b82f640' };
  };

  const filteredUsers = users.filter(u => {
      const matchSearch = (u.nombre_completo || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const status = getUserStatus(u).label.toLowerCase();
      const matchPlan = planFilter === 'todos' || status === planFilter.toLowerCase();
      return matchSearch && matchPlan;
  });

  const exportToExcel = () => {
    const data = filteredUsers.map(u => ({
      "Nombre Completo": u.nombre_completo || '---',
      "Correo Electrónico": u.email,
      "País": u.pais || '---',
      "Celular": u.celular || '---',
      "Plan Actual": getUserStatus(u).label,
      "Pago Mensual ($)": (u.pago_mensual || 0).toFixed(2),
      "Fecha de Registro": new Date(u.creado_en).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    
    const wscols = [
      {wch: 30}, // Nombre
      {wch: 35}, // Email
      {wch: 15}, // Pais
      {wch: 15}, // Celular
      {wch: 15}, // Plan
      {wch: 18}, // Pago
      {wch: 20}  // Registro
    ];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Usuarios Prospera");
    XLSX.writeFile(wb, `Usuarios_Prospera_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const logoImg = new Image();
    logoImg.src = '/admin-logo.png';

    const renderReport = () => {
        doc.addImage(logoImg, 'PNG', 14, 10, 40, 15);
        
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("Reporte Maestro de Usuarios", 14, 40);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`Generado por: Prospera Admin Engine`, 14, 48);
        doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 53);
        doc.text(`Total usuarios filtrados: ${filteredUsers.length}`, 14, 58);

        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(1.5);
        doc.line(14, 65, 196, 65);

        autoTable(doc, {
          startY: 75,
          head: [["NOMBRE", "EMAIL", "ESTADO PLAN", "BILLING ($)"]],
          body: filteredUsers.map(u => [
            u.nombre_completo || '---',
            u.email,
            getUserStatus(u).label,
            { content: `$${(u.pago_mensual || 0).toFixed(2)}`, styles: { fontStyle: 'bold', halign: 'right' } }
          ]),
          headStyles: { 
            fillColor: [30, 41, 59], 
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold',
            cellPadding: 5
          },
          bodyStyles: {
            fontSize: 9,
            textColor: [51, 65, 85],
            cellPadding: 4
          },
          alternateRowStyles: { 
            fillColor: [248, 250, 252] 
          },
          columnStyles: {
            2: { halign: 'center' },
            3: { halign: 'right' }
          },
          margin: { top: 75 },
          didDrawPage: (data) => {
              const str = "Página " + doc.getNumberOfPages();
              doc.setFontSize(9);
              doc.setTextColor(150);
              doc.text(str, data.settings.margin.left, doc.internal.pageSize.getHeight() - 10);
              doc.text("Confidencial - Prospera Finanzas © 2026", 140, doc.internal.pageSize.getHeight() - 10);
          }
        });
        
        doc.save(`Reporte_Usuarios_Prospera_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    logoImg.onload = renderReport;
    logoImg.onerror = renderReport;
  };

  const glassStyle = { 
    background: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.6)', 
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: 24, 
    border: `1px solid ${theme.border}`, 
    padding: isMobile ? 20 : 30, 
    marginBottom: 24, 
    boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.2)' : '0 10px 30px rgba(0,0,0,0.03)' 
  };

  const inputStyle = { 
    padding: '14px 18px', 
    borderRadius: 14, 
    border: `1px solid ${theme.border}`, 
    background: theme.inputBg, 
    color: theme.text, 
    width: '100%', 
    boxSizing: 'border-box' as const, 
    outline: 'none',
    fontSize: '1rem',
    transition: 'all 0.2s'
  };

  if (loading) return <div style={{color: theme.textSec, textAlign: 'center', padding: 100, fontWeight: 700, letterSpacing: '1px'}}>SINCRONIZANDO NODOS DE USUARIO...</div>;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
        <ControlFiltersHeader
            filteredUsersLength={filteredUsers.length}
            exportToPDF={exportToPDF}
            exportToExcel={exportToExcel}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            planFilter={planFilter}
            setPlanFilter={setPlanFilter}
            isMobile={isMobile}
            isDark={isDark}
            theme={theme}
            glassStyle={glassStyle}
            inputStyle={inputStyle}
        />

        {/* CONTENEDOR DE USUARIOS */}
        {isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {filteredUsers.map(user => {
                    const status = getUserStatus(user);
                    return (
                        <div key={user.id} style={{ ...glassStyle, padding: 20, marginBottom: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div>
                                    <div style={{ fontWeight: 900, fontSize: '1.1rem', color: theme.text }}>{user.nombre_completo || '---'}</div>
                                    <div style={{ fontSize: '0.85rem', color: theme.textSec, marginTop: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
                                        {user.email}
                                        {user.pais && <span style={{ background: theme.primary+'20', color: theme.primary, padding: '2px 6px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 800 }}>{user.pais}</span>}
                                    </div>
                                    {user.celular && (
                                        <div style={{ marginTop: 6 }}>
                                            <a href={`https://wa.me/${user.celular.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, background: '#25D36615', color: '#25D366', padding: '4px 8px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800 }}>
                                                💬 Escribir al {user.celular}
                                            </a>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.primary }}>{getLoyaltyInfo(user).days} días</span>
                                        <span style={{ 
                                            background: getLoyaltyInfo(user).bg, 
                                            color: getLoyaltyInfo(user).color, 
                                            border: `1px solid ${getLoyaltyInfo(user).border}`, 
                                            padding: '2px 8px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 900 
                                        }}>
                                            {getLoyaltyInfo(user).label}
                                        </span>
                                    </div>
                                </div>
                                <span style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}`, padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900 }}>{status.label}</span>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: `1px dashed ${theme.border}` }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: theme.textSec, fontWeight: 800, textTransform: 'uppercase' }}>Pago Mensual</div>
                                    <div style={{ fontWeight: 900, fontSize: '1.1rem', color: theme.text }}>${(user.pago_mensual || 0).toFixed(2)}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => handleResetPassword(user.email)} style={{ background: theme.danger + '15', border: 'none', color: theme.danger, width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Resetear Clave"><IconKey /></button>
                                    <button onClick={() => handleImpersonate(user.email)} style={{ background: '#8b5cf615', border: 'none', color: '#8b5cf6', width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Ver como Usuario"><IconEye /></button>
                                    <button onClick={() => setSelectedUser(user)} style={{ background: theme.primary, border: 'none', color: isDark ? '#000' : '#fff', width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${theme.primary}40` }} title="Permisos"><IconSettings /></button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        ) : (
            <div style={{ ...glassStyle, padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: theme.text }}>
                    <thead>
                        <tr style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)', borderBottom: `1px solid ${theme.border}` }}>
                            <th style={{ padding: '20px 24px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Perfil</th>
                            <th style={{ padding: '20px 24px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Días / Lealtad</th>
                            <th style={{ padding: '20px 24px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Credenciales / Contacto</th>
                            <th style={{ padding: '20px 24px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Nivel Actual</th>
                            <th style={{ padding: '20px 24px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Billing ($)</th>
                            <th style={{ padding: '20px 24px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Último Acceso</th>
                            <th style={{ padding: '20px 24px', textAlign: 'right', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Acceso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user, idx) => {
                            const status = getUserStatus(user);
                            return (
                                <tr key={user.id} style={{ borderBottom: idx === filteredUsers.length -1 ? 'none' : `1px solid ${theme.border}`, transition: 'all 0.2s' }} className="admin-row">
                                    <td style={{ padding: '20px 24px', fontWeight: 800, fontSize: '0.95rem' }}>{user.nombre_completo || '---'}</td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <div style={{ fontWeight: 900, fontSize: '1rem', color: theme.primary }}>{getLoyaltyInfo(user).days} días</div>
                                            <span style={{ 
                                                background: getLoyaltyInfo(user).bg, 
                                                color: getLoyaltyInfo(user).color, 
                                                border: `1px solid ${getLoyaltyInfo(user).border}`, 
                                                padding: '2px 8px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 900,
                                                width: 'fit-content'
                                            }}>
                                                {getLoyaltyInfo(user).label}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px', color: theme.textSec, fontSize: '0.85rem', fontWeight: 500 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                {user.email}
                                                {user.pais && <span style={{ background: theme.primary+'20', color: theme.primary, padding: '2px 6px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 800 }}>{user.pais}</span>}
                                            </div>
                                            {user.celular && (
                                                <a href={`https://wa.me/${user.celular.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, background: '#25D36615', color: '#25D366', padding: '4px 8px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800, width: 'fit-content', transition: 'all 0.2s' }} className="hover-scale">
                                                    💬 {user.celular}
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <span style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}`, padding: '6px 14px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 900 }}>{status.label}</span>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                defaultValue={user.pago_mensual || 0}
                                                onBlur={async (e) => {
                                                    const val = parseFloat(e.target.value) || 0;
                                                    await supabase.from('perfiles').update({ pago_mensual: val }).eq('id', user.id);
                                                }}
                                                style={{ 
                                                    width: '70px', background: theme.inputBg, border: `1px solid ${theme.border}`, 
                                                    color: theme.text, borderRadius: '8px', padding: '6px 10px', fontSize: '0.9rem', outline: 'none', fontWeight: 800
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px', fontWeight: 700, fontSize: '0.85rem', color: theme.textSec }}>
                                        {formatLastAccess(user.ultimo_acceso)}
                                    </td>
                                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                        <div style={{display: 'flex', gap: 10, justifyContent: 'flex-end'}}>
                                            <button onClick={() => handleResetPassword(user.email)} style={{ background: 'transparent', border: `1px solid ${theme.danger}40`, color: theme.danger, width: 38, height: 38, borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} className="hover-scale" title="Resetear Clave">
                                                <IconKey />
                                            </button>
                                            <button onClick={() => handleImpersonate(user.email)} style={{ background: '#8b5cf615', border: 'none', color: '#8b5cf6', width: 38, height: 38, borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} className="hover-scale" title="Ver como Usuario">
                                                <IconEye />
                                            </button>
                                            <button onClick={() => setSelectedUser(user)} style={{ background: theme.primary, border: 'none', color: isDark ? '#000' : '#fff', width: 38, height: 38, borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: `0 4px 12px ${theme.primary}30` }} className="hover-scale" title="Permisos">
                                                <IconSettings />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )}

        {/* MODAL DE PERMISOS PREMIUM */}
        <UserDetailsSidebar
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            togglePermission={togglePermission}
            isMobile={isMobile}
            isDark={isDark}
            theme={theme}
        />

        {/* MODAL DE IMPERSONACIÓN PREMIUM */}
        {impersonateModal && impersonateModal.isOpen && (
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
          }} onClick={() => !impersonateModal.loading && setImpersonateModal(null)}>
            <div style={{
              background: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${theme.border}`,
              borderRadius: 24,
              width: '100%',
              maxWidth: 440,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              overflow: 'hidden',
              padding: '32px 24px',
              textAlign: 'center',
              color: theme.text
            }} onClick={e => e.stopPropagation()}>
              
              {/* Header Icon */}
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: impersonateModal.error 
                  ? 'rgba(239, 68, 68, 0.15)' 
                  : (impersonateModal.actionLink ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)'),
                color: impersonateModal.error 
                  ? 'rgb(239, 68, 68)' 
                  : (impersonateModal.actionLink ? 'rgb(16, 185, 129)' : 'rgb(139, 92, 246)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '1.8rem',
                fontWeight: 'bold'
              }}>
                {impersonateModal.error ? '✗' : (impersonateModal.actionLink ? '✓' : '🎭')}
              </div>

              <h3 style={{ margin: '0 0 8px', fontSize: '1.3rem', fontWeight: 900 }}>
                {impersonateModal.error 
                  ? 'Error de Conexión' 
                  : (impersonateModal.actionLink ? 'Sesión Lista' : 'Impersonar Usuario')}
              </h3>

              <p style={{ margin: '0 0 24px', fontSize: '0.9rem', color: theme.textSec, lineHeight: 1.5 }}>
                {impersonateModal.error ? (
                  `Ocurrió un error al generar el enlace de acceso: ${impersonateModal.error}`
                ) : impersonateModal.actionLink ? (
                  `El enlace de acceso para ${impersonateModal.email} se generó con éxito. Haz clic abajo para ingresar.`
                ) : (
                  `Estás a punto de generar un acceso de administrador temporal para la cuenta de ${impersonateModal.email}. Cualquier cambio afectará la información real en producción.`
                )}
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {impersonateModal.error ? (
                  <button
                    onClick={() => setImpersonateModal(null)}
                    style={{
                      background: 'rgb(239, 68, 68)',
                      color: '#fff',
                      border: 'none',
                      width: '100%',
                      padding: '14px',
                      borderRadius: 14,
                      cursor: 'pointer',
                      fontWeight: 800,
                      fontSize: '0.95rem'
                    }}
                  >
                    Cerrar
                  </button>
                ) : impersonateModal.actionLink ? (
                  <>
                    <button
                      onClick={() => {
                        window.open(impersonateModal.actionLink, '_blank');
                        setImpersonateModal(null);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#fff',
                        border: 'none',
                        width: '100%',
                        padding: '14px',
                        borderRadius: 14,
                        cursor: 'pointer',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)'
                      }}
                    >
                      Ingresar a la Cuenta
                    </button>
                    <button
                      onClick={() => setImpersonateModal(null)}
                      style={{
                        background: 'transparent',
                        color: theme.textSec,
                        border: `1px solid ${theme.border}`,
                        width: '100%',
                        padding: '12px',
                        borderRadius: 14,
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={async () => {
                        setImpersonateModal(prev => prev ? { ...prev, loading: true } : null);
                        try {
                          const { data, error } = await supabase.functions.invoke('impersonate-user', {
                            body: { email: impersonateModal.email }
                          });
                          if (error) throw error;
                          if (data?.action_link) {
                            setImpersonateModal(prev => prev ? { ...prev, loading: false, actionLink: data.action_link } : null);
                          } else {
                            throw new Error('No se recibió enlace de retorno.');
                          }
                        } catch (err: any) {
                          setImpersonateModal(prev => prev ? { ...prev, loading: false, error: err.message || 'Error en Edge Function' } : null);
                        }
                      }}
                      disabled={impersonateModal.loading}
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        color: '#fff',
                        border: 'none',
                        width: '100%',
                        padding: '14px',
                        borderRadius: 14,
                        cursor: impersonateModal.loading ? 'not-allowed' : 'pointer',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      {impersonateModal.loading ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Generando enlace...
                        </>
                      ) : (
                        'Generar Acceso e Ingresar'
                      )}
                    </button>
                    <button
                      onClick={() => setImpersonateModal(null)}
                      disabled={impersonateModal.loading}
                      style={{
                        background: 'transparent',
                        color: theme.textSec,
                        border: `1px solid ${theme.border}`,
                        width: '100%',
                        padding: '12px',
                        borderRadius: 14,
                        cursor: impersonateModal.loading ? 'not-allowed' : 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <style>
            {`
              @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
              @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
              .admin-row:hover { background: ${theme.primary}05 !important; }
              .hover-scale:hover { transform: scale(1.05); }
              .hover-scale:active { transform: scale(0.95); }
            `}
        </style>
    </div>
  );
}
