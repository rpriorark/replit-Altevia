// Using SendGrid integration for email notifications
import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const mailData: any = {
      to: params.to,
      from: params.from,
      subject: params.subject,
    };
    
    if (params.text) {
      mailData.text = params.text;
    }
    
    if (params.html) {
      mailData.html = params.html;
    }
    
    await mailService.send(mailData);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Specific email templates for Altevia
export async function sendTrialSignupNotification(
  businessName: string,
  contactEmail: string,
  phone?: string,
  industry?: string,
  city?: string,
  websiteUrl?: string,
  mainChallenges?: string
): Promise<boolean> {
  const subject = `Nueva Prueba Gratis - ${businessName}`;
  
  const htmlContent = `
    <h2>Nueva Solicitud de Prueba Gratis - Altevia</h2>
    <p><strong>Negocio:</strong> ${businessName}</p>
    <p><strong>Email de contacto:</strong> ${contactEmail}</p>
    ${phone ? `<p><strong>Teléfono:</strong> ${phone}</p>` : ''}
    ${industry ? `<p><strong>Industria:</strong> ${industry}</p>` : ''}
    ${city ? `<p><strong>Ciudad:</strong> ${city}</p>` : ''}
    ${websiteUrl ? `<p><strong>Sitio web:</strong> <a href="${websiteUrl}">${websiteUrl}</a></p>` : ''}
    ${mainChallenges ? `<p><strong>Principales desafíos:</strong> ${mainChallenges}</p>` : ''}
    <p><strong>Fecha de solicitud:</strong> ${new Date().toLocaleString('es-MX')}</p>
    
    <hr>
    <p><em>Esta notificación fue enviada automáticamente desde la plataforma Altevia.</em></p>
  `;

  const textContent = `
Nueva Solicitud de Prueba Gratis - Altevia

Negocio: ${businessName}
Email de contacto: ${contactEmail}
${phone ? `Teléfono: ${phone}` : ''}
${industry ? `Industria: ${industry}` : ''}
${city ? `Ciudad: ${city}` : ''}
${websiteUrl ? `Sitio web: ${websiteUrl}` : ''}
${mainChallenges ? `Principales desafíos: ${mainChallenges}` : ''}
Fecha de solicitud: ${new Date().toLocaleString('es-MX')}

Esta notificación fue enviada automáticamente desde la plataforma Altevia.
  `;

  return sendEmail({
    to: 'roprior@gmail.com',
    from: 'noreply@altevia.com', // You'll need to verify this domain in SendGrid
    subject,
    text: textContent,
    html: htmlContent
  });
}

export async function sendWelcomeEmail(
  businessName: string,
  contactEmail: string
): Promise<boolean> {
  const subject = `¡Bienvenido a Altevia! Tu prueba gratis de 14 días ha comenzado`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">¡Bienvenido a Altevia, ${businessName}!</h1>
      
      <p>¡Gracias por registrarte en Altevia! Tu prueba gratuita de 14 días ha comenzado y ya puedes empezar a mejorar la visibilidad digital de tu negocio.</p>
      
      <h2 style="color: #1e40af;">¿Qué puedes hacer durante tu prueba?</h2>
      <ul>
        <li>📝 <strong>Generar contenido SEO</strong> optimizado para tu ubicación</li>
        <li>⭐ <strong>Gestionar reseñas</strong> con respuestas inteligentes</li>
        <li>📅 <strong>Crear calendarios de contenido</strong> automáticos</li>
        <li>📊 <strong>Analizar tu reputación</strong> y la de tu competencia</li>
        <li>🚀 <strong>Crear posts para Google My Business</strong></li>
      </ul>
      
      <h2 style="color: #1e40af;">Próximos pasos:</h2>
      <ol>
        <li>Configura tu ubicación y datos del negocio</li>
        <li>Conecta tus fuentes de reseñas (Google, Facebook, etc.)</li>
        <li>Genera tu primer contenido SEO</li>
        <li>Explora las herramientas de análisis de competencia</li>
      </ol>
      
      <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>💡 Consejo:</strong> Para obtener los mejores resultados, te recomendamos completar la configuración inicial y generar al menos 3 piezas de contenido durante la primera semana.</p>
      </div>
      
      <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
      
      <p>¡Que tengas mucho éxito con Altevia!</p>
      
      <hr style="margin: 30px 0;">
      <p style="font-size: 12px; color: #6b7280;">
        El equipo de Altevia<br>
        <em>Mejorando la visibilidad digital de negocios locales</em>
      </p>
    </div>
  `;

  const textContent = `
¡Bienvenido a Altevia, ${businessName}!

¡Gracias por registrarte en Altevia! Tu prueba gratuita de 14 días ha comenzado y ya puedes empezar a mejorar la visibilidad digital de tu negocio.

¿Qué puedes hacer durante tu prueba?
- Generar contenido SEO optimizado para tu ubicación
- Gestionar reseñas con respuestas inteligentes
- Crear calendarios de contenido automáticos
- Analizar tu reputación y la de tu competencia
- Crear posts para Google My Business

Próximos pasos:
1. Configura tu ubicación y datos del negocio
2. Conecta tus fuentes de reseñas (Google, Facebook, etc.)
3. Genera tu primer contenido SEO
4. Explora las herramientas de análisis de competencia

Consejo: Para obtener los mejores resultados, te recomendamos completar la configuración inicial y generar al menos 3 piezas de contenido durante la primera semana.

Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.

¡Que tengas mucho éxito con Altevia!

El equipo de Altevia
Mejorando la visibilidad digital de negocios locales
  `;

  return sendEmail({
    to: contactEmail,
    from: 'welcome@altevia.com',
    subject,
    text: textContent,
    html: htmlContent
  });
}