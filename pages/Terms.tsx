import React from 'react';
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function Terms() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  // --- RESPONSIVE CHECK ---
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { isDark } = useTheme();

  // Función para volver a la pantalla anterior
  const handleGoBack = () => {
    navigate(-1);
  };

  return (    <div style={{ 
      background: '#0F172A', 
      minHeight: '100vh', 
      padding: isMobile ? '20px' : '40px', 
      color: theme.text,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* ORBES DE LUZ */}
      <div style={{ position: 'fixed', top: '10%', right: '-10%', width: '400px', height: '400px', background: theme.primary + '10', borderRadius: '50%', filter: 'blur(120px)', zIndex: 0 }}></div>
      <div style={{ position: 'fixed', bottom: '10%', left: '-10%', width: '300px', height: '300px', background: '#7c3bed10', borderRadius: '50%', filter: 'blur(100px)', zIndex: 0 }}></div>

      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        lineHeight: '1.7', 
        textAlign: 'left',
        paddingBottom: '100px',
        position: 'relative',
        zIndex: 1
      }}>
        
        {/* --- BOTÓN DE REGRESAR --- */}
        <button 
          onClick={handleGoBack} 
          style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            color: theme.text,
            fontSize: '0.9rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '40px',
            padding: '12px 24px',
            borderRadius: '16px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(-5px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Regresar
        </button>

        <header style={{ textAlign: 'center', marginBottom: '60px', animation: 'fadeInDown 0.8s ease' }}>
            <h1 style={{ color: theme.text, marginBottom: '15px', fontSize: isMobile ? '2.2rem' : '3.2rem', fontWeight: 900, letterSpacing: '-1.5px' }}>
              Términos de <span style={{ color: theme.primary }}>Prospera</span>
            </h1>
            <div style={{ display: 'inline-block', background: theme.primary + '15', color: theme.primary, padding: '6px 16px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Versión 3.0 • Febrero 2026
            </div>
        </header>

        <section style={{ 
            background: theme.card, 
            backdropFilter: 'blur(30px)', 
            border: `1px solid ${theme.border}`, 
            borderRadius: '32px', 
            padding: isMobile ? '30px 20px' : '50px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            animation: 'fadeInUp 0.8s ease'
        }}>
            {/* TÉRMINOS Y CONDICIONES */}
            <h2 style={{ color: theme.text, fontSize: '1.6rem', fontWeight: 900, marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: theme.primary }}>📋</span> Condiciones de Uso
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '35px', color: theme.text, opacity: 0.9 }}>
                <div>
                  <h3 style={{ color: theme.primary, fontSize: '1.1rem', marginBottom: '10px', fontWeight: 800 }}>1. Aceptación Universal</h3>
                  <p>Al acceder a <b>Prospera Finanzas</b>, usted entra en un ecosistema de gestión inteligente donde acepta nuestros términos. Este software es una herramienta de empoderamiento financiero.</p>
                </div>

                <div>
                  <h3 style={{ color: theme.primary, fontSize: '1.1rem', marginBottom: '10px', fontWeight: 800 }}>2. Estatus Legal y Financiero</h3>
                  <p>Prospera no es una entidad bancaria ni realiza captación de dinero. Somos estrictamente una <b>plataforma tecnológica de análisis de datos</b>. No estamos bajo la vigilancia de la Superintendencia de Bancos por la naturaleza no financiera de nuestro servicio de software.</p>
                </div>

                <div style={{ padding: '24px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: '20px', borderLeft: `6px solid ${theme.primary}` }}>
                  <h3 style={{ color: theme.text, fontSize: '1.1rem', marginBottom: '10px', fontWeight: 900 }}>🤖 El Factor IA</h3>
                  <p style={{ margin: 0 }}>Nuestro "Analista IA" ofrece sugerencias basadas en patrones. <b>No es asesoría financiera certificada</b>. Las decisiones tomadas son responsabilidad única del usuario. Disfrute del análisis, pero use su criterio.</p>
                </div>

                <div>
                  <h3 style={{ color: theme.primary, fontSize: '1.1rem', marginBottom: '10px', fontWeight: 800 }}>3. Tu Seguridad es Prioridad</h3>
                  <p>Tus credenciales son tu llave maestra. Protégelas. Nosotros usamos encriptación de grado militar y protocolos <b>Supabase</b> para que tus datos estén blindados, pero la seguridad empieza en tu dispositivo.</p>
                </div>

                <hr style={{ border: 'none', height: '1px', background: theme.border, margin: '10px 0' }} />

                {/* POLÍTICA DE PRIVACIDAD */}
                <h2 style={{ color: theme.text, fontSize: '1.6rem', fontWeight: 900, marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: theme.primary }}>🛡️</span> Privacidad y Escudo de Datos
                </h2>
                
                <div>
                  <p>Operamos bajo la <b>Ley Orgánica de Protección de Datos (Ecuador)</b>. Tus datos transaccionales se usan exclusivamente para darte poder sobre tu dinero.</p>
                  <ul style={{ paddingLeft: '20px', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <li><b>Neutralidad:</b> No vendemos tus datos a bancos ni agencias publicitarias. Eres el dueño de tu información.</li>
                    <li><b>Procesamiento IA:</b> Solo los conceptos de gastos viajan a la API de OpenAI, manteniendo tu identidad personal aislada.</li>
                    <li><b>Derecho al Olvido:</b> Puedes exportar o borrar toda tu información permanentemente desde "Configuración".</li>
                  </ul>
                </div>
            </div>

            <footer style={{ textAlign: 'center', marginTop: '60px', paddingTop: '40px', borderTop: `1px solid ${theme.border}` }}>
                <p style={{ fontWeight: 800, color: theme.textSec }}>¿Preguntas sobre el marco legal?</p>
                <a href="mailto:soporte@prosperafinanzas.com" style={{ 
                    display: 'inline-block',
                    background: theme.primary,
                    color: isDark ? '#000' : '#fff',
                    padding: '14px 30px',
                    borderRadius: '16px',
                    textDecoration: 'none',
                    fontWeight: 900,
                    boxShadow: `0 10px 25px ${theme.primary}40`,
                    transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Contactar a Soporte Legal
                </a>
            </footer>
        </section>
      </div>

      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}
