import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../context/ThemeContext';

const IconSend = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconPlus = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconChevronDown = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const IconBell = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const IconGlobe = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;

export default function CommsView() {
  const { theme, isDark } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState<'support' | 'notifications' | 'news'>('support');
  
  // Soporte
  const [tickets, setTickets] = useState<any[]>([]);
  const [expandedChat, setExpandedChat] = useState<string | null>(null);
  const [adminReplies, setAdminReplies] = useState<Record<string, string>>({});

  // Notificaciones App
  const [profiles, setProfiles] = useState<any[]>([]);
  const [sentNotifications, setSentNotifications] = useState<any[]>([]);
  const [notifForm, setNotifForm] = useState({ userId: 'all', title: '', content: '', type: 'info' });
  
  // Noticias Landing
  const [newsList, setNewsList] = useState<any[]>([]);
  const [isAddingNews, setIsAddingNews] = useState(false);
  const [newsForm, setNewsForm] = useState({ title: '', summary: '', content: '', category: 'Actualización', image_url: '', is_published: true });

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Nuevo Chat Modal
  const [isAddingChat, setIsAddingChat] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState('');

  const queryClient = useQueryClient();

  const { data: fetchedTickets } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const { data: ticketsData, error: tErr } = await supabase.from('soporte_tickets').select('*').order('created_at', { ascending: true });
      if (tErr) throw tErr;
      const { data: usersData, error: uErr } = await supabase.from('perfiles').select('id, nombre_completo, email');
      if (uErr) throw uErr;
      
      return ticketsData.map((t: any) => {
        const user = usersData?.find(u => u.id === t.usuario_id);
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

  const { data: fetchedNews } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { data, error } = await supabase.from('public_news').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: fetchedSentNotifications } = useQuery({
    queryKey: ['sentNotifications'],
    queryFn: async () => {
      const { data: notifications, error: err1 } = await supabase.from('user_notifications').select('*').eq('is_read', false).order('created_at', { ascending: false });
      if (err1) throw err1;
      const { data: usersData, error: err2 } = await supabase.from('perfiles').select('id, nombre_completo');
      if (err2) throw err2;
      
      return (notifications || []).map((n: any) => ({
        ...n,
        perfiles: { nombre_completo: usersData?.find(u => u.id === n.user_id)?.nombre_completo || 'Usuario' }
      }));
    }
  });

  useEffect(() => { if (fetchedTickets) setTickets(fetchedTickets); }, [fetchedTickets]);
  useEffect(() => { if (fetchedProfiles) setProfiles(fetchedProfiles); }, [fetchedProfiles]);
  useEffect(() => { if (fetchedNews) setNewsList(fetchedNews); }, [fetchedNews]);
  useEffect(() => { if (fetchedSentNotifications) setSentNotifications(fetchedSentNotifications); }, [fetchedSentNotifications]);

  useEffect(() => {
    const ticketSub = supabase.channel('soporte_admin').on('postgres_changes', { event: '*', schema: 'public', table: 'soporte_tickets' }, () => queryClient.invalidateQueries({queryKey: ['tickets']})).subscribe();
    const newsSub = supabase.channel('news_admin').on('postgres_changes', { event: '*', schema: 'public', table: 'public_news' }, () => queryClient.invalidateQueries({queryKey: ['news']})).subscribe();
    const notifSub = supabase.channel('notif_admin').on('postgres_changes', { event: '*', schema: 'public', table: 'user_notifications' }, () => queryClient.invalidateQueries({queryKey: ['sentNotifications']})).subscribe();

    return () => { 
      supabase.removeChannel(ticketSub); 
      supabase.removeChannel(newsSub);
      supabase.removeChannel(notifSub);
    };
  }, [queryClient]);

  const handleAdminReply = async (usuarioId: string) => {
    const respuesta = adminReplies[usuarioId];
    if (!respuesta?.trim()) return;
    await supabase.from('soporte_tickets').insert({ usuario_id: usuarioId, mensaje: respuesta, origen: 'admin', estado: 'abierto' });
    setAdminReplies(prev => ({ ...prev, [usuarioId]: "" }));
  };

  const handleCloseTicket = async (usuarioId: string) => {
    if (window.confirm("¿Marcar conversación como resuelta?")) {
      await supabase.from('soporte_tickets').update({ estado: 'resuelto' }).eq('usuario_id', usuarioId);
      queryClient.invalidateQueries({queryKey: ['tickets']});
    }
  };

  const handleSendNotification = async () => {
    if (!notifForm.title || !notifForm.content) return alert("Completa título y mensaje");
    if (notifForm.userId === 'all') {
      const inserts = profiles.map(p => ({ user_id: p.id, title: notifForm.title, content: notifForm.content, type: notifForm.type }));
      await supabase.from('user_notifications').insert(inserts);
    } else {
      await supabase.from('user_notifications').insert({ user_id: notifForm.userId, title: notifForm.title, content: notifForm.content, type: notifForm.type });
    }
    alert("Notificación enviada");
    setNotifForm({ userId: 'all', title: '', content: '', type: 'info' });
  };

  const deleteNotification = async (id: string) => {
    if (window.confirm("¿Ocultar/Eliminar del historial?")) {
      await supabase.from('user_notifications').delete().eq('id', id);
    }
  };

  const handleSaveNews = async () => {
    if (!newsForm.title || !newsForm.content) return alert("Completa título y contenido");
    const { error } = await supabase.from('public_news').insert([{ ...newsForm, published_at: new Date() }]);
    if (!error) {
      alert("Noticia publicada!");
      setIsAddingNews(false);
      setNewsForm({ title: '', summary: '', content: '', category: 'Actualización', image_url: '', is_published: true });
    } else alert("Error al publicar");
  };

  const deleteNews = async (id: string) => {
    if (window.confirm("¿Eliminar esta noticia?")) await supabase.from('public_news').delete().eq('id', id);
  };

  const chatsAgrupadosArray = Object.values(tickets.filter(t => t.estado === 'abierto').reduce((acc: any, t) => {
    if (!acc[t.usuario_id]) acc[t.usuario_id] = { id: t.usuario_id, nombre: t.perfiles?.nombre_completo, email: t.perfiles?.email, mensajes: [] };
    acc[t.usuario_id].mensajes.push(t);
    return acc;
  }, {}));

  const filteredChats = chatsAgrupadosArray.filter((chat: any) => {
    return (chat.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
           (chat.email || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const tabStyle = (active: boolean) => ({
    padding: '12px 20px', background: active ? theme.primary : 'transparent', color: active ? (isDark ? '#000' : '#fff') : theme.textSec,
    border: active ? 'none' : `1px solid ${theme.border}`, borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.3s'
  });

  const inputStyle = { padding: '12px 16px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, width: '100%', outline: 'none', fontSize: '0.9rem', marginBottom: 12 };
  const cardStyle = { background: theme.card, borderRadius: 20, border: `1px solid ${theme.border}`, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' };

  const filterSectionStyle = { 
    background: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.6)', 
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: 24, 
    border: `1px solid ${theme.border}`, 
    padding: 20, 
    marginBottom: 24, 
    boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.2)' : '0 10px 30px rgba(0,0,0,0.03)' 
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <button onClick={() => setActiveSubTab('support')} style={tabStyle(activeSubTab === 'support')}><IconSend /> Soporte App</button>
        <button onClick={() => setActiveSubTab('notifications')} style={tabStyle(activeSubTab === 'notifications')}><IconBell /> Notificaciones App</button>
        <button onClick={() => setActiveSubTab('news')} style={tabStyle(activeSubTab === 'news')}><IconGlobe /> Noticias Landing</button>
      </div>

      {activeSubTab === 'support' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>Bandeja de Entrada</h3>
            <button 
              onClick={() => setIsAddingChat(true)}
              style={{ background: theme.primary, border: 'none', padding: '8px 16px', borderRadius: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <IconPlus /> Nuevo Chat
            </button>
          </div>

          {/* FILTRO DE SOPORTE */}
          <div style={filterSectionStyle}>
              <div onClick={() => setShowFilters(!showFilters)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '10px', background: theme.primary + '15', color: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔍</div>
                      Refina su búsqueda
                  </h3>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</div>
              </div>
              
              {showFilters && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, marginTop: 20, paddingTop: 20, borderTop: `1px solid ${theme.border}` }}>
                      <div>
                          <label style={{display: 'block', fontSize: '0.75rem', color: theme.textSec, marginBottom: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px'}}>Nombre o Correo</label>
                          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Ej. Alex Rivera" style={{ ...inputStyle, marginBottom: 0 }} />
                      </div>
                  </div>
              )}
          </div>

          {filteredChats.length === 0 ? (
            <div style={{ textAlign: 'center', color: theme.textSec, padding: '60px 20px', border: `2px dashed ${theme.border}`, borderRadius: 16, background: theme.card }}>
              <h3>Bandeja Limpia</h3><p>No hay mensajes que coincidan con su búsqueda.</p>
            </div>
          ) : filteredChats.map((chat: any) => (
            <div key={chat.id} style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <div onClick={() => setExpandedChat(expandedChat === chat.id ? null : chat.id)} style={{ padding: 16, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: expandedChat === chat.id ? theme.accent : 'transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: theme.primary, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{chat.nombre?.charAt(0).toUpperCase() || '?'}</div>
                  <div><div style={{ fontWeight: 'bold' }}>{chat.nombre}</div><div style={{ fontSize: '0.75rem', color: theme.textSec }}>{chat.mensajes.filter((m:any) => m.id && m.id.toString && !m.id.toString().startsWith('temp-')).length} mensajes históricos</div></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   {chat.mensajes.some((m:any) => m.origen === 'usuario' && m.estado === 'abierto') && <div style={{ width: 10, height: 10, borderRadius: '50%', background: theme.primary }}></div>}
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
                     <input type="text" value={adminReplies[chat.id] || ""} onChange={e => setAdminReplies({ ...adminReplies, [chat.id]: e.target.value })} placeholder="Escribir respuesta..." style={{ ...inputStyle, marginBottom: 0 }} />
                     <button onClick={() => handleAdminReply(chat.id)} style={{ padding: '0 20px', borderRadius: 12, background: theme.primary, border: 'none', cursor: 'pointer' }}><IconSend /></button>
                   </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'notifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 15px 0' }}>Nueva Notificación</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
               <div><label style={{ fontSize: '0.7rem', fontWeight: 800, color: theme.textSec }}>Destinatario</label><select value={notifForm.userId} onChange={e => setNotifForm({...notifForm, userId: e.target.value})} style={inputStyle}><option value="all">Todos los usuarios</option>{profiles.map(p => <option key={p.id} value={p.id}>{p.nombre_completo}</option>)}</select></div>
               <div><label style={{ fontSize: '0.7rem', fontWeight: 800, color: theme.textSec }}>Tipo Alerta</label><select value={notifForm.type} onChange={e => setNotifForm({...notifForm, type: e.target.value})} style={inputStyle}><option value="info">Info</option><option value="success">Éxito</option><option value="warning">Aviso</option><option value="error">Error</option></select></div>
            </div>
            <input type="text" value={notifForm.title} onChange={e => setNotifForm({...notifForm, title: e.target.value})} placeholder="Título de la notificación" style={inputStyle} />
            <textarea value={notifForm.content} onChange={e => setNotifForm({...notifForm, content: e.target.value})} placeholder="Contenido del mensaje..." style={{ ...inputStyle, height: 80, resize: 'none' }} />
            <button onClick={handleSendNotification} style={{ width: '100%', background: theme.primary, border: 'none', padding: 14, borderRadius: 12, fontWeight: 900, cursor: 'pointer' }}>Enviar Mensaje</button>
          </div>
          <div style={cardStyle}>
             <h3 style={{ margin: '0 0 15px 0' }}>Historial de Notificaciones (Pendientes)</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
               {sentNotifications.map(n => (
                 <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: theme.bg, borderRadius: 16, border: `1px solid ${theme.border}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 900, background: theme.primary + '20', color: theme.primary, padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>Enviado</span>
                          <span style={{ fontSize: '0.75rem', color: theme.textSec, fontWeight: 700 }}>Para: {n.perfiles?.nombre_completo || 'Usuario'}</span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: theme.text, marginBottom: 2 }}>{n.title}</div>
                      <div style={{ fontSize: '0.85rem', color: theme.textSec, lineHeight: 1.4 }}>{n.content}</div>
                    </div>
                    <button 
                      onClick={() => deleteNotification(n.id)} 
                      style={{ background: '#ef444415', color: '#ef4444', border: '1px solid #ef444430', padding: '8px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      Bajar
                    </button>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}

      {activeSubTab === 'news' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Noticias en Landing</h3>
            <button onClick={() => setIsAddingNews(!isAddingNews)} style={{ background: theme.primary, border: 'none', padding: '8px 16px', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>{isAddingNews ? 'Cerrar' : '+ Nueva'}</button>
          </div>
          {isAddingNews && (
            <div style={cardStyle}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                  <input type="text" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} placeholder="Título" style={inputStyle} />
                  <select value={newsForm.category} onChange={e => setNewsForm({...newsForm, category: e.target.value})} style={inputStyle}><option>Actualización</option><option>Tip Financiero</option></select>
               </div>
               <textarea value={newsForm.summary} onChange={e => setNewsForm({...newsForm, summary: e.target.value})} placeholder="Resumen corto..." style={{ ...inputStyle, height: 60 }} />
               <textarea value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} placeholder="Detalle completo" style={{ ...inputStyle, height: 120 }} />
               <button onClick={handleSaveNews} style={{ width: '100%', background: theme.primary, border: 'none', padding: 14, borderRadius: 12, fontWeight: 900, cursor: 'pointer' }}>Publicar Noticia</button>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 15 }}>
            {newsList.map(item => (
              <div key={item.id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: theme.primary, fontWeight: 900, marginBottom: 8 }}><span>{item.category}</span><button onClick={() => deleteNews(item.id)} style={{ color: '#ff4444', border: 'none', background: 'transparent', cursor: 'pointer' }}>Borrar</button></div>
                <div style={{ fontWeight: 'bold', marginBottom: 5 }}>{item.title}</div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: theme.textSec }}>{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* MODAL NUEVO CHAT MODERNO */}
      {isAddingChat && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }} onClick={() => setIsAddingChat(false)}>
           <div style={{ ...cardStyle, width: '100%', maxWidth: 450, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ marginTop: 0, marginBottom: 20 }}>Iniciar Conversación</h3>
              <input 
                type="text" 
                autoFocus
                value={searchUserQuery} 
                onChange={e => setSearchUserQuery(e.target.value)} 
                placeholder="Buscar por nombre o correo..." 
                style={inputStyle} 
              />
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                 {profiles
                   .filter(p => !searchUserQuery || p.nombre_completo.toLowerCase().includes(searchUserQuery.toLowerCase()) || p.email.toLowerCase().includes(searchUserQuery.toLowerCase()))
                   .slice(0, 50)
                   .map(p => (
                   <div 
                     key={p.id} 
                     onClick={() => {
                        setExpandedChat(p.id);
                        if (!tickets.some(t => t.usuario_id === p.id)) {
                          setTickets(prev => [...prev, { 
                            id: 'temp-' + Date.now(), 
                            usuario_id: p.id, 
                            mensaje: "Iniciando conversación...", 
                            origen: 'admin', 
                            estado: 'abierto',
                            perfiles: { nombre_completo: p.nombre_completo, email: p.email }
                          }]);
                        }
                        setIsAddingChat(false);
                        setSearchUserQuery('');
                     }}
                     style={{ padding: 12, borderRadius: 12, border: `1px solid ${theme.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: '0.2s' }}
                     onMouseEnter={e => e.currentTarget.style.background = theme.accent}
                     onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                   >
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: theme.primary, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{p.nombre_completo.charAt(0)}</div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.nombre_completo}</div>
                        <div style={{ fontSize: '0.75rem', color: theme.textSec }}>{p.email}</div>
                      </div>
                   </div>
                 ))}
              </div>
              <button 
                onClick={() => setIsAddingChat(false)}
                style={{ marginTop: 20, width: '100%', padding: 12, borderRadius: 12, background: theme.bg, border: `1px solid ${theme.border}`, color: theme.textSec, cursor: 'pointer' }}
              >
                Cancelar
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
