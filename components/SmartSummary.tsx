import React, { useState, useEffect } from 'react';
import { useTheme } from "../context/ThemeContext";
import { generateSmartSummary, FinancialContext } from "../services/ai-service";

interface Props {
  contextData: FinancialContext;
}

export default function SmartSummary({ contextData }: Props) {
  const { theme } = useTheme();
  
  // --- RESPONSIVE CHECK ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // ------------------------

  const [summary, setSummary] = useState<string>("✨ Verificando datos...");
  const [loading, setLoading] = useState(false);

  // 🔐 CLAVE ÚNICA: Creamos un ID basado en los datos actuales.
  // Si los montos no cambian, esta clave sigue siendo la misma.
  const dataKey = `prospera_summary_${contextData.periodo}_${contextData.ingresos}_${contextData.gastos}`;

  const fetchSummary = async (force = false) => {
    // 1. Si NO estamos forzando y ya existe un análisis guardado para estos datos exactos...
    const cachedData = localStorage.getItem(dataKey);
    if (!force && cachedData) {
        // ... ¡Usamos el guardado y NO gastamos API de Google! 🧠
        setSummary(cachedData);
        return;
    }

    // 2. Si es nuevo o forzamos, llamamos a la IA
    setLoading(true);
    const res = await generateSmartSummary(contextData);
    
    // Si la IA nos dio error de límite (429), intentamos no borrar lo que ya teníamos si existía
    if (res.includes("429") || res.includes("Límite")) {
         if (cachedData) {
             setSummary(cachedData); // Mantenemos el viejo si el nuevo falló
         } else {
             setSummary(res);
         }
    } else {
        setSummary(res);
        // Guardamos en memoria para la próxima vez que cambies de pestaña
        localStorage.setItem(dataKey, res);
    }
    setLoading(false);
  };

  // Se ejecuta automáticamente si cambian los datos (o la clave)
  useEffect(() => {
    fetchSummary(false); // false = intenta usar caché primero
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey]); 

  return (
    <div style={{
        background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", 
        padding: isMobile ? "24px" : "25px 35px",
        borderRadius: "32px",
        marginBottom: "35px",
        color: "white",
        boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
        border: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: 20,
        position: 'relative',
        overflow: 'hidden'
    }} className="hover-lift">
        {/* EFECTO DE LUZ DE FONDO IA */}
        <div style={{ 
            position: 'absolute', top: -50, left: -50, width: 200, height: 200, 
            background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', 
            opacity: 0.2, filter: 'blur(30px)', pointerEvents: 'none' 
        }} />

        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 12, display: 'flex' }}>
                    <span style={{ fontSize: '1.2rem' }}>💎</span>
                </div>
                <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: '#818cf8' }}>
                    Perspectiva Estratégica
                </h3>
            </div>
            
            <div style={{ 
                fontSize: isMobile ? '1.05rem' : '1.2rem', 
                fontWeight: 600, 
                lineHeight: '1.6',
                minHeight: '2rem',
                color: '#f8fafc'
            }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="prospera-pulse" style={{ width: 8, height: 8, background: '#818cf8', borderRadius: '50%' }} />
                        <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>Sincronizando con redes neuronales...</span>
                    </div>
                ) : (
                    summary
                )}
            </div>
        </div>

        <button 
            onClick={() => fetchSummary(true)} 
            disabled={loading}
            style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: 'blur(10px)',
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
                padding: "12px 24px",
                borderRadius: "16px",
                cursor: "pointer",
                fontWeight: 800,
                fontSize: "0.85rem",
                transition: "all 0.3s ease",
                whiteSpace: "nowrap",
                width: isMobile ? "100%" : "auto",
                zIndex: 1
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
            {loading ? "Sincronizando..." : "Refrescar Análisis"}
        </button>
    </div>
  );
}
