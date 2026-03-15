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

export interface Reminder {
  id: string;
  name: string;
  amount: number;
  dayOfMonth: number;
  categoryId?: string;
}

export interface AppSettings {
  alertThresholdOptimistic: number;
  alertThresholdIdeal: number;
  alertThresholdPessimistic: number;
  currency?: string;
  locale?: string;
  startDay?: number;
  reminderDaysBefore: number;
  reminderFrequency: number;
}
