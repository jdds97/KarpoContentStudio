// Templates HTML puros para emails de The Content Studio
// Solo contienen el HTML sin lógica de negocio

export const BOOKING_CONFIRMATION_TEMPLATE = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Reserva - The Content Studio</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Instrument+Serif:wght@400&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1F1F1F;
      background-color: #F5F5F5;
      padding: 20px 0;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #000000 0%, #3C3C3C 100%);
      color: #FFFFFF;
      padding: 40px 30px;
      text-align: center;
      position: relative;
    }
    
    .header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #DAD6C9 0%, #C4BFB1 100%);
    }
    
    .logo {
      font-family: 'Instrument Serif', serif;
      font-size: 28px;
      font-weight: 400;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    
    .subtitle {
      font-size: 16px;
      font-weight: 300;
      opacity: 0.9;
      letter-spacing: 0.5px;
    }
    
    .content {
      padding: 40px 30px;
    }
    
    .greeting {
      font-family: 'Instrument Serif', serif;
      font-size: 24px;
      color: #000000;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .intro-text {
      font-size: 16px;
      color: #3C3C3C;
      text-align: center;
      margin-bottom: 30px;
      line-height: 1.5;
    }
    
    .status-badge {
      display: inline-block;
      background: linear-gradient(135deg, #DAD6C9 0%, #C4BFB1 100%);
      color: #000000;
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      text-align: center;
      margin: 20px auto;
      display: block;
      width: fit-content;
    }
    
    .booking-details {
      background: #F0ECE0;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
      border-left: 4px solid #DAD6C9;
    }
    
    .booking-details h3 {
      font-family: 'Instrument Serif', serif;
      font-size: 20px;
      color: #000000;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .detail-grid {
      display: grid;
      gap: 12px;
    }
    
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(196, 191, 177, 0.3);
    }
    
    .detail-item:last-child {
      border-bottom: none;
    }
    
    .detail-label {
      font-weight: 500;
      color: #3C3C3C;
      font-size: 14px;
    }
    
    .detail-value {
      font-weight: 400;
      color: #000000;
      font-size: 14px;
      text-align: right;
      max-width: 60%;
    }
    
    .price-highlight {
      background: #FFFFFF;
      border-radius: 6px;
      padding: 15px;
      margin: 15px 0;
      border: 2px solid #DAD6C9;
      text-align: center;
    }
    
    .price-highlight .detail-label {
      font-size: 16px;
      font-weight: 600;
    }
    
    .price-highlight .detail-value {
      font-size: 20px;
      font-weight: 600;
      color: #000000;
      max-width: 100%;
    }
    
    .next-steps {
      background: #FFFFFF;
      border: 1px solid #C8C8C8;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    
    .next-steps h4 {
      font-family: 'Instrument Serif', serif;
      font-size: 18px;
      color: #000000;
      margin-bottom: 15px;
    }
    
    .next-steps p {
      font-size: 14px;
      color: #3C3C3C;
      line-height: 1.5;
    }
    
    .contact-info {
      background: #000000;
      color: #FFFFFF;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
      text-align: center;
    }
    
    .contact-info h4 {
      font-family: 'Instrument Serif', serif;
      font-size: 18px;
      margin-bottom: 15px;
    }
    
    .contact-details {
      display: flex;
      justify-content: center;
      gap: 30px;
      flex-wrap: wrap;
    }
    
    .contact-item {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .contact-item strong {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
    }
    
    .footer {
      background: #DAD6C9;
      color: #000000;
      text-align: center;
      padding: 20px;
      font-size: 12px;
    }
    
    .footer-text {
      opacity: 0.8;
      line-height: 1.4;
    }
    
    @media (max-width: 600px) {
      .email-container {
        margin: 0 10px;
      }
      
      .header, .content {
        padding: 30px 20px;
      }
      
      .booking-details {
        padding: 20px;
      }
      
      .contact-details {
        flex-direction: column;
        gap: 15px;
      }
      
      .detail-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
      
      .detail-value {
        max-width: 100%;
        text-align: left;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">The Content Studio</div>
      <div class="subtitle">El espacio donde tu creatividad cobra vida</div>
    </div>
    
    <div class="content">
      <h2 class="greeting">¡Hola {{CUSTOMER_NAME}}!</h2>
      <p class="intro-text">
        Hemos recibido tu solicitud de reserva correctamente. 
        Te confirmamos que hemos registrado todos los detalles de tu sesión.
      </p>
      
      <div class="status-badge">
        📅 Reserva Pendiente de Confirmación
      </div>
      
      <div class="booking-details">
        <h3>📋 Detalles de tu Reserva</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Fecha de la sesión</span>
            <span class="detail-value">{{SESSION_DATE}}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Hora de inicio</span>
            <span class="detail-value">{{SESSION_TIME}}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Duración</span>
            <span class="detail-value">{{PACKAGE_DURATION}}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Espacio del estudio</span>
            <span class="detail-value">{{STUDIO_SPACE}}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Tipo de sesión</span>
            <span class="detail-value">{{SESSION_TYPE}}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Número de participantes</span>
            <span class="detail-value">{{PARTICIPANTS}}</span>
          </div>
          {{COMPANY_SECTION}}
          {{NOTES_SECTION}}
          {{DISCOUNT_SECTION}}
        </div>
        
        <div class="price-highlight">
          <div class="detail-item">
            <span class="detail-label">💰 Precio Total</span>
            <span class="detail-value">€{{TOTAL_PRICE}}</span>
          </div>
        </div>
      </div>
      
      <div class="next-steps">
        <h4>🚀 Siguientes Pasos</h4>
        <p>
          Nuestro equipo revisará tu solicitud y te contactaremos en las próximas 24 horas 
          para confirmar la disponibilidad y coordinar los detalles finales de tu sesión. 
          ¡Estamos emocionados de trabajar contigo!
        </p>
      </div>
      
      <div class="contact-info">
        <h4>📞 ¿Necesitas ayuda?</h4>
        <div class="contact-details">
          <div class="contact-item">
            <strong>Email</strong>
            contacto@contentstudiokrp.es
          </div>
          <div class="contact-item">
            <strong>Teléfono</strong>
            +34 XXX XXX XXX
          </div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p class="footer-text">
        © 2025 The Content Studio | Sevilla, España<br>
        El espacio donde tu creatividad cobra vida
      </p>
    </div>
  </div>
</body>
</html>
`;

export const BOOKING_CONFIRMED_TEMPLATE = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reserva Confirmada - The Content Studio</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Instrument+Serif:wght@400&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1F1F1F;
      background-color: #F5F5F5;
      padding: 20px 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #DAD6C9 0%, #C4BFB1 100%);
      color: #000000;
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-family: 'Instrument Serif', serif;
      font-size: 28px;
      font-weight: 400;
      margin-bottom: 8px;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .confirmation-icon {
      font-size: 60px;
      margin-bottom: 20px;
    }
    .greeting {
      font-family: 'Instrument Serif', serif;
      font-size: 24px;
      color: #000000;
      margin-bottom: 20px;
    }
    .confirmed-details {
      background: #F0ECE0;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
      border: 2px solid #DAD6C9;
    }
    .session-info {
      font-size: 18px;
      font-weight: 500;
      color: #000000;
      margin-bottom: 10px;
    }
    .footer {
      background: #000000;
      color: #FFFFFF;
      text-align: center;
      padding: 20px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">The Content Studio</div>
      <div>El espacio donde tu creatividad cobra vida</div>
    </div>
    
    <div class="content">
      <div class="confirmation-icon">🎉</div>
      <h2 class="greeting">¡Tu reserva ha sido confirmada!</h2>
      <p>Hola {{CUSTOMER_NAME}},</p>
      
      <div class="confirmed-details">
        <div class="session-info">{{SESSION_DATE}}</div>
        <div class="session-info">{{SESSION_TIME}}</div>
      </div>
      
      <p>¡Te esperamos en The Content Studio para crear contenido increíble juntos!</p>
      
      <p style="margin-top: 20px;">
        <strong>Equipo The Content Studio</strong><br>
        contacto@contentstudiokrp.es
      </p>
    </div>
    
    <div class="footer">
      <p>© 2025 The Content Studio | Sevilla, España</p>
    </div>
  </div>
</body>
</html>
`;

export const BOOKING_CANCELLED_TEMPLATE = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reserva Cancelada - The Content Studio</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Instrument+Serif:wght@400&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1F1F1F;
      background-color: #F5F5F5;
      padding: 20px 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: #B2B2B2;
      color: #000000;
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-family: 'Instrument Serif', serif;
      font-size: 28px;
      font-weight: 400;
      margin-bottom: 8px;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .cancelled-details {
      background: #F5F5F5;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
      border-left: 4px solid #B2B2B2;
    }
    .footer {
      background: #000000;
      color: #FFFFFF;
      text-align: center;
      padding: 20px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">The Content Studio</div>
      <div>El espacio donde tu creatividad cobra vida</div>
    </div>
    
    <div class="content">
      <h2>Tu reserva ha sido cancelada</h2>
      <p>Hola {{CUSTOMER_NAME}},</p>
      
      <div class="cancelled-details">
        <p><strong>Sesión:</strong> {{SESSION_DATE}} a las {{SESSION_TIME}}</p>
        {{REASON_SECTION}}
      </div>
      
      <p>Si tienes alguna pregunta o deseas hacer una nueva reserva, no dudes en contactarnos.</p>
      
      <p style="margin-top: 20px;">
        <strong>Equipo The Content Studio</strong><br>
        contacto@contentstudiokrp.es
      </p>
    </div>
    
    <div class="footer">
      <p>© 2025 The Content Studio | Sevilla, España</p>
    </div>
  </div>
</body>
</html>
`;

export const ADMIN_NOTIFICATION_TEMPLATE = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Reserva - Admin</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Instrument+Serif:wght@400&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1F1F1F;
      background-color: #F5F5F5;
      padding: 20px 0;
    }
    .email-container {
      max-width: 700px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #000000 0%, #DAD6C9 100%);
      color: #FFFFFF;
      padding: 30px;
      text-align: center;
    }
    .alert-badge {
      display: inline-block;
      background: #FF6B6B;
      color: white;
      padding: 6px 15px;
      border-radius: 15px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .logo {
      font-family: 'Instrument Serif', serif;
      font-size: 24px;
      font-weight: 400;
    }
    .content {
      padding: 30px;
    }
    .booking-id {
      background: #000000;
      color: #FFFFFF;
      padding: 10px 20px;
      border-radius: 20px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 25px;
    }
    .client-info {
      background: #F0ECE0;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid #DAD6C9;
    }
    .client-info h3 {
      font-family: 'Instrument Serif', serif;
      color: #000000;
      margin-bottom: 15px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .info-label {
      font-size: 12px;
      font-weight: 600;
      color: #3C3C3C;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-value {
      font-size: 14px;
      font-weight: 500;
      color: #000000;
    }
    .session-details {
      background: #FFFFFF;
      border: 2px solid #DAD6C9;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .session-details h3 {
      font-family: 'Instrument Serif', serif;
      color: #000000;
      margin-bottom: 15px;
    }
    .urgent-info {
      background: #FFF3CD;
      border: 1px solid #FFEAA7;
      border-radius: 6px;
      padding: 15px;
      margin: 15px 0;
    }
    .urgent-info strong {
      color: #D63031;
    }
    .actions {
      background: #000000;
      color: #FFFFFF;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 25px 0;
    }
    .actions h4 {
      font-family: 'Instrument Serif', serif;
      margin-bottom: 10px;
    }
    .footer {
      background: #DAD6C9;
      color: #000000;
      text-align: center;
      padding: 15px;
      font-size: 12px;
    }
    
    @media (max-width: 600px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="alert-badge">NUEVA RESERVA</div>
      <div class="logo">The Content Studio - Admin</div>
    </div>
    
    <div class="content">
      <div class="booking-id">
        📋 Reserva ID: {{BOOKING_ID}}
      </div>
      
      <div class="client-info">
        <h3>👤 Información del Cliente</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Nombre</span>
            <span class="info-value">{{CUSTOMER_NAME}}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Email</span>
            <span class="info-value">{{CUSTOMER_EMAIL}}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Teléfono</span>
            <span class="info-value">{{CUSTOMER_PHONE}}</span>
          </div>
          {{COMPANY_SECTION}}
        </div>
      </div>
      
      <div class="session-details">
        <h3>📅 Detalles de la Sesión</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Fecha Solicitada</span>
            <span class="info-value">{{SESSION_DATE}}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Hora</span>
            <span class="info-value">{{SESSION_TIME}}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Duración</span>
            <span class="info-value">{{PACKAGE_DURATION}}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Espacio</span>
            <span class="info-value">{{STUDIO_SPACE}}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Tipo de Sesión</span>
            <span class="info-value">{{SESSION_TYPE}}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Participantes</span>
            <span class="info-value">{{PARTICIPANTS}}</span>
          </div>
        </div>
        
        {{NOTES_SECTION}}
        
        <div class="info-grid" style="margin-top: 15px;">
          <div class="info-item">
            <span class="info-label">Precio Total</span>
            <span class="info-value" style="font-size: 18px; font-weight: 600;">€{{TOTAL_PRICE}}</span>
          </div>
          {{DISCOUNT_SECTION}}
        </div>
      </div>
      
      <div class="actions">
        <h4>🚀 Acciones Requeridas</h4>
        <p>
          • Revisar disponibilidad del espacio<br>
          • Contactar al cliente para confirmar<br>
          • Actualizar estado en el dashboard
        </p>
      </div>
      
      <div style="text-align: center; color: #666; font-size: 12px;">
        Reserva recibida el {{CREATED_AT}}
      </div>
    </div>
    
    <div class="footer">
      <p>Notificación automática del sistema de reservas</p>
    </div>
  </div>
</body>
</html>
`;

export const BOOKING_UPDATED_TEMPLATE = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Actualización de Reserva - The Content Studio</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Instrument+Serif:wght@400&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1F1F1F;
      background-color: #F5F5F5;
      padding: 20px 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #DAD6C9 0%, #C4BFB1 100%);
      color: #000000;
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-family: 'Instrument Serif', serif;
      font-size: 28px;
      font-weight: 400;
      margin-bottom: 8px;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .update-icon {
      font-size: 50px;
      margin-bottom: 20px;
    }
    .greeting {
      font-family: 'Instrument Serif', serif;
      font-size: 24px;
      color: #000000;
      margin-bottom: 20px;
    }
    .changes-list {
      background: #F0ECE0;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
      border-left: 4px solid #DAD6C9;
      text-align: left;
    }
    .changes-list h3 {
      font-family: 'Instrument Serif', serif;
      color: #000000;
      margin-bottom: 15px;
    }
    .changes-list ul {
      list-style: none;
      padding: 0;
    }
    .changes-list li {
      padding: 8px 0;
      border-bottom: 1px solid rgba(196, 191, 177, 0.3);
    }
    .changes-list li:last-child {
      border-bottom: none;
    }
    .current-details {
      background: #FFFFFF;
      border: 2px solid #DAD6C9;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .current-details h3 {
      font-family: 'Instrument Serif', serif;
      color: #000000;
      margin-bottom: 15px;
    }
    .footer {
      background: #000000;
      color: #FFFFFF;
      text-align: center;
      padding: 20px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">The Content Studio</div>
      <div>El espacio donde tu creatividad cobra vida</div>
    </div>
    
    <div class="content">
      <div class="update-icon">📝</div>
      <h2 class="greeting">Tu reserva ha sido actualizada</h2>
      <p>Hola {{CUSTOMER_NAME}},</p>
      
      <div class="changes-list">
        <h3>📋 Cambios Realizados</h3>
        <ul>
          {{CHANGES_LIST}}
        </ul>
      </div>
      
      <div class="current-details">
        <h3>📅 Detalles Actuales de tu Reserva</h3>
        <p><strong>Fecha:</strong> {{SESSION_DATE}}</p>
        <p><strong>Hora:</strong> {{SESSION_TIME}}</p>
        <p><strong>Precio Total:</strong> €{{TOTAL_PRICE}}</p>
      </div>
      
      <p>Si tienes alguna pregunta sobre estos cambios, no dudes en contactarnos.</p>
      
      <p style="margin-top: 20px;">
        <strong>Equipo The Content Studio</strong><br>
        info@thecontentstudio.com
      </p>
    </div>
    
    <div class="footer">
      <p>© 2025 The Content Studio | Sevilla, España</p>
    </div>
  </div>
</body>
</html>
`;

export const BOOKING_REMINDER_TEMPLATE = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recordatorio de Reserva - The Content Studio</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Instrument+Serif:wght@400&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1F1F1F;
      background-color: #F5F5F5;
      padding: 20px 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%);
      color: #000000;
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-family: 'Instrument Serif', serif;
      font-size: 28px;
      font-weight: 400;
      margin-bottom: 8px;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .reminder-icon {
      font-size: 60px;
      margin-bottom: 20px;
    }
    .greeting {
      font-family: 'Instrument Serif', serif;
      font-size: 24px;
      color: #000000;
      margin-bottom: 20px;
    }
    .session-tomorrow {
      background: #FFF3CD;
      border: 2px solid #FFE66D;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
      font-weight: 500;
    }
    .session-details {
      background: #F0ECE0;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
      border-left: 4px solid #DAD6C9;
    }
    .preparation-tips {
      background: #E3F2FD;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
      text-align: left;
    }
    .preparation-tips h3 {
      font-family: 'Instrument Serif', serif;
      color: #000000;
      margin-bottom: 15px;
      text-align: center;
    }
    .preparation-tips ul {
      list-style-type: none;
      padding: 0;
    }
    .preparation-tips li {
      padding: 5px 0;
      padding-left: 20px;
      position: relative;
    }
    .preparation-tips li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #4CAF50;
      font-weight: bold;
    }
    .contact-urgent {
      background: #FF6B6B;
      color: #FFFFFF;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .footer {
      background: #000000;
      color: #FFFFFF;
      text-align: center;
      padding: 20px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">The Content Studio</div>
      <div>El espacio donde tu creatividad cobra vida</div>
    </div>
    
    <div class="content">
      <div class="reminder-icon">⏰</div>
      <h2 class="greeting">¡Tu sesión es mañana!</h2>
      <p>Hola {{CUSTOMER_NAME}},</p>
      
      <div class="session-tomorrow">
        <strong>¡Te esperamos mañana en The Content Studio!</strong>
      </div>
      
      <div class="session-details">
        <h3>📅 Detalles de tu Sesión</h3>
        <p><strong>Fecha:</strong> {{SESSION_DATE}}</p>
        <p><strong>Hora:</strong> {{SESSION_TIME}}</p>
        <p><strong>Duración:</strong> {{PACKAGE_DURATION}}</p>
      </div>
      
      <div class="preparation-tips">
        <h3>💡 Consejos para tu Sesión</h3>
        <ul>
          <li>Llega 10 minutos antes para prepararte</li>
          <li>Trae la ropa y accesorios que planeas usar</li>
          <li>Asegúrate de haber descansado bien</li>
          <li>Ven con actitud positiva y ganas de crear</li>
          <li>Si tienes ideas específicas, tráelas contigo</li>
        </ul>
      </div>
      
      <div class="contact-urgent">
        <h3>🚨 ¿Necesitas hacer algún cambio?</h3>
        <p>Si necesitas reprogramar o tienes alguna emergencia, contáctanos lo antes posible:</p>
        <p><strong>Email:</strong> contacto@contentstudiokrp.es</p>
        <p><strong>Teléfono:</strong> +34 </p>
      </div>
      
      <p style="margin-top: 30px; font-size: 18px; font-weight: 500;">
        ¡Estamos emocionados de crear contenido increíble contigo! 🎥📸
      </p>
    </div>
    
    <div class="footer">
      <p>© 2025 The Content Studio | Sevilla, España</p>
    </div>
  </div>
</body>
</html>
`;

export const BOOKING_CONFIRMATION_TEMPLATE_ENHANCED = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Reserva - The Content Studio</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Instrument+Serif:wght@400&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1F1F1F;
      background-color: #F5F5F5;
      padding: 20px 0;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #000000 0%, #3C3C3C 100%);
      color: #FFFFFF;
      padding: 40px 30px;
      text-align: center;
      position: relative;
    }
    
    .header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #DAD6C9 0%, #C4BFB1 100%);
    }
    
    .logo {
      font-family: 'Instrument Serif', serif;
      font-size: 28px;
      font-weight: 400;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    
    .subtitle {
      font-size: 16px;
      font-weight: 300;
      opacity: 0.9;
      letter-spacing: 0.5px;
    }
    
    .content {
      padding: 40px 30px;
    }
    
    .greeting {
      font-family: 'Instrument Serif', serif;
      font-size: 24px;
      color: #000000;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .intro-text {
      font-size: 16px;
      color: #3C3C3C;
      text-align: center;
      margin-bottom: 30px;
      line-height: 1.5;
    }
    
    .status-badge {
      display: inline-block;
      background: linear-gradient(135deg, #DAD6C9 0%, #C4BFB1 100%);
      color: #000000;
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      text-align: center;
      margin: 20px auto;
      display: block;
      width: fit-content;
    }
    
    .booking-details {
      background: #F0ECE0;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
      border-left: 4px solid #DAD6C9;
    }
    
    .booking-details h3 {
      font-family: 'Instrument Serif', serif;
      font-size: 20px;
      color: #000000;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .detail-grid {
      display: grid;
      gap: 12px;
    }
    
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(196, 191, 177, 0.3);
    }
    
    .detail-item:last-child {
      border-bottom: none;
    }
    
    .detail-label {
      font-weight: 500;
      color: #3C3C3C;
      font-size: 14px;
    }
    
    .detail-value {
      font-weight: 400;
      color: #000000;
      font-size: 14px;
      text-align: right;
      max-width: 60%;
    }
    
    .price-highlight {
      background: #FFFFFF;
      border-radius: 6px;
      padding: 15px;
      margin: 15px 0;
      border: 2px solid #DAD6C9;
      text-align: center;
    }
    
    .price-highlight .detail-label {
      font-size: 16px;
      font-weight: 600;
    }
    
    .price-highlight .detail-value {
      font-size: 20px;
      font-weight: 600;
      color: #000000;
      max-width: 100%;
    }
    
    .next-steps {
      background: #FFFFFF;
      border: 1px solid #C8C8C8;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    
    .next-steps h4 {
      font-family: 'Instrument Serif', serif;
      font-size: 18px;
      color: #000000;
      margin-bottom: 15px;
    }
    
    .next-steps p {
      font-size: 14px;
      color: #3C3C3C;
      line-height: 1.5;
    }
    
    .contact-info {
      background: #000000;
      color: #FFFFFF;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
      text-align: center;
    }
    
    .contact-info h4 {
      font-family: 'Instrument Serif', serif;
      font-size: 18px;
      margin-bottom: 15px;
    }
    
    .contact-details {
      display: flex;
      justify-content: center;
      gap: 30px;
      flex-wrap: wrap;
    }
    
    .contact-item {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .contact-item strong {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
    }
    
    .footer {
      background: #DAD6C9;
      color: #000000;
      text-align: center;
      padding: 20px;
      font-size: 12px;
    }
    
    .footer-text {
      opacity: 0.8;
      line-height: 1.4;
    }
    
    @media (max-width: 600px) {
      .email-container {
        margin: 0 10px;
      }
      
      .header, .content {
        padding: 30px 20px;
      }
      
      .booking-details {
        padding: 20px;
      }
      
      .contact-details {
        flex-direction: column;
        gap: 15px;
      }
      
      .detail-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
      
      .detail-value {
        max-width: 100%;
        text-align: left;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">The Content Studio</div>
      <div class="subtitle">El espacio donde tu creatividad cobra vida</div>
    </div>
    
    <div class="content">
      <h2 class="greeting">¡Hola {{CUSTOMER_NAME}}!</h2>
      <p class="intro-text">
        Hemos recibido tu solicitud de reserva correctamente. 
        Te confirmamos que hemos registrado todos los detalles de tu sesión.
      </p>
      
      <div class="status-badge">
        📅 Reserva Pendiente de Confirmación
      </div>
      
      <div class="booking-details">
        <h3>📋 Detalles de tu Reserva</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Fecha de la sesión</span>
            <span class="detail-value">{{SESSION_DATE}}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Hora de inicio</span>
            <span class="detail-value">{{SESSION_TIME}}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Duración</span>
            <span class="detail-value">{{PACKAGE_DURATION}}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Espacio del estudio</span>
            <span class="detail-value">{{STUDIO_SPACE}}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Tipo de sesión</span>
            <span class="detail-value">{{SESSION_TYPE}}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Número de participantes</span>
            <span class="detail-value">{{PARTICIPANTS}}</span>
          </div>
          {{COMPANY_SECTION}}
          {{NOTES_SECTION}}
          {{DISCOUNT_SECTION}}
        </div>
        
        <div class="price-highlight">
          <div class="detail-item">
            <span class="detail-label">💰 Precio Total</span>
            <span class="detail-value">€{{TOTAL_PRICE}}</span>
          </div>
        </div>
      </div>
      
      <div class="next-steps">
        <h4>🚀 Siguientes Pasos</h4>
        <p>
          Nuestro equipo revisará tu solicitud y te contactaremos en las próximas 24 horas 
          para confirmar la disponibilidad y coordinar los detalles finales de tu sesión. 
          ¡Estamos emocionados de trabajar contigo!
        </p>
      </div>
      
      <div class="contact-info">
        <h4>📞 ¿Necesitas ayuda?</h4>
        <div class="contact-details">
          <div class="contact-item">
            <strong>Email</strong>
            info@thecontentstudio.com
          </div>
          <div class="contact-item">
            <strong>Teléfono</strong>
            +34 XXX XXX XXX
          </div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p class="footer-text">
        © 2025 The Content Studio | Sevilla, España<br>
        El espacio donde tu creatividad cobra vida
      </p>
    </div>
  </div>
</body>
</html>
`;
