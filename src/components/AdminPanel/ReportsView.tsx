import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis, Cell, FunnelChart, Funnel, LabelList, AreaChart, Area
} from 'recharts';

export default function ReportsView() {
  const { theme, isDark } = useTheme();
  const [data, setData] = useState<any[]>([]);
  const [precios] = useState({ 
    ia: 3.0, // Precio agrupado para módulos IA (Chat, Magic, Insights)
    pro: 0.3, 
    base: 0.1 
  });

  const { data: fetchedData, isLoading: loading } = useQuery({
    queryKey: ['reportData'],
    queryFn: async () => {
      const { data, error } = await supabase.from('perfiles').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  useEffect(() => {
    if (fetchedData) setData(fetchedData);
  }, [fetchedData]);

  // --- 1. LÓGICA DE SALUD FINANCIERA (MRR & ARPU) ---
  const financialStats = useMemo(() => {
    const totalRevenue = data.reduce((acc, u) => {
      let val = 0;
      if (u.permiso_chat || u.permiso_magic || u.permiso_insights) val += precios.ia;
      if (u.permiso_conciliacion || u.permiso_subcategorias) val += precios.pro;
      return acc + val;
    }, 0);
    return {
      mrr: totalRevenue,
      arpu: data.length > 0 ? totalRevenue / data.length : 0
    };
  }, [data]);

  // --- 2. MAPA DE CALOR (Registros por Día y Hora) ---
  const heatMapData = useMemo(() => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const matrix = days.map(day => ({ name: day, hours: Array(24).fill(0) }));
    
    data.forEach(u => {
      const date = new Date(u.creado_en);
      matrix[date.getDay()].hours[date.getHours()]++;
    });
    return matrix;
  }, [data]);

  // --- 3. GRÁFICO DE EMBUDO (Conversión de Usuarios) ---
  const funnelData = useMemo(() => {
    const total = data.length;
    const conPro = data.filter(u => u.permiso_subcategorias || u.permiso_conciliacion).length;
    const conIA = data.filter(u => u.permiso_chat || u.permiso_magic).length;
    
    return [
      { value: total, name: 'Registrados', fill: '#3b82f6' },
      { value: conPro, name: 'Usuarios Pro', fill: '#10b981' },
      { value: conIA, name: 'Usuarios IA (Premium)', fill: '#c084fc' },
    ];
  }, [data]);

  // --- 4. GRÁFICO DE DISPERSIÓN (Antigüedad vs Valor) ---
  const scatterData = useMemo(() => {
    return data.map(u => {
      const created = new Date(u.creado_en).getTime();
      const now = new Date().getTime();
      const daysOld = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      
      let valor = 0;
      if (u.permiso_chat) valor += 1;
      if (u.permiso_magic) valor += 1;
      if (u.permiso_insights) valor += 1;

      return { x: daysOld, y: valor, z: 1 };
    }).slice(0, 100); // Limitamos para rendimiento
  }, [data]);

  const cardStyle = {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px'
  };

  if (loading) return <div style={{ color: theme.text, padding: '40px', textAlign: 'center' }}>Cargando Reportes Maestros...</div>;

  return (
    <div style={{ paddingBottom: '50px' }}>
      <h2 style={{ color: theme.text, marginBottom: '25px' }}>📊 Business Intelligence</h2>

      {/* FILA 1: SALUD FINANCIERA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '25px' }}>
        <div style={{ ...cardStyle, textAlign: 'center', borderTop: `4px solid ${theme.primary}` }}>
          <div style={{ color: theme.textSec, fontSize: '0.8rem' }}>MRR ESTIMADO</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: theme.text }}>${financialStats.mrr.toFixed(2)}</div>
        </div>
        <div style={{ ...cardStyle, textAlign: 'center', borderTop: `4px solid #10b981` }}>
          <div style={{ color: theme.textSec, fontSize: '0.8rem' }}>ARPU (PROM. POR USUARIO)</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: theme.text }}>${financialStats.arpu.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* EMBUDO DE CONVERSIÓN */}
        <div style={cardStyle}>
          <h4 style={{ color: theme.text, marginTop: 0 }}>Embudo de Adopción</h4>
          <ResponsiveContainer width="100%" height={300}>
            <FunnelChart>
              <Tooltip contentStyle={{ borderRadius: '10px', background: theme.card }} />
              <Funnel dataKey="value" data={funnelData} isAnimationActive>
                <LabelList position="right" fill={theme.text} stroke="none" dataKey="name" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>

        {/* DISPERSIÓN: ANTIGÜEDAD VS USO IA */}
        <div style={cardStyle}>
          <h4 style={{ color: theme.text, marginTop: 0 }}>Antigüedad vs. Módulos IA</h4>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
              <XAxis type="number" dataKey="x" name="Días desde registro" unit="d" stroke={theme.textSec} />
              <YAxis type="number" dataKey="y" name="Módulos IA" stroke={theme.textSec} />
              <ZAxis type="number" range={[50, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Usuarios" data={scatterData} fill={theme.primary} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MAPA DE CALOR DE REGISTROS */}
      <div style={cardStyle}>
        <h4 style={{ color: theme.text, marginTop: 0 }}>Mapa de Calor: Actividad de Registros</h4>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '600px' }}>
            {heatMapData.map((day, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                <div style={{ width: '40px', fontSize: '0.7rem', color: theme.textSec }}>{day.name}</div>
                <div style={{ display: 'flex', gap: '2px', flex: 1 }}>
                  {day.hours.map((count, h) => (
                    <div 
                      key={h} 
                      title={`${count} registros a las ${h}:00`}
                      style={{ 
                        flex: 1, 
                        height: '20px', 
                        borderRadius: '2px',
                        background: count === 0 ? theme.border + '30' : theme.primary,
                        opacity: count === 0 ? 1 : Math.min(count / 5 + 0.2, 1) 
                      }} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.65rem', color: theme.textSec, paddingLeft: '45px' }}>
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
          </div>
        </div>
      </div>

      {/* RENDIMIENTO DE IA */}
      <div style={cardStyle}>
        <h4 style={{ color: theme.text, marginTop: 0 }}>Penetración de Herramientas IA</h4>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {['permiso_chat', 'permiso_magic', 'permiso_insights'].map(key => {
                const count = data.filter(u => u[key]).length;
                const perc = ((count / data.length) * 100).toFixed(1);
                return (
                    <div key={key} style={{ flex: 1, minWidth: '150px', background: theme.nav, padding: '15px', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.7rem', color: theme.textSec, textTransform: 'uppercase' }}>{key.replace('permiso_', '')}</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: theme.primary }}>{perc}%</div>
                        <div style={{ width: '100%', height: '4px', background: theme.border, marginTop: '8px', borderRadius: '2px' }}>
                            <div style={{ width: `${perc}%`, height: '100%', background: theme.primary, borderRadius: '2px' }} />
                        </div>
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  );
}
