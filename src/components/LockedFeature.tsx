import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom'; // Para el botón de cancelar

interface LockedFeatureProps {
  title: string;
  description: string;
  icon?: string;
  onClose?: () => void; // 👈 Nueva propiedad para cerrar como modal
}

export default function LockedFeature({ title, description, icon = "🔐", onClose }: LockedFeatureProps) {
  const { theme, isDark } = useTheme();
  const navigate = useNavigate(); 
  
  // --- RESPONSIVE CHECK ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Función para manejar el botón cancelar/salir
  const handleCancel = () => {
    if (onClose) {
      onClose(); // Si es un modal (como en categorías), solo cierra el aviso
    } else {
      navigate(-1); // Si es una página completa, vuelve atrás
    }
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0, 
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200000,
        backdropFilter: 'blur(15px) brightness(30%)', 
        WebkitBackdropFilter: 'blur(15px) brightness(30%)', 
        padding: '24px',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.5s ease-out'
      }}>
        <div style={{
          background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)', 
          padding: isMobile ? '40px 24px' : '56px 48px',
          borderRadius: '40px',
          textAlign: 'center',
          border: '2px solid rgba(251, 191, 36, 0.3)', 
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 40px rgba(251, 191, 36, 0.1)', 
          animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* DECORACIÓN PREMIUM */}
          <div style={{ 
              position: 'absolute', top: -50, right: -50, width: 150, height: 150, 
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none'
          }} />

          <div style={{ 
            fontSize: isMobile ? '4.5rem' : '6rem',
            marginBottom: 24, 
            filter: 'drop-shadow(0 15px 30px rgba(251, 191, 36, 0.4))',
            animation: 'prospera-pulse 2s infinite'
          }}>
            {icon}
          </div>
          
          <h2 style={{ 
            color: '#fff', 
            margin: '0 0 16px 0', 
            fontSize: isMobile ? '1.8rem' : '2.2rem',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-1px'
          }}>
            {title}
          </h2>
          
          <p style={{ 
            color: '#94a3b8', 
            marginBottom: 32, 
            lineHeight: '1.6',
            fontSize: isMobile ? '1.05rem' : '1.15rem',
            fontWeight: 500
          }}>
            {description}
          </p>
          
          <button 
            onClick={() => alert("Contacta al soporte para activar el Plan Ultra+")}
            style={{ 
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', 
              color: '#000',
              border: 'none', 
              padding: '20px 32px', 
              borderRadius: '20px', 
              cursor: 'pointer', 
              fontWeight: 900,
              fontSize: '1.1rem',
              width: '100%',
              boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)',
              transition: 'all 0.3s ease',
              marginBottom: '16px'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Acceder ahora 💎
          </button>

          <button 
            onClick={handleCancel}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)', 
              padding: '16px 32px', 
              borderRadius: '20px', 
              cursor: 'pointer', 
              fontWeight: 700,
              fontSize: '0.95rem',
              width: '100%',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            {onClose ? 'Regresar' : 'Explorar otras funciones'}
          </button>
          
          <div style={{ 
              marginTop: 32, 
              fontSize: '0.75rem', 
              color: '#fbbf24', 
              fontWeight: 900, 
              textTransform: 'uppercase', 
              letterSpacing: '3px',
              opacity: 0.8
          }}>
            Experiencia Ultra
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
