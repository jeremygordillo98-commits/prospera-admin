import { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../services/supabase';
import { 
  TimeRange, 
  getRangeDates, 
  calculateBalances, 
  getBarChartData,
  getDynamicTitle
} from '../utils/financial-helpers';

export function useDashboardData() {
  const { accounts, transactions, categories, settings, showNotification, loading, reminders, username } = useData();
  const { theme, isDark } = useTheme();
  
  const [range, setRange] = useState<TimeRange>("month"); 
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [viewDate, setViewDate] = useState(new Date());
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [hasInsightsPermission, setHasInsightsPermission] = useState(false);
  const [lastAlertLevel, setLastAlertLevel] = useState<'none' | 'opt' | 'ideal' | 'pess'>('none');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkPermission = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('perfiles')
          .select('permiso_insights') 
          .eq('id', user.id)
          .single();
        if (data) {
           setHasInsightsPermission(data.permiso_insights || false);
        }
      }
    };
    checkPermission();
  }, []);

  const handlePrev = () => { 
    const d = new Date(viewDate); 
    if(range==='week') d.setDate(d.getDate()-7); 
    if(range==='month') d.setMonth(d.getMonth()-1); 
    if(range==='year') d.setFullYear(d.getFullYear()-1); 
    setViewDate(d); 
  };
  
  const handleNext = () => { 
    const d = new Date(viewDate); 
    if(range==='week') d.setDate(d.getDate()+7); 
    if(range==='month') d.setMonth(d.getMonth()+1); 
    if(range==='year') d.setFullYear(d.getFullYear()+1); 
    setViewDate(d); 
  };
  
  const handleToday = () => setViewDate(new Date());

  const balances = useMemo(() => calculateBalances(accounts, transactions), [accounts, transactions]);
  
  const financialStatus = useMemo(() => {
    let liquidity = 0; let savings = 0; let receivables = 0; let debt = 0;
    for (const a of accounts) {
        const bal = balances.get(a.id) ?? 0;
        const type = (a as any).type || (a.isSavings ? 'savings' : 'general');
        if (type === 'general') liquidity += bal;
        else if (type === 'savings') savings += bal;
        else if (type === 'receivable') receivables += bal;
        else if (type === 'debt') debt += bal;
    }
    return { liquidity, savings, receivables, debt, netWorth: (liquidity + savings + receivables) - debt };
  }, [accounts, balances]);

  const { filteredTransactions, dateStart, dateEnd, periodStats } = useMemo(() => {
    const { start, end } = getRangeDates(range, viewDate, transactions, customStart, customEnd);
    const filtered = transactions.filter(t => t.createdAt >= start && t.createdAt <= end);
    let income = 0; let expense = 0;
    filtered.forEach(t => {
        if (t.type === 'income') income += t.amount;
        if (t.type === 'expense') expense += t.amount;
    });
    return { filteredTransactions: filtered, dateStart: start, dateEnd: end, periodStats: { income, expense, balance: income - expense } };
  }, [transactions, range, viewDate, customStart, customEnd]);

  const savingsRate = periodStats.income > 0 ? ((periodStats.income - periodStats.expense) / periodStats.income) * 100 : 0;

  const { globalBudget, categoryBudgets } = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime();
    const monthlyExpenses = transactions.filter(t => t.type === 'expense' && t.createdAt >= startOfMonth && t.createdAt <= endOfMonth);
    const monthlySpent = monthlyExpenses.reduce((sum, t) => sum + t.amount, 0);
    const sumIdeal = categories.filter(c => c.type === 'expense').reduce((sum, c) => sum + (c.budgets?.ideal || 0), 0);
    const percentAgainstIdeal = sumIdeal > 0 ? (monthlySpent / sumIdeal) * 100 : 0;

    const spendingMap = new Map<string, number>();
    monthlyExpenses.forEach(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        const groupId = cat?.parentId || cat?.id || 'unknown';
        spendingMap.set(groupId, (spendingMap.get(groupId) || 0) + t.amount);
    });

    const catBudgets = categories
        .filter(c => c.type === 'expense' && (c.budgets?.pess || 0) > 0)
        .map(c => {
            const spent = spendingMap.get(c.id) || 0;
            const limit = c.budgets?.pess || 0; 
            const pct = limit > 0 ? (spent / limit) * 100 : 0;
            let color = theme.primary; let status = 'Bien'; 
            if(spent > limit) { color = theme.danger; status = 'Crítico'; }
            else if(spent > (c.budgets?.ideal || 0)) { color = '#ff9800'; status = 'Alerta'; }
            else if(spent > (c.budgets?.opt || 0)) { color = '#ffeb3b'; status = 'Cuidado'; }
            return { id: c.id, name: c.name, icon: c.icon, spent, limit, pct, color, status };
        })
        .sort((a,b) => b.pct - a.pct); 

    return { globalBudget: { monthlySpent, sumIdeal, percent: percentAgainstIdeal }, categoryBudgets: catBudgets };
  }, [transactions, categories, settings, theme]);

  const chartTitle = useMemo(() => getDynamicTitle(range, dateStart, dateEnd), [range, dateStart, dateEnd]);
  const barChartData = useMemo(() => getBarChartData(filteredTransactions, range, dateStart, dateEnd), [filteredTransactions, range, dateStart, dateEnd]);
  const maxBarValue = useMemo(() => { 
    let max = 0; 
    barChartData.forEach((d) => { 
      if (d.income > max) max = d.income; 
      if (d.expense > max) max = d.expense; 
    }); 
    return max || 1; 
  }, [barChartData]);
  
  const { paretoData, pieData } = useMemo(() => {
    let expenseTotal = 0; const expenseMap = new Map<string, number>();
    for (const t of filteredTransactions) {
        if (t.type === 'expense') {
            expenseTotal += t.amount;
            const cat = categories.find(c => c.id === t.categoryId);
            const key = cat?.parentId || cat?.id || 'unknown';
            expenseMap.set(key, (expenseMap.get(key) ?? 0) + t.amount);
        }
    }
    const sorted = Array.from(expenseMap.entries()).map(([id, amount]) => {
        const cat = categories.find(c => c.id === id);
        return { name: cat ? cat.name : 'Otros', icon: cat?.icon || '🏷️', color: cat?.color || '#3f51b5', amount };
    }).sort((a, b) => b.amount - a.amount);
    let accumulated = 0;
    const pareto = sorted.map(item => { accumulated += item.amount; return { ...item, percent: expenseTotal > 0 ? (item.amount / expenseTotal) * 100 : 0, accumulatedPercent: expenseTotal > 0 ? (accumulated / expenseTotal) * 100 : 0 }; });
    const top5 = pareto.slice(0, 5); const others = pareto.slice(5); const othersAmount = others.reduce((sum, item) => sum + item.amount, 0); const finalSlices = [...top5];
    if (othersAmount > 0) finalSlices.push({ name: 'Otros', icon: '🔹', color: '#9e9e9e', amount: othersAmount, percent: 0, accumulatedPercent: 0 });
    const total = finalSlices.reduce((sum, item) => sum + item.amount, 0); let currentDeg = 0; const gradientParts: string[] = [];
    const pieLegend = finalSlices.map((item) => {
        const degrees = total > 0 ? (item.amount / total) * 360 : 0;
        gradientParts.push(`${item.color} ${currentDeg}deg ${currentDeg + degrees}deg`);
        currentDeg += degrees;
        return { ...item, percent: total > 0 ? (item.amount / total) * 100 : 0 };
    });
    return { paretoData: pareto, pieData: { css: `conic-gradient(${gradientParts.join(', ')})`, legend: pieLegend } };
  }, [filteredTransactions, categories]);

  const paretoMax = useMemo(() => paretoData.length > 0 ? paretoData[0].amount : 1, [paretoData]);

  const isNewUser = transactions.length === 0;
  const hasAccounts = accounts.length > 0;
  const hasCategories = categories.length > 0;
  const canAddTransaction = hasAccounts && hasCategories;

  return {
    accounts, transactions, categories, settings, showNotification, loading, reminders, username,
    theme, isDark,
    range, setRange,
    customStart, setCustomStart,
    customEnd, setCustomEnd,
    viewDate, setViewDate,
    isMobile,
    hasInsightsPermission,
    handlePrev, handleNext, handleToday,
    balances, financialStatus,
    filteredTransactions, dateStart, dateEnd, periodStats,
    savingsRate,
    globalBudget, categoryBudgets,
    chartTitle, barChartData, maxBarValue,
    paretoData, pieData, paretoMax,
    isNewUser, hasAccounts, hasCategories, canAddTransaction,
    lastAlertLevel, setLastAlertLevel
  };
}
