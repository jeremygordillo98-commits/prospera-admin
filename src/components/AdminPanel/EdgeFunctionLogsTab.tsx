import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabaseContable } from '../../services/supabaseContable';
import { useTheme } from '../../context/ThemeContext';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function EdgeFunctionLogsTab() {
  const { theme, isDark } = useTheme();

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['edgeFunctionLogs'],
    queryFn: async () => {
      const { data, error } = await supabaseContable
        .from('log_edge_functions')
        .select('*')
        .order('ejecutado_al', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    }
  });

  const cardStyle = {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
  };

  const formatDateTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('es-EC', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ ...cardStyle, marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>⚙️ Visor de Logs de Edge Functions</h3>
          <p style={{ color: theme.textSec, fontSize: '0.82rem', margin: '4px 0 0 0' }}>
            Últimas 50 ejecuciones de procesos del servidor con tiempos de respuesta y errores.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          style={{
            background: 'transparent',
            border: `1px solid ${theme.border}`,
            color: theme.textSec,
            borderRadius: 12,
            padding: '8px 16px',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: theme.textSec, fontWeight: 700 }}>
          Cargando logs del servidor...
        </div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: theme.textSec, fontStyle: 'italic' }}>
          No hay logs de ejecución registrados.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textSec }}>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Función</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Estado</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Tiempo Resp.</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Ejecutado El</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Detalles / Error</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => {
                const isError = log.estado === 'ERROR';
                return (
                  <tr key={log.id} style={{ borderBottom: `1px solid ${theme.border}`, color: theme.text }}>
                    <td style={{ padding: '14px 16px', fontWeight: 800 }}>
                      <code>{log.nombre_funcion}</code>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: isError ? theme.danger : '#10b981',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 900
                      }}>
                        {isError ? '❌ ERROR' : '✅ OK'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                      {log.tiempo_respuesta_ms} ms
                    </td>
                    <td style={{ padding: '14px 16px', color: theme.textSec }}>
                      {formatDateTime(log.ejecutado_al)}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.82rem' }}>
                      {isError ? (
                        <div style={{ color: theme.danger, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                          <AlertCircle size={14} /> {log.mensaje_error || 'Internal Server Error'}
                        </div>
                      ) : (
                        <span style={{ color: theme.textSec }}>Ejecución exitosa</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
