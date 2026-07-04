import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabaseContable } from '../../services/supabaseContable';
import { useTheme } from '../../context/ThemeContext';

export const StorageMonitorTab: React.FC = () => {
  const { theme } = useTheme();

  const cardStyle: React.CSSProperties = { background: theme.card, borderRadius: 20, border: `1px solid ${theme.border}`, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' };

  // Cargar estadísticas de storage
  const { data: storageStats, isLoading } = useQuery({
    queryKey: ['storageStats'],
    queryFn: async () => {
      const { data, error } = await supabaseContable
        .from('vista_uso_storage')
        .select('*');

      if (error) throw error;
      return data || [];
    }
  });

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getAlertBadge = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb > 20) {
      return { text: 'Crítico (>20MB)', color: theme.danger, bg: 'rgba(239, 68, 68, 0.1)' };
    } else if (mb > 15) {
      return { text: 'Advertencia (>15MB)', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
    }
    return { text: 'Óptimo', color: theme.primary, bg: 'rgba(16, 185, 129, 0.1)' };
  };

  return (
    <div style={{ ...cardStyle, marginTop: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>📦 Monitor de Uso del Storage</h3>
        <p style={{ color: theme.textSec, fontSize: '0.82rem', margin: '4px 0 0 0' }}>
          Monitorea el espacio que ocupan los archivos XML de comprobantes contables en Supabase Storage.
        </p>
      </div>

      {isLoading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: theme.textSec, fontWeight: 700 }}>Cargando métricas...</div>
      ) : storageStats && storageStats.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textSec }}>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Empresa</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>RUC</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Total XMLs</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Espacio Utilizado</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Porcentaje (Límite 20MB)</th>
                <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'right' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {storageStats.map((stat: any) => {
                const totalBytes = stat.total_bytes || 0;
                const percent = Math.min((totalBytes / (20 * 1024 * 1024)) * 100, 100);
                const badge = getAlertBadge(totalBytes);

                return (
                  <tr key={stat.id_empresa} style={{ borderBottom: `1px solid ${theme.border}`, color: theme.text }}>
                    <td style={{ padding: '14px 16px', fontWeight: 800 }}>
                      {stat.nombre_empresa || <span style={{ color: theme.textSec, fontStyle: 'italic' }}>[ID: {stat.id_empresa.substring(0, 8)}...]</span>}
                    </td>
                    <td style={{ padding: '14px 16px', color: theme.textSec, fontWeight: 600 }}>
                      {stat.ruc_empresa || 'N/A'}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                      {stat.total_archivos} XMLs
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                      {formatBytes(totalBytes)}
                    </td>
                    <td style={{ padding: '14px 16px', width: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', background: theme.border, borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${percent}%`,
                            height: '100%',
                            background: badge.color,
                            borderRadius: '999px',
                            transition: 'width 0.4s'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.textSec, minWidth: '35px' }}>{percent.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        background: badge.bg,
                        color: badge.color
                      }}>
                        {badge.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: theme.textSec, fontWeight: 700 }}>
          Ninguna empresa tiene documentos guardados en Supabase Storage actualmente.
        </div>
      )}
    </div>
  );
};
