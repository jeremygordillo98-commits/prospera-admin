import { Transaction, Account } from "../services/types";

// --- CONFIGURACIÓN DINÁMICA DE FORMATEO ---
let currentLocale = 'es-EC';
let currentCurrency = 'USD';

/**
 * Actualiza la configuración global de formateo desde los ajustes del usuario.
 */
export const updateFormattingConfig = (locale: string = 'es-EC', currency: string = 'USD') => {
  currentLocale = locale;
  currentCurrency = currency;
};

export type TimeRange = "week" | "month" | "year" | "all" | "custom";

export const formatDateShort = (date: Date) => {
  return new Intl.DateTimeFormat(currentLocale, { day: '2-digit', month: '2-digit' }).format(date);
};

export const formatCurrency = (amount: number) => {
  try {
    return new Intl.NumberFormat(currentLocale, { 
      style: 'currency', 
      currency: currentCurrency 
    }).format(amount);
  } catch (e) {
    // Fallback en caso de que el locale o currency sean inválidos
    return new Intl.NumberFormat('es-EC', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  }
};

export const getDynamicTitle = (range: TimeRange, start: number, end: number) => { 
  const s = new Date(start); const e = new Date(end); 
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]; 
  if (range === 'week') return `Semana del ${s.getDate()} al ${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`; 
  if (range === 'month') return `${months[s.getMonth()]} ${s.getFullYear()}`; 
  if (range === 'year') return `Año ${s.getFullYear()}`; 
  if (range === 'all') return "Historial Completo"; 
  return `${formatDateShort(s)} - ${formatDateShort(e)}`; 
};

export function getRangeDates(range: TimeRange, viewDate: Date, allTransactions: Transaction[], customStart?: string, customEnd?: string) {
  const now = new Date(viewDate); let start = 0; let end = Date.now(); now.setHours(0,0,0,0);
  switch (range) {
    case "week": { const day = now.getDay(); const diff = now.getDate() - day + (day === 0 ? -6 : 1); const m = new Date(now); m.setDate(diff); m.setHours(0,0,0,0); start = m.getTime(); const s = new Date(m); s.setDate(m.getDate() + 6); s.setHours(23,59,59,999); end = s.getTime(); break; }
    case "month": { const f = new Date(now.getFullYear(), now.getMonth(), 1); start = f.getTime(); const l = new Date(now.getFullYear(), now.getMonth() + 1, 0); l.setHours(23,59,59,999); end = l.getTime(); break; }
    case "year": { const f = new Date(now.getFullYear(), 0, 1); start = f.getTime(); const l = new Date(now.getFullYear(), 11, 31); l.setHours(23,59,59,999); end = l.getTime(); break; }
    case "all": { if (allTransactions.length === 0) { start = now.getTime(); end = now.getTime(); } else { const times = allTransactions.map(t => t.createdAt); start = Math.min(...times); end = Math.max(...times); } break; }
    case "custom": { if(customStart){ const p = customStart.split('-'); start = new Date(Number(p[0]), Number(p[1])-1, Number(p[2])).getTime(); } if(customEnd){ const p = customEnd.split('-'); const e = new Date(Number(p[0]), Number(p[1])-1, Number(p[2])); e.setHours(23,59,59); end = e.getTime(); } break; }
  }
  return { start, end };
}

export function calculateBalances(accounts: Account[], transactions: Transaction[]) {
  const map = new Map<string, number>();
  for (const a of accounts) map.set(a.id, a.initialBalance);
  for (const t of transactions) {
    const prevOrigin = map.get(t.accountId) ?? 0;
    if (t.type === "income") map.set(t.accountId, prevOrigin + t.amount);
    else if (t.type === "expense") map.set(t.accountId, prevOrigin - t.amount);
    else if (t.type === "transfer") { 
        map.set(t.accountId, prevOrigin - t.amount); 
        if (t.toAccountId) { const prevDest = map.get(t.toAccountId) ?? 0; map.set(t.toAccountId, prevDest + t.amount); } 
    }
  }
  return map;
}

export interface ChartDataPoint { income: number; expense: number; label: string; order: number; startTs?: number; endTs?: number; }

export function getBarChartData(transactions: Transaction[], range: TimeRange, start: number, end: number) {
   const dataMap = new Map<string, ChartDataPoint>();
   if (range === 'week' || range === 'all' || range === 'custom') {
     let c = new Date(start); const e = new Date(end); let i = 0;
     while (c <= e) { 
         const k = c.toDateString(); 
         const l = range==='week' ? ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][c.getDay()] : `${["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][c.getDay()]} ${c.getDate()}/${c.getMonth()+1}`; 
         dataMap.set(k, {income:0, expense:0, label:l, order:i}); c.setDate(c.getDate()+1); i++; 
     }
   } else if (range === 'month') {
      let c = new Date(start); const me = new Date(end); let wi = 1;
      while(c <= me) {
          const ws = new Date(c); ws.setHours(0,0,0,0);
          let dts = (7 - c.getDay()) % 7; if(c.getDay()===0) dts=0; 
          const pe = new Date(c); pe.setDate(c.getDate()+dts); 
          const we = pe > me ? new Date(me) : pe;
          we.setHours(23,59,59,999);
          dataMap.set(`W${wi}`, {
              income:0, expense:0, 
              label:`${formatDateShort(ws)} - ${formatDateShort(we)}`, 
              order:wi,
              startTs: ws.getTime(),
              endTs: we.getTime()
          }); 
          c = new Date(we); c.setDate(c.getDate()+1); c.setHours(0,0,0,0); wi++;
      }
   } else if (range === 'year') {
      const m = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
      for(let i=0; i<12; i++) dataMap.set(`M${i}`, {income:0, expense:0, label:m[i], order:i});
   }
   
   transactions.forEach((t) => {
     if(t.type==='transfer') return;
     const time = t.createdAt; const d = new Date(time); 
     if(time < start || time > end) return;
     
     let k = "";
     if(range==='week'||range==='all'||range==='custom') {
         k = d.toDateString();
     } else if(range==='month') {
         for (const [key, val] of dataMap.entries()) {
             if (time >= val.startTs! && time <= val.endTs!) {
                 k = key; break;
             }
         }
     } else {
         k = `M${d.getMonth()}`;
     }
     
     if(k && dataMap.has(k)) { 
         const p = dataMap.get(k)!; 
         if(t.type==='income') p.income+=t.amount; 
         if(t.type==='expense') p.expense+=t.amount; 
     }
   });
   return Array.from(dataMap.values()).sort((a,b)=>a.order-b.order);
}
