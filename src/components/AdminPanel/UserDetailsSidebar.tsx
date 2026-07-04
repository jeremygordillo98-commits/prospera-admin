import React from 'react';

interface UserDetailsSidebarProps {
    selectedUser: any;
    setSelectedUser: (user: any) => void;
    togglePermission: (userId: string, field: string, currentValue: boolean) => Promise<void>;
    isMobile: boolean;
    isDark: boolean;
    theme: any;
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

export const UserDetailsSidebar: React.FC<UserDetailsSidebarProps> = ({
    selectedUser,
    setSelectedUser,
    togglePermission,
    isMobile,
    isDark,
    theme
}) => {
    if (!selectedUser) return null;

    return (
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
    );
};
