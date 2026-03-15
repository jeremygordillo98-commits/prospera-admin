// src/services/config.ts

// 1. Forzamos a que la IA esté siempre activa porque ahora Supabase controla el acceso
export const enableAI = true;

// 2. Dejamos esta función vacía para no romper otras partes de tu app que la llamen
export const getOpenAIApiKey = (): string => {
  return ""; 
};