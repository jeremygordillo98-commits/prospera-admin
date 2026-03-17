import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../context/ThemeContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// --- ÍCONOS SVG ---
const IconKey = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>;
const IconSettings = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;

export default function ControlView() {
  const { theme, isDark } = useTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('todos');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    fetchUsers();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('perfiles').select('*').order('creado_en', { ascending: false });
    if (!error && data) setUsers(data);
    setLoading(false);
  };

  const handleResetPassword = async (email: string) => {
    if (window.confirm(`⚠️ ¿Enviar correo de restablecimiento a ${email}?`)) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://prospera-finanzas.vercel.app/profile' });
      if (error) alert('❌ Error: ' + error.message);
      else alert('✅ Correo enviado a ' + email);
    }
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
    // Preparar datos con encabezados claros
    const data = filteredUsers.map(u => ({
      "Nombre Completo": u.nombre_completo || '---',
      "Correo Electrónico": u.email,
      "Plan Actual": getUserStatus(u).label,
      "Pago Mensual ($)": (u.pago_mensual || 0).toFixed(2),
      "Fecha de Registro": new Date(u.creado_en).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    
    // Auto-ajustar ancho de columnas (opcional pero profesional)
    const wscols = [
      {wch: 30}, // Nombre
      {wch: 35}, // Email
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
        // Encabezado
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

        // Línea decorativa
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
              // Footer
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
    logoImg.onerror = renderReport; // Fallback si no carga la imagen
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
        {/* TITULAR Y ACCIONES */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexDirection: isMobile ? 'column' : 'row', gap: 20 }}>
            <div>
                <h2 style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, letterSpacing: '-1px' }}>Gestión de Usuarios</h2>
                <div style={{ color: theme.textSec, fontSize: '0.9rem', marginTop: 4, fontWeight: 600 }}>{filteredUsers.length} cuentas registradas en el sistema</div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={exportToPDF} style={{ background: theme.card, color: theme.text, border: `1px solid ${theme.border}`, padding: '12px 24px', borderRadius: 14, cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', transition: 'all 0.2s' }} className="hover-scale">🖨️ Imprimir</button>
                <button onClick={exportToExcel} style={{ background: theme.primary, color: isDark ? '#000' : '#fff', border: 'none', padding: '12px 24px', borderRadius: 14, cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', boxShadow: `0 8px 24px ${theme.primary}40`, transition: 'all 0.2s' }} className="hover-scale">📥 Descargar Excel</button>
            </div>
        </div>

        {/* FILTROS INTELIGENTES */}
        <div style={glassStyle}>
            <div onClick={() => setShowFilters(!showFilters)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: theme.primary + '15', color: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔍</div>
                    Filtros de Auditoría
                </h3>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</div>
            </div>
            
            {showFilters && (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginTop: 24, paddingTop: 24, borderTop: `1px solid ${theme.border}` }}>
                    <div>
                        <label style={{display: 'block', fontSize: '0.75rem', color: theme.textSec, marginBottom: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px'}}>Identificador / Email</label>
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Ej. Alex Rivera" style={inputStyle} />
                    </div>
                    <div>
                        <label style={{display: 'block', fontSize: '0.75rem', color: theme.textSec, marginBottom: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px'}}>Estado del Plan</label>
                        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} style={inputStyle}>
                            <option value="todos">Todos los niveles</option>
                            <option value="básico">Básico (Free)</option>
                            <option value="pro">Pro (Standard)</option>
                            <option value="ultra">Ultra (Tier 1)</option>
                        </select>
                    </div>
                </div>
            )}
        </div>

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
                                    <div style={{ fontSize: '0.85rem', color: theme.textSec, marginTop: 4 }}>{user.email}</div>
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
                                    <button onClick={() => handleResetPassword(user.email)} style={{ background: theme.danger + '15', border: 'none', color: theme.danger, width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconKey /></button>
                                    <button onClick={() => setSelectedUser(user)} style={{ background: theme.primary, border: 'none', color: isDark ? '#000' : '#fff', width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${theme.primary}40` }}><IconSettings /></button>
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
                            <th style={{ padding: '20px 24px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Credenciales</th>
                            <th style={{ padding: '20px 24px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Nivel Actual</th>
                            <th style={{ padding: '20px 24px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Billing ($)</th>
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
                                    <td style={{ padding: '20px 24px', color: theme.textSec, fontSize: '0.85rem', fontWeight: 500 }}>{user.email}</td>
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
                                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                        <div style={{display: 'flex', gap: 10, justifyContent: 'flex-end'}}>
                                            <button onClick={() => handleResetPassword(user.email)} style={{ background: 'transparent', border: `1px solid ${theme.danger}40`, color: theme.danger, width: 38, height: 38, borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} className="hover-scale" title="Resetear">
                                                <IconKey />
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
        {selectedUser && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: isMobile ? 'flex-end' : 'center', zIndex: 10000, backdropFilter: 'blur(8px)', padding: isMobile ? 0 : 20 }} onClick={() => setSelectedUser(null)}>
                <div 
                  style={{ 
                    background: theme.card, 
                    padding: isMobile ? '30px 20px 40px' : '40px', 
                    borderRadius: isMobile ? '32px 32px 0 0' : '32px', 
                    width: '100%', 
                    maxWidth: '480px', 
                    border: `1px solid ${theme.border}`, 
                    maxHeight: '90vh', 
                    overflowY: 'auto', 
                    boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                    animation: isMobile ? 'slideUp 0.4s ease' : 'scaleIn 0.3s ease'
                  }} 
                  onClick={e => e.stopPropagation()}
                >
                    <div style={{textAlign: 'center', marginBottom: 32}}>
                        <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'linear-gradient(135deg, #3b82f6, #10b981)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.8rem', fontWeight: 950 }}>{selectedUser.nombre_completo?.[0] || 'U'}</div>
                        <h3 style={{ margin: '0 0 4px 0', color: theme.text, fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.5px' }}>{selectedUser.nombre_completo || 'Usuario'}</h3>
                        <div style={{ fontSize: '0.9rem', color: theme.textSec, fontWeight: 500 }}>{selectedUser.email}</div>
                    </div>
                    
                    <PermissionGroup title="🛡️ Nivel Básico" color="#3b82f6">
                      <SwitchRow label="Presupuestos" desc="Gestión de límites mensuales" checked={selectedUser.permiso_presupuestos} onChange={() => togglePermission(selectedUser.id, 'permiso_presupuestos', selectedUser.permiso_presupuestos)} theme={theme} />
                      <SwitchRow label="Recordatorios" desc="Alarmas y facturas" checked={selectedUser.permiso_recordatorios} onChange={() => togglePermission(selectedUser.id, 'permiso_recordatorios', selectedUser.permiso_recordatorios)} theme={theme} />
                    </PermissionGroup>
                    
                    <PermissionGroup title="💎 Nivel PRO" color="#10b981">
                      <SwitchRow label="Subcategorías" desc="Jerarquía avanzada" checked={selectedUser.permiso_subcategorias} onChange={() => togglePermission(selectedUser.id, 'permiso_subcategorias', selectedUser.permiso_subcategorias)} theme={theme} />
                      <SwitchRow label="Conciliación" desc="Auditoría bancaria" checked={selectedUser.permiso_conciliacion} onChange={() => togglePermission(selectedUser.id, 'permiso_conciliacion', selectedUser.permiso_conciliacion)} theme={theme} />
                      <SwitchRow label="Reporte Estado" desc="Estado de Cuenta / Exportación" checked={selectedUser.permiso_reporte_estado} onChange={() => togglePermission(selectedUser.id, 'permiso_reporte_estado', selectedUser.permiso_reporte_estado)} theme={theme} />
                      <SwitchRow label="Reporte Patrimonio" desc="Valor neto total" checked={selectedUser.permiso_reporte_patrimonio} onChange={() => togglePermission(selectedUser.id, 'permiso_reporte_patrimonio', selectedUser.permiso_reporte_patrimonio)} theme={theme} />
                      <SwitchRow label="Reporte Flujo" desc="Sankey Diagrams" checked={selectedUser.permiso_reporte_flujo} onChange={() => togglePermission(selectedUser.id, 'permiso_reporte_flujo', selectedUser.permiso_reporte_flujo)} theme={theme} />
                    </PermissionGroup>
                    
                    <PermissionGroup title="🚀 Nivel ULTRA" color="#a855f7">
                      <SwitchRow label="Prospera CFO (IA)" desc="Asesor GPT-4o" checked={selectedUser.permiso_chat} onChange={() => togglePermission(selectedUser.id, 'permiso_chat', selectedUser.permiso_chat)} theme={theme} />
                      <SwitchRow label="Magic Input" desc="Voz y texto natural" checked={selectedUser.permiso_magic} onChange={() => togglePermission(selectedUser.id, 'permiso_magic', selectedUser.permiso_magic)} theme={theme} />
                      <SwitchRow label="Predicciones" desc="Smart Insights" checked={selectedUser.permiso_insights} onChange={() => togglePermission(selectedUser.id, 'permiso_insights', selectedUser.permiso_insights)} theme={theme} />
                      <SwitchRow label="Reporte Comparativo" desc="Benchmarking" checked={selectedUser.permiso_reporte_comparativo} onChange={() => togglePermission(selectedUser.id, 'permiso_reporte_comparativo', selectedUser.permiso_reporte_comparativo)} theme={theme} />
                      <SwitchRow label="Mapa de Calor" desc="Densidad de gastos" checked={selectedUser.permiso_reporte_calor} onChange={() => togglePermission(selectedUser.id, 'permiso_reporte_calor', selectedUser.permiso_reporte_calor)} theme={theme} />
                    </PermissionGroup>
                    
                    <button onClick={() => setSelectedUser(null)} style={{ width: '100%', padding: '18px', marginTop: '32px', background: theme.primary, color: isDark ? '#000' : '#fff', border: 'none', borderRadius: '18px', fontWeight: 900, cursor: 'pointer', transition: 'all 0.3s', boxShadow: `0 10px 30px ${theme.primary}40` }} className="hover-scale">Confirmar Configuración</button>
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

const PermissionGroup = ({ title, color, children }: any) => (
  <div style={{ marginBottom: 24 }}>
    <h4 style={{ color, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '1.2px', fontWeight: 900 }}>{title}</h4>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
  </div>
);

const SwitchRow = ({ label, desc, checked, onChange, theme }: any) => (
    <div onClick={onChange} style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
      padding: '14px 18px', background: theme.bg, borderRadius: '18px', 
      border: `1px solid ${checked ? theme.primary + '40' : theme.border}`,
      transition: 'all 0.2s', cursor: 'pointer'
    }}>
        <div style={{ flex: 1, paddingRight: 10 }}>
            <div style={{ fontSize: '1rem', color: theme.text, fontWeight: 800, letterSpacing: '-0.3px' }}>{label}</div>
            <div style={{ fontSize: '0.75rem', color: theme.textSec, fontWeight: 500 }}>{desc}</div>
        </div>
        <div style={{ 
          width: '50px', height: '28px', background: checked ? theme.primary : theme.textSec + '40', 
          borderRadius: '50px', position: 'relative', transition: '0.4s', flexShrink: 0 
        }}>
            <div style={{ 
              width: '22px', height: '22px', background: 'white', 
              borderRadius: '50%', position: 'absolute', top: '3px', 
              left: checked ? '25px' : '3px', transition: '0.4s cubic-bezier(0.18, 0.89, 0.35, 1.15)', 
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)' 
            }} />
        </div>
    </div>
);
