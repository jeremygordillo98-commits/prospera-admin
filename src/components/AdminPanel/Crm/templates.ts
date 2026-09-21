export interface EmailTemplate {
  id: string;
  name: string;
  category: 'ventas' | 'boletin';
  target: 'pymes' | 'app';
  subject: string;
  content: string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'ventas_pymes',
    name: '🎯 Ventas - Prospera Pymes (Con Botón CTA)',
    category: 'ventas',
    target: 'pymes',
    subject: 'Optimiza la tesorería de tu negocio hoy con Prospera Pymes 🚀',
    content: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #00956A; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">PROSPERA PYMES</h2>
    <span style="font-size: 11px; color: #00956A; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Tesorería y Automatización Contable</span>
  </div>
  
  <p>Estimado/a,</p>
  
  <p>¿Pasas demasiadas horas cuadrando cuentas y registrando movimientos contables de forma manual? Es momento de dar el siguiente paso en la gestión de tu negocio.</p>
  
  <p>Con <strong>Prospera Pymes</strong>, centralizas la facturación de tu empresa, automatizas las conciliaciones bancarias en segundos y obtienes reportes patrimoniales y gráficos de flujo en tiempo real.</p>
  
  <div style="text-align: center; margin: 28px 0;">
    <a href="https://pymes.prosperafinanzas.com" style="background: linear-gradient(135deg, #00956A, #00b37e); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 800; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(0, 149, 106, 0.25); display: inline-block;">Registrar mi Empresa Gratis</a>
  </div>
  
  <p>Únete a los cientos de empresarios que ya han ahorrado más de 15 horas semanales en papeleo administrativo, ganando tiempo valioso para hacer crecer sus ventas.</p>
  
  <p style="margin-top: 30px; font-size: 0.9rem; color: #334155; line-height: 1.6;">
    Un saludo cordial,<br />
    <strong style="color: #1e293b; font-size: 0.95rem;">Área de Relaciones y Clientes</strong><br />
    <span style="color: #64748b; font-weight: 600;">Prospera Finanzas</span>
  </p>
  
  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
  
  <div style="text-align: center; font-size: 11px; color: #94a3b8;">
    <p>Este correo electrónico fue generado automáticamente por Prospera CRM.</p>
    <p>soporte@prosperafinanzas.com | +593 98 831 3486</p>
  </div>
</div>
    `.trim()
  },
  {
    id: 'ventas_app',
    name: '📱 Ventas - Prospera APP (Con Botón CTA)',
    category: 'ventas',
    target: 'app',
    subject: 'Toma el control absoluto de tus finanzas personales con Prospera APP 📱',
    content: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #3b82f6; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">PROSPERA APP</h2>
    <span style="font-size: 11px; color: #3b82f6; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Finanzas Personales Simples</span>
  </div>
  
  <p>Estimado/a,</p>
  
  <p>Llegó el momento de despedirse de las hojas de cálculo complejas y los dolores de cabeza a fin de mes. Toma las riendas de tu dinero hoy mismo.</p>
  
  <p><strong>Prospera APP</strong> te ayuda a registrar tus gastos diarios en un clic, establecer presupuestos mensuales inteligentes con alertas automatizadas y alcanzar tus metas de ahorro de forma divertida y sin esfuerzo.</p>
  
  <div style="text-align: center; margin: 28px 0;">
    <a href="https://app.prosperafinanzas.com" style="background: linear-gradient(135deg, #3b82f6, #60a5fa); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 800; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25); display: inline-block;">Descargar App y Registrarme</a>
  </div>
  
  <p>Descubre lo fácil que es crear hábitos financieros saludables cuando tienes analíticas automatizadas y gráficos de calor en la palma de tu mano.</p>
  
  <p style="margin-top: 30px; font-size: 0.9rem; color: #334155; line-height: 1.6;">
    Un saludo cordial,<br />
    <strong style="color: #1e293b; font-size: 0.95rem;">Área de Relaciones y Clientes</strong><br />
    <span style="color: #64748b; font-weight: 600;">Prospera Finanzas</span>
  </p>
  
  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
  
  <div style="text-align: center; font-size: 11px; color: #94a3b8;">
    <p>Este correo electrónico fue generado automáticamente por Prospera CRM.</p>
    <p>soporte@prosperafinanzas.com | +593 98 831 3486</p>
  </div>
</div>
    `.trim()
  },
  {
    id: 'boletin_pymes',
    name: '📢 Notificación - Prospera Pymes (Sin Botón)',
    category: 'boletin',
    target: 'pymes',
    subject: 'Actualización Importante de Servicios - Prospera Pymes 📢',
    content: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #00956A; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">PROSPERA PYMES</h2>
    <span style="font-size: 11px; color: #00956A; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Boletín Informativo Empresarial</span>
  </div>
  
  <p>Estimado/a,</p>
  
  <p>Queremos informarte sobre las nuevas mejoras integradas en tu plataforma contable <strong>Prospera Pymes</strong> para optimizar la administración de tu negocio:</p>
  
  <div style="background: #f8fafc; border-left: 4px solid #00956A; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0;">
    <ul style="margin: 0; padding-left: 20px; font-size: 0.9rem; color: #334155;">
      <li style="margin-bottom: 8px;"><strong>Conciliación Bancaria Veloz:</strong> Nuevo algoritmo de cruce automático que procesa extractos bancarios un 50% más rápido.</li>
      <li style="margin-bottom: 8px;"><strong>Soporte Contable Multitasa:</strong> Módulo de IVA reestructurado y completamente adaptable a regulaciones vigentes.</li>
      <li style="margin-bottom: 0;"><strong>Seguridad Blindada:</strong> Sistema de encriptación mejorado para resguardar tus reportes financieros corporativos.</li>
    </ul>
  </div>
  
  <p>Nuestro equipo de desarrollo trabaja continuamente para ofrecerte una herramienta intuitiva que reduzca el trabajo contable de tu empresa, garantizando que dediques más tiempo al crecimiento estratégico de tu negocio.</p>
  
  <p style="margin-top: 30px; font-size: 0.9rem; color: #334155; line-height: 1.6;">
    Un saludo cordial,<br />
    <strong style="color: #1e293b; font-size: 0.95rem;">Área de Relaciones y Clientes</strong><br />
    <span style="color: #64748b; font-weight: 600;">Prospera Finanzas</span>
  </p>
  
  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
  
  <div style="text-align: center; font-size: 11px; color: #94a3b8;">
    <p>Este correo electrónico fue generado automáticamente por Prospera CRM.</p>
    <p>soporte@prosperafinanzas.com | +593 98 831 3486</p>
  </div>
</div>
    `.trim()
  },
  {
    id: 'boletin_app',
    name: '💡 Novedades - Prospera APP (Sin Botón)',
    category: 'boletin',
    target: 'app',
    subject: 'Tips de Ahorro y Novedades de Prospera APP 💡',
    content: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #3b82f6; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">PROSPERA APP</h2>
    <span style="font-size: 11px; color: #3b82f6; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Consejos de Bienestar Financiero</span>
  </div>
  
  <p>Estimado/a,</p>
  
  <p>En <strong>Prospera APP</strong> nos apasiona acompañarte en tu camino hacia la libertad financiera. Hoy queremos compartirte 3 recomendaciones simples para aumentar tus ahorros este mes utilizando tu app:</p>
  
  <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0;">
    <ol style="margin: 0; padding-left: 20px; font-size: 0.9rem; color: #334155;">
      <li style="margin-bottom: 8px;"><strong>Define límites mensuales:</strong> Configura montos tope en tus categorías de gastos recurrentes (restaurantes, transporte, entretenimiento).</li>
      <li style="margin-bottom: 8px;"><strong>Programa tus recordatorios:</strong> Evita pagar multas o recargos activando alertas de facturas en tu calendario integrado.</li>
      <li style="margin-bottom: 0;"><strong>Analiza tu flujo:</strong> Revisa el gráfico de calor de gastos semanales para detectar fugas de dinero innecesarias.</li>
    </ol>
  </div>
  
  <p>Recuerda que cada pequeño ahorro acumulado hoy se convierte en la base sólida de tus metas patrimoniales del mañana. ¡Sigue adelante con tu registro diario!</p>
  
  <p style="margin-top: 30px; font-size: 0.9rem; color: #334155; line-height: 1.6;">
    Un saludo cordial,<br />
    <strong style="color: #1e293b; font-size: 0.95rem;">Área de Relaciones y Clientes</strong><br />
    <span style="color: #64748b; font-weight: 600;">Prospera Finanzas</span>
  </p>
  
  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
  
  <div style="text-align: center; font-size: 11px; color: #94a3b8;">
    <p>Este correo electrónico fue generado automáticamente por Prospera CRM.</p>
    <p>soporte@prosperafinanzas.com | +593 98 831 3486</p>
  </div>
</div>
    `.trim()
  },
  {
    id: 'reengagement_pymes',
    name: '🔄 Reactivación - Prospera Pymes (Prevención Churn)',
    category: 'ventas',
    target: 'pymes',
    subject: 'Te extrañamos en Prospera Pymes — Reactiva tu gestión contable hoy 🚀',
    content: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #00956A; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">PROSPERA PYMES</h2>
    <span style="font-size: 11px; color: #00956A; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Gestión y Automatización Contable</span>
  </div>
  
  <p>Estimado/a colega contador/a,</p>
  
  <p>Notamos que hace varios días no ingresas a tu panel contable en <strong>Prospera Pymes</strong>. Queremos asegurarnos de que todo esté marchando excelente con tus empresas gestionadas.</p>
  
  <p>Hemos añadido nuevas mejoras para facilitar tu trabajo mensual:</p>
  
  <div style="background: #f0fdf4; border-left: 4px solid #00956A; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0;">
    <ul style="margin: 0; padding-left: 20px; font-size: 0.9rem; color: #166534;">
      <li style="margin-bottom: 6px;"><strong>Importador Masivo SRI:</strong> Carga facturas XML en lote con mapeo tributario inteligente.</li>
      <li style="margin-bottom: 6px;"><strong>Alertas ATS & Calendario:</strong> Recordatorios automáticos según el 9º dígito del RUC.</li>
      <li style="margin-bottom: 0;"><strong>Reportes en PDF Premium:</strong> Balances listos para entregar a tus clientes en 1 clic.</li>
    </ul>
  </div>
  
  <div style="text-align: center; margin: 28px 0;">
    <a href="https://pymes.prosperafinanzas.com" style="background: linear-gradient(135deg, #00956A, #00b37e); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 800; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(0, 149, 106, 0.25); display: inline-block;">Ingresar a mi Panel Contable</a>
  </div>
  
  <p>Si tienes alguna duda o necesitas ayuda para configurar el plan de cuentas de alguna empresa, recuerda que nuestro equipo de soporte está siempre disponible para ti.</p>
  
  <p style="margin-top: 30px; font-size: 0.9rem; color: #334155; line-height: 1.6;">
    Un saludo cordial,<br />
    <strong style="color: #1e293b; font-size: 0.95rem;">Equipo de Éxito del Cliente</strong><br />
    <span style="color: #64748b; font-weight: 600;">Prospera Finanzas</span>
  </p>
  
  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
  
  <div style="text-align: center; font-size: 11px; color: #94a3b8;">
    <p>Prospera Ecuador S.A.S. | soporte@prosperafinanzas.com | +593 98 831 3486</p>
  </div>
</div>
    `.trim()
  },
  {
    id: 'reengagement_app',
    name: '🔄 Reactivación - Prospera APP (Prevención Churn)',
    category: 'ventas',
    target: 'app',
    subject: '¿Todo bien con tus finanzas? Vuelve a registrar tus movimientos en Prospera 📱',
    content: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #3b82f6; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">PROSPERA APP</h2>
    <span style="font-size: 11px; color: #3b82f6; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Finanzas Personales en tus Manos</span>
  </div>
  
  <p>¡Hola!</p>
  
  <p>Vemos que han pasado algunos días desde tu último registro en <strong>Prospera APP</strong>. La constancia es el secreto número uno para mantener tus finanzas bajo control y cumplir tus metas de ahorro.</p>
  
  <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0;">
    <p style="margin: 0; font-size: 0.9rem; color: #1e40af; font-weight: 600;">
      💡 Tip rápido: Solo toma 10 segundos registrar tus gastos diarios para evitar fugas de capital a fin de mes.
    </p>
  </div>
  
  <div style="text-align: center; margin: 28px 0;">
    <a href="https://app.prosperafinanzas.com" style="background: linear-gradient(135deg, #3b82f6, #60a5fa); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 800; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25); display: inline-block;">Abrir mi App de Finanzas</a>
  </div>
  
  <p>¡Retoma el control de tu patrimonio hoy mismo!</p>
  
  <p style="margin-top: 30px; font-size: 0.9rem; color: #334155; line-height: 1.6;">
    Un saludo cordial,<br />
    <strong style="color: #1e293b; font-size: 0.95rem;">Equipo Prospera</strong><br />
    <span style="color: #64748b; font-weight: 600;">prosperafinanzas.com</span>
  </p>
  
  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
  
  <div style="text-align: center; font-size: 11px; color: #94a3b8;">
    <p>soporte@prosperafinanzas.com | +593 98 831 3486</p>
  </div>
</div>
    `.trim()
  }
];
