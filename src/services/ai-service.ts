// @ts-nocheck
import { Category } from './types';
import { enableAI } from './config';
// 👇 AÑADIMOS ESTO para poder verificar que el usuario está logueado
import { supabase } from './supabase'; 

/**
 * SERVICIO DE INTELIGENCIA ARTIFICIAL (OPENAI VIA SUPABASE)
 */

// 👇 TU NUEVA URL SEGURA
const SUPABASE_FUNCTION_URL = "https://brlqdlnbebtmtmyodxgy.supabase.co/functions/v1/ask-prospera";

export interface FinancialContext {
  periodo: string;
  ingresos: number;
  gastos: number;
  ahorro: number;
  tasaAhorro: number;
  topGastos: { name: string; amount: number }[];
  presupuestoEstado: string; 
}

export interface MagicResult {
  amount: number;
  categoryName: string;
  accountName: string;    
  toAccountName: string;  
  date: string; 
  note: string;
  type: 'expense' | 'income' | 'transfer'; 
}

const getLocalDate = () => {
    const now = new Date();
    const local = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    return local.toISOString().split('T')[0];
};

// 👇 AQUÍ ESTÁ LA MAGIA CORREGIDA
async function callOpenAI(systemPrompt: string, userPrompt: string, jsonMode: boolean = false) {
    if (!enableAI) {
        console.error("⚠️ La IA está desactivada. Revisa tu configuración.");
        return null;
    }

    // Obtenemos el token del usuario actual por seguridad
    const { data: { session } } = await supabase.auth.getSession();

    try {
        const response = await fetch(SUPABASE_FUNCTION_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Esta llave es la que le dice a Supabase que la petición es tuya
                "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY 
            },
            body: JSON.stringify({ 
                systemPrompt, 
                userPrompt,
                jsonMode
            })
        });

        if (!response.ok) {
            console.error("❌ Error HTTP de Supabase:", response.status);
            return null;
        }

        const data = await response.json();

        // 🚨 ESCUDO DE SEGURIDAD: Evita que la app se rompa si OpenAI devuelve un error (ej. sin saldo)
        if (data.error) {
            console.error("🚨 Error reportado por OpenAI:", data.error);
            return null;
        }

        // 🚨 ESCUDO DE SEGURIDAD: Verifica que realmente haya un mensaje antes de leerlo
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        }

        return null;
    } catch (error) {
        console.error("❌ Error de conexión con Supabase:", error);
        return null;
    }
}

// --- 1. HERRAMIENTA: ANALISTA (Smart Summary) ---
export const generateSmartSummary = async (context: FinancialContext) => {
  // 👇 CAMBIO AQUÍ: Se mejoró el systemPrompt y userPrompt del Analista para que sea más estricto, 
  // corto y detecte advertencias o felicitaciones específicas basadas en los gastos.
  const systemPrompt = `Eres Prospera AI, el analista financiero personal del usuario. 
  REGLAS ESTRICTAS:
  1. Tu respuesta DEBE tener MÁXIMO 2 oraciones (sé súper conciso y directo).
  2. Si el ahorro es positivo o la tasa de ahorro es buena, felicítalo con entusiasmo.
  3. Si los gastos superan los ingresos o están cerca de hacerlo, da una advertencia amable pero firme.
  4. Observa el "Top gastos". Si una categoría es muy alta (ej. comida o salidas), enfoca tu consejo en reducir ese gasto específico.
  5. Usa máximo 2 emojis en toda tu respuesta.`;

  const userPrompt = `Datos del mes actual: 
  - Ingresos: $${context.ingresos} 
  - Gastos: $${context.gastos} 
  - Ahorro: $${context.ahorro}
  - Top gastos: ${JSON.stringify(context.topGastos)}
  - Estado de presupuestos: ${context.presupuestoEstado || 'No definido'}
  
  Genera el consejo del mes basándote en estos datos.`;
  // ☝️ FIN DEL CAMBIO EN ANALISTA

  try {
    const res = await callOpenAI(systemPrompt, userPrompt);
    return res || "Revisa tus movimientos para obtener consejos.";
  } catch (e) {
    return "⏳ No pude analizar tus datos ahora.";
  }
};

