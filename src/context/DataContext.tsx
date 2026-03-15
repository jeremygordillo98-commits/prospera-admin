import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../services/supabase"; 
import { DataService } from "../services/data-service";
import { Toast } from "../components/Toast";
import { updateFormattingConfig } from "../utils/financial-helpers";
import { 
  Category, Account, Transaction, AppSettings, 
  CategoryType, Reconciliation, CategoryBudget, Reminder 
} from "../services/types";

// --- INTERFAZ PARA NOTIFICACIONES ---
export interface GamificationNotification {
    type: 'celebration' | 'success' | 'warning';
    title: string;
    message: string;
    amountLeft?: number;
}

// ✅ NUEVA INTERFAZ DE PERMISOS
export interface UserPermissions {
    presupuestos: boolean;
    recordatorios: boolean;
    subcategorias: boolean;
    reporte_patrimonio: boolean;
    reporte_estado: boolean;
    reporte_flujo: boolean;
    conciliacion: boolean;
    reporte_comparativo: boolean;
    reporte_calor: boolean;
    chat: boolean;
    magic: boolean;
    insights: boolean;
}

export interface PreciosConfig {
    presupuestos: number;
    recordatorios: number;
    subcategorias: number;
    reporte_patrimonio: number;
    reporte_estado: number;
    reporte_flujo: number;
    conciliacion: number;
    reporte_comparativo: number;
    reporte_calor: number;
    chat: number;
    magic: number;
    insights: number;
}

interface DataContextType {
  username: string;
  updateUsername: (name: string) => Promise<void>;
  categories: Category[];
  accounts: Account[];
  transactions: Transaction[];
  reconciliations: Reconciliation[];
  reminders: Reminder[]; 
  settings: AppSettings;
  loading: boolean;
  isAdmin: boolean;
  permissions: UserPermissions;
  notification: GamificationNotification | null;
  showNotification: (n: GamificationNotification) => void;
  clearNotification: () => void;
  addCategory: (name: string, type: CategoryType, budgets: CategoryBudget, icon?: string, color?: string, parentId?: string) => Promise<void>;
  updateCategory: (id: string, name: string, budgets: CategoryBudget, icon?: string, color?: string, parentId?: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addAccount: (name: string, initialBalance: number, isSavings: boolean, savingsTarget?: number, type?: string) => Promise<void>;
  updateAccount: (id: string, name: string, initialBalance: number, isSavings: boolean, savingsTarget?: number, type?: string) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  fetchAccounts: () => Promise<void>; 
  addTransaction: (tx: Omit<Transaction, "id">) => Promise<boolean>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<void>;
  resetTransactions: () => Promise<void>;
  addReconciliation: (accountId: string, cutoffDate: number, balance: number) => Promise<void>;
  deleteReconciliation: (id: string) => Promise<void>;
  addReminder: (rem: Omit<Reminder, "id">) => Promise<void>;
  updateReminder: (id: string, updates: Partial<Reminder>) => Promise<boolean>; 
  deleteReminder: (id: string) => Promise<void>;
  updateSettings: (s: AppSettings) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  precios: PreciosConfig;
  updatePrecios: (nuevosPrecios: PreciosConfig) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [username, setUsername] = useState<string>(() => localStorage.getItem("cached_username") || "Usuario");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissions, setPermissions] = useState<UserPermissions>({
    presupuestos: false, recordatorios: false, subcategorias: false,
    reporte_patrimonio: false, reporte_estado: false, reporte_flujo: false,
    conciliacion: false, reporte_comparativo: false, reporte_calor: false,
    chat: false, magic: false, insights: false
  });

