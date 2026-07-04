import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { AlertCircle, PiggyBank, Clock, TrendingUp } from 'lucide-react';

export default function RoiCalculatorTab() {
  const { theme, isDark } = useTheme();

  // Inputs state
  const [precioPlan, setPrecioPlan] = useState(29);
  const [numClientes, setNumClientes] = useState(10);
  const [costoHora, setCostoHora] = useState(15);
  const [horasAhorradas, setHorasAhorradas] = useState(8);

  // Calculations
  const horasGanadasMes = numClientes * horasAhorradas;
  const valorAhorroMonetario = horasGanadasMes * costoHora;
  const ahorroNeto = valorAhorroMonetario - precioPlan;
  const roi = precioPlan > 0 ? (ahorroNeto / precioPlan) * 100 : 0;

  const cardStyle = {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
  };

  const kpiStyle = (color: string) => ({
    background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
    border: `1px solid ${theme.border}`,
    borderLeft: `5px solid ${color}`,
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  });

  const sliderContainerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  };

  return (
    <div style={{ ...cardStyle, marginTop: 20 }}>
      <div>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>🧮 Calculadora de Retorno de Inversión (ROI)</h3>
        <p style={{ color: theme.textSec, fontSize: '0.82rem', margin: '4px 0 20px 0' }}>
          Analiza el valor estimado y ahorro que Prospera Pymes ofrece a los contadores asociados.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30 }}>
        {/* PARTE 1: CONTROLES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: theme.primary }}>🎛️ Parámetros de Simulación</h4>

          {/* Slider 1: Precio Plan */}
          <div style={sliderContainerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
              <span>Costo del Plan Prospera</span>
              <span style={{ color: theme.primary }}>${precioPlan} / mes</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              value={precioPlan}
              onChange={e => setPrecioPlan(parseInt(e.target.value))}
              style={{ accentColor: theme.primary, width: '100%' }}
            />
          </div>

          {/* Slider 2: Clientes */}
          <div style={sliderContainerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
              <span>Clientes (Empresas) Gestionadas</span>
              <span style={{ color: theme.primary }}>{numClientes} empresas</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={numClientes}
              onChange={e => setNumClientes(parseInt(e.target.value))}
              style={{ accentColor: theme.primary, width: '100%' }}
            />
          </div>

          {/* Slider 3: Costo Hora */}
          <div style={sliderContainerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
              <span>Valor por Hora de tu Trabajo</span>
              <span style={{ color: theme.primary }}>${costoHora} / hora</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={costoHora}
              onChange={e => setCostoHora(parseInt(e.target.value))}
              style={{ accentColor: theme.primary, width: '100%' }}
            />
          </div>

          {/* Slider 4: Horas Ahorradas */}
          <div style={sliderContainerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
              <span>Horas Ahorradas por Cliente al Mes</span>
              <span style={{ color: theme.primary }}>{horasAhorradas} horas</span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              value={horasAhorradas}
              onChange={e => setHorasAhorradas(parseInt(e.target.value))}
              style={{ accentColor: theme.primary, width: '100%' }}
            />
          </div>
        </div>

        {/* PARTE 2: CALCULOS Y RESULTADOS */}
        <div style={{ background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)', padding: 24, borderRadius: 20, border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>📊 Resultados Estimados</h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={kpiStyle('#3b82f6')}>
              <Clock size={20} style={{ color: '#3b82f6' }} />
              <div>
                <div style={{ fontSize: '0.72rem', color: theme.textSec, fontWeight: 700 }}>TIEMPO RECUPERADO</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>{horasGanadasMes} hrs / mes</div>
              </div>
            </div>

            <div style={kpiStyle('#10b981')}>
              <PiggyBank size={20} style={{ color: '#10b981' }} />
              <div>
                <div style={{ fontSize: '0.72rem', color: theme.textSec, fontWeight: 700 }}>AHORRO BRUTO</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>${valorAhorroMonetario}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', padding: 20, borderRadius: 16, textAlign: 'center', marginTop: 10 }}>
            <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              💰 Retorno Neto Estimado
            </span>
            <span style={{ fontSize: '2.5rem', fontWeight: 950, color: '#10b981', margin: '4px 0' }}>
              ${ahorroNeto.toFixed(2)}
            </span>
            <span style={{ fontSize: '0.8rem', color: theme.textSec }}>
              Ahorro real mensual restando el costo del plan.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(139,92,246,0.08)', borderRadius: 12, border: '1px solid rgba(139,92,246,0.15)', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={16} style={{ color: '#8b5cf6' }} /> ROI Promedio
            </span>
            <span style={{ fontWeight: 950, color: '#8b5cf6', fontSize: '1rem' }}>
              +{roi.toFixed(0)}%
            </span>
          </div>

          {/* Gráfico Comparativo de Barras */}
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: theme.textSec, marginBottom: 6, fontWeight: 700 }}>
              <span>Costo Prospera (${precioPlan})</span>
              <span>Valor Ahorro (${valorAhorroMonetario})</span>
            </div>
            <div style={{ height: 16, background: theme.border, borderRadius: 8, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${Math.max(10, Math.min(90, (precioPlan / (precioPlan + valorAhorroMonetario)) * 100))}%`, height: '100%', background: '#ef4444' }} title="Costo" />
              <div style={{ flex: 1, height: '100%', background: '#10b981' }} title="Ahorro" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
