import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../context/ThemeContext';

// --- ÍCONOS SVG ---
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconChevronDown = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IconSend = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IconBell = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IconGlobe = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const IconPlus = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

export default function CommsView() {
  const { theme, isDark } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState<'support' | 'notifications' | 'news'>('support');
  
  // Soporte
  const [tickets, setTickets] = useState<any[]>([]);
  const [adminReplies, setAdminReplies] = useState<{ [key: string]: string }>({});
  const [expandedChat, setExpandedChat] = useState<string | null>(null);

  // Notificaciones App
  const [profiles, setProfiles] = useState<any[]>([]);
  const [notifForm, setNotifForm] = useState({ userId: 'all', title: '', content: '', type: 'info' });
  
  // Noticias Landing
  const [newsList, setNewsList] = useState<any[]>([]);
  const [isAddingNews, setIsAddingNews] = useState(false);
  const [newsForm, setNewsForm] = useState({ title: '', summary: '', content: '', category: 'Actualización', image_url: '', is_published: true });

  useEffect(() => {
    fetchTickets();
    fetchProfiles();
    fetchNews();

    // Suscripciones en tiempo real
    const ticketSub = supabase.channel('soporte_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'soporte_tickets' }, () => fetchTickets())
      .subscribe();
    
    const newsSub = supabase.channel('news_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'public_news' }, () => fetchNews())
      .subscribe();

    return () => { 
      supabase.removeChannel(ticketSub); 
      supabase.removeChannel(newsSub);
    };
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

  const fetchProfiles = async () => {
    const { data } = await supabase.from('perfiles').select('id, nombre_completo, email').order('nombre_completo');
    if (data) setProfiles(data);
  };

  const fetchNews = async () => {
    const { data } = await supabase.from('public_news').select('*').order('created_at', { ascending: false });
    if (data) setNewsList(data);
  };

  const handleAdminReply = async (usuarioId: string) => {
    const respuesta = adminReplies[usuarioId];
    if (!respuesta?.trim()) return;
    await supabase.from('soporte_tickets').insert({ usuario_id: usuarioId, mensaje: respuesta, origen: 'admin', estado: 'abierto' });
    setAdminReplies(prev => ({ ...prev, [usuarioId]: "" }));
    fetchTickets();
  };

  const handleSendNotification = async () => {
    if (!notifForm.title || !notifForm.content) return alert("Completa título y mensaje");
    
    if (notifForm.userId === 'all') {
      const inserts = profiles.map(p => ({
        usuario_id: p.id,
        title: notifForm.title,
        content: notifForm.content,
        type: notifForm.type
      }));
      await supabase.from('user_notifications').insert(inserts);
    } else {
      await supabase.from('user_notifications').insert({
        usuario_id: notifForm.userId,
        title: notifForm.title,
        content: notifForm.content,
        type: notifForm.type
      });
    }

    alert("Notificación enviada con éxito");
    setNotifForm({ userId: 'all', title: '', content: '', type: 'info' });
  };

  const handleSaveNews = async () => {
    if (!newsForm.title || !newsForm.summary) return alert("Completa título y resumen");
    await supabase.from('public_news').insert(newsForm);
    alert("Noticia publicada");
    setIsAddingNews(false);
    setNewsForm({ title: '', summary: '', content: '', category: 'Actualización', image_url: '', is_published: true });
    fetchNews();
  };

  const deleteNews = async (id: string) => {
    if (window.confirm("¿Eliminar noticia?")) {
      await supabase.from('public_news').delete().eq('id', id);
      fetchNews();
    }
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

  const glassStyle = { 
    background: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.6)', 
    backdropFilter: 'blur(16px)',
    borderRadius: 20, 
    border: `1px solid ${theme.border}`, 
    padding: 24,
    boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.2)' : '0 10px 30px rgba(0,0,0,0.03)' 
  };

  const tabStyle = (active: boolean) => ({
    padding: '12px 20px',
    background: active ? theme.primary : 'transparent',
    color: active ? (isDark ? '#000' : '#fff') : theme.textSec,
    border: active ? 'none' : `1px solid ${theme.border}`,
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 800,
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'all 0.3s'
  });

  const inputStyle = { 
    padding: '12px 16px', 
    borderRadius: 12, 
    border: `1px solid ${theme.border}`, 
    background: theme.inputBg, 
    color: theme.text, 
    width: '100%', 
    boxSizing: 'border-box' as const, 
    outline: 'none',
    fontSize: '0.9rem',
    marginBottom: 12
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
        
        {/* TABS DE COMUNICACIÓN */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <button onClick={() => setActiveSubTab('support')} style={tabStyle(activeSubTab === 'support')}><IconSend /> Soporte App</button>
            <button onClick={() => setActiveSubTab('notifications')} style={tabStyle(activeSubTab === 'notifications')}><IconBell /> Notificaciones App</button>
            <button onClick={() => setActiveSubTab('news')} style={tabStyle(activeSubTab === 'news')}><IconGlobe /> Noticias Landing</button>
        </div>

        {/* CONTENIDO SOPORTE */}
        {activeSubTab === 'support' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Object.keys(chatsAgrupados).length === 0 ? (
                    <div style={{ textAlign: 'center', color: theme.textSec, padding: '60px 20px', border: `2px dashed ${theme.border}`, borderRadius: 16, background: theme.card }}>
                        <h3 style={{margin: '0 0 10px 0', color: theme.text}}>Bandeja Limpia</h3>
                        <p style={{margin: 0}}>No hay hilos de soporte abiertos.</p>
                    </div>
                ) : (
                    Object.values(chatsAgrupados).map((chat: any) => (
                        <div key={chat.id} style={{ background: theme.card, borderRadius: '16px', border: `1px solid ${theme.border}`, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
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
                                        <input type="text" value={adminReplies[chat.id] || ""} onChange={(e) => setAdminReplies({ ...adminReplies, [chat.id]: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleAdminReply(chat.id)} placeholder="Responder..." style={inputStyle} />
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
        )}

        {/* NOTIFICACIONES APP */}
        {activeSubTab === 'notifications' && (
            <div style={glassStyle}>
                <h3 style={{ margin: '0 0 20px 0', fontWeight: 900 }}>Enviar Notificación de Sistema</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 20 }}>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, display: 'block', marginBottom: 8 }}>Destinatario</label>
                        <select value={notifForm.userId} onChange={e => setNotifForm({...notifForm, userId: e.target.value})} style={inputStyle}>
                            <option value="all">Todos los usuarios (Broadcast)</option>
                            {profiles.map(p => <option key={p.id} value={p.id}>{p.nombre_completo} ({p.email})</option>)}
                        </select>

                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, display: 'block', marginBottom: 8 }}>Título</label>
                        <input type="text" value={notifForm.title} onChange={e => setNotifForm({...notifForm, title: e.target.value})} placeholder="Ej: Nueva función disponible" style={inputStyle} />
                        
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, display: 'block', marginBottom: 8 }}>Categoría / Importancia</label>
                        <select value={notifForm.type} onChange={e => setNotifForm({...notifForm, type: e.target.value})} style={inputStyle}>
                            <option value="info">💡 Informativa (Azul)</option>
                            <option value="success">✅ Éxito / Regalo (Verde)</option>
                            <option value="warning">⚠️ Advertencia (Amarillo)</option>
                            <option value="error">🚨 Alerta Crítica (Rojo)</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, display: 'block', marginBottom: 8 }}>Mensaje Detallado</label>
                        <textarea value={notifForm.content} onChange={e => setNotifForm({...notifForm, content: e.target.value})} placeholder="Escribe el contenido de la notificación aquí..." style={{ ...inputStyle, height: 140, resize: 'none' }} />
                        
                        <button onClick={handleSendNotification} style={{ width: '100%', background: theme.primary, color: isDark ? '#000' : '#fff', border: 'none', padding: '16px', borderRadius: 12, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: `0 8px 20px ${theme.primary}40` }}>
                            <IconSend /> Desplegar Notificación
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* NOTICIAS LANDING */}
        {activeSubTab === 'news' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* BOTÓN NUEVA NOTICIA */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontWeight: 900 }}>Gestión de Boletín (Landing Page)</h3>
                    <button onClick={() => setIsAddingNews(!isAddingNews)} style={{ background: theme.primary, color: isDark ? '#000' : '#fff', border: 'none', padding: '10px 20px', borderRadius: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                       {isAddingNews ? 'Cancelar' : <><IconPlus /> Nueva Noticia</>}
                    </button>
                </div>

                {isAddingNews && (
                    <div style={{ ...glassStyle, border: `2px solid ${theme.primary}40` }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)', gap: 30 }}>
                            <div className="news-inputs">
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, display: 'block', marginBottom: 8 }}>Categoría</label>
                                <select value={newsForm.category} onChange={e => setNewsForm({...newsForm, category: e.target.value})} style={inputStyle}>
                                    <option value="Actualización">Actualización</option>
                                    <option value="Tip Financiero">Tip Financiero</option>
                                    <option value="Comunidad">Comunidad</option>
                                    <option value="Evento">Evento</option>
                                </select>

                                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, display: 'block', marginBottom: 8 }}>Título Llamativo</label>
                                <input type="text" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} placeholder="Ej: ¡Ya puedes conectar tu banco!" style={inputStyle} />

                                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, display: 'block', marginBottom: 8 }}>Resumen (Max 150 caracteres)</label>
                                <textarea value={newsForm.summary} onChange={e => setNewsForm({...newsForm, summary: e.target.value})} maxLength={150} placeholder="Un texto corto para la tarjeta..." style={{ ...inputStyle, height: 80, resize: 'none' }} />
                                
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, display: 'block', marginBottom: 8 }}>Imagen URL (Opcional)</label>
                                <input type="text" value={newsForm.image_url} onChange={e => setNewsForm({...newsForm, image_url: e.target.value})} placeholder="https://..." style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.textSec, display: 'block', marginBottom: 8 }}>Contenido Extendido</label>
                                <textarea value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} placeholder="Aquí va todo el detalle de la noticia..." style={{ ...inputStyle, height: 260, resize: 'none' }} />
                                
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button onClick={handleSaveNews} style={{ flex: 1, background: theme.primary, color: isDark ? '#000' : '#fff', border: 'none', padding: '16px', borderRadius: 12, fontWeight: 900, cursor: 'pointer' }}>Publicar en Landing</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* LISTADO DE NOTICIAS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                    {newsList.map(item => (
                        <div key={item.id} style={{ ...glassStyle, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: theme.primary }}>{item.category}</span>
                                <button onClick={() => deleteNews(item.id)} style={{ background: 'transparent', border: 'none', color: theme.danger, cursor: 'pointer', fontWeight: 800 }}>Eliminar</button>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{item.title}</div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: theme.textSec, lineHeight: 1.5 }}>{item.summary}</p>
                            <div style={{ fontSize: '0.7rem', color: theme.textSec, borderTop: `1px solid ${theme.border}`, paddingTop: 10, marginTop: 'auto' }}>
                                {new Date(item.published_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}