// --- 2. HERRAMIENTA: MAGIC INPUT (Procesador de lenguaje natural) ---
export const parseMagicInput = async (text: string, categories: string[], accounts: string[]): Promise<MagicResult | null> => {
  const today = getLocalDate();
  
  // 👇 CAMBIO AQUÍ: Se mejoró el systemPrompt del Magic Input para que sea a prueba de balas, 
  // asigne correctamente ingresos/gastos/transferencias y use categorías por defecto si el usuario se equivoca.
  const systemPrompt = `Eres el motor de procesamiento de datos de Prospera Finanzas. Tu única función es extraer datos de texto libre y devolver UNICAMENTE un objeto JSON válido, sin texto adicional ni formato markdown.
  
  CONTEXTO:
  - Fecha de hoy: ${today} (usa esta fecha si el texto dice "hoy", resta 1 día si dice "ayer").
  - Categorías permitidas: [${categories.join(", ")}].
  - Cuentas permitidas: [${accounts.join(", ")}].
  
  REGLAS DE CLASIFICACIÓN:
  1. Si el usuario no menciona la cuenta, asume la cuenta principal por defecto (o la primera de la lista).
  2. Si la categoría que menciona el usuario NO está exactamente en la lista de 'Categorías permitidas', asigna la categoría que sea semánticamente más parecida. Si ninguna se parece, asigna "General" o "Varios".
  3. Tipo de movimiento ('type'):
     - "expense": para compras, pagos, gastos (ej. "comida 10", "pagué la luz").
     - "income": para ingresos, sueldos, cobros (ej. "me pagaron 100", "sueldo").
     - "transfer": solo cuando se mueve dinero entre dos cuentas del usuario.
  
  FORMATO JSON REQUERIDO:
  {"amount": number, "categoryName": string, "accountName": string, "toAccountName": string|null, "date": "YYYY-MM-DD", "note": string, "type": "expense"|"income"|"transfer"}`;
  // ☝️ FIN DEL CAMBIO EN MAGIC INPUT

  const userPrompt = `Analiza este texto y extrae la información en JSON: "${text}"`;

  try {
    const res = await callOpenAI(systemPrompt, userPrompt, true); 
    return res ? JSON.parse(res) : null;
  } catch (error) {
    console.error("Error parseando Magic Input:", error);
    return null;
  }
};

// --- 3. HERRAMIENTA: PROSPERA CFO (Chat de ayuda avanzada con memoria) ---
export const askProspera = async (
    question: string, 
    transactions: any[], 
    accounts: any[], 
    categories: any[], 
    settings: any, 
    username: string,
    history: { role: 'user' | 'ai'; text: string }[] = []
) => {
    const txSummary = transactions.slice(0, 15).map(t => 
        `${t.date}: ${t.type.toUpperCase()} $${t.amount} (${t.category || 'General'})`
    ).join("\n");

    const accSummary = accounts.map(a => `- ${a.name}: $${a.balance}`).join("\n");

    // Formateamos el historial (últimos 6 mensajes por brevedad y costo)
    const historyContext = history.slice(-6).map(m => 
        `${m.role === 'user' ? 'Usuario' : 'CFO'}: ${m.text}`
    ).join("\n");

    const systemPrompt = `Eres "Prospera CFO", el Director Financiero Personal de ${username}. 
    Tu misión es ayudar al usuario a dominar su dinero, salir de deudas y alcanzar la libertad financiera.
    
    PERSONALIDAD: Eres un experto de alto nivel: estratégico, directo, empático, motivador y profesional.
    
    REGLAS ESTRICTAS:
    1. LÍMITE DE DOMINIO: SOLO puedes hablar de finanzas personales, economía, ahorro, inversión y la plataforma Prospera.
    2. Usa formato Markdown con **negritas** y viñetas.
    3. Básate ÚNICAMENTE en la información del "ESTADO ACTUAL".
    4. CERO CÓDIGO MATEMÁTICO: No uses LaTeX.
    5. MEMORIA: Tienes acceso a los últimos mensajes de esta conversación para mantener la continuidad.`;

    const userPrompt = `
    ESTADO ACTUAL:
    Cuentas:
    ${accSummary}

    Últimos movimientos:
    ${txSummary}

    Datos Extras:
    ${JSON.stringify(settings)}

    HISTORIAL RECIENTE:
    ${historyContext || "No hay mensajes previos."}

    Pregunta actual del usuario: "${question}"
    
    Respuesta del CFO:`;

    try {
        const response = await callOpenAI(systemPrompt, userPrompt);
        return response || "Lo siento, no pude procesar esa consulta en este momento.";
    } catch (e) {
        return "Error de conexión con el CFO virtual.";
    }
};