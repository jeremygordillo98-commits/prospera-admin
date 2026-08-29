import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { VAPID_PUBLIC_KEY } from '../services/constants';
import { soundService } from '../utils/soundService';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useAdminPush() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Verificar compatibilidad y estado actual
  const checkStatus = useCallback(async () => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !('Notification' in window)
    ) {
      setIsSupported(false);
      setLoading(false);
      return;
    }

    setIsSupported(true);
    setPermission(Notification.permission);

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch (err: any) {
      console.warn('Error comprobando estado de push:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // 2. Activar y Suscribir Notificaciones Push
  const subscribe = async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Las notificaciones Push no son soportadas en este navegador.');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Solicitar permiso nativo al sistema / APK
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        setError('Permiso de notificaciones denegado por el usuario.');
        setLoading(false);
        return false;
      }

      // Asegurar que el Service Worker está activo
      const reg = await navigator.serviceWorker.ready;

      // Obtener o crear suscripción Push en Google FCM / WebPush
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey as unknown as BufferSource
        });
      }

      const subJson = sub.toJSON();
      const endpoint = sub.endpoint;
      const p256dh = subJson.keys?.p256dh;
      const auth = subJson.keys?.auth;

      if (!endpoint || !p256dh || !auth) {
        throw new Error('No se pudieron extraer las llaves de suscripción del dispositivo.');
      }

      // Obtener usuario autenticado actual en Supabase B2C
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No hay sesión de administrador activa.');
      }

      // Determinar nombre amigable del dispositivo
      const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
      const isTWA = window.matchMedia('(display-mode: standalone)').matches;
      const deviceName = `${isMobile ? (isTWA ? 'APK Móvil' : 'Navegador Móvil') : 'PC Escritorio'} (${navigator.platform || 'Admin'})`;

      // Guardar / Actualizar suscripción en Supabase B2C
      const { error: dbError } = await supabase.from('admin_push_subscriptions').upsert(
        {
          user_id: user.id,
          endpoint,
          p256dh,
          auth,
          device_name: deviceName,
          user_agent: navigator.userAgent,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'endpoint' }
      );

      if (dbError) {
        console.error('Error guardando suscripción en base de datos:', dbError);
        throw dbError;
      }

      setIsSubscribed(true);
      soundService.playNotification('success');
      return true;
    } catch (err: any) {
      console.error('Error al suscribir notificaciones push:', err);
      setError(err.message || 'Error al activar notificaciones');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 3. Desactivar / Cancelar Suscripción
  const unsubscribe = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();

        // Eliminar de Supabase B2C
        await supabase.from('admin_push_subscriptions').delete().eq('endpoint', endpoint);
      }

      setIsSubscribed(false);
      return true;
    } catch (err: any) {
      console.error('Error al cancelar suscripción:', err);
      setError(err.message || 'Error al desactivar notificaciones');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 4. Enviar Notificación de Prueba Inmediata
  const sendTestNotification = async () => {
    soundService.playNotification('ticket');
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification('🛡️ Prospera Admin (Prueba)', {
        body: '¡Excelente! Las notificaciones nativas en tu dispositivo están activas y sincronizadas con el sistema.',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'test-admin-push',
        data: { url: '/admin' }
      } as any);
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    error,
    subscribe,
    unsubscribe,
    sendTestNotification,
    refreshStatus: checkStatus
  };
}
