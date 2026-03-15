import React, { createContext, useContext, useState, useEffect } from "react";

// DEFINICIÓN DE LOS TEMAS CON ESTILO "MODERN GLASS FINTECH" 💎
const themes = {
  light: {
    bg: "#F8FAFC",
    bgGradient: `
      radial-gradient(at 0% 0%, rgba(224, 242, 254, 0.6) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(209, 250, 229, 0.6) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(219, 234, 254, 0.6) 0px, transparent 50%),
      radial-gradient(at 0% 100%, rgba(204, 253, 246, 0.6) 0px, transparent 50%),
      #F8FAFC
    `,
    nav: "rgba(255, 255, 255, 0.9)", 
    card: "rgba(255, 255, 255, 0.85)",
    text: "#0F172A",
    textSec: "#64748B",
    accent: "#E2E8F0",
    border: "rgba(0, 0, 0, 0.06)", 
    inputBg: "rgba(255, 255, 255, 0.8)",
    primary: "#059669",
    danger: "#EF4444",
    glassBorder: "rgba(255, 255, 255, 0.4)",
    glassShadow: "0 20px 50px rgba(0,0,0,0.05)",
    blur: "blur(20px)",
  },
  
  dark: {
    bg: "#0B1120",
    bgGradient: `
      radial-gradient(at 0% 0%, rgba(30, 58, 138, 0.15) 0px, transparent 50%),
      radial-gradient(at 98% 1%, rgba(0, 214, 143, 0.1) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.1) 0px, transparent 50%),
      radial-gradient(at 0% 99%, rgba(16, 185, 129, 0.1) 0px, transparent 50%),
      #0B1120
    `,
    nav: "rgba(11, 17, 32, 0.85)",
    card: "rgba(30, 41, 59, 0.7)",
    text: "#F8FAFC", 
    textSec: "#94A3B8",
    accent: "rgba(255, 255, 255, 0.08)",
    border: "rgba(255, 255, 255, 0.15)", 
    inputBg: "rgba(15, 23, 42, 0.7)",
    primary: "#00D68F",
    danger: "#EF4444",
    glassBorder: "rgba(255, 255, 255, 0.1)",
    glassShadow: "0 20px 50px rgba(0,0,0,0.3)",
    blur: "blur(25px)",
  },
};

type ThemeType = typeof themes.light;

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  theme: ThemeType;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    return saved ? JSON.parse(saved) : true; 
  });

  const theme = isDark ? themes.dark : themes.light;

  // Efecto para inyectar el Gradiente en el body
  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(isDark));
    
    // Aplicamos el gradiente
    document.body.style.background = theme.bgGradient;
    document.body.style.backgroundAttachment = "fixed"; // Importante para que el fondo no se corte al scrollear
    document.body.style.backgroundSize = "cover";
    
    document.body.style.color = theme.text;
    
    // Aseguramos que la transición sea suave
    document.body.style.transition = "background 0.3s ease, color 0.3s ease";
  }, [isDark, theme]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
