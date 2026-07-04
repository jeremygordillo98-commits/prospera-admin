import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { supabaseContable } from '../../services/supabaseContable';
import { useTheme } from '../../context/ThemeContext';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

export const EliminacionesTab: React.FC = () => {
  const { theme, isDark } = useTheme();
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [confirmDeleteSol, setConfirmDeleteSol] = useState<any | null>(null);
  const [confirmInputName, setConfirmInputName] = useState('');

  const inputStyle: React.CSSProperties = { padding: '12px 16px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, width: '100%', outline: 'none', fontSize: '0.9rem', marginBottom: 12 };
  const cardStyle: React.CSSProperties = { background: theme.card, borderRadius: 20, border: `1px solid ${theme.border}`, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' };

  // Cargar solicitudes de eliminación
  const { data: solicitudes, isLoading } = useQuery({
    queryKey: ['solicitudesEliminacion'],
    queryFn: async () => {
      const { data, error } = await supabaseContable
        .from('solicitudes_eliminacion')
        .select(`
          *,
          empresas_gestionadas (
            nombre_empresa,
            ruc_empresa
          )
        `)
        .order('fecha_solicitud', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const convertToExcel = (data: any[], sheetName: string) => {
    const wb = XLSX.utils.book_new();
    let ws;
    if (!data || data.length === 0) {
      ws = XLSX.utils.aoa_to_sheet([["No data available"]]);
    } else {
      // Process data to stringify nested objects or arrays to prevent [object Object]
      const processedData = data.map(row => {
        const newRow: any = {};
        for (const key of Object.keys(row)) {
          const val = row[key];
          if (val !== null && typeof val === 'object') {
            newRow[key] = JSON.stringify(val);
          } else {
            newRow[key] = val;
          }
        }
        return newRow;
      });
      ws = XLSX.utils.json_to_sheet(processedData);
    }
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  };

  const handleGenerateAndSendBackup = async (solicitud: any) => {
    const empresaId = solicitud.id_empresa;
    const emailDestino = solicitud.correo_contacto;
    setProcessingId(solicitud.id);
    showStatus(`Compilando datos de "${solicitud.empresas_gestionadas?.nombre_empresa}"...`, 'success');

    try {
      // 1. Consultar todas las tablas de forma asíncrona en paralelo
      const [
        { data: empInfo },
        { data: docsSri },
        { data: tesoMov },
        { data: tesoDoc },
        { data: movs },
        { data: txs },
        { data: ents },
        { data: accounts }
      ] = await Promise.all([
        supabaseContable.from('empresas_gestionadas').select('*').eq('id', empresaId).single(),
        supabaseContable.from('documentos_sri').select('*').eq('id_empresa', empresaId),
        supabaseContable.from('tesoreria_movimientos').select('*').eq('id_empresa', empresaId),
        supabaseContable.from('tesoreria_documentos').select('*').eq('id_empresa', empresaId),
        supabaseContable.from('movimientos').select('*').eq('id_empresa', empresaId),
        supabaseContable.from('transacciones').select('*').eq('id_empresa', empresaId),
        supabaseContable.from('entidades').select('*').eq('id_empresa', empresaId),
        supabaseContable.from('cuentas_financieras').select('*').eq('id_empresa', empresaId)
      ]);

      if (!empInfo) throw new Error("No se pudo obtener la información de la empresa.");

      // 2. Generar ZIP en memoria
      const zip = new JSZip();
      zip.file('info_empresa.xlsx', convertToExcel([empInfo], 'Info Empresa'));
      zip.file('documentos_sri.xlsx', convertToExcel(docsSri || [], 'Documentos SRI'));
      zip.file('tesoreria_movimientos.xlsx', convertToExcel(tesoMov || [], 'Movimientos Tesoreria'));
      zip.file('tesoreria_documentos.xlsx', convertToExcel(tesoDoc || [], 'Documentos Tesoreria'));
      zip.file('movimientos.xlsx', convertToExcel(movs || [], 'Movimientos'));
      zip.file('transacciones.xlsx', convertToExcel(txs || [], 'Transacciones'));
      zip.file('entidades.xlsx', convertToExcel(ents || [], 'Entidades'));
      zip.file('cuentas_financieras.xlsx', convertToExcel(accounts || [], 'Cuentas Financieras'));

      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // 3. Convertir a Base64 y despachar vía Edge Function
      const reader = new FileReader();
      reader.readAsDataURL(zipBlob);
      reader.onloadend = async () => {
        try {
          const base64data = (reader.result as string).split(',')[1];
          const fileName = `respaldo_${empInfo.nombre_empresa.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.zip`;

          const { data: sendData, error: sendError } = await supabase.functions.invoke('send-campaign', {
            body: {
              to: emailDestino,
              subject: `Respaldo Contable Autorizado — ${empInfo.nombre_empresa}`,
              htmlContent: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; color: #1e293b;">
                  <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 40px; margin-bottom: 8px;">💾</div>
                    <h2 style="color: #4f46e5; margin: 0; font-size: 20px; font-weight: 800;">Respaldo de Datos Financieros</h2>
                    <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Prospera Pymes — Seguridad & Respaldo</p>
                  </div>
                  
                  <p>Hola,</p>
                  <p>Hemos procesado la solicitud de baja y eliminación para tu cliente contable <strong>${empInfo.nombre_empresa}</strong> (RUC: ${empInfo.ruc_empresa || 'N/A'}).</p>
                  
                  <p>Adjunto a este correo encontrarás el archivo comprimido en formato <strong>ZIP</strong> conteniendo todas las tablas de tu base de datos contable exportadas en archivos <strong>Excel (.xlsx)</strong> individuales:</p>
                  
                  <ul style="background: #f8fafc; padding: 16px 32px; border-radius: 12px; font-size: 13px; color: #334155; line-height: 1.8;">
                    <li><strong>info_empresa.xlsx</strong>: Identificación, RUC y nombre comercial.</li>
                    <li><strong>documentos_sri.xlsx</strong>: Catálogo y datos de XMLs procesados de Compras y Ventas.</li>
                    <li><strong>tesoreria_movimientos.xlsx</strong>: Historial de transacciones de caja y bancos.</li>
                    <li><strong>tesoreria_documentos.xlsx</strong>: Cuentas por cobrar y pagar registradas.</li>
                    <li><strong>movimientos.xlsx</strong>: Asientos de diario detallados por cuenta.</li>
                    <li><strong>transacciones.xlsx</strong>: Historial completo de asientos contables.</li>
                    <li><strong>entidades.xlsx</strong>: Directorio de Clientes y Proveedores.</li>
                    <li><strong>cuentas_financieras.xlsx</strong>: Cuentas bancarias y de efectivo estructuradas.</li>
                  </ul>
                  
                  <p style="font-size: 13px; color: #ef4444; font-weight: 700; background: #fef2f2; padding: 12px; border-radius: 8px; border: 1px solid #fee2e2;">
                    ⚠️ ATENCIÓN: Este respaldo ha sido generado en caliente y enviado directamente. Ninguna copia queda almacenada en nuestros servidores. De acuerdo al protocolo, la empresa y todos sus datos contables asociados serán eliminados físicamente en las próximas 24 horas.
                  </p>
                  
                  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                  <p style="font-size: 11px; text-align: center; color: #64748b;">Generado por Prospera Admin Engine B2B.</p>
                </div>
              `,
              sender: {
                name: "Prospera Comunicaciones",
                email: "comunicaciones@prosperafinanzas.com"
              },
              replyTo: {
                email: "prosperaapp.soporte@gmail.com",
                name: "Prospera Soporte"
              },
              attachment: {
                base64: base64data,
                name: fileName
              }
            }
          });

          if (sendError) throw sendError;

          // 4. Marcar solicitud como completada
          const { error: updErr } = await supabaseContable
            .from('solicitudes_eliminacion')
            .update({ estado: 'completado' })
            .eq('id', solicitud.id);

          if (updErr) throw updErr;

          showStatus("Respaldo compilado y enviado con éxito al contador.", 'success');
          queryClient.invalidateQueries({ queryKey: ['solicitudesEliminacion'] });
        } catch (innerErr: any) {
          console.error(innerErr);
          showStatus("Error al despachar el respaldo: " + innerErr.message, 'error');
        } finally {
          setProcessingId(null);
        }
      };
    } catch (err: any) {
      console.error(err);
      showStatus("Error al compilar respaldo: " + err.message, 'error');
      setProcessingId(null);
    }
  };

  const executePhysicalDelete = async (solicitud: any) => {
    if (confirmInputName !== solicitud.empresas_gestionadas?.nombre_empresa) {
      showStatus("Confirmación fallida. El nombre de la empresa no coincide.", 'error');
      return;
    }

    setConfirmDeleteSol(null);
    setProcessingId(solicitud.id);
    try {
      const { error } = await supabaseContable
        .from('empresas_gestionadas')
        .delete()
        .eq('id', solicitud.id_empresa);

      if (error) throw error;

      showStatus("Empresa y todos sus datos asociados borrados físicamente con éxito.", 'success');
      queryClient.invalidateQueries({ queryKey: ['solicitudesEliminacion'] });
    } catch (err: any) {
      console.error(err);
      showStatus("Error al borrar físicamente: " + err.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={{ ...cardStyle, marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>🗑️ Gestión de Eliminación Segura</h3>
          <p style={{ color: theme.textSec, fontSize: '0.82rem', margin: '4px 0 0 0' }}>
            Despacha los respaldos en caliente y realiza el borrado físico permanente de las empresas solicitadas.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '12px',
          background: statusMessage.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          color: statusMessage.type === 'error' ? theme.danger : theme.primary,
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: 20
        }}>
          {statusMessage.text}
        </div>
      )}

      {isLoading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: theme.textSec, fontWeight: 700 }}>Cargando solicitudes...</div>
      ) : solicitudes && solicitudes.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textSec }}>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Empresa</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>RUC</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Correo Destino</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Fecha Solicitud</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Estado</th>
                <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((sol: any) => {
                const isProcessing = processingId === sol.id;
                return (
                  <tr key={sol.id} style={{ borderBottom: `1px solid ${theme.border}`, color: theme.text }}>
                    <td style={{ padding: '14px 16px', fontWeight: 800 }}>
                      {sol.empresas_gestionadas?.nombre_empresa || <span style={{ color: theme.danger, fontStyle: 'italic' }}>[Ya eliminada/Desconocida]</span>}
                    </td>
                    <td style={{ padding: '14px 16px', color: theme.textSec, fontWeight: 600 }}>
                      {sol.empresas_gestionadas?.ruc_empresa || 'N/A'}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                      {sol.correo_contacto}
                    </td>
                    <td style={{ padding: '14px 16px', color: theme.textSec, fontSize: '0.8rem' }}>
                      {new Date(sol.fecha_solicitud).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        background: sol.estado === 'completado' ? 'rgba(16, 185, 129, 0.1)' : sol.estado === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: sol.estado === 'completado' ? theme.primary : sol.estado === 'error' ? theme.danger : '#f59e0b'
                      }}>
                        {sol.estado === 'completado' ? 'Respaldo Enviado' : sol.estado === 'error' ? 'Error' : 'Pendiente'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {sol.estado === 'pendiente' && (
                          <button
                            disabled={isProcessing || !sol.empresas_gestionadas}
                            onClick={() => handleGenerateAndSendBackup(sol)}
                            style={{
                              background: theme.primary,
                              color: isDark ? '#000' : '#fff',
                              border: 'none',
                              padding: '8px 14px',
                              borderRadius: '10px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              opacity: (isProcessing || !sol.empresas_gestionadas) ? 0.6 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            💾 {isProcessing ? 'Enviando...' : 'Enviar Respaldo'}
                          </button>
                        )}

                        {sol.estado === 'completado' && sol.empresas_gestionadas && (
                          <button
                            disabled={isProcessing}
                            onClick={() => {
                              setConfirmInputName('');
                              setConfirmDeleteSol(sol);
                            }}
                            style={{
                              background: theme.danger,
                              color: '#fff',
                              border: 'none',
                              padding: '8px 14px',
                              borderRadius: '10px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              opacity: isProcessing ? 0.6 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            🗑️ Borrado Físico
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: theme.textSec, fontWeight: 700 }}>
          No hay solicitudes de eliminación pendientes.
        </div>
      )}

      {confirmDeleteSol && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            ...cardStyle,
            width: '90%',
            maxWidth: '450px',
            textAlign: 'center',
            padding: '40px'
          }}>
            <div style={{
              width: 64,
              height: 64,
              background: 'rgba(239, 68, 68, 0.1)',
              color: theme.danger,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '2rem'
            }}>
              ⚠️
            </div>
            <h3 style={{ color: theme.danger, margin: '0 0 12px 0', fontSize: '1.2rem', fontWeight: 800 }}>ALERTA CRÍTICA</h3>
            <p style={{ color: theme.textSec, fontSize: '0.88rem', lineHeight: '1.5', marginBottom: 24 }}>
              Esta acción borrará de forma FÍSICA y permanente a la empresa y <strong>TODOS</strong> sus datos asociados.
            </p>
            <p style={{ color: theme.text, fontSize: '0.85rem', fontWeight: 700, textAlign: 'left', marginBottom: 8 }}>
              Escribe el nombre de la empresa para confirmar: <span style={{ color: theme.primary }}>"{confirmDeleteSol.empresas_gestionadas?.nombre_empresa}"</span>
            </p>
            <input
              type="text"
              placeholder="Escribe el nombre aquí..."
              value={confirmInputName}
              onChange={(e) => setConfirmInputName(e.target.value)}
              style={inputStyle}
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button
                onClick={() => setConfirmDeleteSol(null)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                  padding: '12px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => executePhysicalDelete(confirmDeleteSol)}
                disabled={confirmInputName !== confirmDeleteSol.empresas_gestionadas?.nombre_empresa}
                style={{
                  flex: 1,
                  background: theme.danger,
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontWeight: 700,
                  opacity: confirmInputName !== confirmDeleteSol.empresas_gestionadas?.nombre_empresa ? 0.5 : 1
                }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
