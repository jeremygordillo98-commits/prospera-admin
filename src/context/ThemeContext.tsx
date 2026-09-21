import React, { createContext, useContext, useState, useEffect } from "react";

// DEFINICIÓN DE LOS TEMAS CON ESTILO "MODERN GLASS FINTECH" 💎
export type ThemeMode = 'light' | 'dark' | 'high-contrast';

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

  'high-contrast': {
    bg: "#000000",
    bgGradient: `
      radial-gradient(at 0% 0%, rgba(250, 204, 21, 0.08) 0px, transparent 40%),
      radial-gradient(at 100% 100%, rgba(250, 204, 21, 0.06) 0px, transparent 40%),
      #000000
    `,
    nav: "rgba(10, 10, 10, 0.95)",
    card: "rgba(20, 20, 24, 0.95)",
    text: "#FFFFFF",
    textSec: "#FACC15",
    accent: "rgba(250, 204, 21, 0.18)",
    border: "rgba(250, 204, 21, 0.35)",
    inputBg: "rgba(26, 26, 30, 0.95)",
    primary: "#FACC15",
    danger: "#FF4D4D",
    glassBorder: "rgba(250, 204, 21, 0.3)",
    glassShadow: "0 20px 50px rgba(0,0,0,0.8)",
    blur: "blur(25px)",
  },
};

type ThemeType = typeof themes.light;

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  isHighContrast: boolean;
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
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("theme_mode") || localStorage.getItem("theme");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed === true) return "dark";
        if (parsed === false) return "light";
        if (parsed === "high-contrast" || parsed === "dark" || parsed === "light") return parsed;
      } catch {
        if (saved === "high-contrast" || saved === "dark" || saved === "light") return saved as ThemeMode;
      }
    }
    return "dark";
  });

  const isDark = themeMode === "dark" || themeMode === "high-contrast";
  const isHighContrast = themeMode === "high-contrast";
  const theme = themes[themeMode] || themes.dark;

  // Efecto para inyectar el Gradiente en el body
  useEffect(() => {
    localStorage.setItem("theme_mode", JSON.stringify(themeMode));
    localStorage.setItem("theme", JSON.stringify(isDark));
    
    // Aplicamos el gradiente
    document.body.style.background = theme.bgGradient;
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundSize = "cover";
    
    document.body.style.color = theme.text;
    
    // Aseguramos que la transición sea suave
    document.body.style.transition = "background 0.3s ease, color 0.3s ease";
  }, [themeMode, isDark, theme]);

  const toggleTheme = () => {
    setThemeMode((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "high-contrast";
      return "light";
    });
  };

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, isDark, isHighContrast, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
