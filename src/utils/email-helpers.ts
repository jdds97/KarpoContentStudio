// Funciones consolidadas para envío de emails - The Content Studio
import type { Database } from '@/lib/database.types';
import {
  BOOKING_CONFIRMATION_TEMPLATE,
  BOOKING_CONFIRMED_TEMPLATE,
  BOOKING_CANCELLED_TEMPLATE,
  ADMIN_NOTIFICATION_TEMPLATE,
  BOOKING_UPDATED_TEMPLATE
} from './data/email-templates';

export type Booking = Database['public']['Tables']['bookings']['Row'];

// Utilidades compartidas para formateo
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (timeString: string): string => {
  return timeString.includes(':') ? timeString : `${timeString}:00`;
};

// Tipos para formulario de contacto
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

/**
 * Función para reemplazar placeholders en las plantillas HTML
 */
const replacePlaceholders = (template: string, data: Record<string, string>): string => {
  let result = template;
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value);
  });
  return result;
};

/**
 * Genera secciones HTML condicionales
 */
const generateCompanySection = (company: string | null): string => {
  if (!company) return '';
  return `
          <!-- ═══ SEPARADOR: INFORMACIÓN ADICIONAL ═══ -->
          <div style="height: 12px; border-bottom: 2px solid rgba(196, 191, 177, 0.2); margin: 20px 0; position: relative;">
            <div style="position: absolute; top: -8px; left: 50%; transform: translateX(-50%); background: #F0ECE0; padding: 0 12px; color: #666; font-size: 11px; font-weight: 600; letter-spacing: 0.8px;">
              INFORMACIÓN ADICIONAL
            </div>
          </div>
          <div class="detail-item" style="background: rgba(218, 214, 201, 0.1); padding: 15px; border-radius: 6px;">
            <span class="detail-label">🏢 Empresa</span>
            <span class="detail-value" style="font-weight: 600;">${company}</span>
          </div>`;
};

const generateNotesSection = (notes: string | null): string => {
  if (!notes) return '';
  return `
          <!-- ═══ SEPARADOR: NOTAS ADICIONALES ═══ -->
          <div style="height: 10px; margin: 18px 0;"></div>
          <div class="detail-item" style="background: linear-gradient(135deg, #f8f8f8 0%, #f0f0f0 100%); border: 1px solid rgba(196, 191, 177, 0.3); border-radius: 8px; padding: 18px;">
            <span class="detail-label" style="color: #555; font-weight: 600;">📝 Notas adicionales</span>
            <div style="margin-top: 8px; padding: 10px; background: white; border-radius: 4px; border-left: 3px solid #DAD6C9;">
              <span class="detail-value" style="font-style: italic; color: #333; line-height: 1.5; display: block;">${notes}</span>
            </div>
          </div>`;
};

const generateDiscountSection = (discountCode: string | null, discountPercentage: number): string => {
  if (!discountCode) return '';
  return `
          <!-- ═══ SEPARADOR: DESCUENTO ESPECIAL ═══ -->
          <div style="height: 12px; border-bottom: 2px solid #4CAF50; margin: 25px 0; position: relative;">
            <div style="position: absolute; top: -8px; left: 50%; transform: translateX(-50%); background: #F0ECE0; padding: 0 15px; color: #2E7D32; font-size: 11px; font-weight: 700; letter-spacing: 1px;">
              ✨ DESCUENTO APLICADO ✨
            </div>
          </div>
          <div class="detail-item discount-applied" style="background: linear-gradient(135deg, #e8f5e8 0%, #d4f1d4 100%); border-radius: 12px; padding: 20px; border: 3px solid #4CAF50; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);">
            <div style="text-align: center;">
              <div style="font-size: 24px; margin-bottom: 8px;">🎉</div>
              <span class="detail-label" style="color: #2E7D32; font-weight: 700; font-size: 16px; display: block; margin-bottom: 5px;">Descuento aplicado</span>
              <span class="detail-value" style="color: #1B5E20; font-weight: 600; font-size: 18px; display: block;">${discountCode} (-${discountPercentage}%)</span>
            </div>
          </div>`;
};

const generateReasonSection = (reason: string | null): string => {
  if (!reason) return '';
  return `<p><strong>Motivo:</strong> ${reason}</p>`;
};

const generateChangesListSection = (changes: string[]): string => {
  return changes.map(change => `<li>• ${change}</li>`).join('');
};

/**
 * Precios de los paquetes de horas
 * Tarifa base: 75€/hora con ajustes por volumen
 */
export const PACKAGE_PRICES: Record<string, number> = {
  '1h': 85,    // Sesión express (mínimo)
  '2h': 150,   // Estándar
  '3h': 225,   // 3 horas
  '4h': 300,   // Medio día
  '6h': 450,   // 6 horas
  '8h': 600,   // Día completo
  '12h': 850   // Jornada extendida
};

