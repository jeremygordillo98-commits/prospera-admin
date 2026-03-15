import React, { useState } from 'react';
import { useTheme } from "../../context/ThemeContext";
import { useData } from "../../context/DataContext";
import { CategoryType, Transaction } from "../../services/types";
import { 
    IconExpense, IconIncome, IconTransfer, IconSparkles, IconEdit 
} from '../dashboard/DashboardIcons';
import { parseMagicInput } from "../../services/ai-service";
import { enableAI } from "../../services/config";

interface TransactionFormProps {
    date: string;
    setDate: (v: string) => void;
    type: CategoryType;
    setType: (v: CategoryType) => void;
    amount: string;
    setAmount: (v: string) => void;
    categoryId: string;
    setCategoryId: (v: string) => void;
    accountId: string;
    setAccountId: (v: string) => void;
    toAccountId: string;
    setToAccountId: (v: string) => void;
    note: string;
    setNote: (v: string) => void;
    isSaving: boolean;
    onSave: () => void;
    editingTx: Transaction | null;
    onCancelEdit: () => void;
    isMobile: boolean;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
    date, setDate, type, setType, amount, setAmount, categoryId, setCategoryId,
    accountId, setAccountId, toAccountId, setToAccountId, note, setNote,
    isSaving, onSave, editingTx, onCancelEdit, isMobile
}) => {
    const { theme, isDark } = useTheme();
    const { categories, accounts, permissions, showToast } = useData();
    const [magicText, setMagicText] = useState("");
    const [magicLoading, setMagicLoading] = useState(false);

    const handleMagic = async () => {
        if (!enableAI || !permissions.magic || !magicText.trim()) return;
        setMagicLoading(true);
        const result = await parseMagicInput(magicText, categories.map(c => c.name), accounts.map(a => a.name));
        if (result) {
            setAmount(String(result.amount));
            setDate(result.date);
            setType(result.type);
            setNote(result.note);
            if (result.type !== 'transfer' && result.categoryName) {
                const cat = categories.find(c => c.name.toLowerCase() === result.categoryName.toLowerCase());
                setCategoryId(cat ? cat.id : "");
            }
            if (result.accountName) {
                const acc = accounts.find(a => a.name.toLowerCase() === result.accountName.toLowerCase());
                setAccountId(acc ? acc.id : "");
            }
            if (result.type === 'transfer' && result.toAccountName) {
                const toAcc = accounts.find(a => a.name.toLowerCase() === result.toAccountName.toLowerCase());
                setToAccountId(toAcc ? toAcc.id : "");
            }
            showToast('IA aplicada con éxito', 'success');
            setMagicText("");
        } else {
            showToast('No entendí bien, intenta de nuevo', 'warning');
        }
        setMagicLoading(false);
    };

    const inputStyle = { 
        padding: "14px", borderRadius: "12px", border: `1px solid ${theme.border}`, 
        background: theme.bg, color: theme.text, width: "100%", boxSizing: "border-box" as const, 
        fontSize: "0.95rem", outline: 'none' 
    };
    const labelStyle = { display: "block", marginBottom: "8px", fontSize: "0.8rem", color: theme.textSec, fontWeight: 700, textTransform: 'uppercase' as const };

    return (
        <div style={{ marginBottom: 40 }}>
            {enableAI && permissions.magic && (
                <div style={{ 
                    background: isDark ? "linear-gradient(135deg, #6d28d9, #4c1d95)" : "linear-gradient(135deg, #8b5cf6, #7c3bed)", 
                    padding: 24, borderRadius: 20, marginBottom: 24, boxShadow: '0 8px 25px rgba(124, 92, 246, 0.3)', color: '#fff'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <IconSparkles />
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Magia con IA</h3>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
                        <input 
                            placeholder="Ej: Gasté 10 en comida hoy con mi cuenta principal..." 
                            value={magicText} onChange={e => setMagicText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleMagic()}
                            style={{ flex: 1, padding: '14px 18px', borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff', outline: 'none', fontSize: '1rem' }} 
                        />
                        <button onClick={handleMagic} disabled={magicLoading || !magicText} style={{ padding: '0 24px', height: 48, borderRadius: 12, border: 'none', background: '#fff', color: '#7c3bed', fontWeight: 800, cursor: 'pointer' }}>
                            {magicLoading ? '...' : 'Aplicar'}
                        </button>
                    </div>
                </div>
            )}

            <div style={{ 
                background: theme.card, padding: 30, borderRadius: 24, border: `1px solid ${editingTx ? theme.primary : theme.border}`, 
                position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' 
            }}>
                {editingTx && <div style={{ position:'absolute', top: -14, left: 30, background: theme.primary, color:'#fff', padding: '6px 16px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}><IconEdit /> Modo Edición</div>}

                <div style={{ display: 'grid', gap: 24 }}>
                    <div>
                        <label style={labelStyle}>Tipo</label>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setType('expense')} style={{ flex: 1, height: 48, borderRadius: 12, border: `1px solid ${type === 'expense' ? theme.danger : theme.border}`, background: type === 'expense' ? theme.danger : 'transparent', color: type === 'expense' ? '#fff' : theme.textSec, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <IconExpense /> Gasto
                            </button>
                            <button onClick={() => setType('income')} style={{ flex: 1, height: 48, borderRadius: 12, border: `1px solid ${type === 'income' ? theme.primary : theme.border}`, background: type === 'income' ? theme.primary : 'transparent', color: type === 'income' ? '#fff' : theme.textSec, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <IconIncome /> Ingreso
                            </button>
                            <button onClick={() => setType('transfer')} style={{ flex: 1, height: 48, borderRadius: 12, border: `1px solid ${type === 'transfer' ? '#8b5cf6' : theme.border}`, background: type === 'transfer' ? '#8b5cf6' : 'transparent', color: type === 'transfer' ? '#fff' : theme.textSec, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <IconTransfer /> Transf.
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
                        <div><label style={labelStyle}>Fecha</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} /></div>
                        <div><label style={labelStyle}>Monto</label><input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} style={{ ...inputStyle, fontWeight: 800, fontSize: '1.2rem' }} /></div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
                        {type === 'transfer' ? (
                            <>
                                <div><label style={labelStyle}>Origen</label><select value={accountId} onChange={e => setAccountId(e.target.value)} style={inputStyle}><option value="">-- Seleccionar --</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
                                <div><label style={labelStyle}>Destino</label><select value={toAccountId} onChange={e => setToAccountId(e.target.value)} style={inputStyle}><option value="">-- Seleccionar --</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
                            </>
                        ) : (
                            <>
                                <div><label style={labelStyle}>Categoría</label><select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={inputStyle}><option value="">-- Seleccionar --</option>{categories.filter(c => c.type === type).map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></div>
                                <div><label style={labelStyle}>Cuenta</label><select value={accountId} onChange={e => setAccountId(e.target.value)} style={inputStyle}><option value="">-- Seleccionar --</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
                            </>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr auto', gap: 20, alignItems: 'end' }}>
                        <div><label style={labelStyle}>Nota</label><input placeholder="Nota opcional..." value={note} onChange={e => setNote(e.target.value)} style={inputStyle} /></div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            {editingTx && <button onClick={onCancelEdit} style={{ padding: '0 20px', height: 50, borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, cursor: 'pointer' }}>Bail</button>}
                            <button onClick={onSave} disabled={isSaving} style={{ padding: '0 32px', height: 50, borderRadius: 12, border: 'none', background: theme.primary, color: '#fff', fontWeight: 800, cursor: 'pointer', boxShadow: `0 8px 20px ${theme.primary}40` }}>
                                {isSaving ? '...' : (editingTx ? 'Actualizar' : 'Guardar')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