  const [precios, setPrecios] = useState<PreciosConfig>({
    presupuestos: 0, recordatorios: 0, subcategorias: 0.3,
    reporte_patrimonio: 0.3, reporte_estado: 0.3, reporte_flujo: 0.3,
    conciliacion: 0.3, reporte_comparativo: 0.6, reporte_calor: 0.6,
    chat: 1.0, magic: 1.0, insights: 1.0
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]); 
  const [notification, setNotification] = useState<GamificationNotification | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("settings");
    return saved ? JSON.parse(saved) : { 
        alertThresholdOptimistic: 50, alertThresholdIdeal: 75, alertThresholdPessimistic: 100, 
        currency: '$', reminderDaysBefore: 3, reminderFrequency: 1  
    };
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) cargarDatos(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) cargarDatos(session.user.id);
      else {
        setCategories([]); setAccounts([]); setTransactions([]); setReconciliations([]); setReminders([]); 
        setIsAdmin(false);
        setPermissions({
            presupuestos: false, recordatorios: false, subcategorias: false,
            reporte_patrimonio: false, reporte_estado: false, reporte_flujo: false,
            conciliacion: false, reporte_comparativo: false, reporte_calor: false,
            chat: false, magic: false, insights: false
        });
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Sincronizar formateo cuando cambian los settings
  useEffect(() => {
    // Mapeo básico de símbolos a códigos ISO si es necesario
    const currencyMap: Record<string, string> = {
      '$': 'USD',
      '€': 'EUR',
      'S/.': 'PEN',
      'Q': 'GTQ',
      'A$': 'ARS'
    };
    
    const isoCurrency = currencyMap[settings.currency || '$'] || settings.currency || 'USD';
    updateFormattingConfig(settings.locale || 'es-EC', isoCurrency);
  }, [settings]);

  const cargarDatos = async (userId: string) => {
    setLoading(true);
    try {
      const { perfilRes, cuentasRes, catsRes, recsRes, txsRes, remsRes } = await DataService.fetchAllData(userId);
      const settingsData = await DataService.getSettings(userId);
      if (settingsData) setSettings(settingsData);

      if (perfilRes.data) {
          if (perfilRes.data.nombre_completo) {
              setUsername(perfilRes.data.nombre_completo);
              localStorage.setItem("cached_username", perfilRes.data.nombre_completo);
          }
          setIsAdmin(perfilRes.data.rol === 'admin');
          setPermissions({
            presupuestos: perfilRes.data.permiso_presupuestos || false,
            recordatorios: perfilRes.data.permiso_recordatorios || false,
            subcategorias: perfilRes.data.permiso_subcategorias || false,
            reporte_patrimonio: perfilRes.data.permiso_reporte_patrimonio || false,
            reporte_estado: perfilRes.data.permiso_reporte_estado || false,
            reporte_flujo: perfilRes.data.permiso_reporte_flujo || false,
            conciliacion: perfilRes.data.permiso_conciliacion || false,
            reporte_comparativo: perfilRes.data.permiso_reporte_comparativo || false,
            reporte_calor: perfilRes.data.permiso_reporte_calor || false,
            chat: perfilRes.data.permiso_chat || false,
            magic: perfilRes.data.permiso_magic || false,
            insights: perfilRes.data.permiso_insights || false
          });
      }

      // Cargar Precios Globales
      const { data: preciosData } = await supabase.from('precios_config').select('*');
      if (preciosData && preciosData.length > 0) {
          const pMap: any = { ...precios };
          preciosData.forEach(p => pMap[p.id] = p.valor);
          setPrecios(pMap);
      }

      if (cuentasRes.data) {
        setAccounts(cuentasRes.data.map((a:any) => ({
          id: a.id, name: a.nombre, initialBalance: a.saldo_inicial || 0, 
          isSavings: a.es_ahorro || false, savingsTarget: a.meta_ahorro || 0, type: a.tipo 
        })));
      }

      if (catsRes.data) {
        setCategories(catsRes.data.map((c:any) => {
          let mappedType: CategoryType = 'expense';
          if (c.tipo === 'ingreso' || c.tipo === 'income') mappedType = 'income';
          else if (c.tipo === 'transferencia' || c.tipo === 'transfer') mappedType = 'transfer';
          
          return {
            id: c.id, name: c.nombre, 
            type: mappedType, 
            budgets: { opt: c.presupuesto_opt || 0, ideal: c.presupuesto_ideal || 0, pess: c.presupuesto_pes || 0 },
            icon: c.icono || undefined, color: c.color || undefined, parentId: c.padre_id || undefined
          };
        }));
      }

      if (recsRes.data) {
        setReconciliations(recsRes.data.map((r:any) => ({
            id: r.id, accountId: r.cuenta_id, cutoffDate: Number(r.fecha_corte), balance: r.saldo, createdAt: new Date(r.created_at).getTime()
        })));
      }

      if (txsRes.data) {
        const mappedTransactions = txsRes.data.map((t:any) => {
          let mappedType: CategoryType = 'expense';
          if (t.tipo === 'ingreso' || t.tipo === 'income') mappedType = 'income';
          else if (t.tipo === 'transferencia' || t.tipo === 'transfer') mappedType = 'transfer';

          return {
            id: t.id, amount: t.monto,
            type: mappedType,
            categoryId: t.categoria_id || "", accountId: t.cuenta_id,
            toAccountId: t.cuenta_destino_id || undefined, createdAt: new Date(t.fecha).getTime(),
            note: t.nota || "", isReconciled: !!t.conciliacion_id, reconciliationId: t.conciliacion_id || undefined
          };
        }) as Transaction[];
        setTransactions(mappedTransactions.sort((a, b) => b.createdAt - a.createdAt));
      }

      if (remsRes.data) {
          setReminders(remsRes.data.map((r:any) => ({
              id: r.id, name: r.nombre, amount: r.monto, dayOfMonth: r.dia_corte, categoryId: r.categoria_id
          })));
      }

    } catch (e: any) { 
      console.error("Error cargando datos:", e);
      showToast(e.message || "Error al conectar con la nube", "error");
    } finally { 
      setLoading(false); 
    }
  };

  const updateUsername = async (name: string) => {
    setUsername(name);
    localStorage.setItem("cached_username", name);
    if (session?.user) await supabase.from('perfiles').upsert({ id: session.user.id, nombre_completo: name, updated_at: new Date() });
  };

  const fetchAccounts = async () => {
    if (!session?.user) return;
    try {
      const accs = await DataService.getAccounts(session.user.id);
      setAccounts(accs);
    } catch (e: any) {
      showToast("Error al sincronizar cuentas", "error");
    }
  };

  const getCurrentBalance = (accountId: string) => {
      const acc = accounts.find(a => a.id === accountId);
      if (!acc) return 0;
      let balance = acc.initialBalance;
      transactions.forEach(t => {
          if (t.accountId === accountId) {
              if (t.type === 'income') balance += t.amount;
              else balance -= t.amount; 
          }
          if (t.type === 'transfer' && t.toAccountId === accountId) balance += t.amount; 
      });
      return balance;
  };

  const checkSavingsImpact = (tx: Omit<Transaction, "id">) => {
      const sourceAcc = accounts.find(a => a.id === tx.accountId);
      if (sourceAcc && sourceAcc.isSavings && (sourceAcc.savingsTarget || 0) > 0) {
          const prevBal = getCurrentBalance(sourceAcc.id);
          let newBal = prevBal + (tx.type === 'income' ? tx.amount : -tx.amount);
          const target = sourceAcc.savingsTarget!;
          
          if ((tx.type === 'expense' || tx.type === 'transfer') && newBal < target) {
              setNotification({ type: 'warning', title: '⚠️ ¡Cuidado!', message: `Te faltan $${(target - newBal).toFixed(2)} para tu meta en "${sourceAcc.name}".`, amountLeft: target - newBal });
          } else if (tx.type === 'income') {
              if (newBal >= target && prevBal < target) setNotification({ type: 'celebration', title: '🎉 ¡OBJETIVO ALCANZADO!', message: `¡Felicidades! Has completado la meta de "${sourceAcc.name}".` });
              else if (newBal < target) setNotification({ type: 'success', title: '🚀 ¡Buen trabajo!', message: `Te faltan solo $${(target - newBal).toFixed(2)} para tu meta en "${sourceAcc.name}".` });
          }
      }

      if (tx.type === 'transfer' && tx.toAccountId) {
          const destAcc = accounts.find(a => a.id === tx.toAccountId);
          if (destAcc && destAcc.isSavings && (destAcc.savingsTarget || 0) > 0) {
              const prevBal = getCurrentBalance(destAcc.id);
              const newBal = prevBal + tx.amount;
              const target = destAcc.savingsTarget!;
              if (newBal >= target && prevBal < target) setNotification({ type: 'celebration', title: '🎉 ¡OBJETIVO ALCANZADO!', message: `¡Felicidades! Has completado la meta de "${destAcc.name}".` });
              else if (newBal < target) setNotification({ type: 'success', title: '🐷 ¡Sigue así!', message: `Te faltan $${(target - newBal).toFixed(2)} en "${destAcc.name}".` });
          }
      }
  };

  const addTransaction = async (tx: Omit<Transaction, "id">) => {
    if (!session?.user) return false;
    try {
      checkSavingsImpact(tx);
      const data: any = await DataService.addTransaction(session.user.id, tx);
      if (data) {
        setTransactions(prev => [{ ...tx, id: data.id, isReconciled: false } as Transaction, ...prev].sort((a,b) => b.createdAt - a.createdAt));
        return true;
      }
      return false;
    } catch (e: any) {
      showToast(e.message || "Error al añadir movimiento", "error");
      return false;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      await DataService.updateTransaction(id, updates);
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      return true;
    } catch (e: any) {
      showToast(e.message || "Error al actualizar", "error");
      return false;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await DataService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (e: any) {
      showToast("No se pudo eliminar el movimiento", "error");
    }
  };

  const resetTransactions = async () => {
    if (!session?.user) return;
    try {
      await DataService.resetTransactions(session.user.id);
      setTransactions([]);
      showToast("Historial reiniciado correctamente", "success");
    } catch (e: any) {
      showToast("Error al reiniciar historial", "error");
    }
  };

  const addAccount = async (name: string, initialBalance: number, isSavings: boolean, savingsTarget?: number, type: string = 'general') => {
    if (!session?.user) return;
    try {
      const data: any = await DataService.addAccount(session.user.id, { name, initialBalance, isSavings, savingsTarget, type });
      if (data) setAccounts(prev => [...prev, { id: data.id, name, initialBalance, isSavings, savingsTarget: savingsTarget || 0, type }]);
    } catch (e: any) {
      showToast(e.message || "Error al crear cuenta", "error");
    }
  };

  const updateAccount = async (id: string, name: string, initialBalance: number, isSavings: boolean, savingsTarget?: number, type: string = 'general') => {
    try {
      await DataService.updateAccount(id, { name, initialBalance, isSavings, savingsTarget, type });
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, name, initialBalance, isSavings, savingsTarget: savingsTarget || 0, type } : a));
    } catch (e: any) {
      showToast(e.message || "Error al actualizar cuenta", "error");
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      await DataService.deleteAccount(id);
      setAccounts(prev => prev.filter(a => a.id !== id));
    } catch (e: any) {
      showToast("No se pudo eliminar la cuenta", "error");
    }
  };

  const addCategory = async (name: string, type: CategoryType, budgets: CategoryBudget, icon?: string, color?: string, parentId?: string) => {
    if (!session?.user) return;
    try {
      const data: any = await DataService.addCategory(session.user.id, { name, type, budgets, icon, color, parentId });
      if (data) setCategories(prev => [...prev, { id: data.id, name, type, budgets, icon, color, parentId }]);
    } catch (e: any) {
      showToast(e.message || "Error al crear categoría", "error");
    }
  };

  const updateCategory = async (id: string, name: string, budgets: CategoryBudget, icon?: string, color?: string, parentId?: string) => {
    try {
      await DataService.updateCategory(id, { name, budgets, icon, color, parentId });
      setCategories(prev => prev.map(c => c.id === id ? { ...c, name, budgets, icon, color, parentId } : c));
    } catch (e: any) {
      showToast(e.message || "Error al actualizar categoría", "error");
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await DataService.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (e: any) {
      showToast("No se pudo eliminar la categoría", "error");
    }
  };

  const addReconciliation = async (accountId: string, cutoffDate: number, balance: number) => {
    if (!session?.user) return;
    try {
      const data: any = await DataService.addReconciliation(session.user.id, accountId, cutoffDate, balance);
      if (data) {
        setReconciliations(prev => [...prev, { id: data.id, accountId, cutoffDate, balance, createdAt: Date.now() }]);
        setTransactions(prev => prev.map(t => (t.accountId === accountId && !t.isReconciled && t.createdAt <= cutoffDate) ? { ...t, isReconciled: true, reconciliationId: data.id } : t));
        showToast("Conciliación certificada con éxito", "success");
      }
    } catch (e: any) {
      showToast(e.message || "Error al conciliar", "error");
    }
  };

  const deleteReconciliation = async (id: string) => {
    try {
      await DataService.deleteReconciliation(id);
      setReconciliations(prev => prev.filter(r => r.id !== id));
      setTransactions(prev => prev.map(t => t.reconciliationId === id ? { ...t, isReconciled: false, reconciliationId: undefined } : t));
    } catch (e: any) {
      showToast("No se pudo eliminar el registro", "error");
    }
  };

  const addReminder = async (rem: Omit<Reminder, "id">) => {
    if (!session?.user) return;
    try {
      const newRem: any = await DataService.addReminder(session.user.id, rem);
      if (newRem) {
        setReminders(prev => [...prev, { 
          id: newRem.id, name: newRem.nombre, amount: newRem.monto, 
          dayOfMonth: newRem.dia_corte, categoryId: newRem.categoria_id 
        } as Reminder]);
      }
    } catch (e: any) {
      showToast(e.message || "Error al crear recordatorio", "error");
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await DataService.deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (e: any) {
      showToast("Error al eliminar", "error");
    }
  };

  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    try {
      await DataService.updateReminder(id, updates);
      setReminders(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
      return true;
    } catch (e: any) {
      showToast("Error al actualizar", "error");
      return false;
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const updatePrecios = async (nuevosPrecios: PreciosConfig) => {
      setPrecios(nuevosPrecios);
      const updates = Object.entries(nuevosPrecios).map(([id, valor]) => ({ id, valor }));
      await supabase.from('precios_config').upsert(updates);
      showToast("Precios actualizados globalmente", "success");
  };

  return (
    <DataContext.Provider value={{
      username, updateUsername, categories, accounts, transactions, reconciliations, reminders, 
      settings, loading, isAdmin, permissions, notification, clearNotification: () => setNotification(null), showNotification: (n) => setNotification(n),
      addCategory, updateCategory, deleteCategory, addAccount, updateAccount, deleteAccount, fetchAccounts,
      addTransaction, updateTransaction, deleteTransaction, resetTransactions, addReconciliation, deleteReconciliation,
      addReminder, updateReminder, deleteReminder, updateSettings: (s) => { setSettings(s); localStorage.setItem("settings", JSON.stringify(s)); },
      showToast,
      precios,
      updatePrecios
    }}>
      {children}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          isDark={localStorage.getItem('theme') === 'dark'} 
          onClose={() => setToast(null)} 
        />
      )}
    </DataContext.Provider>
  );
};
