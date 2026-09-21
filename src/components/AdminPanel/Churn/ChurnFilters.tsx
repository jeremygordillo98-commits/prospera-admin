import React from 'react';
import { Search, X, RefreshCw, Rocket } from 'lucide-react';

interface ChurnFiltersProps {
  theme: any;
  isDark: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterTipo: 'todos' | 'B2C' | 'B2B';
  setFilterTipo: (tipo: 'todos' | 'B2C' | 'B2B') => void;
  filterEstado: 'todos' | 'critico' | 'riesgo' | 'activo';
  setFilterEstado: (estado: 'todos' | 'critico' | 'riesgo' | 'activo') => void;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenMassModal: () => void;
  criticosCount: number;
  enRiesgoCount: number;
}

export const ChurnFilters: React.FC<ChurnFiltersProps> = ({
  theme,
  isDark,
  searchTerm,
  setSearchTerm,
  filterTipo,
  setFilterTipo,
  filterEstado,
  setFilterEstado,
  onRefresh,
  isLoading,
  onOpenMassModal,
  criticosCount,
  enRiesgoCount
}) => {
  const cardStyle = {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: '20px',
    padding: '16px 20px',
    marginBottom: '20px',
    boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.2)' : '0 10px 30px rgba(0,0,0,0.02)',
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Buscador */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(241, 245, 249, 0.9)', padding: '8px 14px', borderRadius: '12px', flex: '1 1 230px', border: `1px solid ${theme.border}` }}>
          <Search size={16} style={{ color: theme.textSec }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o correo..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: theme.text, fontSize: '0.85rem', width: '100%' }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', color: theme.textSec, cursor: 'pointer' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filtros de Segmento y Estado */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          
          {/* Filtro Tipo */}
          <div style={{ display: 'flex', background: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(241, 245, 249, 0.9)', padding: '4px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
            <button 
              onClick={() => setFilterTipo('todos')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: filterTipo === 'todos' ? theme.primary : 'transparent',
                color: filterTipo === 'todos' ? '#fff' : theme.textSec,
                transition: 'all 0.2s'
              }}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilterTipo('B2C')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: filterTipo === 'B2C' ? '#3b82f6' : 'transparent',
                color: filterTipo === 'B2C' ? '#fff' : theme.textSec,
                transition: 'all 0.2s'
              }}
            >
              📱 App (B2C)
            </button>
            <button 
              onClick={() => setFilterTipo('B2B')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: filterTipo === 'B2B' ? '#10b981' : 'transparent',
                color: filterTipo === 'B2B' ? '#fff' : theme.textSec,
                transition: 'all 0.2s'
              }}
            >
              🏢 Pymes (B2B)
            </button>
          </div>

          {/* Filtro Riesgo */}
          <select
            value={filterEstado}
            onChange={e => setFilterEstado(e.target.value as any)}
            style={{
              background: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(241, 245, 249, 0.9)',
              border: `1px solid ${theme.border}`,
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: theme.text,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="todos">Todos los Estados</option>
            <option value="critico">🔴 Crítico (&gt;14 días)</option>
            <option value="riesgo">🟡 En Riesgo (8-14 días)</option>
            <option value="activo">🟢 Activo (≤7 días)</option>
          </select>

          {/* Botón Refrescar */}
          <button
            onClick={onRefresh}
            title="Actualizar datos"
            style={{
              background: 'transparent',
              border: `1px solid ${theme.border}`,
              borderRadius: '10px',
              padding: '8px 12px',
              color: theme.textSec,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 700
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refrescar
          </button>

          {/* 🚀 BOTÓN PRINCIPAL DE REACTIVACIÓN MASIVA */}
          <button
            onClick={onOpenMassModal}
            disabled={criticosCount === 0 && enRiesgoCount === 0}
            style={{
              background: 'linear-gradient(135deg, #ef4444, #f97316)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
              transition: 'all 0.2s',
              opacity: (criticosCount === 0 && enRiesgoCount === 0) ? 0.5 : 1
            }}
          >
            <Rocket size={15} />
            <span>Envío Masivo Inactivos</span>
            <span style={{ background: '#ffffff', color: '#ef4444', padding: '1px 7px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 900 }}>
              {criticosCount}
            </span>
          </button>

        </div>
      </div>
    </div>
  );
};
