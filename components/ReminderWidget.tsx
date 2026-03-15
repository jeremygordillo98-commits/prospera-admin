import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';

export default function ReminderWidget() {
  const { reminders, settings, showNotification } = useData();
  const { theme, isDark } = useTheme();
  const navigate = useNavigate();

  // --- RESPONSIVE CHECK ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // ------------------------

  // Lógica para calcular días restantes
  const getDaysUntil = (dayOfMonth: number) => {
    const today = new Date();
    const currentDay = today.getDate();
    
    // Si es hoy
    if (dayOfMonth === currentDay) return 0;
    
    // Si es futuro en este mes (ej: Hoy 5, Vence 10) -> 5 días
    if (dayOfMonth > currentDay) return dayOfMonth - currentDay;
    
    // Si ya pasó este mes (ej: Hoy 25, Vence 5) -> Vence el próximo mes
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return (daysInMonth - currentDay) + dayOfMonth;
  };

  // Filtrar solo los que están "Cerca" según tu configuración
  const upcomingReminders = useMemo(() => {
    // Si no está configurado, usamos 3 días por defecto
    const threshold = settings.reminderDaysBefore ?? 3; 
    
    return reminders
      .map((r: any) => ({ ...r, daysLeft: getDaysUntil(r.dayOfMonth) }))
      .filter(r => r.daysLeft <= threshold)
      .sort((a,b) => a.daysLeft - b.daysLeft);
  }, [reminders, settings.reminderDaysBefore]);

  // EFECTO: Lanzar Pop-up (Gamificación)
  useEffect(() => {
    if (upcomingReminders.length === 0) return;

    const lastPopupStr = localStorage.getItem('last_reminder_popup');
    const lastPopup = lastPopupStr ? parseInt(lastPopupStr) : 0;
    const now = Date.now();
    
    // Frecuencia en días convertida a milisegundos
    const freqDays = settings.reminderFrequency ?? 1; 
    const freqMs = freqDays * 24 * 60 * 60 * 1000;

    // Si ya pasó el tiempo de "descanso" del usuario
    if (now - lastPopup > freqMs) {
       // Encontrar el más urgente
       const urgent = upcomingReminders[0];
       
       if (showNotification) {
         showNotification({
             type: 'warning',
             title: '📅 Recordatorio de Pago',
             message: `El pago de "${urgent.name}" ($${urgent.amount}) vence ${urgent.daysLeft === 0 ? 'HOY' : `en ${urgent.daysLeft} días`}. ¡No lo olvides!`
         });
       }

       // Guardar marca de tiempo para no volver a molestar pronto
       localStorage.setItem('last_reminder_popup', now.toString());
    }
  }, [upcomingReminders, showNotification, settings.reminderFrequency]);

  // Si no hay nada urgente, el widget desaparece (retorna null)
  if (upcomingReminders.length === 0) return null;

  return (
    <div style={{
        marginBottom: 30, 
        display: 'flex', 
        gap: 16, 
        overflowX: 'auto', 
        paddingBottom: 15,
        scrollSnapType: isMobile ? 'x mandatory' : 'none',
        WebkitOverflowScrolling: 'touch',
        paddingRight: 20
    }}>
        {upcomingReminders.map((rem: any) => (
            <div key={rem.id} 
                 onClick={() => navigate('/recordatorios')}
                 className="hover-lift"
                 style={{
                    background: rem.daysLeft === 0 
                        ? (isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2') 
                        : theme.card,
                    backdropFilter: theme.blur,
                    WebkitBackdropFilter: theme.blur,
                    border: `1px solid ${rem.daysLeft === 0 ? theme.danger : theme.glassBorder}`,
                    borderLeft: `6px solid ${rem.daysLeft === 0 ? theme.danger : '#ff9800'}`,
                    borderRadius: 24,
                    padding: '20px',
                    minWidth: isMobile ? 280 : 240,
                    scrollSnapAlign: 'start',
                    cursor: 'pointer',
                    boxShadow: theme.glassShadow,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    flexShrink: 0
                 }}
            >
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12}}>
                    <div style={{
                        background: rem.daysLeft === 0 ? theme.danger : '#ff9800',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: 10,
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        {rem.daysLeft === 0 ? 'Vence Hoy' : `En ${rem.daysLeft} días`}
                    </div>
                    <span style={{fontSize: '1.2rem'}}>📅</span>
                </div>
                <div style={{fontWeight: 800, color: theme.text, fontSize: '1.1rem', letterSpacing: '-0.5px'}}>{rem.name}</div>
                <div style={{color: theme.textSec, fontSize: '0.95rem', fontWeight: 500, marginTop: 4}}>${rem.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
        ))}
    </div>
  );
}
