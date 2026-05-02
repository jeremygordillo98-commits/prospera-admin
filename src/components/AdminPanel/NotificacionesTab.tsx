import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { supabaseContable } from '../../services/supabaseContable';
import { useTheme } from '../../context/ThemeContext';

// ── Tipos compartidos ─────────────────────────────────────────────────
type NotifTarget = 'app' | 'pymes';
interface NotifForm { userId: string; title: string; content: string; type: string; }

// ── Sub-componente: formulario + historial para una BD ────────────────
const NotifPanel: React.FC<{
  target: NotifTarget;
  client: typeof supabase;
  profileIdKey?: string; // 'id' para App, 'id_usuario' para Pymes
  isConnected?: boolean;
  onNeedLogin?: () => void;
}> = ({ target, client, profileIdKey = 'id', isConnected = true, onNeedLogin }) => {
  const { theme } = useTheme();
  const [form, setForm] = useState<NotifForm>({ userId: 'all', title: '', content: '', type: 'info' });
  const [profiles, setProfiles] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const inputStyle: React.CSSProperties = { padding: '12px 16px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, width: '100%', outline: 'none', fontSize: '0.9rem', marginBottom: 12 };
  const cardStyle: React.CSSProperties = { background: theme.card, borderRadius: 20, border: `1px solid ${theme.border}`, padding: 24 };

  useEffect(() => {
    if (!isConnected) return;
    // Perfiles
    client.from('perfiles').select(`${profileIdKey}, nombre_completo, email`).order('nombre_completo').then(({ data }) => { if (data) setProfiles(data); });
    // Historial
    client.from('user_notifications').select('*').eq('is_read', false).order('created_at', { ascending: false }).then(({ data }) => { if (data) setHistory(data); });
  }, [isConnected]);

  const handleSend = async () => {
    if (!form.title || !form.content) return alert('Completa título y mensaje');
    if (!isConnected && onNeedLogin) { onNeedLogin(); return; }
    if (form.userId === 'all') {
      const inserts = profiles.map(p => ({ user_id: p[profileIdKey], title: form.title, content: form.content, type: form.type }));
      await client.from('user_notifications').insert(inserts);
    } else {
      await client.from('user_notifications').insert({ user_id: form.userId, title: form.title, content: form.content, type: form.type });
    }
    alert('Notificación enviada');
    setForm({ userId: 'all', title: '', content: '', type: 'info' });
    // Refrescar historial
    const { data } = await client.from('user_notifications').select('*').eq('is_read', false).order('created_at', { ascending: false });
    if (data) setHistory(data);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar del historial?')) {
      await client.from('user_notifications').delete().eq('id', id);
      setHistory(prev => prev.filter(n => n.id !== id));
    }
  };

  if (!isConnected) return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: theme.textSec }}>
      <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔐</div>
      <p>Debes conectarte primero en la pestaña <strong>Soporte Pymes</strong>.</p>
      <button onClick={onNeedLogin} style={{ background: '#0EA5E9', border: 'none', padding: '10px 20px', borderRadius: 12, fontWeight: 800, cursor: 'pointer', color: '#fff' }}>Ir a conectar</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={cardStyle}>
        <h4 style={{ marginTop: 0, marginBottom: 16 }}>Nueva Notificación — {target === 'app' ? 'Usuarios App' : 'Contadores Pymes'}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: theme.textSec, display: 'block', marginBottom: 4 }}>Destinatario</label>
            <select value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })} style={inputStyle}>
              <option value="all">Todos</option>
              {profiles.map(p => <option key={p[profileIdKey]} value={p[profileIdKey]}>{p.nombre_completo}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: theme.textSec, display: 'block', marginBottom: 4 }}>Tipo</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
              <option value="info">Info</option>
              <option value="success">Éxito</option>
              <option value="warning">Aviso</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
        <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Título de la notificación" style={inputStyle} />
        <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Contenido del mensaje..." style={{ ...inputStyle, height: 80, resize: 'none' }} />
        <button onClick={handleSend} style={{ width: '100%', background: target === 'app' ? theme.primary : '#0EA5E9', border: 'none', padding: 14, borderRadius: 12, fontWeight: 900, cursor: 'pointer', color: target === 'app' ? '#000' : '#fff' }}>
          Enviar Notificación
        </button>
      </div>

      {history.length > 0 && (
        <div style={cardStyle}>
          <h4 style={{ marginTop: 0, marginBottom: 16 }}>Historial Pendientes</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {history.map(n => (
              <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: theme.bg, borderRadius: 14, border: `1px solid ${theme.border}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: theme.text }}>{n.title}</div>
                  <div style={{ fontSize: '0.8rem', color: theme.textSec }}>{n.content}</div>
                </div>
                <button onClick={() => handleDelete(n.id)} style={{ background: '#ef444415', color: '#ef4444', border: '1px solid #ef444430', padding: '6px 12px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>Eliminar</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Componente principal del tab ──────────────────────────────────────
export const NotificacionesTab: React.FC = () => {
  const { theme, isDark } = useTheme();
  const [target, setTarget] = useState<NotifTarget>('app');
  const [pymesSession, setPymesSession] = useState<any>(null);

  useEffect(() => {
    supabaseContable.auth.getSession().then(({ data: { session } }) => setPymesSession(session));
    const { data: l } = supabaseContable.auth.onAuthStateChange((_e, s) => setPymesSession(s));
    return () => l.subscription.unsubscribe();
  }, []);

  const tabBtn = (t: NotifTarget, label: string, color: string) => (
    <button onClick={() => setTarget(t)} style={{
      padding: '10px 18px', borderRadius: 12, border: target === t ? 'none' : `1px solid ${theme.border}`,
      background: target === t ? color : 'transparent', color: target === t ? (t === 'app' ? '#000' : '#fff') : theme.textSec,
      fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s'
    }}>{label}</button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        {tabBtn('app', '📱 Usuarios App', theme.primary)}
        {tabBtn('pymes', '🏢 Contadores Pymes', '#0EA5E9')}
      </div>

      {target === 'app' && <NotifPanel target="app" client={supabase} profileIdKey="id" isConnected={true} />}
      {target === 'pymes' && (
        <NotifPanel
          target="pymes"
          client={supabaseContable as any}
          profileIdKey="id_usuario"
          isConnected={!!pymesSession}
          onNeedLogin={() => alert('Ve a la pestaña "Soporte Pymes" e inicia sesión primero.')}
        />
      )}
    </div>
  );
};
