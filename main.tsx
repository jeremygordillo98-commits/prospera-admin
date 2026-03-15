import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css"; // <--- ¡ESTA ES LA LÍNEA MÁGICAA! 🦈

// 👇 1. IMPORTAMOS VERCEL ANALYTICS AQUÍ
import { Analytics } from '@vercel/analytics/react'; 


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      
      {/* 👇 2. AGREGAMOS EL COMPONENTE JUSTO DESPUÉS DE TU APP */}
      <Analytics />
      
    </BrowserRouter>
  </React.StrictMode>
);
