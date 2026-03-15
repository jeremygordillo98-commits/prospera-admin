import React, { useState, useEffect } from 'react';
import { useTheme } from "../context/ThemeContext";

export default function InstallPrompt() {
  const { theme, isDark } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Detectar si ya está instalada la PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
                         || (window.navigator as any).standalone 
                         || document.referrer.includes('android-app://');

    // Si ya es una App instalada, no mostramos nada
    if (isStandalone) {
      setIsVisible(false);
      return;
    }

    // 2. Escuchar el evento oficial del navegador
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // 3. Forzar visibilidad (Universal)
    // Esto asegura que la pestaña salga aunque el navegador no dispare el evento rápido
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
        setDeferredPrompt(null);
      }
    } else {
      // Instrucción universal para iOS o navegadores que no soportan prompt directo
      alert("🚀 ¡Casi listo!\n\nPara instalar Prospera:\n1. Toca el botón 'Compartir' (el icono del cuadrado con flecha).\n2. Busca y selecciona 'Añadir a pantalla de inicio'.\n3. ¡Listo! Ya tendrás acceso directo.");
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '30px',
      left: '30px',
      zIndex: 200000,
      animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div 
        onClick={handleInstall}
        className="prospera-pulse"
        style={{
          background: theme.primary,
          backdropFilter: theme.blur,
          WebkitBackdropFilter: theme.blur,
          border: `1px solid rgba(255,255,255,0.2)`,
          padding: '12px 20px',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          boxShadow: `0 15px 35px ${theme.primary}50`,
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          color: 'white'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
          e.currentTarget.style.filter = 'brightness(1.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.filter = 'brightness(1)';
        }}
      >
        <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            width: 32, height: 32, 
            borderRadius: 10, 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem'
        }}>
            📲
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 900, fontSize: '0.9rem', letterSpacing: '-0.3px' }}>Instalar Prospera</span>
            <span style={{ fontSize: '0.7rem', opacity: 0.9, fontWeight: 600 }}>Experiencia Nativa</span>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          style={{
            background: 'rgba(0,0,0,0.1)',
            border: 'none',
            color: 'white',
            width: 24, height: 24,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem',
            marginLeft: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
        >
          ✕
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
