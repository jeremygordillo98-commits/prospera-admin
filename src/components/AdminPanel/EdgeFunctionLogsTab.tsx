import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabaseContable } from '../../services/supabaseContable';
import { useTheme } from '../../context/ThemeContext';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function EdgeFunctionLogsTab() {
  const { theme, isDark } = useTheme();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [executingName, setExecutingName] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedFunctionName, setSelectedFunctionName] = useState<string | null>(null);

  const { data: logs = [], isLoading, isFetching, refetch } = useQuery({
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

  const handleRefresh = async () => {
    try {
      await refetch();
      setToastMessage("Logs actualizados");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setToastMessage("Error al actualizar");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleInvokeFunction = (displayName: string) => {
    const functionMapping: Record<string, string> = {
      'sri-sync-alertas': 'send-sri-deadline-alert',
      'send-weekly-report': 'send-weekly-report',
      'send-monthly-iva-report': 'send-monthly-iva-report',
      'send-campaign': 'send-campaign',
    };

    const actualName = functionMapping[displayName];
    if (!actualName) return;

    if (actualName === 'send-campaign') {
      alert("La función 'send-campaign' requiere parámetros específicos de destinatario y contenido, por lo que no se puede ejecutar de forma vacía desde este visor general.");
      return;
    }

    setSelectedFunctionName(displayName);
    setShowConfirmModal(true);
  };

  const executeFunction = async (displayName: string) => {
    const functionMapping: Record<string, string> = {
      'sri-sync-alertas': 'send-sri-deadline-alert',
      'send-weekly-report': 'send-weekly-report',
      'send-monthly-iva-report': 'send-monthly-iva-report',
      'send-campaign': 'send-campaign',
    };

    const actualName = functionMapping[displayName];
    if (!actualName) return;

    setExecutingName(displayName);
    try {
      // Invocar la edge function de Supabase
      const { error } = await supabaseContable.functions.invoke(actualName, {
        body: actualName === 'send-sri-deadline-alert' ? { test: true } : {}
      });

      if (error) throw error;

      setToastMessage("Ejecución completada");
      setTimeout(() => setToastMessage(null), 3000);
      
      // Esperar un momento a que se complete el insert asíncrono y refrescar
      setTimeout(async () => {
        await refetch();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      alert(`Error al invocar la función en Supabase: ${err.message || String(err)}`);
    } finally {
      setExecutingName(null);
    }
  };

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
    <>
      {/* Panel de Ejecución Rápida */}
      <div style={{ ...cardStyle, marginTop: 20 }}>
        <style>{`
          .run-btn {
            transition: all 0.2s ease !important;
          }
          .run-btn:hover:not(:disabled) {
            background: rgba(16, 185, 129, 0.15) !important;
            border-color: ${theme.primary} !important;
          }
        `}</style>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800, color: theme.text }}>⚡ Acciones Rápidas de Servidor</h4>
        <p style={{ color: theme.textSec, fontSize: '0.8rem', margin: '0 0 16px 0' }}>
          Fuerza la ejecución manual de las funciones automatizadas del servidor en cualquier momento para probar o actualizar reportes.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {[
            { id: 'sri-sync-alertas', label: 'Alertas de Vencimiento SRI', sched: 'Diario (7:00 AM)', emoji: '📅' },
            { id: 'send-weekly-report', label: 'Reporte Semanal Financiero', sched: 'Todos los lunes (8:00 AM)', emoji: '📊' },
            { id: 'send-monthly-iva-report', label: 'Reporte Mensual de IVA', sched: 'Día 1 de cada mes (8:00 AM)', emoji: '🧾' }
          ].map(fn => (
            <div key={fn.id} style={{
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
              border: `1px solid ${theme.border}`,
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '1.15rem' }}>{fn.emoji}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: theme.text }}>{fn.label}</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: theme.textSec, fontWeight: 700, textTransform: 'uppercase' }}>
                  Programación: {fn.sched}
                </span>
              </div>
              
              <button
                onClick={() => handleInvokeFunction(fn.id)}
                disabled={executingName === fn.id}
                style={{
                  width: '100%',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  color: theme.primary,
                  padding: '8px 12px',
                  borderRadius: '10px',
                  cursor: executingName === fn.id ? 'not-allowed' : 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  opacity: executingName === fn.id ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
                className="run-btn"
              >
                {executingName === fn.id ? 'Ejecutando...' : '▶ Ejecutar Ahora'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Visor de Logs */}
      <div style={{ ...cardStyle, marginTop: 20 }}>
        <style>{`
          @keyframes spin-custom {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spin-icon {
            animation: spin-custom 1s linear infinite;
          }
        `}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>⚙️ Visor de Logs de Edge Functions</h3>
              {toastMessage && (
                <span style={{
                  fontSize: '0.78rem',
                  color: theme.primary,
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  transition: 'all 0.3s ease'
                }}>
                  ✅ {toastMessage}
                </span>
              )}
            </div>
            <p style={{ color: theme.textSec, fontSize: '0.82rem', margin: '4px 0 0 0' }}>
              Últimas 50 ejecuciones de procesos del servidor con tiempos de respuesta y errores.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            style={{
              background: 'transparent',
              border: `1px solid ${theme.border}`,
              color: theme.textSec,
              borderRadius: 12,
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: isFetching ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: isFetching ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={14} className={isFetching ? 'spin-icon' : ''} /> {isFetching ? 'Actualizando...' : 'Actualizar'}
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
                  <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'right' }}>Acciones</th>
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
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {log.nombre_funcion !== 'cron-check-mantenimiento' && log.nombre_funcion !== 'send-campaign' && (
                          <button
                            onClick={() => handleInvokeFunction(log.nombre_funcion)}
                            disabled={executingName === log.nombre_funcion}
                            style={{
                              background: 'rgba(16, 185, 129, 0.08)',
                              border: '1px solid rgba(16, 185, 129, 0.2)',
                              color: theme.primary,
                              padding: '6px 12px',
                              borderRadius: '8px',
                              cursor: executingName === log.nombre_funcion ? 'not-allowed' : 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              opacity: executingName === log.nombre_funcion ? 0.6 : 1,
                              transition: 'all 0.2s ease',
                            }}
                            className="run-btn"
                          >
                            {executingName === log.nombre_funcion ? 'Ejecutando...' : '▶ Ejecutar'}
                          </button>
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

      {/* Modal de Confirmación Moderno */}
      {showConfirmModal && selectedFunctionName && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(11, 17, 32, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ fontSize: '3rem', margin: '0 auto' }}>⚡</div>
            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: theme.text }}>
              ¿Ejecutar {selectedFunctionName}?
            </h4>
            <p style={{ color: theme.textSec, fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
              Esto disparará el proceso real en los servidores de Supabase de manera inmediata. Podría enviar correos de notificación o sincronizar alertas para los clientes configurados.
            </p>
            
            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedFunctionName(null);
                }}
                style={{
                  background: 'transparent',
                  border: `1px solid ${theme.border}`,
                  color: theme.textSec,
                  borderRadius: '12px',
                  padding: '10px 20px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flex: 1
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const name = selectedFunctionName;
                  setShowConfirmModal(false);
                  setSelectedFunctionName(null);
                  executeFunction(name);
                }}
                style={{
                  background: theme.primary,
                  color: isDark ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flex: 1
                }}
              >
                Confirmar y Ejecutar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
