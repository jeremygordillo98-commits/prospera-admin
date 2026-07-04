import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseContable } from '../../services/supabaseContable';
import { useTheme } from '../../context/ThemeContext';
import { Loader2, Plus, Edit2, Trash2, X, Check, AlertTriangle } from 'lucide-react';

export default function PlantillaCuentasTab() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    codigo_cuenta: '',
    nombre: '',
    tipo: 'Activo',
    acepta_movimientos: true
  });
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Fetch template accounts
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['plantillaCuentas'],
    queryFn: async () => {
      const { data, error } = await supabaseContable
        .from('plantilla_plan_cuentas')
        .select('*')
        .order('codigo_cuenta', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // 2. Mutations
  const saveMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg('');
      const payload = {
        codigo_cuenta: formData.codigo_cuenta.trim(),
        nombre: formData.nombre.trim(),
        tipo: formData.tipo,
        acepta_movimientos: formData.acepta_movimientos
      };

      if (!payload.codigo_cuenta || !payload.nombre) {
        throw new Error('Todos los campos son obligatorios.');
      }

      if (editingId) {
        const { error } = await supabaseContable
          .from('plantilla_plan_cuentas')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabaseContable
          .from('plantilla_plan_cuentas')
          .insert([payload]);
        if (error) {
          if (error.code === '23505') throw new Error('Ya existe una cuenta con este código.');
          throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantillaCuentas'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Error al guardar la cuenta.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseContable
        .from('plantilla_plan_cuentas')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantillaCuentas'] });
    },
    onError: (err: any) => {
      alert('Error al eliminar: ' + err.message);
    }
  });

  const resetForm = () => {
    setFormData({
      codigo_cuenta: '',
      nombre: '',
      tipo: 'Activo',
      acepta_movimientos: true
    });
    setEditingId(null);
    setErrorMsg('');
  };

  const handleEdit = (acc: any) => {
    setEditingId(acc.id);
    setFormData({
      codigo_cuenta: acc.codigo_cuenta,
      nombre: acc.nombre,
      tipo: acc.tipo,
      acepta_movimientos: acc.acepta_movimientos
    });
    setIsModalOpen(true);
  };

  const handleDelete = (acc: any) => {
    if (window.confirm(`⚠️ ¿Estás seguro de eliminar "${acc.codigo_cuenta} - ${acc.nombre}" de la plantilla? Las nuevas empresas ya no recibirán esta cuenta por defecto.`)) {
      deleteMutation.mutate(acc.id);
    }
  };

  const cardStyle = {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
  };

  const inputStyle = {
    padding: '12px 16px',
    borderRadius: '12px',
    border: `1px solid ${theme.border}`,
    background: theme.inputBg,
    color: theme.text,
    width: '100%',
    boxSizing: 'border-box' as const,
    outline: 'none',
    fontSize: '0.9rem',
  };

  return (
    <div style={{ ...cardStyle, marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>📋 Plantilla del Plan de Cuentas</h3>
          <p style={{ color: theme.textSec, fontSize: '0.82rem', margin: '4px 0 0 0' }}>
            Edita las cuentas maestras que se autogenerarán cuando un contador registre una nueva empresa.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          style={{
            background: theme.primary,
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '10px 18px',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Plus size={16} /> Agregar Cuenta
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: theme.textSec, fontWeight: 700 }}>
          Cargando plantilla maestra...
        </div>
      ) : accounts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: theme.textSec, fontStyle: 'italic' }}>
          No hay cuentas definidas en la plantilla.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textSec }}>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Código</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Nombre</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Tipo</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Movimientos</th>
                <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc: any) => {
                const isHeader = !acc.acepta_movimientos;
                return (
                  <tr key={acc.id} style={{ borderBottom: `1px solid ${theme.border}`, color: theme.text }}>
                    <td style={{ padding: '12px 16px', fontWeight: isHeader ? 800 : 500, color: isHeader ? theme.primary : theme.text }}>
                      {acc.codigo_cuenta}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: isHeader ? 800 : 500, paddingLeft: `${(acc.codigo_cuenta.split('.').length - 1) * 16 + 16}px` }}>
                      {acc.nombre}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        background: acc.tipo === 'Activo' ? 'rgba(59, 130, 246, 0.1)' : acc.tipo === 'Pasivo' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: acc.tipo === 'Activo' ? '#3b82f6' : acc.tipo === 'Pasivo' ? '#ef4444' : '#10b981',
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {acc.tipo}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {acc.acepta_movimientos ? (
                        <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Check size={14} /> Permite
                        </span>
                      ) : (
                        <span style={{ color: theme.textSec, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <X size={14} /> Solo Grupo
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleEdit(acc)}
                          style={{ background: 'transparent', border: 'none', color: theme.primary, cursor: 'pointer', padding: 4 }}
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(acc)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL AGREGAR / EDITAR CUENTA */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: theme.card, padding: 30, borderRadius: 20, width: '100%', maxWidth: '450px', border: `1px solid ${theme.border}`, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                {editingId ? '📝 Editar Cuenta Default' : '➕ Agregar Cuenta Default'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: theme.textSec, cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, marginBottom: 6, display: 'block' }}>Código de Cuenta</label>
                <input
                  type="text"
                  placeholder="ej. 1.1.1.01"
                  value={formData.codigo_cuenta}
                  onChange={e => setFormData({ ...formData, codigo_cuenta: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, marginBottom: 6, display: 'block' }}>Nombre de la Cuenta</label>
                <input
                  type="text"
                  placeholder="ej. Caja General"
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, marginBottom: 6, display: 'block' }}>Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                  style={inputStyle}
                >
                  {['Activo', 'Pasivo', 'Patrimonio', 'Ingreso', 'Egreso'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: theme.inputBg, borderRadius: '12px', border: `1px solid ${theme.border}` }}>
                <input
                  type="checkbox"
                  id="acepta_mov"
                  checked={formData.acepta_movimientos}
                  onChange={e => setFormData({ ...formData, acepta_movimientos: e.target.checked })}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <label htmlFor="acepta_mov" style={{ fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                  Acepta movimientos (para asientos contables)
                </label>
              </div>

              {errorMsg && (
                <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 700, background: 'rgba(239,68,68,0.1)', padding: 12, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={16} /> {errorMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSec, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: theme.primary, color: '#fff', fontWeight: 750, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                  {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
