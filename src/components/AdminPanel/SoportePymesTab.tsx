import React, { useEffect, useState } from 'react';
import { supabaseContable } from '../../services/supabaseContable';
import { useTheme } from '../../context/ThemeContext';

const IconSend = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>;
const IconChevronDown = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>;
const IconPlus = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;

export const SoportePymesTab: React.FC = () => {
  const { theme } = useTheme();
  const [session, setSession] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [perfiles, setPerfiles] = useState<any[]>([]);
  const [expandedChat, setExpandedChat] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const inputStyle: React.CSSProperties = { padding: '12px 16px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, width: '100%', outline: 'none', fontSize: '0.9rem', marginBottom: 12 };
  const cardStyle: React.CSSProperties = { background: theme.card, borderRadius: 20, border: `1px solid ${theme.border}`, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' };

  useEffect(() => {
    supabaseContable.auth.getSession().then(({ data: { session: s } }) => { setSession(s); if (s) { fetchTickets(); fetchPerfiles(); } });
    const { data: listener } = supabaseContable.auth.onAuthStateChange((_e, s) => { setSession(s); if (s) { fetchTickets(); fetchPerfiles(); } });
    const sub = supabaseContable.channel('pymes_soporte_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'soporte_tickets' }, () => fetchTickets())
      .subscribe();
    return () => { listener.subscription.unsubscribe(); supabaseContable.removeChannel(sub); };
  }, []);

  const fetchTickets = async () => {
    const { data: td } = await supabaseContable.from('soporte_tickets').select('*').order('created_at', { ascending: true });
    const { data: ud } = await supabaseContable.from('perfiles').select('id_usuario, nombre_completo, email');
    if (td) setTickets(td.map((t: any) => { const u = (ud || []).find((x: any) => x.id_usuario === t.usuario_id); return { ...t, perfiles: { nombre_completo: u?.nombre_completo || 'Contador', email: u?.email || '' } }; }));
  };

  const fetchPerfiles = async () => {
    const { data } = await supabaseContable.from('perfiles').select('id_usuario, nombre_completo, email').order('nombre_completo');
    if (data) setPerfiles(data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true); setAuthError('');
    const { data, error } = await supabaseContable.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) setAuthError('Credenciales inválidas. Usa las credenciales de administrador de Pymes.');
    else setSession(data.session);
    setAuthLoading(false);
  };

  const handleReply = async (usuarioId: string) => {
    const msg = replies[usuarioId]; if (!msg?.trim()) return;
    const { error } = await supabaseContable.from('soporte_tickets').insert({ usuario_id: usuarioId, mensaje: msg, origen: 'admin', estado: 'abierto' });
    if (!error) { setReplies(prev => ({ ...prev, [usuarioId]: '' })); fetchTickets(); }
  };

  const handleClose = async (usuarioId: string) => {
    if (window.confirm('¿Marcar conversación Pymes como resuelta?')) {
      await supabaseContable.from('soporte_tickets').update({ estado: 'resuelto' }).eq('usuario_id', usuarioId);
      fetchTickets();
    }
  };

  const handleStartChat = async (userId: string) => {
    const { error } = await supabaseContable.from('soporte_tickets').insert({ usuario_id: userId, mensaje: '👋 Hola, el equipo de Prospera se ha puesto en contacto contigo. ¿En qué podemos ayudarte?', origen: 'admin', estado: 'abierto' });
    if (!error) { fetchTickets(); setExpandedChat(userId); setShowNewChat(false); setUserSearch(''); }
  };

  // ── Sin sesión ── login inline
  if (!session) return (
    <div style={{ ...cardStyle, maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔐</div>
      <h3 style={{ marginTop: 0 }}>Acceso a Soporte Pymes</h3>
      <p style={{ color: theme.textSec, fontSize: '0.9rem', marginBottom: 24 }}>Inicia sesión con las credenciales de administrador de <strong>Prospera Pymes</strong>.</p>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="Correo admin Pymes" required style={{ ...inputStyle, marginBottom: 0 }} />
        <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="Contraseña" required style={{ ...inputStyle, marginBottom: 0 }} />
        {authError && <p style={{ color: '#ef4444', fontSize: '0.82rem', margin: 0 }}>{authError}</p>}
        <button type="submit" disabled={authLoading} style={{ width: '100%', background: '#0EA5E9', border: 'none', padding: 14, borderRadius: 12, fontWeight: 900, cursor: 'pointer', color: '#fff' }}>
          {authLoading ? 'Conectando...' : 'Conectar a Pymes DB'}
        </button>
      </form>
    </div>
  );

  const chatsAgrupados = Object.values(
    tickets.filter(t => t.estado === 'abierto').reduce((acc: any, t) => {
      if (!acc[t.usuario_id]) acc[t.usuario_id] = { id: t.usuario_id, nombre: t.perfiles?.nombre_completo, email: t.perfiles?.email, mensajes: [] };
      acc[t.usuario_id].mensajes.push(t);
      return acc;
    }, {})
  ) as any[];

  const filtered = chatsAgrupados.filter((c: any) =>
    (c.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0 }}>Bandeja de Soporte — Pymes</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: theme.textSec }}>Base de datos independiente · <span style={{ color: '#0EA5E9', fontWeight: 700 }}>🏢 PYMES DB</span></p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowNewChat(true)} style={{ background: '#0EA5E9', border: 'none', padding: '8px 14px', borderRadius: 12, fontWeight: 800, cursor: 'pointer', color: '#fff', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}><IconPlus /> Nuevo Chat</button>
          <button onClick={() => { supabaseContable.auth.signOut(); setSession(null); setTickets([]); }} style={{ background: 'transparent', border: `1px solid ${theme.border}`, padding: '8px 12px', borderRadius: 12, cursor: 'pointer', color: theme.textSec, fontSize: '0.75rem' }}>Desconectar</button>
        </div>
      </div>

      {/* Buscador */}
      <div style={{ ...cardStyle, display: 'flex', gap: 12, padding: '12px 16px' }}>
        <span>🔍</span>
        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Filtrar por nombre o correo..." style={{ ...inputStyle, marginBottom: 0, border: 'none', flex: 1 }} />
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: theme.textSec, padding: '60px 20px', border: `2px dashed ${theme.border}`, borderRadius: 16, background: theme.card }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏢</div>
          <h3>Sin mensajes de Pymes</h3><p>Cuando un contador escriba desde Prospera Pymes, aparecerá aquí.</p>
        </div>
      ) : filtered.map((chat: any) => (
        <div key={chat.id} style={{ ...cardStyle, padding: 0, overflow: 'hidden', border: `1px solid #0EA5E930` }}>
          <div onClick={() => setExpandedChat(expandedChat === chat.id ? null : chat.id)}
            style={{ padding: 16, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: expandedChat === chat.id ? theme.accent : 'transparent' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#0EA5E9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{chat.nombre?.charAt(0).toUpperCase() || '?'}</div>
              <div><div style={{ fontWeight: 'bold' }}>{chat.nombre}</div><div style={{ fontSize: '0.75rem', color: theme.textSec }}>{chat.mensajes.length} mensajes · {chat.email}</div></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {chat.mensajes.some((m: any) => m.origen === 'usuario' && m.estado === 'abierto') && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#0EA5E9' }} />}
              <IconChevronDown />
            </div>
          </div>
          {expandedChat === chat.id && (
            <div style={{ padding: 20, borderTop: `1px solid ${theme.border}`, background: theme.bg }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                <span style={{ fontSize: '0.8rem', color: theme.textSec }}>{chat.email}</span>
                <button onClick={() => handleClose(chat.id)} style={{ color: '#10b981', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 900 }}>Marcar Resuelto</button>
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: 10, background: theme.card, borderRadius: 12, marginBottom: 15 }}>
                {chat.mensajes.map((m: any) => (
                  <div key={m.id} style={{ alignSelf: m.origen === 'admin' ? 'flex-end' : 'flex-start', background: m.origen === 'admin' ? '#0EA5E9' : theme.inputBg, color: m.origen === 'admin' ? '#fff' : theme.text, padding: '10px 14px', borderRadius: 12, maxWidth: '85%', fontSize: '0.85rem' }}>{m.mensaje}</div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" value={replies[chat.id] || ''} onChange={e => setReplies({ ...replies, [chat.id]: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleReply(chat.id)}
                  placeholder="Responder al contador..." style={{ ...inputStyle, marginBottom: 0 }} />
                <button onClick={() => handleReply(chat.id)} style={{ padding: '0 20px', borderRadius: 12, background: '#0EA5E9', border: 'none', cursor: 'pointer' }}><IconSend /></button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Modal nuevo chat */}
      {showNewChat && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }} onClick={() => setShowNewChat(false)}>
          <div style={{ ...cardStyle, width: '100%', maxWidth: 450, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Iniciar conversación — Pymes</h3>
            <input type="text" autoFocus value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Buscar contador por nombre o correo..." style={inputStyle} />
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {perfiles.filter(p => !userSearch || (p.nombre_completo || '').toLowerCase().includes(userSearch.toLowerCase()) || (p.email || '').toLowerCase().includes(userSearch.toLowerCase())).slice(0, 50).map((p: any) => (
                <div key={p.id_usuario} onClick={() => handleStartChat(p.id_usuario)}
                  style={{ padding: 12, borderRadius: 12, border: `1px solid ${theme.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.accent}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0EA5E9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{(p.nombre_completo || '?').charAt(0).toUpperCase()}</div>
                  <div><div style={{ fontWeight: 700 }}>{p.nombre_completo || 'Contador'}</div><div style={{ fontSize: '0.75rem', color: theme.textSec }}>{p.email}</div></div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowNewChat(false)} style={{ marginTop: 16, width: '100%', padding: 12, borderRadius: 12, background: theme.bg, border: `1px solid ${theme.border}`, color: theme.textSec, cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};
