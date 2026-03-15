/**
 * UTILIDADES DE VALIDACIÓN Y SANEAMIENTO DE DATOS
 * Evita que datos corruptos o de tipo incorrecto entren a la lógica de la app.
 */

import { Transaction, Account, Category, Reminder } from "../services/types";

export const DataValidator = {
  /**
   * Asegura que una transacción tenga los tipos correctos y valores lógicos.
   */
  sanitizeTransaction(tx: any): Omit<Transaction, "id"> {
    return {
      amount: Math.abs(Number(tx.amount) || 0),
      type: tx.type || 'expense',
      categoryId: tx.categoryId || undefined,
      accountId: tx.accountId || '',
      toAccountId: tx.toAccountId || undefined,
      createdAt: typeof tx.createdAt === 'number' ? tx.createdAt : new Date(tx.createdAt || Date.now()).getTime(),
      note: String(tx.note || '').trim(),
      isReconciled: !!tx.isReconciled,
      reconciliationId: tx.reconciliationId || undefined
    };
  },

  /**
   * Valida los datos de una cuenta.
   */
  sanitizeAccount(acc: any): Partial<Account> {
    return {
      name: String(acc.name || 'Nueva Cuenta').trim(),
      initialBalance: Number(acc.initialBalance) || 0,
      isSavings: !!acc.isSavings,
      savingsTarget: Math.abs(Number(acc.savingsTarget) || 0),
      type: acc.type || 'general'
    };
  },

  /**
   * Valida los datos de una categoría y sus presupuestos.
   */
  sanitizeCategory(cat: any): Partial<Category> {
    return {
      name: String(cat.name || 'Nueva Categoría').trim(),
      type: cat.type || 'expense',
      icon: cat.icon || '🏷️',
      color: cat.color || '#9e9e9e',
      parentId: cat.parentId || undefined,
      budgets: {
        opt: Math.abs(Number(cat.budgets?.opt) || 0),
        ideal: Math.abs(Number(cat.budgets?.ideal) || 0),
        pess: Math.abs(Number(cat.budgets?.pess) || 0)
      }
    };
  },

  /**
   * Valida un recordatorio.
   */
  sanitizeReminder(rem: any): Omit<Reminder, "id"> {
    return {
      name: String(rem.name || 'Nuevo Recordatorio').trim(),
      amount: Math.abs(Number(rem.amount) || 0),
      dayOfMonth: Math.min(31, Math.max(1, Number(rem.dayOfMonth) || 1)),
      categoryId: rem.categoryId || undefined
    };
  }
};
