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
          <div class="detail-item">
            <span class="detail-label">Empresa</span>
            <span class="detail-value">${company}</span>
          </div>`;
};

const generateNotesSection = (notes: string | null): string => {
  if (!notes) return '';
  return `
          <div class="detail-item">
            <span class="detail-label">Notas adicionales</span>
            <span class="detail-value">${notes}</span>
          </div>`;
};

const generateDiscountSection = (discountCode: string | null, discountPercentage: number): string => {
  if (!discountCode) return '';
  return `
          <div class="detail-item discount-applied">
            <span class="detail-label">🎉 Descuento aplicado</span>
            <span class="detail-value">${discountCode} (${discountPercentage}% de descuento)</span>
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
 */
export const PACKAGE_PRICES: Record<string, number> = {
  '2h': 150,
  '4h': 300,
  '8h': 600,
  '12h': 850
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2c3e50; border-bottom: 2px solid #f4f1eb; padding-bottom: 10px;">
        Gracias por contactarnos
      </h2>
      <p>Hola <strong>${contactData.name}</strong>,</p>
      <p>Hemos recibido tu mensaje y te responderemos lo antes posible.</p>
      
      <div style="background: #f4f1eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2c3e50; margin-top: 0;">Resumen de tu consulta:</h3>
        <p><strong>Asunto:</strong> ${contactData.subject}</p>
        <p><strong>Mensaje:</strong></p>
        <div style="background: white; padding: 10px; border-radius: 4px; border-left: 4px solid #d4af37;">
          ${contactData.message.replace(/\n/g, '<br>')}
        </div>
      </div>
      
      <p>Saludos cordiales,<br>
      <strong>The Content Studio</strong></p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
        📧 Email: contacto@thecontentstudio.com<br>
        📍 Sevilla, España
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2c3e50; border-bottom: 2px solid #f4f1eb; padding-bottom: 10px;">
        Nuevo mensaje de contacto
      </h2>
      
      <div style="background: #f4f1eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2c3e50; margin-top: 0;">Datos del contacto:</h3>
        <p><strong>Nombre:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        ${contactData.phone ? `<p><strong>Teléfono:</strong> ${contactData.phone}</p>` : ''}
        <p><strong>Asunto:</strong> ${contactData.subject}</p>
      </div>
      
      <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #d4af37;">
        <h3 style="color: #2c3e50; margin-top: 0;">Mensaje:</h3>
        <p>${contactData.message.replace(/\n/g, '<br>')}</p>
      </div>
      
      <p style="margin-top: 20px; font-size: 12px; color: #666;">
        Enviado desde el formulario de contacto del sitio web
      </p>
    </div>
  `;
  
  return { subject, html };
}