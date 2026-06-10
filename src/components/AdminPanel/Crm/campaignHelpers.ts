export const DEFAULT_PLAIN_TEXTS: Record<string, { name: string; subject: string; text: string }> = {
  ventas_pymes: {
    name: 'Ventas Pymes',
    subject: 'Optimiza la tesorería de tu negocio hoy con Prospera Pymes 🚀',
    text: `Estimado/a,\n\n¿Pasas demasiadas horas cuadrando cuentas y registrando movimientos contables de forma manual? Es momento de dar el siguiente paso en la gestión de tu negocio.\n\nCon Prospera Pymes, centralizas la facturación de tu empresa, automatizas las conciliaciones bancarias en segundos y obtienes reportes patrimoniales y gráficos de flujo en tiempo real.\n\nÚnete a los cientos de empresarios que ya han ahorrado más de 15 horas semanales en papeleo administrativo, ganando tiempo valioso para hacer crecer sus ventas.\n\nUn saludo cordial,\nÁrea de Relaciones y Clientes\nProspera Finanzas`
  },
  ventas_app: {
    name: 'Ventas App',
    subject: 'Toma el control absoluto de tus finanzas personales con Prospera APP 📱',
    text: `Estimado/a,\n\nLlegó el momento de despedirse de las hojas de cálculo complejas y los dolores de cabeza a fin de mes. Toma las riendas de tu dinero hoy mismo.\n\nProspera APP te ayuda a registrar tus gastos diarios en un clic, establecer presupuestos mensuales inteligentes con alertas automatizadas y alcanzar tus metas de ahorro de forma divertida y sin esfuerzo.\n\nDescubre lo fácil que es crear hábitos financieros saludables cuando tienes analíticas automatizadas y gráficos de calor en la palma de tu mano.\n\nUn saludo cordial,\nÁrea de Relaciones y Clientes\nProspera Finanzas`
  },
  boletin_pymes: {
    name: 'Boletín Pymes',
    subject: 'Actualización Importante de Servicios - Prospera Pymes 📢',
    text: `Estimado/a,\n\nQueremos informarte sobre las nuevas mejoras integradas en tu plataforma contable Prospera Pymes para optimizar la administración de tu negocio:\n\n• Conciliación Bancaria Veloz: Nuevo algoritmo de cruce automático que procesa extractos bancarios un 50% más rápido.\n• Soporte Contable Multitasa: Módulo de IVA reestructurado y completamente adaptable a regulaciones vigentes.\n• Seguridad Blindada: Sistema de encriptación mejorado para resguardar tus reportes financieros corporativos.\n\nNuestro equipo de desarrollo trabaja continuamente para ofrecerte una herramienta intuitiva que reduzca el trabajo contable de tu empresa, garantizando que dediques más tiempo al crecimiento estratégico de tu negocio.\n\nUn saludo cordial,\nÁrea de Relaciones y Clientes\nProspera Finanzas`
  },
  boletin_app: {
    name: 'Novedades App',
    subject: 'Tips de Ahorro y Novedades de Prospera APP 💡',
    text: `Estimado/a,\n\nEn Prospera APP nos apasiona acompañarte en tu camino hacia la libertad financiera. Hoy queremos compartirte 3 recomendaciones simples para aumentar tus ahorros este mes utilizando tu app:\n\n1. Define límites mensuales: Configura montos tope en tus categorías de gastos recurrentes (restaurantes, transporte, entretenimiento).\n2. Programa tus recordatorios: Evita pagar multas o recargos activando alertas de facturas en tu calendario integrado.\n3. Analiza tu flujo: Revisa el gráfico de calor de gastos semanales para detectar fugas de dinero innecesarias.\n\nRecuerda que cada pequeño ahorro acumulado hoy se convierte en la base sólida de tus metas patrimoniales del mañana. ¡Sigue adelante con tu registro diario!\n\nUn saludo cordial,\nÁrea de Relaciones y Clientes\nProspera Finanzas`
  }
};

// HTML Email Layout Generator
export const generateCampaignHtml = (bodyText: string, templateId: string) => {
  const paragraphs = bodyText
    .split('\n')
    .map(p => p.trim() ? `<p style="margin-bottom: 16px; line-height: 1.6;">${p}</p>` : '')
    .join('');

  const isPymes = templateId.includes('pymes');
  const titleColor = isPymes ? '#00956A' : '#3b82f6';
  const headerTitle = isPymes ? 'PROSPERA PYMES' : 'PROSPERA APP';
  const subHeader = isPymes 
    ? 'Tesorería y Automatización Contable' 
    : 'Finanzas Personales Simples';
  
  // CTA Button
  let ctaSection = '';
  if (templateId === 'ventas_pymes') {
    ctaSection = `
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://pymes.prosperafinanzas.com" style="background: linear-gradient(135deg, #00956A, #00b37e); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 800; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(0, 149, 106, 0.25); display: inline-block;">Registrar mi Empresa Gratis</a>
      </div>
    `;
  } else if (templateId === 'ventas_app') {
    ctaSection = `
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://app.prosperafinanzas.com" style="background: linear-gradient(135deg, #3b82f6, #60a5fa); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 800; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25); display: inline-block;">Descargar App y Registrarme</a>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table width="100%" maxWidth="600px" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); max-width: 600px; border: 1px solid #e2e8f0;">
              
              <!-- Header -->
              <tr>
                <td style="padding: 40px 32px; background-color: #ffffff; border-bottom: 1px solid #f1f5f9; text-align: center;">
                  <h2 style="color: ${titleColor}; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${headerTitle}</h2>
                  <span style="font-size: 11px; color: ${titleColor}; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">${subHeader}</span>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 32px; font-size: 1rem; color: #1e293b; line-height: 1.6;">
                  ${paragraphs}
                  ${ctaSection}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8;">
                  <p style="margin: 0 0 6px;">Este correo electrónico fue generado de forma segura a través de Prospera CRM.</p>
                  <p style="margin: 0;">soporte@prosperafinanzas.com | +593 98 831 3486</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `.trim();
};
