import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../context/ThemeContext';

const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconChevronDown = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IconSend = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;

export default function CommsView() {
  const { theme, isDark } = useTheme();
  const [tickets, setTickets] = useState<any[]>([]);
  const [adminReplies, setAdminReplies] = useState<{ [key: string]: string }>({});
  const [expandedChat, setExpandedChat] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
    const channel = supabase.channel('soporte_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'soporte_tickets' }, () => fetchTickets())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchTickets = async () => {
    const { data: ticketsData } = await supabase.from('soporte_tickets').select('*').order('created_at', { ascending: true });
    const { data: usersData } = await supabase.from('perfiles').select('id, nombre_completo, email');
    
    if (ticketsData && usersData) {
      const fixedData = ticketsData.map((t: any) => {
        const user = usersData.find(u => u.id === t.usuario_id);
        return { ...t, perfiles: { nombre_completo: user?.nombre_completo || 'Usuario', email: user?.email || '' } };
      });
      setTickets(fixedData);
    }
  };

  const handleAdminReply = async (usuarioId: string) => {
    const respuesta = adminReplies[usuarioId];
    if (!respuesta?.trim()) return;
    await supabase.from('soporte_tickets').insert({ usuario_id: usuarioId, mensaje: respuesta, origen: 'admin', estado: 'abierto' });
    setAdminReplies(prev => ({ ...prev, [usuarioId]: "" }));
    fetchTickets();
  };

  const handleCloseTicket = async (usuarioId: string) => {
    if (window.confirm("¿Marcar conversación como resuelta?")) {
        await supabase.from('soporte_tickets').update({ estado: 'cerrado' }).eq('usuario_id', usuarioId);
        setExpandedChat(null);
        fetchTickets();
    }
  };

  const chatsAgrupados = tickets.filter(t => t.estado === 'abierto').reduce((acc: any, t) => {
    if (!acc[t.usuario_id]) acc[t.usuario_id] = { id: t.usuario_id, nombre: t.perfiles?.nombre_completo, email: t.perfiles?.email, mensajes: [] };
    acc[t.usuario_id].mensajes.push(t);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Object.keys(chatsAgrupados).length === 0 ? (
            <div style={{ textAlign: 'center', color: theme.textSec, padding: '60px 20px', border: `2px dashed ${theme.border}`, borderRadius: 16, background: theme.card }}>
                <h3 style={{margin: '0 0 10px 0', color: theme.text}}>Bandeja Limpia</h3>
                <p style={{margin: 0}}>No hay hilos de soporte abiertos.</p>
            </div>
        ) : (
            Object.values(chatsAgrupados).map((chat: any) => (
                <div key={chat.id} style={{ background: theme.card, borderRadius: '16px', border: `1px solid ${theme.border}`, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    
                    {/* CABECERA CHAT */}
                    <div onClick={() => setExpandedChat(expandedChat === chat.id ? null : chat.id)} style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: expandedChat === chat.id ? theme.accent : 'transparent' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: theme.primary, color: isDark ? '#000' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {chat.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold', color: theme.text }}>{chat.nombre}</div>
                                <div style={{ fontSize: '0.8rem', color: theme.textSec }}>{chat.mensajes.length} mensajes</div>
                            </div>
                        </div>
                        <span style={{ color: theme.textSec, transition: 'transform 0.3s', transform: expandedChat === chat.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            <IconChevronDown />
                        </span>
                    </div>

                    {/* CUERPO CHAT */}
                    {expandedChat === chat.id && (
                        <div style={{ padding: '20px', borderTop: `1px solid ${theme.border}`, background: theme.bg }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <span style={{ color: theme.textSec, fontSize: '0.85rem' }}>{chat.email}</span>
                                <button onClick={(e) => { e.stopPropagation(); handleCloseTicket(chat.id); }} style={{ background: isDark ? 'rgba(16,185,129,0.1)' : '#e8f5e9', color: '#10b981', border: `1px solid #10b98150`, padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold' }}>
                                    <IconCheck /> Resuelto
                                </button>
                            </div>

                            <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, padding: '15px', background: theme.card, borderRadius: '12px', border: `1px solid ${theme.border}` }}>
                                {chat.mensajes.map((m: any) => (
                                    <div key={m.id} style={{ alignSelf: m.origen === 'admin' ? 'flex-end' : 'flex-start', background: m.origen === 'admin' ? theme.primary : theme.inputBg, color: m.origen === 'admin' ? (isDark ? '#000':'#fff') : theme.text, padding: '12px 16px', borderRadius: m.origen === 'admin' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', maxWidth: '80%', fontSize: '0.9rem' }}>
                                        {m.mensaje}
                                        <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: 6, textAlign: m.origen === 'admin' ? 'right' : 'left' }}>
                                            {new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <input type="text" value={adminReplies[chat.id] || ""} onChange={(e) => setAdminReplies({ ...adminReplies, [chat.id]: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleAdminReply(chat.id)} placeholder="Responder..." style={{ flex: 1, background: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text, padding: '12px 16px', borderRadius: '12px', outline: 'none' }} />
                                <button onClick={() => handleAdminReply(chat.id)} style={{ background: theme.primary, color: isDark ? '#000' : '#fff', border: 'none', padding: '0 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                    <IconSend />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))
        )}
    </div>
  );
}
