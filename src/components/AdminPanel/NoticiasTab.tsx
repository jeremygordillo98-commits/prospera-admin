import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../context/ThemeContext';

const IconEdit = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;

const CATEGORIES = ['Actualización', 'Tip Financiero', 'Aviso Importante', 'Nueva Funcionalidad'];
const EMPTY_FORM = { id: '', title: '', summary: '', content: '', category: 'Actualización', image_url: '', is_published: true };

export const NoticiasTab: React.FC = () => {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [filter, setFilter] = useState('Todas');
  const [form, setForm] = useState(EMPTY_FORM);

  const inputStyle: React.CSSProperties = { padding: '12px 16px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, width: '100%', outline: 'none', fontSize: '0.9rem', marginBottom: 12 };
  const cardStyle: React.CSSProperties = { background: theme.card, borderRadius: 20, border: `1px solid ${theme.border}`, padding: 24 };

  const { data: newsList = [] } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { data, error } = await supabase.from('public_news').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  useEffect(() => {
    const sub = supabase.channel('news_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'public_news' }, () => queryClient.invalidateQueries({ queryKey: ['news'] }))
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [queryClient]);

  const handleSave = async () => {
    if (!form.title || !form.content) return alert('Completa título y contenido');
    if (form.id) {
      const { error } = await supabase.from('public_news').update({ title: form.title, summary: form.summary, content: form.content, category: form.category, image_url: form.image_url, is_published: form.is_published }).eq('id', form.id);
      if (!error) { alert('Noticia actualizada'); setIsEditing(false); setForm(EMPTY_FORM); queryClient.invalidateQueries({ queryKey: ['news'] }); }
      else alert('Error al guardar');
    } else {
      const { id, ...data } = form;
      const { error } = await supabase.from('public_news').insert([{ ...data, published_at: new Date() }]);
      if (!error) { alert('Noticia publicada'); setIsEditing(false); setForm(EMPTY_FORM); queryClient.invalidateQueries({ queryKey: ['news'] }); }
      else alert('Error al publicar');
    }
  };

  const handleEdit = (item: any) => { setForm(item); setIsEditing(true); };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar esta noticia?')) {
      await supabase.from('public_news').delete().eq('id', id);
      queryClient.invalidateQueries({ queryKey: ['news'] });
    }
  };

  const filtered = filter === 'Todas' ? newsList : newsList.filter((n: any) => n.category === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Noticias en Landing</h3>
        <div style={{ display: 'flex', gap: 12 }}>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...inputStyle, marginBottom: 0, width: 'auto', fontSize: '0.75rem', padding: '8px 12px' }}>
            <option>Todas</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button onClick={() => { setForm(EMPTY_FORM); setIsEditing(!isEditing); }} style={{ background: theme.primary, border: 'none', padding: '8px 16px', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>
            {isEditing ? 'Cerrar' : '+ Nueva'}
          </button>
        </div>
      </div>

      {/* Formulario edición */}
      {isEditing && (
        <div style={cardStyle}>
          <h4 style={{ marginTop: 0, marginBottom: 16, color: theme.primary }}>{form.id ? 'Editando Noticia' : 'Nueva Noticia'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Título" style={inputStyle} />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <input type="text" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="URL de imagen (opcional)" style={inputStyle} />
          <textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} placeholder="Resumen corto (aparece en la tarjeta)..." style={{ ...inputStyle, height: 60 }} />
          <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Contenido completo..." style={{ ...inputStyle, height: 120 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleSave} style={{ flex: 2, background: theme.primary, border: 'none', padding: 14, borderRadius: 12, fontWeight: 900, cursor: 'pointer' }}>
              {form.id ? 'Guardar Cambios' : 'Publicar Noticia'}
            </button>
            {form.id && (
              <button onClick={() => { setIsEditing(false); setForm(EMPTY_FORM); }} style={{ flex: 1, background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textSec, borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>Cancelar</button>
            )}
          </div>
        </div>
      )}

      {/* Grid de noticias */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 15 }}>
        {filtered.map((item: any) => (
          <div key={item.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: theme.primary, fontWeight: 900, marginBottom: 8 }}>
              <span>{item.category}</span>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => handleEdit(item)} style={{ color: theme.textSec, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><IconEdit /> Editar</button>
                <button onClick={() => handleDelete(item.id)} style={{ color: '#ef4444', border: 'none', background: 'transparent', cursor: 'pointer' }}>Borrar</button>
              </div>
            </div>
            <div style={{ fontWeight: 'bold', marginBottom: 6, color: theme.text }}>{item.title}</div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: theme.textSec, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any }}>{item.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
