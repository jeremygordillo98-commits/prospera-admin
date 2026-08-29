import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAdminPush } from '../../hooks/useAdminPush';
import { Bell, BellOff, BellRing, Smartphone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const PushNotificationToggle: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { theme, isDark } = useTheme();
  const { isSupported, isSubscribed, loading, error, subscribe, unsubscribe, sendTestNotification } = useAdminPush();
  const [testing, setTesting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleToggle = async () => {
    if (isSubscribed) {
      const ok = await unsubscribe();
      if (ok) {
        setSuccessMsg('Notificaciones desactivadas en este dispositivo.');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } else {
      const ok = await subscribe();
      if (ok) {
        setSuccessMsg('¡Notificaciones activadas con éxito!');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    }
  };

  const handleTest = async () => {
    setTesting(true);
    await sendTestNotification();
    setSuccessMsg('Notificación de prueba enviada.');
    setTimeout(() => {
      setTesting(false);
      setSuccessMsg(null);
    }, 3000);
  };

  if (!isSupported) {
    if (compact) return null;
    return (
      <div 
        className="px-3 py-2 rounded-xl text-xs flex items-center gap-2"
        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
      >
        <BellOff size={14} />
        <span>Push no soportado en este navegador</span>
      </div>
    );
  }

  // Versión compacta para la barra superior (Header)
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggle}
          disabled={loading}
          title={isSubscribed ? "Notificaciones Push Activas (Clic para desactivar)" : "Activar Notificaciones Push en este dispositivo"}
          className="h-9 px-3 rounded-xl flex items-center gap-2 border-none cursor-pointer transition-all duration-200 font-bold text-xs"
          style={{
            background: isSubscribed 
              ? (isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.12)')
              : (isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(148, 163, 184, 0.18)'),
            color: isSubscribed ? '#10b981' : theme.textSec,
            border: `1px solid ${isSubscribed ? '#10b98140' : theme.border}`
          }}
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : isSubscribed ? (
            <BellRing size={15} className="text-emerald-500 animate-pulse" />
          ) : (
            <Bell size={15} />
          )}
          <span className="hidden sm:inline">
            {isSubscribed ? 'Push Activo' : 'Activar Push'}
          </span>
        </button>

        {isSubscribed && (
          <button
            onClick={handleTest}
            disabled={testing}
            title="Probar sonido, vibración y notificación push"
            className="h-9 px-2.5 rounded-xl flex items-center justify-center border-none cursor-pointer text-xs font-bold transition-all"
            style={{
              background: theme.primary + '15',
              color: theme.primary,
              border: `1px solid ${theme.primary}30`
            }}
          >
            {testing ? <Loader2 size={14} className="animate-spin" /> : '🔔 Probar'}
          </button>
        )}
      </div>
    );
  }

  // Versión expandida para SysConfig / Herramientas
  return (
    <div
      className="p-5 rounded-2xl transition-all duration-300 relative overflow-hidden"
      style={{
        background: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${isSubscribed ? '#10b98140' : theme.border}`,
        boxShadow: isSubscribed ? '0 10px 30px rgba(16, 185, 129, 0.08)' : 'none'
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: isSubscribed ? 'rgba(16, 185, 129, 0.15)' : `${theme.primary}15`,
              color: isSubscribed ? '#10b981' : theme.primary
            }}
          >
            {isSubscribed ? <Smartphone size={22} /> : <Bell size={22} />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold m-0">Notificaciones Push & Alertas Móviles</h4>
              <span
                className="text-[0.68rem] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: isSubscribed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                  color: isSubscribed ? '#10b981' : theme.textSec
                }}
              >
                {isSubscribed ? '🟢 Vinculado (APK / PC)' : '⚪ Inactivo'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 mb-0 leading-relaxed">
              Recibe avisos sonoros y vibración en tu APK de PWABuilder cuando lleguen tickets de App B2C o Pymes B2B, incluso con la app cerrada.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {isSubscribed && (
            <button
              onClick={handleTest}
              disabled={testing}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border-none cursor-pointer transition-all flex items-center gap-1.5"
              style={{
                background: `${theme.primary}15`,
                color: theme.primary,
                border: `1px solid ${theme.primary}30`
              }}
            >
              {testing ? <Loader2 size={14} className="animate-spin" /> : <BellRing size={14} />}
              <span>Probar Alerta</span>
            </button>
          )}

          <button
            onClick={handleToggle}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-extrabold border-none cursor-pointer transition-all flex items-center gap-2"
            style={{
              background: isSubscribed ? 'rgba(239, 68, 68, 0.12)' : theme.primary,
              color: isSubscribed ? '#ef4444' : '#000000',
              border: isSubscribed ? '1px solid rgba(239, 68, 68, 0.3)' : 'none'
            }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            <span>{isSubscribed ? 'Desactivar en este Dispositivo' : 'Activar Notificaciones'}</span>
          </button>
        </div>
      </div>

      {/* Mensaje de retroalimentación o error */}
      {successMsg && (
        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
          <CheckCircle2 size={14} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
