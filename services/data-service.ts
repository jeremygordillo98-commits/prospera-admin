import { supabase } from "./supabase";
import { 
  Category, Account, Transaction, Reconciliation, 
  Reminder, AppSettings
} from "./types";
import { DataValidator } from "../utils/data-validators";
import { ErrorHandler } from "../utils/error-handler";

/**
 * SERVICIO CENTRAL DE DATOS - PROSPERA FINANZAS
 * Unifica toda la comunicación con Supabase y el mapeo de datos con manejo robusto de errores.
 */

export const DataService = {
  // --- CARGA GLOBAL ---
  async fetchAllData(userId: string) {
    try {
        const results = await Promise.all([
          supabase.from('perfiles').select('*').eq('id', userId).single(),
          supabase.from('cuentas').select('*').eq('usuario_id', userId),
          supabase.from('categorias').select('*').eq('usuario_id', userId),
          supabase.from('conciliaciones').select('*').eq('usuario_id', userId),
          supabase.from('transacciones').select('*').eq('usuario_id', userId),
          supabase.from('recordatorios').select('*').eq('usuario_id', userId)
        ]);

        const errors = results.filter(r => r.error);
        if (errors.length > 0) {
            console.warn("[DataService] Algunos datos no se cargaron correctamente:", errors);
        }

        return { 
            perfilRes: results[0], 
            cuentasRes: results[1], 
            catsRes: results[2], 
            recsRes: results[3], 
            txsRes: results[4],
            remsRes: results[5] 
        };
    } catch (error) {
        return ErrorHandler.handle(error, "fetchAllData");
    }
  },

  // --- CUENTAS ---
  async getAccounts(userId: string): Promise<Account[]> {
    const data = await ErrorHandler.wrap<any[]>(
        supabase.from('cuentas').select('*').eq('usuario_id', userId),
        "getAccounts"
    );
    return data.map((a: any) => ({
      id: a.id, name: a.nombre, initialBalance: a.saldo_inicial, 
      isSavings: a.es_ahorro, savingsTarget: a.meta_ahorro, type: a.tipo
    }));
  },

  async addAccount(userId: string, account: Partial<Account>) {
    const clean = DataValidator.sanitizeAccount(account);
    return ErrorHandler.wrap(
        supabase.from('cuentas').insert([{
          nombre: clean.name, 
          saldo_inicial: clean.initialBalance, 
          es_ahorro: clean.isSavings, 
          meta_ahorro: clean.savingsTarget || 0,
          tipo: clean.type || 'general', 
          usuario_id: userId
        }]).select().single(),
        "addAccount"
    );
  },

  async updateAccount(id: string, account: Partial<Account>) {
    const clean = DataValidator.sanitizeAccount(account);
    return ErrorHandler.wrap(
        supabase.from('cuentas').update({
            nombre: clean.name, 
            saldo_inicial: clean.initialBalance, 
            es_ahorro: clean.isSavings, 
            meta_ahorro: clean.savingsTarget || 0,
            tipo: clean.type 
        }).eq('id', id).select().single(),
        "updateAccount"
    );
  },

  async deleteAccount(id: string) {
    return ErrorHandler.wrap(
        supabase.from('cuentas').delete().eq('id', id).select(),
        "deleteAccount"
    );
  },

  // --- TRANSACCIONES ---
  async addTransaction(userId: string, tx: Omit<Transaction, "id" | "isReconciled">) {
    const clean = DataValidator.sanitizeTransaction(tx);
    const tipoDB = clean.type === 'income' ? 'ingreso' : clean.type === 'expense' ? 'gasto' : 'transferencia';
    return ErrorHandler.wrap(
        supabase.from('transacciones').insert([{
          monto: clean.amount, 
          tipo: tipoDB, 
          fecha: new Date(clean.createdAt).toISOString(), 
          nota: clean.note,
          categoria_id: clean.categoryId || null, 
          cuenta_id: clean.accountId, 
          cuenta_destino_id: clean.toAccountId || null, 
          usuario_id: userId
        }]).select().single(),
        "addTransaction"
    );
  },

  async updateTransaction(id: string, updates: Partial<Transaction>) {
    const clean = DataValidator.sanitizeTransaction(updates);
    const dbUpdates: any = {};
    if (updates.amount !== undefined) dbUpdates.monto = clean.amount;
    if (updates.categoryId !== undefined) dbUpdates.categoria_id = clean.categoryId;
    if (updates.accountId !== undefined) dbUpdates.cuenta_id = clean.accountId;
    if (updates.note !== undefined) dbUpdates.nota = clean.note;
    if (updates.reconciliationId !== undefined) dbUpdates.conciliacion_id = clean.reconciliationId;
    if (updates.type !== undefined) dbUpdates.tipo = clean.type === 'income' ? 'ingreso' : clean.type === 'expense' ? 'gasto' : 'transferencia';
    
    return ErrorHandler.wrap(
        supabase.from('transacciones').update(dbUpdates).eq('id', id).select().single(),
        "updateTransaction"
    );
  },

  async deleteTransaction(id: string) {
    return ErrorHandler.wrap(
        supabase.from('transacciones').delete().eq('id', id).select(),
        "deleteTransaction"
    );
  },

  async resetTransactions(userId: string) {
    return ErrorHandler.wrap(
        supabase.from('transacciones').delete().eq('usuario_id', userId).select(),
        "resetTransactions"
    );
  },

  // --- CATEGORÍAS ---
  async addCategory(userId: string, cat: any) {
    const clean = DataValidator.sanitizeCategory(cat);
    return ErrorHandler.wrap(
        supabase.from('categorias').insert([{
          nombre: clean.name, 
          tipo: clean.type, 
          usuario_id: userId, 
          presupuesto_opt: clean.budgets?.opt, 
          presupuesto_ideal: clean.budgets?.ideal, 
          presupuesto_pes: clean.budgets?.pess, 
          icono: clean.icon, 
          color: clean.color, 
          padre_id: clean.parentId || null
        }]).select().single(),
        "addCategory"
    );
  },

  async updateCategory(id: string, cat: any) {
    const clean = DataValidator.sanitizeCategory(cat);
    return ErrorHandler.wrap(
        supabase.from('categorias').update({
            nombre: clean.name, 
            presupuesto_opt: clean.budgets?.opt, 
            presupuesto_ideal: clean.budgets?.ideal, 
            presupuesto_pes: clean.budgets?.pess, 
            icono: clean.icon, 
            color: clean.color, 
            padre_id: clean.parentId || null
        }).eq('id', id).select().single(),
        "updateCategory"
    );
  },

  async deleteCategory(id: string) {
    return ErrorHandler.wrap(
        supabase.from('categorias').delete().eq('id', id).select(),
        "deleteCategory"
    );
  },

  // --- RECORDATORIOS ---
  async getReminders(userId: string): Promise<Reminder[]> {
      const data = await ErrorHandler.wrap<any[]>(
          supabase.from('recordatorios').select('*').eq('usuario_id', userId),
          "getReminders"
      );
      return data.map((r: any) => ({
          id: r.id, name: r.nombre, amount: r.monto, dayOfMonth: r.dia_corte, categoryId: r.categoria_id
      }));
  },

  async addReminder(userId: string, rem: Omit<Reminder, "id">) {
      const clean = DataValidator.sanitizeReminder(rem);
      return ErrorHandler.wrap(
          supabase.from('recordatorios').insert([{
              usuario_id: userId,
              nombre: clean.name,
              monto: clean.amount,
              dia_corte: clean.dayOfMonth,
              categoria_id: clean.categoryId || null
          }]).select().single(),
          "addReminder"
      );
  },

  async updateReminder(id: string, updates: Partial<Reminder>) {
    const clean = DataValidator.sanitizeReminder(updates);
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.nombre = clean.name;
    if (updates.amount !== undefined) dbUpdates.monto = clean.amount;
    if (updates.dayOfMonth !== undefined) dbUpdates.dia_corte = clean.dayOfMonth;
    if (updates.categoryId !== undefined) dbUpdates.categoria_id = clean.categoryId;

    return ErrorHandler.wrap(
        supabase.from('recordatorios').update(dbUpdates).eq('id', id).select().single(),
        "updateReminder"
    );
  },

  async deleteReminder(id: string) {
      return ErrorHandler.wrap(
          supabase.from('recordatorios').delete().eq('id', id).select(),
          "deleteReminder"
      );
  },

  // --- CONCILIACIONES ---
  async addReconciliation(userId: string, accountId: string, cutoffDate: number, balance: number) {
      const data: any = await ErrorHandler.wrap(
          supabase.from('conciliaciones').insert([{
            cuenta_id: accountId, fecha_corte: cutoffDate, saldo: balance, usuario_id: userId
          }]).select().single(),
          "addReconciliation"
      );
      
      if (data && data.id) {
      const fechaISO = new Date(cutoffDate).toISOString();
      await ErrorHandler.wrap(
          supabase.from('transacciones')
            .update({ conciliacion_id: data.id })
            .eq('cuenta_id', accountId)
            .is('conciliacion_id', null)
            .lte('fecha', fechaISO)
            .select(),
          "updateTransactionsPostReconciliation"
      );
    }
    return data;
  },

  async deleteReconciliation(id: string) {
    await ErrorHandler.wrap(
        supabase.from('transacciones').update({ conciliacion_id: null }).eq('conciliacion_id', id).select(),
        "unreconcileTransactions"
    );
    return ErrorHandler.wrap(
        supabase.from('conciliaciones').delete().eq('id', id).select(),
        "deleteReconciliation"
    );
  },

  // --- PERFIL & AJUSTES ---
  async updateProfile(userId: string, updates: any) {
      return ErrorHandler.wrap(
          supabase.from('perfiles').update(updates).eq('id', userId).select().single(),
          "updateProfile"
      );
  },

  async getSettings(userId: string): Promise<AppSettings> {
      // Devolvemos defaults. En el futuro esto leerá de la tabla 'perfiles' o 'settings'
      return { 
        alertThresholdOptimistic: 80, 
        alertThresholdIdeal: 90, 
        alertThresholdPessimistic: 100,
        currency: '$',
        locale: 'es-EC',
        reminderDaysBefore: 3,
        reminderFrequency: 1
      };
  }
};
