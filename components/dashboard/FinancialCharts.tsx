import React from 'react';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';
import { formatCurrency } from '../../utils/financial-helpers';

interface BarChartProps {
  isMobile: boolean;
  theme: any;
  barChartData: any[];
  maxBarValue: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  isMobile,
  theme,
  barChartData
}) => {
  const cardStyle = { 
    padding: isMobile ? 15 : 20, 
    borderRadius: 16, 
    background: theme.card, 
    backdropFilter: 'blur(12px)', 
    border: `1px solid ${theme.border}`, 
    marginBottom: 24,
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    height: 350
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: theme.card, padding: '10px 15px', border: `1px solid ${theme.border}`, borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: theme.text, fontSize: '0.9rem', marginBottom: 5 }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ margin: 0, color: entry.color, fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', gap: 20 }}>
              <span style={{opacity: 0.8}}>{entry.name}:</span>
              <span style={{fontWeight: 'bold'}}>{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={cardStyle}>
        <h3 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: 20, color: theme.text }}>Ingresos vs Gastos</h3>
        <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.border} opacity={0.5} />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: theme.textSec, fontSize: 11 }}
                interval={isMobile ? 1 : 0}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: theme.textSec, fontSize: 11 }}
                tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.accent, opacity: 0.4 }} />
              <Bar 
                name="Ingreso" 
                dataKey="income" 
                fill={theme.primary} 
                radius={[4, 4, 0, 0]} 
                barSize={isMobile ? 12 : 20}
                animationDuration={1500}
              />
              <Bar 
                name="Gasto" 
                dataKey="expense" 
                fill={theme.danger} 
                radius={[4, 4, 0, 0]} 
                barSize={isMobile ? 12 : 20}
                animationDuration={1500}
                animationBegin={200}
              />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
    </div>
  );
};

interface PieChartProps {
  isMobile: boolean;
  theme: any;
  pieData: any;
}

export const PieChart: React.FC<PieChartProps> = ({ isMobile, theme, pieData }) => {
  const cardStyle = { 
    padding: isMobile ? 15 : 20, 
    borderRadius: 16, 
    background: theme.card, 
    backdropFilter: 'blur(12px)', 
    border: `1px solid ${theme.border}`, 
    height: '100%',
    boxSizing: 'border-box' as const,
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    minHeight: isMobile ? 400 : 'auto'
  };

  if (!pieData.legend || pieData.legend.length === 0) {
    return (
      <section style={cardStyle}>
          <h3 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: 20, color: theme.text }}>Distribución</h3>
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textSec }}>No hay gastos</div>
      </section>
    );
  }

  return (
    <section style={cardStyle}>
       <h3 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: 20, color: theme.text }}>Distribución</h3>
       <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: 24, height: '100%' }}>
          <div style={{ width: isMobile ? '100%' : '50%', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={pieData.legend}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="amount"
                  nameKey="name"
                  stroke="none"
                  animationDuration={1000}
                >
                  {pieData.legend.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value || 0))}
                  contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: '12px', color: theme.text }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ width: isMobile ? '100%' : '50%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pieData.legend.map((item: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: '4px', background: item.color }} />
                <span style={{ color: theme.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                <span style={{ color: theme.textSec, fontWeight: '600' }}>{item.percent.toFixed(0)}%</span>
              </div>
            ))}
          </div>
       </div>
    </section>
  );
};

interface ParetoChartProps {
  isMobile: boolean;
  theme: any;
  paretoData: any[];
  paretoMax: number;
}

export const ParetoChart: React.FC<ParetoChartProps> = ({ isMobile, theme, paretoData }) => {
  const cardStyle = { 
    padding: isMobile ? 15 : 20, 
    borderRadius: 16, 
    background: theme.card, 
    backdropFilter: 'blur(12px)', 
    border: `1px solid ${theme.border}`, 
    height: '100%',
    boxSizing: 'border-box' as const,
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    minHeight: 350
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: theme.card, padding: '10px 15px', border: `1px solid ${theme.border}`, borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: theme.text, fontSize: '0.9rem' }}>{label}</p>
          <p style={{ margin: 0, color: theme.primary, fontWeight: 'bold' }}>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <section style={cardStyle}>
       <h3 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: 20, color: theme.text }}>Top Gastos</h3>
       {paretoData.length === 0 ? <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textSec }}>No hay gastos</div> : (
         <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={paretoData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: theme.text, fontSize: 11 }}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.accent, opacity: 0.3 }} />
                <Bar 
                  dataKey="amount" 
                  radius={[0, 4, 4, 0]} 
                  barSize={15}
                  animationDuration={1500}
                >
                  {paretoData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
         </div>
       )}
    </section>
  );
};
