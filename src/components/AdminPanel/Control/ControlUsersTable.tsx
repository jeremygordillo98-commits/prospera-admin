import React from 'react';
import { Trash2 } from 'lucide-react';
import { supabase } from '../../../services/supabase';

const IconKey = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>;
const IconSettings = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconEye = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;

const formatLastAccess = (dateStr?: string, fallbackStr?: string) => {
  const targetDate = dateStr || fallbackStr;
  if (!targetDate) return 'Nunca';
  try {
    const d = new Date(targetDate);
    if (isNaN(d.getTime())) return 'Nunca';
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

interface ControlUsersTableProps {
  theme: any;
  isDark: boolean;
  isMobile: boolean;
  glassStyle: any;
  filteredUsers: any[];
  onResetPassword: (email: string) => void;
  onImpersonate: (email: string) => void;
  onSelectUser: (user: any) => void;
  onDeleteUser: (user: any) => void;
}

export const ControlUsersTable: React.FC<ControlUsersTableProps> = ({
  theme,
  isDark,
  isMobile,
  glassStyle,
  filteredUsers,
  onResetPassword,
  onImpersonate,
  onSelectUser,
  onDeleteUser
}) => {
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredUsers.map(user => {
          const status = getUserStatus(user);
          return (
            <div key={user.id} style={{ ...glassStyle, padding: 20, marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '14px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '1.1rem', flexShrink: 0
                  }}>
                    {(user.nombre_completo || user.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '1.1rem', color: theme.text }}>{user.nombre_completo || 'Sin Nombre'}</div>
                    <div style={{ fontSize: '0.85rem', color: theme.textSec, marginTop: 2, display: 'flex', gap: 6, alignItems: 'center' }}>
                      {user.email}
                      {user.pais && <span style={{ background: theme.primary+'20', color: theme.primary, padding: '2px 6px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 800 }}>{user.pais}</span>}
                    </div>
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
                  <button onClick={() => onResetPassword(user.email)} style={{ background: theme.danger + '15', border: 'none', color: theme.danger, width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Resetear Clave"><IconKey /></button>
                  <button onClick={() => onImpersonate(user.email)} style={{ background: '#8b5cf615', border: 'none', color: '#8b5cf6', width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Ver como Usuario"><IconEye /></button>
                  <button onClick={() => onSelectUser(user)} style={{ background: theme.primary, border: 'none', color: isDark ? '#000' : '#fff', width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${theme.primary}40` }} title="Permisos"><IconSettings /></button>
                  <button onClick={() => onDeleteUser(user)} style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#ef4444', width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Eliminar Usuario Definitivamente">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ ...glassStyle, padding: 0, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: theme.text }}>
        <thead>
          <tr style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)', borderBottom: `1px solid ${theme.border}` }}>
            <th style={{ padding: '20px 24px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Perfil</th>
            <th style={{ padding: '20px 24px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Días / Lealtad</th>
            <th style={{ padding: '20px 24px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Credenciales / Contacto</th>
            <th style={{ padding: '20px 24px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Nivel Actual</th>
            <th style={{ padding: '20px 24px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Billing ($)</th>
            <th style={{ padding: '20px 24px', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Actividad / Registro</th>
            <th style={{ padding: '20px 24px', textAlign: 'right', fontSize: '0.75rem', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Acceso</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, idx) => {
            const status = getUserStatus(user);
            return (
              <tr key={user.id} style={{ borderBottom: idx === filteredUsers.length -1 ? 'none' : `1px solid ${theme.border}`, transition: 'all 0.2s' }} className="admin-row">
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '12px',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: '0.95rem', flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
                    }}>
                      {(user.nombre_completo || user.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: theme.text }}>
                      {user.nombre_completo || 'Sin Nombre'}
                    </div>
                  </div>
                </td>
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
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: user.ultimo_acceso ? theme.primary : theme.textSec }}>
                      <span style={{ fontSize: '0.68rem', color: theme.textSec, fontWeight: 700, textTransform: 'uppercase' }}>Login: </span>
                      {user.ultimo_acceso ? formatLastAccess(user.ultimo_acceso) : 'Nunca'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: theme.textSec, fontWeight: 600 }}>
                      <span style={{ fontSize: '0.68rem', color: theme.textSec, opacity: 0.8, textTransform: 'uppercase' }}>Reg: </span>
                      {user.creado_en ? new Date(user.creado_en).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }) : '---'}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                  <div style={{display: 'flex', gap: 10, justifyContent: 'flex-end'}}>
                    <button onClick={() => onResetPassword(user.email)} style={{ background: 'transparent', border: `1px solid ${theme.danger}40`, color: theme.danger, width: 38, height: 38, borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} className="hover-scale" title="Resetear Clave">
                      <IconKey />
                    </button>
                    <button onClick={() => onImpersonate(user.email)} style={{ background: '#8b5cf615', border: 'none', color: '#8b5cf6', width: 38, height: 38, borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} className="hover-scale" title="Ver como Usuario">
                      <IconEye />
                    </button>
                    <button onClick={() => onSelectUser(user)} style={{ background: theme.primary, border: 'none', color: isDark ? '#000' : '#fff', width: 38, height: 38, borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: `0 4px 12px ${theme.primary}30` }} className="hover-scale" title="Permisos">
                      <IconSettings />
                    </button>
                    <button onClick={() => onDeleteUser(user)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', width: 38, height: 38, borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} className="hover-scale" title="Eliminar Usuario Definitivamente">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
