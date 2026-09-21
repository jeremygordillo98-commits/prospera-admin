import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../context/ThemeContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { UserDetailsSidebar } from './UserDetailsSidebar';
import { ControlFiltersHeader } from './ControlFiltersHeader';
import { ControlUsersTable } from './Control/ControlUsersTable';
import { ImpersonateModal } from './Control/ImpersonateModal';
import { DeleteUserModal } from './Control/DeleteUserModal';

const getUserStatus = (u: any) => {
  const ultraCount = (u.permiso_chat ? 1 : 0) + (u.permiso_magic ? 1 : 0) + (u.permiso_insights ? 1 : 0) + (u.permiso_reporte_comparativo ? 1 : 0) + (u.permiso_reporte_calor ? 1 : 0);
  if (ultraCount > 0) return { label: `ULTRA`, color: '#c084fc', bg: '#c084fc20', border: '#c084fc40' }; 
  const proCount = (u.permiso_conciliacion ? 1 : 0) + (u.permiso_subcategorias ? 1 : 0) + (u.permiso_reporte_patrimonio ? 1 : 0) + (u.permiso_reporte_estado ? 1 : 0) + (u.permiso_reporte_flujo ? 1 : 0);
  if (proCount > 0) return { label: `PRO`, color: '#10b981', bg: '#10b98120', border: '#10b98140' };
  return { label: `BÁSICO`, color: '#3b82f6', bg: '#3b82f620', border: '#3b82f640' };
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

  const [deleteUserModal, setDeleteUserModal] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [deleteSuccessModal, setDeleteSuccessModal] = useState<string | null>(null);

  const { data: fetchedUsers, isLoading: loading, refetch } = useQuery({
    queryKey: ['usuariosAdmin'],
    queryFn: async () => {
      const { data, error } = await supabase.from('perfiles').select('*').order('creado_en', { ascending: false });
      if (error) throw error;
      return (data || []).filter(u => u.rol !== 'admin');
    }
  });

  const confirmDeleteUser = async () => {
    if (!deleteUserModal) return;
    const target = deleteUserModal;
    setDeletingUser(true);
    try {
      const userId = target.id;

      // 1. Intentar borrado a través de RPC con permisos para eliminar auth.users
      try {
        const { error: rpcErr } = await supabase.rpc('admin_delete_b2c_user', { target_user_id: userId });
        if (!rpcErr) {
          setDeleteUserModal(null);
          setDeleteSuccessModal(`El usuario "${target.nombre_completo || target.email}" y todos sus datos (incluyendo credenciales de acceso) han sido eliminados.`);
          await refetch();
          return;
        }
      } catch (e) {
        console.warn('[Admin] RPC admin_delete_b2c_user no disponible, procediendo con borrado manual:', e);
      }

      // 2. Fallback de purga en cascada en tablas de Supabase B2C
      await supabase.from('transacciones').delete().eq('usuario_id', userId);
      await supabase.from('conciliaciones').delete().eq('usuario_id', userId);
      await supabase.from('recordatorios').delete().eq('usuario_id', userId);
      await supabase.from('categorias').delete().eq('usuario_id', userId);
      await supabase.from('cuentas').delete().eq('usuario_id', userId);
      await supabase.from('user_push_subscriptions').delete().eq('user_id', userId);
      await supabase.from('user_notification_preferences').delete().eq('user_id', userId);
      await supabase.from('user_notifications').delete().eq('user_id', userId);
      await supabase.from('soporte_tickets').delete().eq('usuario_id', userId);
      
      // 3. Eliminar registro del perfil
      const { error: perfilErr } = await supabase.from('perfiles').delete().eq('id', userId);
      if (perfilErr) throw perfilErr;

      setDeleteUserModal(null);
      setDeleteSuccessModal(`El usuario "${target.nombre_completo || target.email}" y todos sus datos han sido eliminados del sistema.`);
      await refetch();
    } catch (err: any) {
      alert(`❌ Error al eliminar usuario: ${err.message || err}`);
    } finally {
      setDeletingUser(false);
    }
  };

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
      {wch: 30},
      {wch: 35},
      {wch: 15},
      {wch: 15},
      {wch: 15},
      {wch: 18},
      {wch: 20}
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

      {/* CONTENEDOR / TABLA DE USUARIOS B2C */}
      <ControlUsersTable
        theme={theme}
        isDark={isDark}
        isMobile={isMobile}
        glassStyle={glassStyle}
        filteredUsers={filteredUsers}
        onResetPassword={handleResetPassword}
        onImpersonate={handleImpersonate}
        onSelectUser={setSelectedUser}
        onDeleteUser={setDeleteUserModal}
      />

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
      <ImpersonateModal
        theme={theme}
        isDark={isDark}
        impersonateModal={impersonateModal}
        setImpersonateModal={setImpersonateModal}
      />

      {/* MODAL DE CONFIRMACIÓN Y ÉXITO DE ELIMINACIÓN */}
      <DeleteUserModal
        theme={theme}
        isDark={isDark}
        deleteUserModal={deleteUserModal}
        setDeleteUserModal={setDeleteUserModal}
        deletingUser={deletingUser}
        confirmDeleteUser={confirmDeleteUser}
        deleteSuccessModal={deleteSuccessModal}
        setDeleteSuccessModal={setDeleteSuccessModal}
      />

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
