import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabaseContable } from '../../services/supabaseContable';
import { useTheme } from '../../context/ThemeContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const SriCalendarioTab: React.FC = () => {
  const { theme, isDark } = useTheme();
  const queryClient = useQueryClient();
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterDigito, setFilterDigito] = useState<string>('todos');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDia, setEditDia] = useState<number>(10);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  const cardStyle: React.CSSProperties = { background: theme.card, borderRadius: 20, border: `1px solid ${theme.border}`, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' };
  const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, outline: 'none', fontSize: '0.85rem' };

  const paginationButtonStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 12px',
    borderRadius: '10px',
    border: active ? `1px solid ${theme.primary}` : `1px solid ${theme.border}`,
    background: active ? theme.primary : 'transparent',
    color: active ? (isDark ? '#000' : '#fff') : theme.textSec,
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    outline: 'none',
    minWidth: '36px',
    height: '36px'
  });

  const paginationButtonDisabledStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: '10px',
    border: `1px solid ${theme.border}`,
    background: 'transparent',
    color: theme.textSec,
    opacity: 0.4,
    cursor: 'not-allowed',
    fontSize: '0.82rem',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
    minWidth: '36px',
    height: '36px'
  };

  // Cargar calendario SRI
  const { data: calendario, isLoading } = useQuery({
    queryKey: ['sriCalendario'],
    queryFn: async () => {
      const { data, error } = await supabaseContable
        .from('sri_calendario')
        .select('*')
        .order('tipo')
        .order('digito_ruc')
        .order('mes');

      if (error) throw error;
      return data || [];
    }
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartEdit = (item: any) => {
    setEditingId(item.id);
    setEditDia(item.dia_vencimiento);
  };

  const handleSaveEdit = async (id: number) => {
    if (editDia < 1 || editDia > 31) {
      alert("El día de vencimiento debe estar entre 1 y 31.");
      return;
    }

    setSavingId(id);
    try {
      const { error } = await supabaseContable
        .from('sri_calendario')
        .update({ dia_vencimiento: editDia })
        .eq('id', id);

      if (error) throw error;

      showToast("Día de vencimiento actualizado con éxito.");
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['sriCalendario'] });
    } catch (err: any) {
      console.error(err);
      alert("Error al actualizar: " + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const getNombreMes = (num: number) => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[num - 1] || `Mes ${num}`;
  };

  // Filtrar en cliente
  const filteredCalendario = (calendario || []).filter((item: any) => {
    const matchesTipo = filterTipo === 'todos' || item.tipo === filterTipo;
    const matchesDigito = filterDigito === 'todos' || item.digito_ruc.toString() === filterDigito;
    return matchesTipo && matchesDigito;
  });

  const totalPages = Math.ceil(filteredCalendario.length / pageSize);
  const activePage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const paginatedCalendario = filteredCalendario.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize
  );

  return (
    <div style={{ ...cardStyle, marginTop: 20 }}>
      <style>{`
        .pg-btn {
          transition: all 0.2s ease !important;
        }
        .pg-btn:hover:not(:disabled) {
          border-color: ${theme.primary}80 !important;
          background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'} !important;
          color: ${theme.text} !important;
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: 24 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>📅 Calendario de Declaraciones SRI</h3>
          <p style={{ color: theme.textSec, fontSize: '0.82rem', margin: '4px 0 0 0' }}>
            Ajusta los límites oficiales de vencimiento para las declaraciones de impuestos en base al RUC.
          </p>
        </div>

        {toastMessage && (
          <div style={{
            padding: '8px 16px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.1)',
            color: theme.primary,
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            ✅ {toastMessage}
          </div>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 800, color: theme.textSec, textTransform: 'uppercase' }}>Filtro de Obligación</label>
          <select
            value={filterTipo}
            onChange={(e) => {
              setFilterTipo(e.target.value);
              setCurrentPage(1);
            }}
            style={{ ...inputStyle, width: '160px' }}
          >
            <option value="todos">Todos</option>
            <option value="mensual">Mensual (IVA/Rentas)</option>
            <option value="semestral">Semestral</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 800, color: theme.textSec, textTransform: 'uppercase' }}>Noveno Dígito RUC</label>
          <select
            value={filterDigito}
            onChange={(e) => {
              setFilterDigito(e.target.value);
              setCurrentPage(1);
            }}
            style={{ ...inputStyle, width: '120px' }}
          >
            <option value="todos">Todos</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: theme.textSec, fontWeight: 700 }}>Cargando calendario...</div>
      ) : filteredCalendario.length > 0 ? (
        <>
          <div style={{ overflowX: 'auto', border: `1px solid ${theme.border}`, borderRadius: '14px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: theme.card, zIndex: 10 }}>
                <tr style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textSec }}>
                  <th style={{ padding: '12px 16px', fontWeight: 800 }}>Tipo de Impuesto</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800 }}>Dígito RUC</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800 }}>Mes de Declaración</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800 }}>Día Límite</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCalendario.map((item: any) => {
                  const isEditing = editingId === item.id;
                  const isSaving = savingId === item.id;

                  return (
                    <tr key={item.id} style={{ borderBottom: `1px solid ${theme.border}`, color: theme.text }}>
                      <td style={{ padding: '14px 16px', fontWeight: 800, textTransform: 'capitalize' }}>
                        {item.tipo}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                        Dígito {item.digito_ruc}
                      </td>
                      <td style={{ padding: '14px 16px', color: theme.textSec, fontWeight: 600 }}>
                        {getNombreMes(item.mes)} ({item.mes.toString().padStart(2, '0')})
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {isEditing ? (
                          <input
                            type="number"
                            min={1}
                            max={31}
                            value={editDia}
                            onChange={(e) => setEditDia(parseInt(e.target.value) || 1)}
                            style={{
                              ...inputStyle,
                              width: '70px',
                              textAlign: 'center',
                              fontWeight: 800,
                              padding: '4px 8px'
                            }}
                          />
                        ) : (
                          <span style={{ fontWeight: 800, color: theme.primary }}>Día {item.dia_vencimiento}</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => setEditingId(null)}
                              style={{
                                background: 'transparent',
                                border: `1px solid ${theme.border}`,
                                color: theme.textSec,
                                padding: '6px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}
                            >
                              Cancelar
                            </button>
                            <button
                              disabled={isSaving}
                              onClick={() => handleSaveEdit(item.id)}
                              style={{
                                background: theme.primary,
                                color: isDark ? '#000' : '#fff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 800
                              }}
                            >
                              {isSaving ? 'Guardando...' : 'Guardar'}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(item)}
                            style={{
                              background: 'rgba(99,102,241,0.08)',
                              border: '1px solid rgba(99,102,241,0.2)',
                              color: '#818CF8',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            ✏️ Editar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 20,
              paddingTop: 16,
              borderTop: `1px solid ${theme.border}`,
              flexWrap: 'wrap',
              gap: 12
            }}>
              <span style={{ fontSize: '0.82rem', color: theme.textSec, fontWeight: 600 }}>
                Mostrando <strong style={{ color: theme.text }}>{Math.min(filteredCalendario.length, (activePage - 1) * pageSize + 1)}</strong> a <strong style={{ color: theme.text }}>{Math.min(filteredCalendario.length, activePage * pageSize)}</strong> de <strong style={{ color: theme.text }}>{filteredCalendario.length}</strong> registros
              </span>
              
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={activePage === 1}
                  className="pg-btn"
                  style={activePage === 1 ? paginationButtonDisabledStyle : paginationButtonStyle(false)}
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    return page === 1 || page === totalPages || Math.abs(page - activePage) <= 1;
                  })
                  .map((page, idx, arr) => {
                    const elements = [];
                    if (idx > 0 && page - arr[idx - 1] > 1) {
                      elements.push(
                        <span key={`ellipsis-${page}`} style={{ color: theme.textSec, padding: '0 4px', fontSize: '0.82rem' }}>
                          ...
                        </span>
                      );
                    }
                    elements.push(
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className="pg-btn"
                        style={paginationButtonStyle(activePage === page)}
                      >
                        {page}
                      </button>
                    );
                    return elements;
                  })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={activePage === totalPages}
                  className="pg-btn"
                  style={activePage === totalPages ? paginationButtonDisabledStyle : paginationButtonStyle(false)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: theme.textSec, fontWeight: 700 }}>
          No hay registros en el calendario SRI para los filtros aplicados.
        </div>
      )}
    </div>
  );
};
