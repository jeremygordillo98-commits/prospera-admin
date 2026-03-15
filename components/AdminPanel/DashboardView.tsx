import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useData, PreciosConfig } from '../../context/DataContext';
import { supabase } from '../../services/supabase';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';

const IconCalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconEdit = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>;

export default function DashboardView() {
  const { theme, isDark } = useTheme();
  const { precios: preciosDB, updatePrecios } = useData();
  
  // --- ESTADO DE PRECIOS EDITABLE ---
  const [precios, setPrecios] = useState<PreciosConfig>(preciosDB);

  useEffect(() => {
    setPrecios(preciosDB);
  }, [preciosDB]);

  const [isEditing, setIsEditing] = useState(false);
  const [perfilesRaw, setPerfilesRaw] = useState<any[]>([]); 
  const [stats, setStats] = useState({ total: 0, ultra: 0, pro: 0, basico: 0, usersWithPending: 0, valorEstimado: 0 });
  const [plansData, setPlansData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('week');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    fetchDashboardData();
    return () => window.removeEventListener('resize', handleResize);
  }, [timeRange, customRange]);

  useEffect(() => {
    if (perfilesRaw.length > 0) {
      updateCalculations(perfilesRaw);
    }
  }, [precios]);

  const calculateUserValue = (u: any, p: typeof precios) => {
    let total = 0;
    if (u.permiso_presupuestos) total += p.presupuestos;
    if (u.permiso_recordatorios) total += p.recordatorios;
    if (u.permiso_subcategorias) total += p.subcategorias;
    if (u.permiso_reporte_patrimonio) total += p.reporte_patrimonio;
    if (u.permiso_reporte_estado) total += p.reporte_estado;
    if (u.permiso_reporte_flujo) total += p.reporte_flujo;
    if (u.permiso_conciliacion) total += p.conciliacion;
    if (u.permiso_reporte_comparativo) total += p.reporte_comparativo;
    if (u.permiso_reporte_calor) total += p.reporte_calor;
    if (u.permiso_chat) total += p.chat;
    if (u.permiso_magic) total += p.magic;
    if (u.permiso_insights) total += p.insights;
    return total;
  };

  const calculateUserLevel = (u: any) => {
    const ultraCount = (u.permiso_chat ? 1 : 0) + (u.permiso_magic ? 1 : 0) + (u.permiso_insights ? 1 : 0) + (u.permiso_reporte_comparativo ? 1 : 0) + (u.permiso_reporte_calor ? 1 : 0);
    if (ultraCount > 0) return 'ULTRA';
    const proCount = (u.permiso_conciliacion ? 1 : 0) + (u.permiso_subcategorias ? 1 : 0) + (u.permiso_reporte_patrimonio ? 1 : 0) + (u.permiso_reporte_estado ? 1 : 0) + (u.permiso_reporte_flujo ? 1 : 0);
    if (proCount > 0) return 'PRO';
    return 'BÁSICO';
  };

  const updateCalculations = (data: any[]) => {
    let ultra = 0, pro = 0, basico = 0, valorTotal = 0;
    data.forEach(u => {
      const level = calculateUserLevel(u);
      if (level === 'ULTRA') ultra++; else if (level === 'PRO') pro++; else basico++;
      valorTotal += calculateUserValue(u, precios);
    });

    setStats(prev => ({ ...prev, ultra, pro, basico, valorEstimado: valorTotal, total: data.length }));
    setPlansData([
      { name: 'ULTRA', value: ultra, color: '#c084fc' },
      { name: 'PRO', value: pro, color: '#10b981' },
      { name: 'BÁSICO', value: basico, color: '#3b82f6' },
    ]);
  };

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const { data: perfiles } = await supabase.from('perfiles').select('*');
      const { data: pendingTickets } = await supabase.from('soporte_tickets').select('user_id').eq('leido', false);
      const uniqueUsersPending = new Set(pendingTickets?.map(t => t.user_id)).size;

      if (perfiles) {
        setPerfilesRaw(perfiles);
        updateCalculations(perfiles);
      }
      setStats(prev => ({ ...prev, usersWithPending: uniqueUsersPending }));
      await fetchChartData();
    } catch (error) { console.error("Error Dashboard:", error); } finally { setLoading(false); }
  }

  async function fetchChartData() {
    let startDate = new Date();
    if (timeRange === 'today') startDate.setHours(0,0,0,0);
    else if (timeRange === 'week') startDate.setDate(startDate.getDate() - 7);
    else if (timeRange === 'month') startDate.setMonth(startDate.getMonth() - 1);
    else if (timeRange === 'year') startDate.setFullYear(startDate.getFullYear() - 1);
    else if (timeRange === 'custom' && customRange.start) { startDate = new Date(customRange.start); startDate.setHours(0,0,0,0); }

    let query = supabase.from('perfiles').select('creado_en').gte('creado_en', startDate.toISOString());
    if (timeRange === 'custom' && customRange.end) {
        const endDate = new Date(customRange.end);
        endDate.setHours(23,59,59,999);
        query = query.lte('creado_en', endDate.toISOString());
    }
    const { data } = await query.order('creado_en', { ascending: true });
    const grouped = data?.reduce((acc: any, curr: any) => {
      const date = new Date(curr.creado_en).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    setChartData(Object.keys(grouped || {}).map(key => ({ name: key, usuarios: grouped[key] })));
  }

  const handlePrecioChange = (key: keyof PreciosConfig, value: string) => {
    setPrecios(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const handleSavePrecios = async () => {
      await updatePrecios(precios);
      setIsEditing(false);
  };

  const cardStyle = {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: '24px',
    padding: isMobile ? '20px' : '24px',
    boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.2)' : '0 10px 40px rgba(0,0,0,0.03)',
    position: 'relative' as const,
    overflow: 'hidden'
  };

  const kpiStyle = (lineColor: string) => ({
    ...cardStyle,
    borderLeft: `6px solid ${lineColor}`,
    background: isDark ? `linear-gradient(145deg, ${theme.card}, rgba(30, 41, 59, 0.4))` : theme.card
  });

  const inputStyle = {
    width: '70px',
    background: theme.inputBg,
    color: theme.text,
    border: `1px solid ${theme.border}`,
    borderRadius: '10px',
    padding: '6px 10px',
    fontSize: '0.85rem',
    textAlign: 'right' as const,
    fontWeight: 800,
    outline: 'none'
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', paddingBottom: '60px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '40px', flexDirection: isMobile ? 'column' : 'row', gap: '24px' }}>
        <div>
            <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.2rem', margin: 0, color: theme.text, fontWeight: 900, letterSpacing: '-1.5px' }}>Prospera Insights</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                <p style={{ margin: 0, color: theme.textSec, fontSize: '0.9rem', fontWeight: 600 }}>Sistemas Operativos • Real-time</p>
            </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', background: theme.inputBg, padding: '6px', borderRadius: '16px', border: `1px solid ${theme.border}`, alignSelf: isMobile ? 'center' : 'auto' }}>
          {(['today', 'week', 'month', 'year'] as const).map((range) => (
            <button key={range} onClick={() => setTimeRange(range)} style={{ padding: '10px 18px', borderRadius: '12px', border: 'none', background: timeRange === range ? theme.primary : 'transparent', color: timeRange === range ? (isDark ? '#000' : '#fff') : theme.textSec, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 800, transition: 'all 0.2s' }}>
              {range === 'today' ? 'Hoy' : range === 'week' ? 'Semana' : range === 'month' ? 'Mes' : 'Año'}
            </button>
          ))}
          <button onClick={() => setTimeRange('custom')} style={{ padding: '10px', borderRadius: '12px', border: 'none', background: timeRange === 'custom' ? theme.primary : 'transparent', color: timeRange === 'custom' ? (isDark ? '#000' : '#fff') : theme.textSec, cursor: 'pointer', display: 'flex' }}> <IconCalendar /> </button>
        </div>
      </div>

      {/* RANGO PERSONALIZADO */}
      {timeRange === 'custom' && (
        <div style={{ marginBottom: '30px', display: 'flex', gap: '15px', flexDirection: isMobile ? 'column' : 'row', background: theme.card, padding: '20px', borderRadius: '20px', border: `1px solid ${theme.primary}50` }}>
          <div style={{flex: 1}}>
            <label style={{display:'block', fontSize:'0.7rem', fontWeight:800, marginBottom:8, color:theme.textSec}}>FECHA INICIAL</label>
            <input type="date" value={customRange.start} onChange={(e) => setCustomRange({...customRange, start: e.target.value})} style={{ background: theme.inputBg, color: theme.text, border: `1px solid ${theme.border}`, padding: '12px', borderRadius: '12px', width:'100%', boxSizing:'border-box', outline: 'none' }} />
          </div>
          <div style={{flex: 1}}>
            <label style={{display:'block', fontSize:'0.7rem', fontWeight:800, marginBottom:8, color:theme.textSec}}>FECHA FINAL</label>
            <input type="date" value={customRange.end} onChange={(e) => setCustomRange({...customRange, end: e.target.value})} style={{ background: theme.inputBg, color: theme.text, border: `1px solid ${theme.border}`, padding: '12px', borderRadius: '12px', width:'100%', boxSizing:'border-box', outline: 'none' }} />
          </div>
        </div>
      )}

      {/* TARJETAS KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={kpiStyle(theme.primary)}><div style={{ color: theme.textSec, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Usuarios</div><div style={{ fontSize: '2.2rem', fontWeight: 900 }}>{loading ? '...' : stats.total}</div></div>
        <div style={kpiStyle('#c084fc')}><div style={{ color: '#c084fc', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Usuarios Ultra</div><div style={{ fontSize: '2.2rem', fontWeight: 900 }}>{loading ? '...' : stats.ultra}</div></div>
        <div style={kpiStyle('#10b981')}><div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Usuarios Pro</div><div style={{ fontSize: '2.2rem', fontWeight: 900 }}>{loading ? '...' : stats.pro}</div></div>
        <div style={kpiStyle(theme.danger)}><div style={{ color: theme.danger, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Soporte</div><div style={{ fontSize: '2.2rem', fontWeight: 900 }}>{loading ? '...' : stats.usersWithPending}</div></div>
      </div>

      {/* SECCIÓN DE VALORIZACIÓN */}
      <div style={{ ...cardStyle, marginBottom: '30px', background: isDark ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(16, 185, 129, 0.05))', border: `2px solid ${theme.primary}40`, padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row', gap: '24px' }}>
          <div>
            <h4 style={{ margin: 0, color: theme.primary, fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>📊 Valorización del Ecosistema</h4>
            <p style={{ margin: '8px 0 0 0', color: theme.textSec, fontSize: '0.9rem', fontWeight: 500 }}>Proyección basada en la configuración de servicios activa.</p>
          </div>
          <div style={{ textAlign: isMobile ? 'center' : 'right' }}>
            <div style={{ fontSize: '0.8rem', color: theme.textSec, fontWeight: 800, letterSpacing: '1px' }}>VALOR POTENCIAL ESTIMADO</div>
            <div style={{ fontSize: '3rem', fontWeight: 950, color: theme.text, letterSpacing: '-2px' }}>${loading ? '0.00' : stats.valorEstimado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      {/* DESGLOSE DE PRECIOS EDITABLE */}
      <div style={{ position: 'relative', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900 }}>Estructura de Precios</h3>
            <button 
              onClick={() => {
                  if (isEditing) handleSavePrecios();
                  else setIsEditing(true);
              }}
              style={{ background: isEditing ? theme.primary : theme.inputBg, color: isEditing ? (isDark ? '#000' : '#fff') : theme.text, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '10px 20px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10, transition: 'all 0.2s' }}
            >
              {isEditing ? <><IconCheck /> GUARDAR</> : <><IconEdit /> AJUSTAR TARIFAS</>}
            </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
          {/* BÁSICOS */}
          <div style={cardStyle}>
            <div style={{ background: '#3b82f6', width: 40, height: 4, borderRadius: 2, marginBottom: 16 }}></div>
            <h5 style={{ marginTop: 0, color: '#3b82f6', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Fase Iniciación</h5>
            {[
              { label: 'Presupuestos', key: 'presupuestos' },
              { label: 'Recordatorios', key: 'recordatorios' }
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${theme.border}`, alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.label}</span>
                {isEditing ? (
                  <input type="number" step="0.01" value={precios[item.key as keyof typeof precios]} onChange={(e) => handlePrecioChange(item.key as keyof typeof precios, e.target.value)} style={inputStyle} />
                ) : (
                  <b style={{ fontSize: '1rem', fontWeight: 800 }}>${precios[item.key as keyof typeof precios].toFixed(2)}</b>
                )}
              </div>
            ))}
          </div>

          {/* PRO */}
          <div style={cardStyle}>
            <div style={{ background: '#10b981', width: 40, height: 4, borderRadius: 2, marginBottom: 16 }}></div>
            <h5 style={{ marginTop: 0, color: '#10b981', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Fase Analítica</h5>
            {[
              { label: 'Conciliación', key: 'conciliacion' },
              { label: 'Subcategorías', key: 'subcategorias' },
              { label: 'Reportes Pro', key: 'reporte_patrimonio' }
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${theme.border}`, alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.label}</span>
                {isEditing ? (
                  <input type="number" step="0.01" value={precios[item.key as keyof typeof precios]} onChange={(e) => handlePrecioChange(item.key as keyof typeof precios, e.target.value)} style={inputStyle} />
                ) : (
                  <b style={{ fontSize: '1rem', fontWeight: 800 }}>${precios[item.key as keyof typeof precios].toFixed(2)}</b>
                )}
              </div>
            ))}
          </div>

          {/* ULTRA */}
          <div style={cardStyle}>
            <div style={{ background: '#c084fc', width: 40, height: 4, borderRadius: 2, marginBottom: 16 }}></div>
            <h5 style={{ marginTop: 0, color: '#c084fc', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Fase Avanzada</h5>
            {[
              { label: 'IA Integral', key: 'chat' },
              { label: 'Ingreso Mágico', key: 'magic' },
              { label: 'Insights IA', key: 'insights' }
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${theme.border}`, alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.label}</span>
                {isEditing ? (
                  <input type="number" step="0.01" value={precios[item.key as keyof typeof precios]} onChange={(e) => handlePrecioChange(item.key as keyof typeof precios, e.target.value)} style={inputStyle} />
                ) : (
                  <b style={{ fontSize: '1rem', fontWeight: 800 }}>${precios[item.key as keyof typeof precios].toFixed(2)}</b>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.8fr 1fr', gap: '24px' }}>
        <div style={{ ...cardStyle, height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.5px' }}>Adquisición de Usuarios</h4>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs><linearGradient id="colorU" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={theme.primary} stopOpacity={0.4}/><stop offset="95%" stopColor={theme.primary} stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="4 4" stroke={theme.border} vertical={false} />
                <XAxis dataKey="name" stroke={theme.textSec} fontSize={11} tickLine={false} axisLine={false} tickMargin={10} fontWeight={600} />
                <YAxis stroke={theme.textSec} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} fontWeight={600} />
                <Tooltip contentStyle={{ background: theme.card, borderColor: theme.border, borderRadius: '16px', color: theme.text, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 800 }} />
                <Area type="monotone" dataKey="usuarios" stroke={theme.primary} fillOpacity={1} fill="url(#colorU)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ ...cardStyle, height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.5px' }}>Mix de Suscripción</h4>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plansData} layout="vertical" margin={{ left: -10, right: 30, top: 10, bottom: 10 }}>
                <XAxis type="number" hide /><YAxis dataKey="name" type="category" stroke={theme.textSec} fontSize={11} width={80} tickLine={false} axisLine={false} fontWeight={800} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ background: theme.card, borderRadius: '16px', border: `1px solid ${theme.border}`, color: theme.text, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 800 }} />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={40}>{plansData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{textAlign: 'center', fontSize: '0.75rem', color: theme.textSec, marginTop: 16, fontWeight: 700, opacity: 0.6}}>SEGMENTACIÓN DINÁMICA DE AUDIENCIA</div>
        </div>
      </div>
    </div>
  );
}
