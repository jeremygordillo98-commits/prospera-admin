import React, { useState } from 'react';
import { supabase } from '../services/supabase';

const IconEye = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const IconEyeOff = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;
const IconLogin = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>;
const IconArrowBack = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconLock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
        if (view === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } else if (view === 'forgot') {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`, 
            });
            if (error) throw error;
            setMessage({ type: 'success', text: 'Te hemos enviado un correo para recuperar tu clave.' });
        }
    } catch (error: any) {
        setMessage({ type: 'error', text: error.message || 'Ocurrió un error inesperado' });
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          .minimal-input {
              background: transparent !important;
              border-top: none !important;
              border-left: none !important;
              border-right: none !important;
              border-bottom: 1px solid #475569 !important;
              border-radius: 0 !important;
              transition: all 0.3s ease;
          }
          .minimal-input:focus {
              border-bottom-color: #3b82f6 !important;
              box-shadow: 0 4px 12px -4px rgba(59, 130, 246, 0.3);
              outline: none !important;
          }
          input:-webkit-autofill,
          input:-webkit-autofill:hover, 
          input:-webkit-autofill:focus, 
          input:-webkit-autofill:active{
              -webkit-box-shadow: 0 0 0 30px #1E293B inset !important;
              -webkit-text-fill-color: white !important;
              transition: background-color 5000s ease-in-out 0s;
          }
          .neural-bg {
              background-image: radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.1) 1px, transparent 0);
              background-size: 40px 40px;
          }
        `}
      </style>

      <div className="flex flex-col h-screen w-full overflow-hidden md:flex-row bg-[#0f172a] text-slate-100 font-sans relative">
        {/* PANEL IZQUIERDO (Marketing Admin) */}
        <section className="hidden md:flex relative bg-[#0B1120] overflow-hidden items-center justify-center border-r border-slate-800/50 md:w-[60%] lg:w-[65%]">
          <div className="absolute inset-0 neural-bg opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1120] via-transparent to-[#3b82f6]/20 opacity-60"></div>
          
          <div className="relative z-10 flex flex-col p-12 max-w-2xl w-full">
            <div className="mb-12 flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-[0_8px_16px_rgba(59,130,246,0.4)]">
                    P
                </div>
                <div>
                   <h1 className="text-3xl font-black tracking-tight text-white mb-0">PROSPERA</h1>
                   <div className="text-[#3b82f6] text-sm font-bold tracking-widest uppercase">Root Admin Control</div>
                </div>
            </div>
            
            <h2 className="text-4xl font-black text-slate-200 mb-6 leading-tight">
              Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]">Centralizado.</span>
            </h2>
            <p className="text-slate-400 max-w-md text-lg">
              Plataforma exclusiva para administradores. Acceso denegado a usuarios no autorizados.
            </p>
          </div>
        </section>

        {/* PANEL DERECHO (Formulario Admin) */}
        <section className="w-full h-full relative flex flex-col justify-center p-8 md:p-10 z-10 md:w-[40%] lg:w-[35%] bg-[#1E293B] overflow-y-auto min-w-[320px]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#3b82f6]/5 to-transparent pointer-events-none"></div>
          
          <div className="w-full max-w-sm mx-auto flex flex-col h-full justify-center">
              
              <div className="relative z-20 mb-8 mt-auto">
                <div className="inline-block bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                    Pestaña Segura
                </div>
                {view === 'login' ? (
                    <>
                        <h1 className="text-3xl font-black text-white mb-2">Ingresar</h1>
                        <p className="text-slate-400 text-sm">Inicia sesión con credenciales de administrador.</p>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-black text-white mb-2">Recuperar acceso</h1>
                        <p className="text-slate-400 text-sm">Te enviaremos un enlace seguro a tu correo.</p>
                    </>
                )}
              </div>

              <div className="relative z-20 w-full">
                {message && (
                    <div className={`p-4 rounded-xl mb-6 text-sm border font-medium flex items-start gap-3 shadow-lg ${message.type === 'error' ? 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20' : 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20'}`}>
                        {message.text}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleAuth}>
                  <div className="group relative">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-[#3b82f6] transition-colors">
                      Correo corporativo
                    </label>
                    <input type="email" className="minimal-input w-full py-2 text-base text-slate-100 placeholder:text-slate-600" placeholder="admin@prospera.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  
                  {view === 'login' && (
                      <div className="group relative">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-[#3b82f6] transition-colors">
                            Clave de Acceso
                          </label>
                          <input type={showPassword ? "text" : "password"} className="minimal-input w-full py-2 text-base text-slate-100 placeholder:text-slate-600 pr-10" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-7 text-slate-500 hover:text-[#3b82f6] p-2 bg-transparent border-none cursor-pointer flex items-center justify-center">
                              {showPassword ? <IconEyeOff /> : <IconEye />}
                          </button>
                      </div>
                  )}

                  <div className="pt-4">
                    <button type="submit" disabled={loading} className="w-full h-14 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#60a5fa] hover:to-[#a78bfa] text-white font-black rounded-xl shadow-[0_8px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_12px_25px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed border-none text-lg">
                      <span>{loading ? 'Verificando...' : view === 'login' ? 'Acceder al Panel' : 'Enviar Enlace'}</span>
                      {!loading && view === 'login' && <span className="opacity-80"><IconLogin /></span>}
                    </button>
                  </div>
                  
                  {view === 'login' && (
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium mt-4">
                      <IconLock /> Conexión segura y encriptada
                    </div>
                  )}
                </form>

                {/* Enlaces secundarios */}
                <div className="mt-8 flex flex-col gap-4 text-center">
                  {view === 'login' && (
                      <button onClick={() => { setView('forgot'); setMessage(null); }} className="text-slate-500 hover:text-[#3b82f6] text-sm transition-colors flex items-center justify-center gap-2 w-full bg-transparent border-none cursor-pointer p-0 font-medium">
                        ¿Olvidaste tu contraseña de sistema?
                      </button>
                  )}
                  {view === 'forgot' && (
                      <button onClick={() => { setView('login'); setMessage(null); }} className="text-slate-500 hover:text-[#3b82f6] text-sm transition-colors flex items-center justify-center gap-2 w-full bg-transparent border-none cursor-pointer p-0 font-medium">
                        <IconArrowBack /> Volver al Login
                      </button>
                  )}
                </div>
              </div>

              <footer className="relative z-20 mt-auto pt-6 flex flex-col gap-2 text-[10px] uppercase tracking-widest text-slate-600 border-t border-slate-800/50">
                <div className="flex justify-between w-full">
                    <span>Prospera Admin v4.0</span>
                    <span>© {new Date().getFullYear()}</span>
                </div>
              </footer>
          </div>
        </section>
      </div>
    </>
  );
}
