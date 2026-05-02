import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../context/ThemeContext';

const IconSend = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>;
const IconChevronDown = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>;
const IconPlus = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;

export const SoporteAppTab: React.FC = () => {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [expandedChat, setExpandedChat] = useState<string | null>(null);
  const [adminReplies, setAdminReplies] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isAddingChat, setIsAddingChat] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  const inputStyle: React.CSSProperties = { padding: '12px 16px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, width: '100%', outline: 'none', fontSize: '0.9rem', marginBottom: 12 };
  const cardStyle: React.CSSProperties = { background: theme.card, borderRadius: 20, border: `1px solid ${theme.border}`, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' };

  const { data: fetchedTickets } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const { data: ticketsData, error: tErr } = await supabase.from('soporte_tickets').select('*').order('created_at', { ascending: true });
      if (tErr) throw tErr;
      const { data: usersData } = await supabase.from('perfiles').select('id, nombre_completo, email');
      return (ticketsData || []).map((t: any) => {
        const user = (usersData || []).find((u: any) => u.id === t.usuario_id);
        return { ...t, perfiles: { nombre_completo: user?.nombre_completo || 'Usuario', email: user?.email || '' } };
      });
    }
  });

  const { data: fetchedProfiles } = useQuery({
    queryKey: ['profilesComms'],
    queryFn: async () => {
      const { data, error } = await supabase.from('perfiles').select('id, nombre_completo, email').order('nombre_completo');
      if (error) throw error;
      return data || [];
    }
  });

  useEffect(() => { if (fetchedTickets) setTickets(fetchedTickets); }, [fetchedTickets]);
  useEffect(() => { if (fetchedProfiles) setProfiles(fetchedProfiles); }, [fetchedProfiles]);

  useEffect(() => {
    const sub = supabase.channel('soporte_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'soporte_tickets' }, () => queryClient.invalidateQueries({ queryKey: ['tickets'] }))
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [queryClient]);

  const handleAdminReply = async (usuarioId: string) => {
    const respuesta = adminReplies[usuarioId];
    if (!respuesta?.trim()) return;
    await supabase.from('soporte_tickets').insert({ usuario_id: usuarioId, mensaje: respuesta, origen: 'admin', estado: 'abierto' });
    setAdminReplies(prev => ({ ...prev, [usuarioId]: '' }));
  };

  const handleCloseTicket = async (usuarioId: string) => {
    if (window.confirm('¿Marcar conversación como resuelta?')) {
      await supabase.from('soporte_tickets').update({ estado: 'resuelto' }).eq('usuario_id', usuarioId);
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    }
  };

  const chatsAgrupados = Object.values(
    tickets.filter(t => t.estado === 'abierto').reduce((acc: any, t) => {
      if (!acc[t.usuario_id]) acc[t.usuario_id] = { id: t.usuario_id, nombre: t.perfiles?.nombre_completo, email: t.perfiles?.email, mensajes: [] };
      acc[t.usuario_id].mensajes.push(t);
      return acc;
    }, {})
  ) as any[];

  const filteredChats = chatsAgrupados.filter((c: any) =>
    (c.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Bandeja de Entrada — App</h3>
        <button onClick={() => setIsAddingChat(true)} style={{ background: theme.primary, border: 'none', padding: '8px 16px', borderRadius: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconPlus /> Nuevo Chat
        </button>
      </div>

      {/* Filtro */}
      <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, padding: 16 }}>
        <div onClick={() => setShowFilters(!showFilters)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          <span style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>🔍 Filtrar chats</span>
          <span style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: '0.3s' }}>▼</span>
        </div>
        {showFilters && (
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Nombre o correo..." style={{ ...inputStyle, marginTop: 12, marginBottom: 0 }} />
        )}
      </div>

      {/* Lista chats */}
      {filteredChats.length === 0 ? (
        <div style={{ textAlign: 'center', color: theme.textSec, padding: '60px 20px', border: `2px dashed ${theme.border}`, borderRadius: 16, background: theme.card }}>
          <h3>Bandeja Limpia</h3><p>No hay mensajes activos.</p>
        </div>
      ) : filteredChats.map((chat: any) => (
        <div key={chat.id} style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div onClick={() => setExpandedChat(expandedChat === chat.id ? null : chat.id)}
            style={{ padding: 16, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: expandedChat === chat.id ? theme.accent : 'transparent' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: theme.primary, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{chat.nombre?.charAt(0).toUpperCase() || '?'}</div>
              <div>
                <div style={{ fontWeight: 'bold' }}>{chat.nombre}</div>
                <div style={{ fontSize: '0.75rem', color: theme.textSec }}>{chat.mensajes.length} mensajes · {chat.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {chat.mensajes.some((m: any) => m.origen === 'usuario' && m.estado === 'abierto') && <div style={{ width: 10, height: 10, borderRadius: '50%', background: theme.primary }} />}
              <IconChevronDown />
            </div>
          </div>
          {expandedChat === chat.id && (
            <div style={{ padding: 20, borderTop: `1px solid ${theme.border}`, background: theme.bg }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                <span style={{ fontSize: '0.8rem', color: theme.textSec }}>{chat.email}</span>
                <button onClick={() => handleCloseTicket(chat.id)} style={{ color: '#10b981', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 900 }}>Marcar Resuelto</button>
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: 10, background: theme.card, borderRadius: 12, marginBottom: 15 }}>
                {chat.mensajes.map((m: any) => (
                  <div key={m.id} style={{ alignSelf: m.origen === 'admin' ? 'flex-end' : 'flex-start', background: m.origen === 'admin' ? theme.primary : theme.inputBg, color: m.origen === 'admin' ? '#000' : theme.text, padding: '10px 14px', borderRadius: 12, maxWidth: '85%', fontSize: '0.85rem' }}>{m.mensaje}</div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" value={adminReplies[chat.id] || ''} onChange={e => setAdminReplies({ ...adminReplies, [chat.id]: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleAdminReply(chat.id)}
                  placeholder="Escribir respuesta..." style={{ ...inputStyle, marginBottom: 0 }} />
                <button onClick={() => handleAdminReply(chat.id)} style={{ padding: '0 20px', borderRadius: 12, background: theme.primary, border: 'none', cursor: 'pointer' }}><IconSend /></button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Modal nuevo chat */}
      {isAddingChat && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }} onClick={() => setIsAddingChat(false)}>
          <div style={{ ...cardStyle, width: '100%', maxWidth: 450, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Iniciar Conversación — App</h3>
            <input type="text" autoFocus value={searchUserQuery} onChange={e => setSearchUserQuery(e.target.value)} placeholder="Buscar por nombre o correo..." style={inputStyle} />
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {profiles.filter(p => !searchUserQuery || (p.nombre_completo || '').toLowerCase().includes(searchUserQuery.toLowerCase()) || (p.email || '').toLowerCase().includes(searchUserQuery.toLowerCase())).slice(0, 50).map((p: any) => (
                <div key={p.id} onClick={() => { setExpandedChat(p.id); if (!tickets.some(t => t.usuario_id === p.id)) { setTickets(prev => [...prev, { id: 'temp-' + Date.now(), usuario_id: p.id, mensaje: 'Iniciando conversación...', origen: 'admin', estado: 'abierto', perfiles: { nombre_completo: p.nombre_completo, email: p.email } }]); } setIsAddingChat(false); setSearchUserQuery(''); }}
                  style={{ padding: 12, borderRadius: 12, border: `1px solid ${theme.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.accent}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: theme.primary, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{(p.nombre_completo || '?').charAt(0).toUpperCase()}</div>
                  <div><div style={{ fontWeight: 700 }}>{p.nombre_completo || 'Usuario'}</div><div style={{ fontSize: '0.75rem', color: theme.textSec }}>{p.email}</div></div>
                </div>
              ))}
            </div>
            <button onClick={() => setIsAddingChat(false)} style={{ marginTop: 16, width: '100%', padding: 12, borderRadius: 12, background: theme.bg, border: `1px solid ${theme.border}`, color: theme.textSec, cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};
