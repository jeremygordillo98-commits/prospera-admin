import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Contextos y Servicios
import { DataProvider, useData } from "./context/DataContext"; 
import { ThemeProvider } from "./context/ThemeContext"; 
import { supabase } from "./services/supabase"; 

// Componentes
import AdminPanel from "./components/AdminPanel/AdminLayout";
import InstallPrompt from "./components/InstallPrompt"; 

// Páginas
import Login from "./pages/Login"; 
import Terms from "./pages/Terms"; 
import UpdatePassword from "./pages/UpdatePassword";

// --- COMPONENTE DE ENRUTAMIENTO PRIVADO ADMIN ---
function PrivateRouting() {
  const { isAdmin, loading } = useData();

  if (loading) {
    return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1120', color: 'white'}}>Verificando permisos...</div>;
  }

  return (
    <Routes>
        {isAdmin ? (
          <>
            <Route path="/admin/*" element={<AdminPanel />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </>
        ) : (
          <Route path="*" element={
            <div style={{height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0b1120', color: 'white', fontFamily: 'Inter, sans-serif'}}>
               <h2 style={{color: '#ef4444'}}>Acceso Denegado</h2>
               <p style={{marginTop: 10, color: '#94a3b8'}}>Esta plataforma es exclusiva para administradores.</p>
               <button 
                onClick={() => supabase.auth.signOut()} 
                style={{marginTop: 20, padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold'}}
               >
                 Cerrar Sesión
               </button>
            </div>
          } />
        )}
    </Routes>
  );
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  if (loadingSession) {
    return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1120', color: 'white'}}>Iniciando ROOT Admin... 🚀</div>;
  }

  return (
    <ThemeProvider>
      <InstallPrompt />
      <Routes>
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/terms" element={<Terms />} />
        
        {/* Rutas Públicas (Si NO hay sesión iniciada) */}
        {!session ? (
           <>
             <Route path="/login" element={<Login />} />
             <Route path="*" element={<Navigate to="/login" replace />} />
           </>
        ) : (
           <Route path="*" element={
             <DataProvider>
                <PrivateRouting />
             </DataProvider>
           } />
        )}
      </Routes>
    </ThemeProvider>
  );
}
