import { supabase } from "./supabase";

// --- TIPOS E INTERFACES ---

export type CategoryType = 'income' | 'expense' | 'transfer';

export interface CategoryBudget {
  opt: number;   
  ideal: number; 
  pess: number;  
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
  parentId?: string;
  budgets?: CategoryBudget; 
}

export interface Account {
  id: string;
  name: string;
  initialBalance: number;
  isSavings: boolean;
  savingsTarget?: number; 
  type?: string; 
  userId?: string;
  createdAt?: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: CategoryType;
  categoryId?: string;
  accountId: string;
  toAccountId?: string;
  createdAt: number; 
  note: string;
  isReconciled: boolean;
  reconciliationId?: string;
  image?: string;
}

export interface Reconciliation {
  id: string;
  accountId: string;
  cutoffDate: number;
  balance: number;
  createdAt: number;
}

// ✅ NUEVO: Interfaz para Recordatorios
export interface Reminder {
  id: string;
  name: string;
  amount: number;
  dayOfMonth: number; // Día del mes (1-31)
  categoryId?: string;
}

// ✅ ACTUALIZADO: Agregamos las variables de configuración
export interface AppSettings {
  alertThresholdOptimistic: number;
  alertThresholdIdeal: number;
  alertThresholdPessimistic: number;
  currency?: string;
  startDay?: number;
  // Nuevos campos
  reminderDaysBefore: number;   // Días antes para avisar
  reminderFrequency: number;    // Frecuencia del pop-up
}

// --- CONSTANTES PARA LA UI (Emojis y Colores) ---

export const ICON_LIST = [
  { name: 'Casa', icon: "🏠" },
  { name: 'Comida', icon: "🍔" },
  { name: 'Transporte', icon: "🚌" },
  { name: 'Servicios', icon: "💡" },
  { name: 'Salud', icon: "💊" },
  { name: 'Compras', icon: "🛒" },
  { name: 'Entretenimiento', icon: "🎮" },
  { name: 'Educación', icon: "🎓" },
  { name: 'Viajes', icon: "✈️" },
  { name: 'Ahorro', icon: "🐷" },
  { name: 'Trabajo', icon: "💼" },
  { name: 'Celular', icon: "📱" },
  { name: 'Regalo', icon: "🎁" },
  { name: 'Herramientas', icon: "🛠️" },
  { name: 'Banco', icon: "🏦" },
  { name: 'Inversión', icon: "📈" },
  { name: 'Mascota', icon: "🐾" },
  { name: 'Hijos', icon: "👶" },
  { name: 'Internet', icon: "📶" },
  { name: 'Otros', icon: "❓" },
];

export const COLORS = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
  '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', 
  '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', 
  '#ff5722', '#795548', '#9e9e9e', '#607d8b'
];

// --- FUNCIONES REALES (Conectadas a Supabase) ---

// 1. CUENTAS 
export const getAccounts = async (): Promise<Account[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('cuentas')
    .select('*')
    .eq('user_id', user.id);

  if (error) { console.error("Error fetching accounts:", error); return []; }
  
  return data.map((d: any) => ({
    id: d.id,
    name: d.name,
    initialBalance: d.initial_balance,
    isSavings: d.is_savings,
    savingsTarget: d.savings_target, 
    type: d.tipo 
  }));
};

export const addAccount = async (name: string, initialBalance: number, isSavings: boolean, savingsTarget: number = 0, type: string = 'general'): Promise<Account | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('cuentas')
    .insert([{ 
      name, 
      initial_balance: initialBalance, 
      is_savings: isSavings, 
      savings_target: savingsTarget, 
      tipo: type, 
      user_id: user.id 
    }])
    .select()
    .single();

  if (error) { console.error("Error adding account:", error); return null; }

  return {
    id: data.id,
    name: data.name,
    initialBalance: data.initial_balance,
    isSavings: data.is_savings,
    savingsTarget: data.savings_target,
    type: data.type 
  };
};

export const updateAccount = async (id: string, name: string, initialBalance: number, isSavings: boolean, savingsTarget: number = 0, type: string = 'general'): Promise<boolean> => {
  const { error } = await supabase
    .from('cuentas')
    .update({ 
      name, 
      initial_balance: initialBalance, 
      is_savings: isSavings, 
      savings_target: savingsTarget,
      tipo: type 
    })
    .eq('id', id);

  if (error) { console.error("Error updating account:", error); return false; }
  return true;
};

export const deleteAccount = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('cuentas').delete().eq('id', id);
  return !error;
};

// 2. CATEGORÍAS
export const getCategories = async (): Promise<Category[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.from('categorias').select('*').eq('user_id', user.id);
  if (error) { console.error(error); return []; }

  return data.map((d: any) => ({
    id: d.id,
    name: d.name,
    type: d.type as CategoryType,
    parentId: d.parent_id,
    budgets: {
        opt: d.presupuesto_opt || 0,
        ideal: d.presupuesto_ideal || 0,
        pess: d.presupuesto_pes || 0
    },
    icon: d.icono,
    color: d.color
  }));
};

export const addCategory = async (name: string, type: CategoryType, budgets: any, icon: string, color: string, parentId?: string): Promise<Category | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from('categorias').insert([{
    name, 
    type, 
    parent_id: parentId || null, 
    presupuesto_opt: budgets.opt, 
    presupuesto_ideal: budgets.ideal, 
    presupuesto_pes: budgets.pess,
    icono: icon, 
    color, 
    user_id: user.id
  }]).select().single();

  if (error) { console.error(error); return null; }
  return { id: data.id, name: data.name, type: data.type, parentId: data.parent_id, budgets, icon: data.icono, color: data.color };
};