/**
 * Calcula el precio total basado en la duración del paquete y el descuento aplicado
 */
export const calculateTotalPrice = (packageDuration: string, discountPercentage: number = 0): number => {
  const basePrice = PACKAGE_PRICES[packageDuration];
  if (!basePrice) {
    throw new Error(`Duración de paquete no válida: ${packageDuration}`);
  }
  
  const discount = (basePrice * discountPercentage) / 100;
  return basePrice - discount;
};

/**
 * Envía un email usando Resend
 */
export const sendEmailWithResend = async (
  to: string | string[],
  subject: string,
  html: string,
  runtime?: any,
  from?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const RESEND_API_KEY = runtime?.env?.RESEND_API_KEY || process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY no está configurada');
    }

    const fromEmail = from || 'reservas@contentstudiokrp.es';
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error de Resend: ${errorData.message || response.statusText}`);
    }

    return { success: true };
    
  } catch (error) {
    console.error('Error enviando email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
};

/**
 * Genera el email de confirmación de reserva (pendiente de confirmación)
 */
export function generateBookingConfirmationEmail(booking: Booking): { subject: string; html: string } {
  const subject = `Confirmación de Reserva - The Content Studio`;
  
  const data = {
    CUSTOMER_NAME: booking.name || 'Cliente',
    SESSION_DATE: formatDate(booking.preferred_date),
    SESSION_TIME: formatTime(booking.preferred_time),
    PACKAGE_DURATION: booking.package_duration || 'No especificada',
    STUDIO_SPACE: booking.studio_space || 'No especificado',
    SESSION_TYPE: booking.session_type || 'No especificado',
    PARTICIPANTS: booking.participants?.toString() || 'No especificado',
    TOTAL_PRICE: booking.total_price ? Number(booking.total_price).toFixed(2) : '0.00',
    COMPANY_SECTION: generateCompanySection(booking.company),
    NOTES_SECTION: generateNotesSection(booking.notes),
    DISCOUNT_SECTION: generateDiscountSection(booking.discount_code, booking.discount_percentage || 0)
  };

  const html = replacePlaceholders(BOOKING_CONFIRMATION_TEMPLATE, data);
  return { subject, html };
}

/**
 * Genera el email de confirmación definitiva de reserva
 */
export function generateBookingConfirmedEmail(booking: Booking): { subject: string; html: string } {
  const subject = `🎉 ¡Reserva Confirmada! - The Content Studio`;
  
  const data = {
    CUSTOMER_NAME: booking.name || 'Cliente',
    SESSION_DATE: formatDate(booking.preferred_date),
    SESSION_TIME: formatTime(booking.preferred_time)
  };

  const html = replacePlaceholders(BOOKING_CONFIRMED_TEMPLATE, data);
  return { subject, html };
}

/**
 * Genera el email de cancelación de reserva
 */
export function generateBookingCancelledEmail(booking: Booking, reason?: string): { subject: string; html: string } {
  const subject = `Reserva Cancelada - The Content Studio`;
  
  const data = {
    CUSTOMER_NAME: booking.name || 'Cliente',
    SESSION_DATE: formatDate(booking.preferred_date),
    SESSION_TIME: formatTime(booking.preferred_time),
    REASON_SECTION: generateReasonSection(reason || null)
  };

  const html = replacePlaceholders(BOOKING_CANCELLED_TEMPLATE, data);
  return { subject, html };
}

/**
 * Genera el email de notificación de admin (nueva reserva)
 */
export function generateAdminBookingNotificationEmail(booking: Booking): { subject: string; html: string } {
  const subject = `🔔 Nueva Reserva Recibida - ID: ${booking.id}`;
  
  const data = {
    CUSTOMER_NAME: booking.name || 'Cliente',
    CUSTOMER_EMAIL: booking.email || 'No especificado',
    CUSTOMER_PHONE: booking.phone || 'No especificado',
    SESSION_DATE: formatDate(booking.preferred_date),
    SESSION_TIME: formatTime(booking.preferred_time),
    PACKAGE_DURATION: booking.package_duration || 'No especificada',
    STUDIO_SPACE: booking.studio_space || 'No especificado',
    SESSION_TYPE: booking.session_type || 'No especificado',
    PARTICIPANTS: booking.participants?.toString() || 'No especificado',
    BOOKING_ID: booking.id || 'No especificado',
    TOTAL_PRICE: booking.total_price ? Number(booking.total_price).toFixed(2) : '0.00',
    COMPANY_SECTION: generateCompanySection(booking.company),
    NOTES_SECTION: generateNotesSection(booking.notes),
    DISCOUNT_SECTION: generateDiscountSection(booking.discount_code, booking.discount_percentage || 0),
    CREATED_AT: new Date(booking.created_at).toLocaleString('es-ES')
  };

  const html = replacePlaceholders(ADMIN_NOTIFICATION_TEMPLATE, data);
  return { subject, html };
}

/**
 * Genera el email de actualización de reserva
 */
export function generateBookingUpdatedEmail(booking: Booking, changes: string[]): { subject: string; html: string } {
  const subject = `Actualización de Reserva - The Content Studio`;
  
  const data = {
    CUSTOMER_NAME: booking.name || 'Cliente',
    SESSION_DATE: formatDate(booking.preferred_date),
    SESSION_TIME: formatTime(booking.preferred_time),
    TOTAL_PRICE: booking.total_price ? Number(booking.total_price).toFixed(2) : '0.00',
    CHANGES_LIST: generateChangesListSection(changes)
  };

  const html = replacePlaceholders(BOOKING_UPDATED_TEMPLATE, data);
  return { subject, html };
}

/**
 * Genera el email de confirmación para formulario de contacto
 */
export function generateContactConfirmationEmail(contactData: ContactFormData): { subject: string; html: string } {
  const subject = `Confirmación de contacto - ${contactData.subject}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #f8f9fa;">
      <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        
        <h2 style="color: #2c3e50; border-bottom: 3px solid #f4f1eb; padding-bottom: 15px; margin-bottom: 30px; font-size: 28px;">
          Gracias por contactarnos
        </h2>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hola <strong>${contactData.name}</strong>,
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          Hemos recibido tu mensaje y te responderemos lo antes posible.
        </p>
        
        <div style="background: #f4f1eb; padding: 25px; border-radius: 10px; margin: 30px 0;">
          <h3 style="color: #2c3e50; margin-top: 0; margin-bottom: 20px; font-size: 20px;">
            Resumen de tu consulta:
          </h3>
          
          <p style="margin-bottom: 15px; font-size: 16px;">
            <strong>Asunto:</strong> ${contactData.subject}
          </p>
          
          <p style="margin-bottom: 15px; font-size: 16px;">
            <strong>Mensaje:</strong>
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid #d4af37; margin-top: 15px;">
            <p style="margin: 0; font-size: 15px; line-height: 1.6;">
              ${contactData.message.replace(/\n/g, '<br>')}
            </p>
          </div>
        </div>
        
        <div style="margin: 40px 0;">
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">
            Saludos cordiales,
          </p>
          <p style="font-size: 16px; font-weight: bold; margin: 0;">
            <strong>The Content Studio</strong>
          </p>
        </div>
        
        <div style="margin-top: 40px; padding-top: 25px; border-top: 2px solid #eee; font-size: 14px; color: #666;">
          <p style="margin-bottom: 8px;">
            📧 Email: contacto@contentstudiokrp.es
          </p>
          <p style="margin: 0;">
            📍 Sevilla, España
          </p>
        </div>
        
      </div>
    </div>
  `;
  
  return { subject, html };
}

/**
 * Genera el email de notificación de admin para formulario de contacto
 */
export function generateContactNotificationEmail(contactData: ContactFormData): { subject: string; html: string } {
  const subject = `Nuevo contacto: ${contactData.subject}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 30px; background: #f8f9fa;">
      <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        
        <div style="background: linear-gradient(135deg, #000000 0%, #3C3C3C 100%); color: white; padding: 25px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 600;">
            Nuevo mensaje de contacto
          </h2>
        </div>
        
        <div style="background: #f4f1eb; padding: 25px; border-radius: 10px; margin: 30px 0;">
          <h3 style="color: #2c3e50; margin-top: 0; margin-bottom: 25px; font-size: 20px;">
            👤 Datos del contacto:
          </h3>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 0; font-size: 16px; line-height: 1.6;">
              <strong>Nombre:</strong> ${contactData.name}
            </p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 0; font-size: 16px; line-height: 1.6;">
              <strong>Email:</strong> ${contactData.email}
            </p>
          </div>
          
          ${contactData.phone ? `
          <div style="margin-bottom: 15px;">
            <p style="margin: 0; font-size: 16px; line-height: 1.6;">
              <strong>Teléfono:</strong> ${contactData.phone}
            </p>
          </div>
          ` : ''}
          
          <div style="margin-bottom: 0;">
            <p style="margin: 0; font-size: 16px; line-height: 1.6;">
              <strong>Asunto:</strong> ${contactData.subject}
            </p>
          </div>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 10px; border-left: 5px solid #d4af37; border: 1px solid #e0e0e0;">
          <h3 style="color: #2c3e50; margin-top: 0; margin-bottom: 20px; font-size: 18px;">
            💬 Mensaje:
          </h3>
          <div style="font-size: 15px; line-height: 1.7; color: #333;">
            ${contactData.message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <div style="margin-top: 40px; padding-top: 25px; border-top: 2px solid #eee; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #888; font-style: italic;">
            📧 Enviado desde el formulario de contacto del sitio web
          </p>
        </div>
        
      </div>
    </div>
  `;
  
  return { subject, html };
}