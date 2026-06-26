import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase';
import { supabaseContable } from '../../services/supabaseContable';
import CohortAnalysis from './CohortAnalysis';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis, FunnelChart, Funnel, LabelList, Legend
} from 'recharts';
import { Users, Building2, TrendingUp, DollarSign, BarChart3, Loader2 } from 'lucide-react';

export default function ReportsView() {
  const { theme, isDark } = useTheme();
  const [activeDashboard, setActiveDashboard] = useState<'b2c' | 'b2b'>('b2c');
  const [data, setData] = useState<any[]>([]);
  const [precios] = useState({ 
    ia: 3.0, // Precio agrupado para módulos IA (Chat, Magic, Insights)
    pro: 0.3, 
    base: 0.1 
  });

  // --- QUERY B2C ---
  const { data: fetchedB2CData, isLoading: loadingB2C } = useQuery({
    queryKey: ['reportDataB2C'],
    queryFn: async () => {
      const { data, error } = await supabase.from('perfiles').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // --- QUERY B2B ---
  const { data: fetchedB2BData, isLoading: loadingB2B } = useQuery({
    queryKey: ['reportDataB2B'],
    queryFn: async () => {
      const { data: perfiles, error: pErr } = await supabaseContable.from('perfiles').select('*');
      if (pErr) throw pErr;

      const { data: empresas, error: eErr } = await supabaseContable.from('empresas_gestionadas').select('*');
      if (eErr) throw eErr;

      return { perfiles: perfiles || [], empresas: empresas || [] };
    }
  });

  useEffect(() => {
    if (fetchedB2CData) setData(fetchedB2CData);
  }, [fetchedB2CData]);

  // --- 1. LÓGICA B2C APP ---
  const financialStatsB2C = useMemo(() => {
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

  const heatMapDataB2C = useMemo(() => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const matrix = days.map(day => ({ name: day, hours: Array(24).fill(0) }));
    
    data.forEach(u => {
      const date = new Date(u.creado_en);
      matrix[date.getDay()].hours[date.getHours()]++;
    });
    return matrix;
  }, [data]);

  const funnelDataB2C = useMemo(() => {
    const total = data.length;
    const conPro = data.filter(u => u.permiso_subcategorias || u.permiso_conciliacion).length;
    const conIA = data.filter(u => u.permiso_chat || u.permiso_magic).length;
    
    return [
      { value: total, name: 'Registrados', fill: '#3b82f6' },
      { value: conPro, name: 'Usuarios Pro', fill: '#10b981' },
      { value: conIA, name: 'Usuarios IA (Premium)', fill: '#c084fc' },
    ];
  }, [data]);

  const scatterDataB2C = useMemo(() => {
    return data.map(u => {
      const created = new Date(u.creado_en).getTime();
      const now = new Date().getTime();
      const daysOld = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      
      let valor = 0;
      if (u.permiso_chat) valor += 1;
      if (u.permiso_magic) valor += 1;
      if (u.permiso_insights) valor += 1;

      return { x: daysOld, y: valor, z: 1 };
    }).slice(0, 100);
  }, [data]);

  // --- 2. LÓGICA B2B PYMES ---
  const financialStatsB2B = useMemo(() => {
    if (!fetchedB2BData) return { totalContadores: 0, totalEmpresas: 0, mrr: 0, arpu: 0 };
    const { perfiles, empresas } = fetchedB2BData;

    // Calcular MRR B2B:
    // Base de $10.00 por cada empresa gestionada + módulos adicionales contratados
    let mrr = 0;
    empresas.forEach(emp => {
      let val = 10.0;
      if (emp.permiso_reportes_pdf) val += 3.0;
      if (emp.permiso_descarga_ats) val += 5.0;
      if (emp.permiso_comunicacion_cliente) val += 4.0;
      mrr += val;
    });

    const arpu = perfiles.length > 0 ? mrr / perfiles.length : 0;

    return {
      totalContadores: perfiles.length,
      totalEmpresas: empresas.length,
      mrr,
      arpu
    };
  }, [fetchedB2BData]);

  const b2bAdoptionData = useMemo(() => {
    if (!fetchedB2BData) return [];
    const { empresas } = fetchedB2BData;
    const conPdf = empresas.filter(e => e.permiso_reportes_pdf).length;
    const conAts = empresas.filter(e => e.permiso_descarga_ats).length;
    const conMailer = empresas.filter(e => e.permiso_comunicacion_cliente).length;
    
    return [
      { name: 'Reportes PDF', valor: conPdf, fill: '#10b981' },
      { name: 'Descarga ATS', valor: conAts, fill: '#f59e0b' },
      { name: 'Mailer Pymes', valor: conMailer, fill: '#8b5cf6' }
    ];
  }, [fetchedB2BData]);

  const b2bDistributionData = useMemo(() => {
    if (!fetchedB2BData) return [];
    const { perfiles, empresas } = fetchedB2BData;
    
    const countMap = new Map<string, number>();
    empresas.forEach(emp => {
      if (emp.id_usuario) {
        countMap.set(emp.id_usuario, (countMap.get(emp.id_usuario) || 0) + 1);
      }
    });

    let range0 = 0;
    let range1_2 = 0;
    let range3_5 = 0;
    let rangeMore = 0;

    perfiles.forEach(p => {
      const count = countMap.get(p.id_usuario) || 0;
      if (count === 0) range0++;
      else if (count <= 2) range1_2++;
      else if (count <= 5) range3_5++;
      else rangeMore++;
    });

    return [
      { name: '0 Empresas', contadores: range0, fill: '#94a3b8' },
      { name: '1-2 Empresas', contadores: range1_2, fill: '#3b82f6' },
      { name: '3-5 Empresas', contadores: range3_5, fill: '#10b981' },
      { name: '5+ Empresas', contadores: rangeMore, fill: '#8b5cf6' }
    ];
  }, [fetchedB2BData]);

  const cardStyle = {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '25px',
    boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.15)' : '0 10px 30px rgba(0,0,0,0.02)',
  };

  const cardHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: 0,
    marginBottom: '20px',
    color: theme.text,
    fontSize: '1.1rem',
    fontWeight: 800
  };

  const tabStyle = (active: boolean) => ({
    padding: '10px 24px',
    borderRadius: '14px',
    border: 'none',
    background: active ? theme.primary : 'transparent',
    color: active ? '#fff' : theme.textSec,
    fontSize: '0.85rem',
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: active ? `0 6px 20px ${theme.primary}40` : 'none',
  });

  const isLoading = activeDashboard === 'b2c' ? loadingB2C : loadingB2B;

  return (
    <div style={{ paddingBottom: '60px', animation: 'fadeIn 0.5s ease' }}>
      
      {/* HEADER Y SELECTOR DE DASHBOARD DUAL */}
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '35px' }}>
        <div>
          <h2 style={{ color: theme.text, margin: 0, fontWeight: 900, letterSpacing: '-0.5px' }}>📊 Business Intelligence</h2>
          <p style={{ color: theme.textSec, fontSize: '0.85rem', margin: '5px 0 0 0' }}>Estadísticas consolidadas y métricas reales del ecosistema Prospera.</p>
        </div>

        {/* SELECTOR GLASSMORPHISM */}
        <div style={{ 
          display: 'flex', 
          background: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.8)', 
          padding: '6px', 
          borderRadius: '18px',
          border: `1px solid ${theme.border}`
        }}>
          <button 
            onClick={() => setActiveDashboard('b2c')} 
            style={tabStyle(activeDashboard === 'b2c')}
          >
            📱 Prospera App (B2C)
          </button>
          <button 
            onClick={() => setActiveDashboard('b2b')} 
            style={tabStyle(activeDashboard === 'b2b')}
          >
            🏢 Prospera Pymes (B2B)
          </button>
        </div>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', color: theme.textSec }}>
          <Loader2 className="animate-spin text-primary" size={40} style={{ color: theme.primary, marginBottom: '15px' }} />
          <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Cargando analíticas maestras...</div>
        </div>
      )}

      {!isLoading && activeDashboard === 'b2c' && (
        <div style={{ animation: 'slideIn 0.3s ease' }}>
          {/* METRICAS PRINCIPALES B2C */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '25px', marginBottom: '25px' }}>
            <div style={{ ...cardStyle, borderTop: `4px solid ${theme.primary}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ color: theme.textSec, fontSize: '0.75rem', fontWeight: 800 }}>USUARIOS REGISTRADOS</span>
                <Users size={18} style={{ color: theme.primary }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: theme.text }}>{data.length}</div>
            </div>
            
            <div style={{ ...cardStyle, borderTop: `4px solid #10b981` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ color: theme.textSec, fontSize: '0.75rem', fontWeight: 800 }}>MRR ESTIMADO</span>
                <DollarSign size={18} style={{ color: '#10b981' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: theme.text }}>${financialStatsB2C.mrr.toFixed(2)}</div>
            </div>

            <div style={{ ...cardStyle, borderTop: `4px solid #8b5cf6` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ color: theme.textSec, fontSize: '0.75rem', fontWeight: 800 }}>ARPU (PROM. MENSUAL)</span>
                <TrendingUp size={18} style={{ color: '#8b5cf6' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: theme.text }}>${financialStatsB2C.arpu.toFixed(2)}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginBottom: '25px' }}>
            {/* EMBUDO DE ADOPCIÓN */}
            <div style={cardStyle}>
              <h4 style={cardHeaderStyle}><BarChart3 size={18} /> Embudo de Conversión</h4>
              <ResponsiveContainer width="100%" height={300}>
                <FunnelChart>
                  <Tooltip contentStyle={{ borderRadius: '14px', background: theme.card, border: `1px solid ${theme.border}` }} />
                  <Funnel dataKey="value" data={funnelDataB2C} isAnimationActive>
                    <LabelList position="right" fill={theme.text} stroke="none" dataKey="name" style={{ fontSize: '0.75rem', fontWeight: 700 }} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>

            {/* ANTIGÜEDAD VS MODULOS IA */}
            <div style={cardStyle}>
              <h4 style={cardHeaderStyle}><BarChart3 size={18} /> Antigüedad vs. Módulos Activos</h4>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                  <XAxis type="number" dataKey="x" name="Días desde registro" unit="d" stroke={theme.textSec} style={{ fontSize: '0.7rem' }} />
                  <YAxis type="number" dataKey="y" name="Módulos IA" stroke={theme.textSec} style={{ fontSize: '0.7rem' }} />
                  <ZAxis type="number" range={[50, 250]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '12px', background: theme.card }} />
                  <Scatter name="Usuarios B2C" data={scatterDataB2C} fill={theme.primary} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MAPA DE CALOR */}
          <div style={cardStyle}>
            <h4 style={cardHeaderStyle}><BarChart3 size={18} /> Mapa de Calor: Actividad de Registros</h4>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: '600px' }}>
                {heatMapDataB2C.map((day, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                    <div style={{ width: '45px', fontSize: '0.75rem', color: theme.textSec, fontWeight: 700 }}>{day.name}</div>
                    <div style={{ display: 'flex', gap: '3px', flex: 1 }}>
                      {day.hours.map((count, h) => (
                        <div 
                          key={h} 
                          title={`${count} registros a las ${h}:00`}
                          style={{ 
                            flex: 1, 
                            height: '22px', 
                            borderRadius: '4px',
                            background: count === 0 ? theme.border + '30' : theme.primary,
                            opacity: count === 0 ? 1 : Math.min(count / 5 + 0.25, 1),
                            transition: 'all 0.2s'
                          }} 
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.7rem', color: theme.textSec, paddingLeft: '50px' }}>
                <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
              </div>
            </div>
          </div>

          {/* COHORT ANALYSIS INTEGRATION */}
          <CohortAnalysis />
        </div>
      )}

      {!isLoading && activeDashboard === 'b2b' && (
        <div style={{ animation: 'slideIn 0.3s ease' }}>
          {/* METRICAS PRINCIPALES B2B */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '25px', marginBottom: '25px' }}>
            <div style={{ ...cardStyle, borderTop: `4px solid ${theme.primary}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ color: theme.textSec, fontSize: '0.75rem', fontWeight: 800 }}>CONTADORES (B2B)</span>
                <Users size={18} style={{ color: theme.primary }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: theme.text }}>{financialStatsB2B.totalContadores}</div>
            </div>

            <div style={{ ...cardStyle, borderTop: `4px solid #10b981` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ color: theme.textSec, fontSize: '0.75rem', fontWeight: 800 }}>EMPRESAS GESTIONADAS</span>
                <Building2 size={18} style={{ color: '#10b981' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: theme.text }}>{financialStatsB2B.totalEmpresas}</div>
            </div>

            <div style={{ ...cardStyle, borderTop: `4px solid #f59e0b` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ color: theme.textSec, fontSize: '0.75rem', fontWeight: 800 }}>MRR PYMES (DEVENGADO)</span>
                <DollarSign size={18} style={{ color: '#f59e0b' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: theme.text }}>${financialStatsB2B.mrr.toFixed(2)}</div>
            </div>

            <div style={{ ...cardStyle, borderTop: `4px solid #8b5cf6` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ color: theme.textSec, fontSize: '0.75rem', fontWeight: 800 }}>ARPU CONTADOR</span>
                <TrendingUp size={18} style={{ color: '#8b5cf6' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: theme.text }}>${financialStatsB2B.arpu.toFixed(2)}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
            {/* ADOPCIÓN DE MÓDULOS B2B */}
            <div style={cardStyle}>
              <h4 style={cardHeaderStyle}><BarChart3 size={18} /> Adopción de Módulos (Empresas)</h4>
              <p style={{ fontSize: '0.8rem', color: theme.textSec, marginTop: '-15px', marginBottom: '20px' }}>
                Número de empresas con cada módulo avanzado habilitado.
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={b2bAdoptionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                  <XAxis dataKey="name" stroke={theme.textSec} style={{ fontSize: '0.75rem' }} />
                  <YAxis stroke={theme.textSec} style={{ fontSize: '0.75rem' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', background: theme.card }} />
                  <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                    {b2bAdoptionData.map((entry, index) => (
                      <rect key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* DISTRIBUCIÓN DE EMPRESAS POR CONTADOR */}
            <div style={cardStyle}>
              <h4 style={cardHeaderStyle}><BarChart3 size={18} /> Empresas por Contador</h4>
              <p style={{ fontSize: '0.8rem', color: theme.textSec, marginTop: '-15px', marginBottom: '20px' }}>
                Clasificación de contadores según el volumen de empresas que administran.
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={b2bDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                  <XAxis dataKey="name" stroke={theme.textSec} style={{ fontSize: '0.75rem' }} />
                  <YAxis stroke={theme.textSec} style={{ fontSize: '0.75rem' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', background: theme.card }} />
                  <Bar dataKey="contadores" radius={[6, 6, 0, 0]}>
                    {b2bDistributionData.map((entry, index) => (
                      <rect key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}