export const updateCategory = async (id: string, name: string, budgets: any, icon: string, color: string, parentId?: string): Promise<boolean> => {
  const { error } = await supabase.from('categorias').update({ 
      name, 
      presupuesto_opt: budgets.opt, 
      presupuesto_ideal: budgets.ideal, 
      presupuesto_pes: budgets.pess,
      icono: icon, 
      color, 
      parent_id: parentId || null 
  }).eq('id', id);
  return !error;
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('categorias').delete().eq('id', id);
  return !error;
};

// 3. TRANSACCIONES
export const getTransactions = async (): Promise<Transaction[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.from('transacciones').select('*').eq('user_id', user.id); 
  if (error) { console.error(error); return []; }

  return data.map((d: any) => ({
    id: d.id,
    amount: d.monto,
    type: (d.tipo === 'ingreso' ? 'income' : d.tipo === 'gasto' ? 'expense' : 'transfer') as CategoryType,
    categoryId: d.categoria_id,
    accountId: d.cuenta_id,
    toAccountId: d.cuenta_destino_id,
    createdAt: new Date(d.fecha).getTime(),
    note: d.nota,
    isReconciled: !!d.conciliacion_id,
    reconciliationId: d.conciliacion_id
  }));
};

export const addTransaction = async (tx: Omit<Transaction, "id">): Promise<Transaction | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const tipoDB = tx.type === 'income' ? 'ingreso' : tx.type === 'expense' ? 'gasto' : 'transferencia';

  const { data, error } = await supabase.from('transacciones').insert([{
    monto: tx.amount,
    tipo: tipoDB,
    categoria_id: tx.categoryId || null,
    cuenta_id: tx.accountId,
    cuenta_destino_id: tx.toAccountId || null,
    fecha: new Date(tx.createdAt).toISOString(),
    nota: tx.note,
    conciliacion_id: tx.reconciliationId || null,
    user_id: user.id
  }]).select().single();

  if (error) { console.error(error); return null; }
  return { ...tx, id: data.id };
};

export const updateTransaction = async (id: string, tx: Omit<Transaction, "id">): Promise<boolean> => {
  const tipoDB = tx.type === 'income' ? 'ingreso' : tx.type === 'expense' ? 'gasto' : 'transferencia';
  const { error } = await supabase.from('transacciones').update({
    monto: tx.amount,
    tipo: tipoDB,
    categoria_id: tx.categoryId || null,
    cuenta_id: tx.accountId,
    cuenta_destino_id: tx.toAccountId || null,
    fecha: new Date(tx.createdAt).toISOString(),
    nota: tx.note,
    conciliacion_id: tx.reconciliationId || null
  }).eq('id', id);
  return !error;
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('transacciones').delete().eq('id', id);
  return !error;
};

export const clearTransactions = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase.from('transacciones').delete().eq('user_id', user.id);
  return !error;
};

// ✅ 4. RECORDATORIOS (NUEVAS FUNCIONES CONECTADAS A SUPABASE)
export const getReminders = async (): Promise<Reminder[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.from('recordatorios').select('*').eq('usuario_id', user.id);
  if (error) { console.error("Error fetching reminders:", error); return []; }

  return data.map((r: any) => ({
    id: r.id,
    name: r.nombre,
    amount: r.monto,
    dayOfMonth: r.dia_corte,
    categoryId: r.categoria_id
  }));
};

export const addReminder = async (rem: Omit<Reminder, "id">): Promise<Reminder | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from('recordatorios').insert([{
    usuario_id: user.id,
    nombre: rem.name,
    monto: rem.amount,
    dia_corte: rem.dayOfMonth,
    categoria_id: rem.categoryId || null
  }]).select().single();

  if (error) { console.error("Error adding reminder:", error); return null; }
  return { id: data.id, name: data.nombre, amount: data.monto, dayOfMonth: data.dia_corte, categoryId: data.categoria_id };
};

export const deleteReminder = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('recordatorios').delete().eq('id', id);
  return !error;
};

export const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    // Traducir camelCase a snake_case para la BD
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.nombre = updates.name;
    if (updates.amount !== undefined) dbUpdates.monto = updates.amount;
    if (updates.dayOfMonth !== undefined) dbUpdates.dia_corte = updates.dayOfMonth; // Se asume dia_corte en BD según getReminders
    if (updates.categoryId !== undefined) dbUpdates.categoria_id = updates.categoryId;

    const { error } = await supabase
        .from('recordatorios')
        .update(dbUpdates)
        .eq('id', id);

    if (error) {
        console.error("Error actualizando recordatorio:", error);
        return false;
    }
    return true;
};

// 5. SETTINGS & PROFILE
export const getUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('perfiles').select('*').eq('id', user.id).single();
  return { username: data?.nombre_completo || user.email?.split('@')[0] || "Usuario" };
};

// ✅ ACTUALIZADO: Devuelve valores por defecto para los recordatorios
export const getSettings = async (): Promise<AppSettings | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Aquí devolvemos los defaults + la estructura nueva
  return { 
    alertThresholdOptimistic: 80, 
    alertThresholdIdeal: 90, 
    alertThresholdPessimistic: 100,
    reminderDaysBefore: 3, // Default: avisar 3 días antes
    reminderFrequency: 1   // Default: molestar cada 1 día
  };
};

export const saveSettings = async (settings: AppSettings): Promise<boolean> => {
  // Implementación pendiente
  return true;
};