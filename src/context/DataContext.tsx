import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../services/supabase"; 
import { Toast } from "../components/Toast";

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
  loading: boolean;
  isAdmin: boolean;
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

  const [precios, setPrecios] = useState<PreciosConfig>({
    presupuestos: 0, recordatorios: 0, subcategorias: 0.3,
    reporte_patrimonio: 0.3, reporte_estado: 0.3, reporte_flujo: 0.3,
    conciliacion: 0.3, reporte_comparativo: 0.6, reporte_calor: 0.6,
    chat: 1.0, magic: 1.0, insights: 1.0
  });

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

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
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const cargarDatos = async (userId: string) => {
    setLoading(true);
    try {
      const { data: perfilData } = await supabase.from('perfiles').select('*').eq('id', userId).single();

      if (perfilData) {
          if (perfilData.nombre_completo) {
              setUsername(perfilData.nombre_completo);
              localStorage.setItem("cached_username", perfilData.nombre_completo);
          }
          setIsAdmin(perfilData.rol === 'admin');
      }

      // Cargar Precios Globales
      const { data: preciosData } = await supabase.from('precios_config').select('*');
      if (preciosData && preciosData.length > 0) {
          const pMap: any = { ...precios };
          preciosData.forEach(p => pMap[p.id] = p.valor);
          setPrecios(pMap);
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
      username, updateUsername, loading, isAdmin,
      showToast, precios, updatePrecios
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
