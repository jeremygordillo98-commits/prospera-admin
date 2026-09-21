import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { supabaseContable } from '../../services/supabaseContable';
import { useTheme } from '../../context/ThemeContext';
import { REENGAGEMENT_PLAIN_TEXTS, DEFAULT_PLAIN_TEXTS, generateCampaignHtml } from './Crm/campaignHelpers';

import { ChurnKpis } from './Churn/ChurnKpis';
import { ChurnFilters } from './Churn/ChurnFilters';
import { ChurnAccountsTable } from './Churn/ChurnAccountsTable';
import { ReengagementModal } from './Churn/ReengagementModal';
import { MassReengagementModal } from './Churn/MassReengagementModal';

export interface ChurnAccount {
  id: string;
  nombre: string;
  email: string;
  tipo: 'B2C' | 'B2B';
  creadoEn: string;
  ultimaActividad: string;
  diasInactivo: number;
  estado: 'critico' | 'riesgo' | 'activo';
  infoExtra?: string;
}

export default function ChurnPreventionTab() {
  const { theme, isDark } = useTheme();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<'todos' | 'B2C' | 'B2B'>('todos');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'critico' | 'riesgo' | 'activo'>('todos');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  
  // Modal de Re-engagement Individual
  const [selectedAccount, setSelectedAccount] = useState<ChurnAccount | null>(null);
  const [selectedSender, setSelectedSender] = useState('soporte@prosperafinanzas.com');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('reengagement_app');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailPlainText, setEmailPlainText] = useState('');
  const [previewMode, setPreviewMode] = useState<'preview' | 'editor'>('preview');
  const [isSending, setIsSending] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal de Envío Masivo (Blast)
  const [isMassModalOpen, setIsMassModalOpen] = useState(false);
  const [massAudience, setMassAudience] = useState<'critico' | 'riesgo' | 'inactivos_todos' | 'b2b_inactivos' | 'b2c_inactivos'>('critico');
  const [massSender, setMassSender] = useState('soporte@prosperafinanzas.com');
  const [massTemplate, setMassTemplate] = useState<string>('auto');
  const [massSubject, setMassSubject] = useState('');
  const [massPlainText, setMassPlainText] = useState('');
  const [massPreviewMode, setMassPreviewMode] = useState<'preview' | 'editor'>('editor');
  const [isMassSending, setIsMassSending] = useState(false);
  const [massProgress, setMassProgress] = useState<{ current: number; total: number; success: number; failed: number } | null>(null);
  const [massFeedback, setMassFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // 1. QUERY B2C DATA
  const { data: b2cData, isLoading: loadingB2C, refetch: refetchB2C } = useQuery({
    queryKey: ['churnB2C'],
    queryFn: async () => {
      const { data: perfiles, error: pErr } = await supabase
        .from('perfiles')
        .select('*');
      if (pErr) throw pErr;

      const { data: transacciones, error: tErr } = await supabase
        .from('transacciones')
        .select('usuario_id, fecha');
      if (tErr) console.warn('Error fetching transacciones in ChurnPrevention:', tErr);

      return { perfiles: perfiles || [], transacciones: transacciones || [] };
    }
  });

  // 2. QUERY B2B DATA
  const { data: b2bData, isLoading: loadingB2B, refetch: refetchB2B } = useQuery({
    queryKey: ['churnB2B'],
    queryFn: async () => {
      const { data: perfiles, error: pErr } = await supabaseContable
        .from('perfiles')
        .select('*');
      if (pErr) throw pErr;

      const { data: empresas, error: eErr } = await supabaseContable
        .from('empresas_gestionadas')
        .select('*');
      if (eErr) console.warn('Error fetching empresas in ChurnPrevention:', eErr);

      return { perfiles: perfiles || [], empresas: empresas || [] };
    }
  });

  // 3. PROCESAMIENTO UNIFICADO DE CHURN
  const allAccounts = useMemo<ChurnAccount[]>(() => {
    const now = new Date().getTime();
    const accounts: ChurnAccount[] = [];

    // A. Procesar Usuarios B2C
    if (b2cData) {
      const { perfiles, transacciones } = b2cData;
      
      const lastTxMap = new Map<string, string>();
      (transacciones || []).forEach((tx: any) => {
        if (!tx.usuario_id || !tx.fecha) return;
        const current = lastTxMap.get(tx.usuario_id);
        if (!current || new Date(tx.fecha).getTime() > new Date(current).getTime()) {
          lastTxMap.set(tx.usuario_id, tx.fecha);
        }
      });

      (perfiles || []).filter((p: any) => p.rol !== 'admin').forEach((p: any) => {
        const lastTx = lastTxMap.get(p.id);
        const lastLogin = p.ultimo_acceso;
        const created = p.creado_en || new Date().toISOString();

        let bestDateStr = created;
        if (lastLogin && new Date(lastLogin).getTime() > new Date(bestDateStr).getTime()) {
          bestDateStr = lastLogin;
        }
        if (lastTx && new Date(lastTx).getTime() > new Date(bestDateStr).getTime()) {
          bestDateStr = lastTx;
        }

        const days = Math.max(0, Math.floor((now - new Date(bestDateStr).getTime()) / (1000 * 60 * 60 * 24)));
        let estado: 'critico' | 'riesgo' | 'activo' = 'activo';
        if (days > 14) estado = 'critico';
        else if (days > 7) estado = 'riesgo';

        accounts.push({
          id: p.id,
          nombre: p.nombre_completo || p.nombre || (p.email ? p.email.split('@')[0] : 'Usuario App'),
          email: p.email || 'Sin correo',
          tipo: 'B2C',
          creadoEn: created,
          ultimaActividad: bestDateStr,
          diasInactivo: days,
          estado,
          infoExtra: lastTx ? `Última transacción: ${new Date(lastTx).toLocaleDateString('es-EC')}` : 'Sin transacciones'
        });
      });
    }

    // B. Procesar Contadores B2B
    if (b2bData) {
      const { perfiles, empresas } = b2bData;
      
      const empresasCountMap = new Map<string, number>();
      (empresas || []).forEach((emp: any) => {
        const ownerId = emp.id_usuario || emp.usuario_id;
        if (ownerId) {
          empresasCountMap.set(ownerId, (empresasCountMap.get(ownerId) || 0) + 1);
        }
      });

      (perfiles || []).filter((p: any) => p.rol !== 'admin').forEach((p: any) => {
        const userId = p.id_usuario || p.id;
        const lastLogin = p.ultimo_acceso;
        const created = p.creado_en || new Date().toISOString();
        let bestDateStr = lastLogin || created;

        const days = Math.max(0, Math.floor((now - new Date(bestDateStr).getTime()) / (1000 * 60 * 60 * 24)));
        let estado: 'critico' | 'riesgo' | 'activo' = 'activo';
        if (days > 14) estado = 'critico';
        else if (days > 7) estado = 'riesgo';

        const empCount = empresasCountMap.get(userId) || 0;

        accounts.push({
          id: userId,
          nombre: p.nombre_completo || p.nombre || (p.email ? p.email.split('@')[0] : 'Contador Pymes'),
          email: p.email || 'Sin correo',
          tipo: 'B2B',
          creadoEn: created,
          ultimaActividad: bestDateStr,
          diasInactivo: days,
          estado,
          infoExtra: `${empCount} empresa${empCount !== 1 ? 's' : ''} gestionada${empCount !== 1 ? 's' : ''}`
        });
      });
    }

    return accounts.sort((a, b) => b.diasInactivo - a.diasInactivo);
  }, [b2cData, b2bData]);

  // Filtrado dinámico para la tabla
  const filteredAccounts = useMemo(() => {
    return allAccounts.filter(acc => {
      const matchesSearch = 
        acc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTipo = filterTipo === 'todos' || acc.tipo === filterTipo;
      const matchesEstado = filterEstado === 'todos' || acc.estado === filterEstado;

      return matchesSearch && matchesTipo && matchesEstado;
    });
  }, [allAccounts, searchTerm, filterTipo, filterEstado]);

  // Reset de página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterTipo, filterEstado, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / pageSize));
  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAccounts.slice(start, start + pageSize);
  }, [filteredAccounts, currentPage, pageSize]);

  // KPIs de Churn
  const kpis = useMemo(() => {
    const total = allAccounts.length;
    const criticos = allAccounts.filter(a => a.estado === 'critico').length;
    const enRiesgo = allAccounts.filter(a => a.estado === 'riesgo').length;
    const activos = allAccounts.filter(a => a.estado === 'activo').length;
    const rate = total > 0 ? (criticos / total) * 100 : 0;

    return { total, criticos, enRiesgo, activos, rate };
  }, [allAccounts]);

  // Audiencia objetivo para Envío Masivo
  const massTargetAccounts = useMemo<ChurnAccount[]>(() => {
    if (massAudience === 'critico') {
      return allAccounts.filter(a => a.estado === 'critico');
    }
    if (massAudience === 'riesgo') {
      return allAccounts.filter(a => a.estado === 'riesgo');
    }
    if (massAudience === 'inactivos_todos') {
      return allAccounts.filter(a => a.estado === 'critico' || a.estado === 'riesgo');
    }
    if (massAudience === 'b2b_inactivos') {
      return allAccounts.filter(a => a.tipo === 'B2B' && (a.estado === 'critico' || a.estado === 'riesgo'));
    }
    if (massAudience === 'b2c_inactivos') {
      return allAccounts.filter(a => a.tipo === 'B2C' && (a.estado === 'critico' || a.estado === 'riesgo'));
    }
    return [];
  }, [allAccounts, massAudience]);

  // Manejo de Modal Individual
  const handleOpenIndividualModal = (account: ChurnAccount) => {
    setSelectedAccount(account);
    const tmplId = account.tipo === 'B2B' ? 'reengagement_pymes' : 'reengagement_app';
    setSelectedTemplate(tmplId);

    const tmpl = REENGAGEMENT_PLAIN_TEXTS[tmplId] || DEFAULT_PLAIN_TEXTS[tmplId];
    if (tmpl) {
      setEmailSubject(tmpl.subject);
      setEmailPlainText(tmpl.text.replace(/\{\{nombre\}\}/g, account.nombre).replace(/\{\{dias\}\}/g, String(account.diasInactivo)));
    } else {
      setEmailSubject(`¿Todo bien con tu cuenta en Prospera?`);
      setEmailPlainText(`Hola ${account.nombre},\n\nNotamos que han pasado ${account.diasInactivo} días sin actividad en tu cuenta.\n\n¡Queremos invitarte a retomar el control hoy mismo!`);
    }

    setPreviewMode('preview');
    setActionFeedback(null);
  };

  const handleSelectTemplateIndividual = (tmplKey: string) => {
    setSelectedTemplate(tmplKey);
    const tmpl = REENGAGEMENT_PLAIN_TEXTS[tmplKey] || DEFAULT_PLAIN_TEXTS[tmplKey];
    if (tmpl && selectedAccount) {
      setEmailSubject(tmpl.subject);
      setEmailPlainText(tmpl.text.replace(/\{\{nombre\}\}/g, selectedAccount.nombre).replace(/\{\{dias\}\}/g, String(selectedAccount.diasInactivo)));
    }
  };

  const handleSendIndividual = async () => {
    if (!selectedAccount) return;
    setIsSending(true);
    setActionFeedback(null);

    try {
      const senderName = selectedSender === 'ventas@prosperafinanzas.com' ? 'Prospera Comercial' :
                         selectedSender === 'comunicaciones@prosperafinanzas.com' ? 'Prospera Comunicaciones' :
                         selectedSender === 'facturacion@prosperafinanzas.com' ? 'Prospera Facturación' :
                         'Prospera Soporte';

      const htmlContent = generateCampaignHtml(emailPlainText, selectedTemplate);

      const { error } = await supabase.functions.invoke('send-campaign', {
        body: {
          to: selectedAccount.email,
          subject: emailSubject,
          htmlContent,
          sender: {
            name: senderName,
            email: selectedSender || 'soporte@prosperafinanzas.com'
          },
          replyTo: {
            email: 'prosperaapp.soporte@gmail.com',
            name: 'Administrador Prospera'
          }
        }
      });

      if (error) throw error;

      setActionFeedback({
        type: 'success',
        message: `¡Correo de reactivación despachado exitosamente a ${selectedAccount.email}!`
      });

      setTimeout(() => {
        setSelectedAccount(null);
        setActionFeedback(null);
      }, 2200);
    } catch (err: any) {
      console.error('Error enviando correo individual:', err);
      setActionFeedback({
        type: 'error',
        message: `No se pudo enviar el correo: ${err.message || 'Verifica la conexión con Brevo.'}`
      });
    } finally {
      setIsSending(false);
    }
  };

  // Manejo de Modal Masivo
  const handleOpenMassModal = () => {
    setIsMassModalOpen(true);
    setMassAudience('critico');
    setMassTemplate('auto');
    setMassSender('soporte@prosperafinanzas.com');
    setMassSubject('¿Todo bien con tus finanzas? Vuelve a registrar tus movimientos en Prospera 📱');
    setMassPlainText(REENGAGEMENT_PLAIN_TEXTS['reengagement_app']?.text || '');
    setMassProgress(null);
    setMassFeedback(null);
    setMassPreviewMode('editor');
  };

  const handleSelectMassTemplate = (tmplKey: string) => {
    setMassTemplate(tmplKey);
    if (tmplKey === 'auto') {
      setMassSubject('¿Todo bien con tu cuenta en Prospera? Vuelve hoy mismo 🚀');
      setMassPlainText(`Hola {{nombre}},\n\nNotamos que han pasado {{dias}} días desde tu último registro en tu plataforma de {{app}}.\n\nMantener tus registros al día es el hábito fundamental para optimizar tu tiempo y resguardar tu patrimonio.\n\n¡Ingresa hoy mismo y retoma el control!\n\nUn saludo cordial,\nEquipo de Éxito del Cliente\nProspera Finanzas`);
    } else {
      const tmpl = REENGAGEMENT_PLAIN_TEXTS[tmplKey] || DEFAULT_PLAIN_TEXTS[tmplKey];
      if (tmpl) {
        setMassSubject(tmpl.subject);
        setMassPlainText(tmpl.text);
      }
    }
  };

  const handleSendMassBlast = async () => {
    if (massTargetAccounts.length === 0) return;
    setIsMassSending(true);
    setMassProgress({ current: 0, total: massTargetAccounts.length, success: 0, failed: 0 });
    setMassFeedback(null);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < massTargetAccounts.length; i++) {
      const acc = massTargetAccounts[i];
      
      const recipientName = acc.nombre || 'Estimado/a';
      const recipientDays = acc.diasInactivo;
      const recipientApp = acc.tipo === 'B2B' ? 'Prospera Pymes' : 'Prospera APP';

      const personalizedSubject = massSubject
        .replace(/\{\{nombre\}\}/gi, recipientName)
        .replace(/\{\{dias\}\}/gi, String(recipientDays))
        .replace(/\{\{app\}\}/gi, recipientApp);

      const personalizedBodyText = massPlainText
        .replace(/\{\{nombre\}\}/gi, recipientName)
        .replace(/\{\{dias\}\}/gi, String(recipientDays))
        .replace(/\{\{app\}\}/gi, recipientApp);

      let templateId = massTemplate;
      if (massTemplate === 'auto') {
        templateId = acc.tipo === 'B2B' ? 'reengagement_pymes' : 'reengagement_app';
      }

      const htmlContent = generateCampaignHtml(personalizedBodyText, templateId);

      const senderName = massSender === 'ventas@prosperafinanzas.com' ? 'Prospera Comercial' :
                         massSender === 'comunicaciones@prosperafinanzas.com' ? 'Prospera Comunicaciones' :
                         massSender === 'facturacion@prosperafinanzas.com' ? 'Prospera Facturación' :
                         'Prospera Soporte';

      try {
        const { error } = await supabase.functions.invoke('send-campaign', {
          body: {
            to: acc.email,
            subject: personalizedSubject,
            htmlContent,
            sender: {
              name: senderName,
              email: massSender || 'soporte@prosperafinanzas.com'
            },
            replyTo: {
              email: 'prosperaapp.soporte@gmail.com',
              name: 'Administrador Prospera'
            }
          }
        });

        if (error) throw error;
        successCount++;
      } catch (err) {
        console.error(`Error enviando a ${acc.email}:`, err);
        failCount++;
      }

      setMassProgress({
        current: i + 1,
        total: massTargetAccounts.length,
        success: successCount,
        failed: failCount
      });

      if (i < massTargetAccounts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    setIsMassSending(false);
    setMassFeedback({
      type: failCount === 0 ? 'success' : 'info',
      message: `🎉 ¡Campaña Masiva Finalizada! Se despacharon ${successCount} correos con éxito.${failCount > 0 ? ` (${failCount} con error)` : ''}`
    });
  };

  const isLoading = loadingB2C || loadingB2B;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      
      {/* 1. TARJETAS KPI DE SALUD Y PREVENCIÓN DE CHURN */}
      <ChurnKpis 
        theme={theme} 
        isDark={isDark} 
        kpis={kpis} 
      />

      {/* 2. BARRA DE CONTROLES, BÚSQUEDA Y ACCIÓN MASIVA */}
      <ChurnFilters
        theme={theme}
        isDark={isDark}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterTipo={filterTipo}
        setFilterTipo={setFilterTipo}
        filterEstado={filterEstado}
        setFilterEstado={setFilterEstado}
        onRefresh={() => { refetchB2C(); refetchB2B(); }}
        isLoading={isLoading}
        onOpenMassModal={handleOpenMassModal}
        criticosCount={kpis.criticos}
        enRiesgoCount={kpis.enRiesgo}
      />

      {/* 3. TABLA DE CUENTAS AUDITADAS CON PAGINACIÓN */}
      <ChurnAccountsTable
        theme={theme}
        isDark={isDark}
        isLoading={isLoading}
        filteredAccounts={filteredAccounts}
        paginatedAccounts={paginatedAccounts}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalPages={totalPages}
        onOpenIndividualModal={handleOpenIndividualModal}
      />

      {/* 4. MODAL DE RE-ENGAGEMENT INDIVIDUAL */}
      <ReengagementModal
        theme={theme}
        isDark={isDark}
        selectedAccount={selectedAccount}
        onClose={() => setSelectedAccount(null)}
        selectedSender={selectedSender}
        setSelectedSender={setSelectedSender}
        selectedTemplate={selectedTemplate}
        onSelectTemplate={handleSelectTemplateIndividual}
        emailSubject={emailSubject}
        setEmailSubject={setEmailSubject}
        emailPlainText={emailPlainText}
        setEmailPlainText={setEmailPlainText}
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        isSending={isSending}
        actionFeedback={actionFeedback}
        onSend={handleSendIndividual}
      />

      {/* 5. MODAL DE ENVÍO MASIVO (BLAST) */}
      <MassReengagementModal
        theme={theme}
        isDark={isDark}
        isOpen={isMassModalOpen}
        onClose={() => setIsMassModalOpen(false)}
        massAudience={massAudience}
        setMassAudience={setMassAudience}
        massTargetAccounts={massTargetAccounts}
        kpis={kpis}
        massTemplate={massTemplate}
        onSelectMassTemplate={handleSelectMassTemplate}
        massSender={massSender}
        setMassSender={setMassSender}
        massSubject={massSubject}
        setMassSubject={setMassSubject}
        massPlainText={massPlainText}
        setMassPlainText={setMassPlainText}
        massPreviewMode={massPreviewMode}
        setMassPreviewMode={setMassPreviewMode}
        isMassSending={isMassSending}
        massProgress={massProgress}
        massFeedback={massFeedback}
        onSendMassBlast={handleSendMassBlast}
      />

    </div>
  );
}
