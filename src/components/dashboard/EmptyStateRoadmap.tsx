import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IconCheckCircleSolid, 
  IconCircle, 
  IconPlus 
} from './DashboardIcons';

interface EmptyStateRoadmapProps {
  isMobile: boolean;
  isDark: boolean;
  theme: any;
  hasAccounts: boolean;
  hasCategories: boolean;
  canAddTransaction: boolean;
}

export const EmptyStateRoadmap: React.FC<EmptyStateRoadmapProps> = ({
  isMobile,
  isDark,
  theme,
  hasAccounts,
  hasCategories,
  canAddTransaction
}) => {
  const navigate = useNavigate();

  const cardStyle = { 
    padding: isMobile ? 15 : 20, 
    borderRadius: 16, 
    background: theme.card, 
    backdropFilter: 'blur(12px)', 
    border: `1px solid ${theme.border}`, 
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)' 
  };

  const roadmapStepStyle = { 
    display: 'flex', 
    flexDirection: isMobile ? 'column' as const : 'row' as const, 
    alignItems: isMobile ? 'flex-start' : 'center', 
    gap: 16, 
    padding: 20, 
    background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)', 
    borderRadius: 12, 
    border: `1px solid ${theme.border}`, 
    transition: 'all 0.3s ease' 
  };

  return (
    <div style={{...cardStyle, marginTop: 10, padding: isMobile ? 20 : 35, display: 'flex', flexDirection: 'column', gap: 20}}>
        <div style={{textAlign: 'center', marginBottom: 10}}>
            <div style={{fontSize: '3rem', marginBottom: 10}}>🚀</div>
            <h2 style={{margin: 0, color: theme.text, fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 'black'}}>¡Bienvenido a Prospera!</h2>
            <p style={{color: theme.textSec, fontSize: '1.1rem', marginTop: 10, maxWidth: 500, margin: '10px auto 0'}}>Estás a solo 3 pasos de dominar tus finanzas personales y sacarle el máximo provecho a la Inteligencia Artificial.</p>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 700, margin: '0 auto', width: '100%'}}>
            
            {/* Paso 1: Cuentas */}
            <div style={{ ...roadmapStepStyle, borderLeft: hasAccounts ? `4px solid ${theme.primary}` : `4px solid ${theme.border}`}}>
                <div style={{ flexShrink: 0 }}>
                    {hasAccounts ? <IconCheckCircleSolid color={theme.primary} /> : <IconCircle color={theme.textSec} />}
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, color: theme.text, fontSize: '1.1rem' }}>1. Crea tu primera cuenta</h4>
                    <p style={{ margin: '5px 0 0 0', color: theme.textSec, fontSize: '0.85rem' }}>Para registrar gastos, necesitas un lugar de donde salga el dinero (ej. Billetera, Banco).</p>
                </div>
                <div style={{ flexShrink: 0, width: isMobile ? '100%' : 'auto' }}>
                    {hasAccounts ? (
                        <span style={{ color: theme.primary, fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 5, justifyContent: isMobile ? 'flex-end' : 'flex-start' }}><IconCheckCircleSolid color={theme.primary}/> Completado</span>
                    ) : (
                        <button onClick={() => navigate('/accounts')} style={{ background: theme.primary, color: isDark ? '#000' : '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', width: isMobile ? '100%' : 'auto', transition: 'transform 0.2s' }}>Crear Cuenta</button>
                    )}
                </div>
            </div>

            {/* Paso 2: Categorías */}
            <div style={{ ...roadmapStepStyle, borderLeft: hasCategories ? `4px solid ${theme.primary}` : `4px solid ${theme.border}`}}>
                <div style={{ flexShrink: 0 }}>
                    {hasCategories ? <IconCheckCircleSolid color={theme.primary} /> : <IconCircle color={theme.textSec} />}
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, color: theme.text, fontSize: '1.1rem' }}>2. Revisa tus categorías</h4>
                    <p style={{ margin: '5px 0 0 0', color: theme.textSec, fontSize: '0.85rem' }}>Prospera trae categorías por defecto, pero puedes editarlas para adaptarlas a tu estilo de vida.</p>
                </div>
                <div style={{ flexShrink: 0, width: isMobile ? '100%' : 'auto' }}>
                    {hasCategories ? (
                        <span style={{ color: theme.primary, fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 5, justifyContent: isMobile ? 'flex-end' : 'flex-start' }}><IconCheckCircleSolid color={theme.primary}/> Completado</span>
                    ) : (
                        <button onClick={() => navigate('/categories')} style={{ background: theme.primary, color: isDark ? '#000' : '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}>Revisar Categorías</button>
                    )}
                </div>
            </div>

            {/* Paso 3: Movimientos */}
            <div style={{ ...roadmapStepStyle, opacity: canAddTransaction ? 1 : 0.6, borderLeft: `4px solid ${theme.border}`}}>
                <div style={{ flexShrink: 0 }}>
                    <IconCircle color={theme.textSec} />
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, color: theme.text, fontSize: '1.1rem' }}>3. Registra tu primer movimiento</h4>
                    <p style={{ margin: '5px 0 0 0', color: theme.textSec, fontSize: '0.85rem' }}>¡Todo listo! Ve a la sección de Movimientos y usa nuestra IA para agregar tu primer gasto.</p>
                </div>
                <div style={{ flexShrink: 0, width: isMobile ? '100%' : 'auto' }}>
                    <button disabled={!canAddTransaction} onClick={() => navigate('/movements')} style={{ background: canAddTransaction ? theme.primary : theme.inputBg, color: canAddTransaction ? (isDark ? '#000' : '#fff') : theme.textSec, border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 'bold', cursor: canAddTransaction ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: isMobile ? '100%' : 'auto', transition: 'all 0.3s' }}>
                        <IconPlus /> Agregar Gasto
                    </button>
                </div>
            </div>

        </div>
    </div>
  );
};
