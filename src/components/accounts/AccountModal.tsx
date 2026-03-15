import React, { useState, useEffect } from 'react';
import { useTheme } from "../../context/ThemeContext";
import { Account } from "../../services/types";

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    onDelete?: (id: string) => void;
    editingAcc: Account | null;
    isMobile: boolean;
}

export const AccountModal: React.FC<AccountModalProps> = ({ 
    isOpen, onClose, onSave, onDelete, editingAcc, isMobile 
}) => {
    const { theme } = useTheme();
    const [formName, setFormName] = useState("");
    const [formBalance, setFormBalance] = useState("");
    const [formType, setFormType] = useState("general");
    const [formTarget, setFormTarget] = useState("");

    useEffect(() => {
        if (editingAcc) {
            setFormName(editingAcc.name);
            setFormBalance(String(editingAcc.initialBalance));
            setFormType(editingAcc.type || (editingAcc.isSavings ? 'savings' : 'general'));
            setFormTarget(editingAcc.savingsTarget ? String(editingAcc.savingsTarget) : "");
        } else {
            setFormName("");
            setFormBalance("");
            setFormType("general");
            setFormTarget("");
        }
    }, [editingAcc, isOpen]);

    if (!isOpen) return null;

    const inputStyle = { 
        width: '100%', padding: '14px', borderRadius: 12, border: `1px solid ${theme.border}`, 
        background: theme.bg, color: theme.text, marginBottom: 16, boxSizing: 'border-box' as const, 
        fontSize: '1rem', outline: 'none'
    };

    const handleSave = () => {
        if (!formName.trim()) return; 
        onSave({
            name: formName,
            balance: Number(formBalance),
            type: formType,
            target: Number(formTarget),
            isSavings: formType === 'savings'
        });
    };

    return (
        <div style={{
            position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.6)', 
            display:'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent:'center', 
            zIndex: 100000, backdropFilter: 'blur(8px)'
        }} onClick={onClose}>
            <div style={{
                background: theme.card, padding: '32px 24px', 
                borderRadius: isMobile ? '24px 24px 0 0' : 24, 
                width: isMobile ? '100%' : '90%', maxWidth: 450, 
                border: `1px solid ${theme.border}`, boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                animation: isMobile ? 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'scaleIn 0.3s ease-out'
            }} onClick={e => e.stopPropagation()}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 24}}>
                    <h2 style={{margin:0, fontSize: '1.5rem', fontWeight: 800, color: theme.text}}>
                        {editingAcc ? 'Editar Cuenta' : 'Nueva Cuenta'}
                    </h2>
                    <button onClick={onClose} style={{background: 'transparent', border: 'none', color: theme.textSec, fontSize: '1.2rem', cursor: 'pointer'}}>✕</button>
                </div>
                
                <label style={{fontSize:'0.8rem', color: theme.textSec, marginBottom: 6, display: 'block', fontWeight: 700, textTransform: 'uppercase'}}>Nombre</label>
                <input autoFocus placeholder="Ej. Banco, Billetera..." value={formName} onChange={e => setFormName(e.target.value)} style={inputStyle} />
                
                <label style={{fontSize:'0.8rem', color: theme.textSec, marginBottom: 6, display: 'block', fontWeight: 700, textTransform: 'uppercase'}}>Categoría de la Entidad</label>
                <select value={formType} onChange={e => setFormType(e.target.value)} style={{...inputStyle, appearance: 'none'}}>
                    <option value="general">🏦 Bancos y Efectivo</option>
                    <option value="savings">🐷 Bóveda de Ahorro</option>
                    <option value="receivable">🤝 Cuentas por Cobrar</option>
                    <option value="debt">🛑 Deudas y Tarjetas</option>
                </select>

                <label style={{fontSize:'0.8rem', color: theme.textSec, marginBottom: 6, display: 'block', fontWeight: 700, textTransform: 'uppercase'}}>
                    {formType === 'debt' ? 'Saldo Deudor Actual' : 'Saldo Inicial'}
                </label>
                <input type="number" placeholder="0.00" value={formBalance} onChange={e => setFormBalance(e.target.value)} style={inputStyle} />

                {(formType === 'savings' || formType === 'debt') && (
                    <>
                        <label style={{fontSize:'0.8rem', color: theme.textSec, marginBottom: 6, display: 'block', fontWeight: 700, textTransform: 'uppercase'}}>
                            {formType === 'savings' ? 'Meta de Ahorro' : 'Cupo o Límite'}
                        </label>
                        <input type="number" placeholder="0.00" value={formTarget} onChange={e => setFormTarget(e.target.value)} style={inputStyle} />
                    </>
                )}

                <div style={{display:'flex', gap: 12, marginTop: 12}}>
                    <button onClick={handleSave} style={{
                        flex: 1, padding: '16px', borderRadius: 12, border: 'none', 
                        background: theme.primary, color: '#fff', fontSize: '1rem', 
                        fontWeight: 800, cursor: 'pointer', boxShadow: `0 8px 20px ${theme.primary}40`
                    }}>
                        {editingAcc ? 'Guardar Cambios' : 'Crear Cuenta'}
                    </button>
                </div>
                
                {editingAcc && onDelete && (
                    <button onClick={() => onDelete(editingAcc.id)} style={{
                        width:'100%', marginTop: 16, background:'transparent', border:'none', 
                        color: theme.danger, cursor:'pointer', fontWeight: 700, fontSize: '0.9rem', 
                        padding: 10, opacity: 0.8
                    }}>
                        Eliminar Cuenta
                    </button>
                )}
            </div>
        </div>
    );
};
