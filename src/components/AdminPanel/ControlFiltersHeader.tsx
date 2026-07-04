import React from 'react';

interface ControlFiltersHeaderProps {
    filteredUsersLength: number;
    exportToPDF: () => void;
    exportToExcel: () => void;
    showFilters: boolean;
    setShowFilters: (v: boolean) => void;
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    planFilter: string;
    setPlanFilter: (v: string) => void;
    isMobile: boolean;
    isDark: boolean;
    theme: any;
    glassStyle: any;
    inputStyle: any;
}

export const ControlFiltersHeader: React.FC<ControlFiltersHeaderProps> = ({
    filteredUsersLength,
    exportToPDF,
    exportToExcel,
    showFilters,
    setShowFilters,
    searchTerm,
    setSearchTerm,
    planFilter,
    setPlanFilter,
    isMobile,
    isDark,
    theme,
    glassStyle,
    inputStyle
}) => {
    return (
        <>
            {/* TITULAR Y ACCIONES */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexDirection: isMobile ? 'column' : 'row', gap: 20 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, letterSpacing: '-1px' }}>Gestión de Usuarios</h2>
                    <div style={{ color: theme.textSec, fontSize: '0.9rem', marginTop: 4, fontWeight: 600 }}>{filteredUsersLength} cuentas registradas en el sistema</div>
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
        </>
    );
};
