import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { supabaseContable } from '../../services/supabaseContable';
import { useData, PreciosConfig } from '../../context/DataContext';
import { RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

import { SystemStatusCard } from './SystemStatusCard';
import { PricesConfigCard } from './PricesConfigCard';
import { SystemMaintenanceCard } from './SystemMaintenanceCard';

export default function ConfigView() {
  const { theme, isDark, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const { precios: preciosDB, updatePrecios } = useData();

  const [diagnosing, setDiagnosing] = useState(false);
  const [b2cStatus, setB2cStatus] = useState<{ status: string; latency: number; error: string | null } | null>(null);
  const [b2bStatus, setB2bStatus] = useState<{ status: string; latency: number; error: string | null } | null>(null);

  // Estado de APIs Externas
  const [checkingApis, setCheckingApis] = useState(false);
  const [brevoStatus, setBrevoStatus] = useState<{ status: string; latency: number; error: string | null } | null>(null);
  const [sriStatus, setSriStatus] = useState<{ status: string; latency: number; error: string | null } | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // --- CONTROL GLOBAL B2C (APP) ---
  const [b2cMaint, setB2cMaint] = useState({ activo: false, mensaje: '' });
  const [b2cBanner, setB2cBanner] = useState({ activo: false, texto: '', tipo: 'info' });
  const [loadingB2cConfig, setLoadingB2cConfig] = useState(false);

  // --- CONTROL GLOBAL B2B (PYMES) ---
  const [b2bMaint, setB2bMaint] = useState({ activo: false, mensaje: '' });
  const [b2bBanner, setB2bBanner] = useState({ activo: false, texto: '', tipo: 'info' });
  const [loadingB2bConfig, setLoadingB2bConfig] = useState(false);

  // --- CONFIGURACIÓN DE PRECIOS ---
  const [preciosEdit, setPreciosEdit] = useState<PreciosConfig>(preciosDB);
  const [isEditingPrecios, setIsEditingPrecios] = useState(false);

  useEffect(() => {
    setPreciosEdit(preciosDB);
  }, [preciosDB]);

  // --- POLÍTICAS DE MANTENIMIENTO ---
  const [retencionCampanas, setRetencionCampanas] = useState<number>(15);
  const [retencionSoporte, setRetencionSoporte] = useState<number>(30);
  const [isEditingMaint, setIsEditingMaint] = useState(false);

  const [rowCounts, setRowCounts] = useState<{
    b2c: { perfiles: number; transacciones: number; soporte_tickets: number; public_news: number };
    b2b: { perfiles: number; empresas_gestionadas: number; soporte_tickets: number; user_notifications: number };
  }>({
    b2c: { perfiles: 0, transacciones: 0, soporte_tickets: 0, public_news: 0 },
    b2b: { perfiles: 0, empresas_gestionadas: 0, soporte_tickets: 0, user_notifications: 0 }
  });

  const checkDb = async (dbClient: any) => {
    const start = performance.now();
    try {
      const { error } = await dbClient.from('perfiles').select('id_usuario, id', { count: 'exact', head: true }).limit(1);
      const end = performance.now();
      
      if (error && error.code !== 'PGRST100' && error.message.includes('FetchError')) {
        throw error;
      }
      return { status: 'connected', latency: Math.round(end - start), error: null };
    } catch (err: any) {
      return { status: 'error', latency: 0, error: err.message || 'Error de conexión' };
    }
  };

  const runDiagnostics = async () => {
    setDiagnosing(true);
    setActionMessage(null);
    
    const b2cCheck = await checkDb(supabase);
    setB2cStatus(b2cCheck);

    const b2bCheck = await checkDb(supabaseContable);
    setB2bStatus(b2bCheck);

    const counts = {
      b2c: { perfiles: 0, transacciones: 0, soporte_tickets: 0, public_news: 0 },
      b2b: { perfiles: 0, empresas_gestionadas: 0, soporte_tickets: 0, user_notifications: 0 }
    };

    if (b2cCheck.status === 'connected') {
      try {
        const { count: perf } = await supabase.from('perfiles').select('*', { count: 'exact', head: true });
        const { count: tx } = await supabase.from('transacciones').select('*', { count: 'exact', head: true });
        const { count: tix } = await supabase.from('soporte_tickets').select('*', { count: 'exact', head: true });
        const { count: news } = await supabase.from('public_news').select('*', { count: 'exact', head: true });
        counts.b2c = { perfiles: perf || 0, transacciones: tx || 0, soporte_tickets: tix || 0, public_news: news || 0 };
      } catch (e) {
        console.error("B2C counts error", e);
      }
    }

    if (b2bCheck.status === 'connected') {
      try {
        const { count: perf } = await supabaseContable.from('perfiles').select('*', { count: 'exact', head: true });
        const { count: emp } = await supabaseContable.from('empresas_gestionadas').select('*', { count: 'exact', head: true });
        const { count: tix } = await supabaseContable.from('soporte_tickets').select('*', { count: 'exact', head: true });
        const { count: notif } = await supabaseContable.from('user_notifications').select('*', { count: 'exact', head: true });
        counts.b2b = { perfiles: perf || 0, empresas_gestionadas: emp || 0, soporte_tickets: tix || 0, user_notifications: notif || 0 };
      } catch (e) {
        console.error("B2B counts error", e);
      }
    }

    setRowCounts(counts);
    setDiagnosing(false);
  };

  const checkExternalApis = async () => {
    setCheckingApis(true);
    setBrevoStatus(null);
    setSriStatus(null);

    const brevoStart = performance.now();
    try {
      const brevoRes = await fetch('https://api.brevo.com/v3/account', {
        method: 'GET',
        headers: { 'accept': 'application/json' }
      });
      const latency = Math.round(performance.now() - brevoStart);
      if (brevoRes.ok || brevoRes.status === 401) {
        setBrevoStatus({ status: 'connected', latency, error: null });
      } else {
        setBrevoStatus({ status: 'error', latency, error: `HTTP ${brevoRes.status}` });
      }
    } catch (err: any) {
      setBrevoStatus({ status: 'error', latency: 0, error: 'Sin respuesta' });
    }

    const sriStart = performance.now();
    try {
      await fetch('https://srienlinea.sri.gob.ec/', {
        method: 'HEAD',
        mode: 'no-cors',
        signal: AbortSignal.timeout(8000)
      });
      const latency = Math.round(performance.now() - sriStart);
      setSriStatus({ status: 'connected', latency, error: null });
    } catch (err: any) {
      const latency = Math.round(performance.now() - sriStart);
      if (err?.name === 'TimeoutError') {
        setSriStatus({ status: 'slow', latency, error: 'Timeout (>8s)' });
      } else {
        setSriStatus({ status: 'error', latency: 0, error: 'Sin respuesta' });
      }
    }

    setCheckingApis(false);
  };

  const loadMaintConfigs = async () => {
    try {
      const { data } = await supabase
        .from('precios_config')
        .select('*')
        .in('id', ['maint_campanas_retencion', 'maint_soporte_retencion']);
      
      if (data) {
        const campanasObj = data.find(c => c.id === 'maint_campanas_retencion');
        const soporteObj = data.find(c => c.id === 'maint_soporte_retencion');
        if (campanasObj) setRetencionCampanas(campanasObj.valor);
        if (soporteObj) setRetencionSoporte(soporteObj.valor);
      }
    } catch (e) {
      console.error("Error loading maintenance configs:", e);
    }
  };

  const handleSaveMaint = async () => {
    try {
      const updates = [
        { id: 'maint_campanas_retencion', valor: retencionCampanas },
        { id: 'maint_soporte_retencion', valor: retencionSoporte }
      ];
      const { error } = await supabase.from('precios_config').upsert(updates);
      if (error) throw error;
      setActionMessage("Políticas de mantenimiento guardadas con éxito.");
      setIsEditingMaint(false);
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      console.error("Error saving maintenance configs:", err);
      setActionMessage("Error al guardar políticas de mantenimiento: " + err.message);
      setTimeout(() => setActionMessage(null), 3500);
    }
  };

  const handlePrecioChange = (key: keyof PreciosConfig, value: string) => {
    setPreciosEdit(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const handleSavePrecios = async () => {
    try {
      await updatePrecios(preciosEdit);
      setIsEditingPrecios(false);
      setActionMessage("Estructura de precios guardada con éxito.");
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      console.error("Error saving prices:", err);
      setActionMessage("Error al guardar tarifas: " + err.message);
      setTimeout(() => setActionMessage(null), 3500);
    }
  };

  const loadSystemConfigs = async () => {
    try {
      setLoadingB2cConfig(true);
      const { data } = await supabase.from('configuracion_sistema').select('*');
      if (data) {
        const m = data.find(c => c.clave === 'mantenimiento')?.valor;
        const b = data.find(c => c.clave === 'banner')?.valor;
        if (m) setB2cMaint(m);
        if (b) setB2cBanner(b);
      }
    } catch (err) {
      console.error("Error loading B2C system configs:", err);
    } finally {
      setLoadingB2cConfig(false);
    }

    try {
      setLoadingB2bConfig(true);
      const { data } = await supabaseContable.from('configuracion_sistema').select('*');
      if (data) {
        const m = data.find(c => c.clave === 'mantenimiento')?.valor;
        const b = data.find(c => c.clave === 'banner')?.valor;
        if (m) setB2bMaint(m);
        if (b) setB2bBanner(b);
      }
    } catch (err) {
      console.error("Error loading B2B system configs:", err);
    } finally {
      setLoadingB2bConfig(false);
    }
  };

  const handleSaveB2cConfig = async () => {
    try {
      setLoadingB2cConfig(true);
      const updates = [
        { clave: 'mantenimiento', valor: b2cMaint },
        { clave: 'banner', valor: b2cBanner }
      ];
      const { error } = await supabase.from('configuracion_sistema').upsert(updates);
      if (error) throw error;
      setActionMessage("Configuración de Prospera App (B2C) guardada con éxito.");
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      console.error("Error saving B2C config:", err);
      setActionMessage("Error al guardar B2C: " + err.message);
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setLoadingB2cConfig(false);
    }
  };

  const handleSaveB2bConfig = async () => {
    try {
      setLoadingB2bConfig(true);
      const updates = [
        { clave: 'mantenimiento', valor: b2bMaint },
        { clave: 'banner', valor: b2bBanner }
      ];
      const { error } = await supabaseContable.from('configuracion_sistema').upsert(updates);
      if (error) throw error;
      setActionMessage("Configuración de Prospera Pymes (B2B) guardada con éxito.");
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      console.error("Error saving B2B config:", err);
      setActionMessage("Error al guardar B2B: " + err.message);
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setLoadingB2bConfig(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
    loadMaintConfigs();
    loadSystemConfigs();
  }, []);

  const handlePurgeCache = () => {
    queryClient.clear();
    setActionMessage("Caché de consultas de React Query eliminada con éxito.");
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleCleanStorage = () => {
    let count = 0;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && !key.includes('auth-token') && !key.includes('session')) {
        localStorage.removeItem(key);
        count++;
      }
    }
    sessionStorage.clear();
    setActionMessage(`Limpieza exitosa. Se eliminaron ${count} variables de configuración local. Recargando panel...`);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const cardStyle = { 
    background: theme.card, 
    padding: '24px', 
    borderRadius: '24px', 
    border: `1px solid ${theme.border}`,
    boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.15)' : '0 10px 30px rgba(0,0,0,0.02)',
  };

  const statusBadge = (status: string | undefined, latency: number) => {
    if (status === 'connected') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>
          <CheckCircle size={16} /> Conectado ({latency}ms)
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.danger, fontWeight: 800, fontSize: '0.85rem' }}>
        <AlertTriangle size={16} /> Error de Conexión
      </div>
    );
  };

  return (
    <div style={{ paddingBottom: '60px', animation: 'fadeIn 0.4s ease' }}>
      
      {/* HEADER DE SISTEMA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
        <div>
          <h2 style={{ color: theme.text, margin: 0, fontWeight: 900, letterSpacing: '-0.5px' }}>⚙️ Configuración del Sistema</h2>
          <p style={{ color: theme.textSec, fontSize: '0.85rem', margin: '5px 0 0 0' }}>Monitoreo en tiempo real, auditoría de carga y utilidades de mantenimiento.</p>
        </div>
        <button 
          onClick={runDiagnostics} 
          disabled={diagnosing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: theme.primary + '15',
            color: theme.primary,
            border: 'none',
            padding: '10px 18px',
            borderRadius: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '0.8rem',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = `${theme.primary}25`}
          onMouseOut={(e) => e.currentTarget.style.background = `${theme.primary}15`}
        >
          <RefreshCw size={14} className={diagnosing ? 'animate-spin' : ''} />
          Refrescar Diagnóstico
        </button>
      </div>

      {actionMessage && (
        <div style={{
          background: theme.primary + '15',
          border: `1px solid ${theme.primary}30`,
          color: theme.primary,
          padding: '12px 20px',
          borderRadius: '16px',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '25px',
          animation: 'slideIn 0.2s ease'
        }}>
          ✨ {actionMessage}
        </div>
      )}

      {/* SECCIÓN DE MONITOREO Y APIS */}
      <SystemStatusCard
          b2cStatus={b2cStatus}
          b2bStatus={b2bStatus}
          checkingApis={checkingApis}
          brevoStatus={brevoStatus}
          sriStatus={sriStatus}
          rowCounts={rowCounts}
          checkExternalApis={checkExternalApis}
          handlePurgeCache={handlePurgeCache}
          handleCleanStorage={handleCleanStorage}
          toggleTheme={toggleTheme}
          isDark={isDark}
          theme={theme}
          cardStyle={cardStyle}
          statusBadge={statusBadge}
      />

      {/* SECCIÓN DE CONFIGURACIONES OPERATIVAS */}
      <div style={{ marginTop: '45px', marginBottom: '25px' }}>
        <h2 style={{ color: theme.text, margin: 0, fontWeight: 900, letterSpacing: '-0.5px' }}>💼 Configuraciones de Negocio</h2>
        <p style={{ color: theme.textSec, fontSize: '0.85rem', margin: '5px 0 0 0' }}>Gestión de tarifas del ecosistema y reglas de retención automática de datos.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* CARD DE PRECIOS */}
        <PricesConfigCard
            preciosEdit={preciosEdit}
            isEditingPrecios={isEditingPrecios}
            setIsEditingPrecios={setIsEditingPrecios}
            handlePrecioChange={handlePrecioChange}
            handleSavePrecios={handleSavePrecios}
            theme={theme}
            cardStyle={cardStyle}
            isDark={isDark}
        />

        {/* CARD DE POLÍTICAS Y CONTROL REMOTO APP/PYMES */}
        <SystemMaintenanceCard
            retencionCampanas={retencionCampanas}
            setRetencionCampanas={setRetencionCampanas}
            retencionSoporte={retencionSoporte}
            setRetencionSoporte={setRetencionSoporte}
            isEditingMaint={isEditingMaint}
            setIsEditingMaint={setIsEditingMaint}
            handleSaveMaint={handleSaveMaint}
            b2cMaint={b2cMaint}
            setB2cMaint={setB2cMaint}
            b2cBanner={b2cBanner}
            setB2cBanner={setB2cBanner}
            handleSaveB2cConfig={handleSaveB2cConfig}
            loadingB2cConfig={loadingB2cConfig}
            b2bMaint={b2bMaint}
            setB2bMaint={setB2bMaint}
            b2bBanner={b2bBanner}
            setB2bBanner={setB2bBanner}
            handleSaveB2bConfig={handleSaveB2bConfig}
            loadingB2bConfig={loadingB2bConfig}
            theme={theme}
            cardStyle={cardStyle}
            isDark={isDark}
        />

      </div>

      <div style={{ marginTop: 50, textAlign: 'center', color: theme.textSec, fontSize: '0.75rem', fontWeight: 600 }}>
        Prospera Admin Engine v4.1.0 • 2026 Free Spirit
      </div>

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
