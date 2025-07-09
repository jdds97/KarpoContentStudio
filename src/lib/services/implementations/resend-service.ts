// Resend Email Service Implementation - Dependency Inversion Principle
// Implementación concreta de servicios de email usando Resend
import {
  EmailError,
  DeliveryStatus,
  ERROR_CODES
} from '@/types';
import type {
  EmailService,
  EmailTemplateService,
  EmailData,
  EmailResult,
  EmailTemplate,
  Email
} from '@/types';

// Mock de Resend client - en producción usarías el real
interface ResendClient {
  emails: {
    send(data: ResendEmailData): Promise<{ data: { id: string } | null; error: any }>;
    get(id: string): Promise<{ data: any; error: any }>;
  };
}

interface ResendEmailData {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
  reply_to?: string;
  attachments?: ResendAttachment[];
}

interface ResendAttachment {
  filename: string;
  content: string | Buffer;
  content_type?: string;
}

// Implementación del servicio de email con Resend
export class ResendEmailService implements EmailService {
  private defaultFrom: string;

  constructor(
    private client: ResendClient,
    defaultFromEmail: string = 'noreply@contentstudiokrp.es'
  ) {
    this.defaultFrom = defaultFromEmail;
  }

  async send(emailData: EmailData): Promise<EmailResult> {
    try {
      const resendData: ResendEmailData = {
        from: emailData.from || this.defaultFrom,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        cc: emailData.cc,
        bcc: emailData.bcc,
        reply_to: emailData.replyTo,
        attachments: emailData.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          content_type: att.contentType
        }))
      };

      const { data, error } = await this.client.emails.send(resendData);

      if (error) {
        throw new EmailError(
          ERROR_CODES.EMAIL_SEND_FAILED,
          error.message,
          emailData,
          error
        );
      }

      return {
        success: true,
        messageId: data?.id
      };

    } catch (error) {
      if (error instanceof EmailError) throw error;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error'
      };
    }
  }

  async sendBatch(emails: EmailData[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];

    // Resend no tiene envío en lote nativo, procesamos uno por uno
    for (const email of emails) {
      try {
        const result = await this.send(email);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  validateEmailAddress(email: Email): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async getDeliveryStatus(messageId: string): Promise<DeliveryStatus> {
    try {
      const { data, error } = await this.client.emails.get(messageId);

      if (error) {
        throw new EmailError(
          ERROR_CODES.EMAIL_SEND_FAILED,
          error.message,
          { messageId },
          error
        );
      }

      // Mapear el estado de Resend al enum DeliveryStatus
      switch (data?.last_event) {
        case 'sent':
          return DeliveryStatus.SENT;
        case 'delivered':
          return DeliveryStatus.DELIVERED;
        case 'bounced':
          return DeliveryStatus.BOUNCED;
        case 'failed':
          return DeliveryStatus.FAILED;
        default:
          return DeliveryStatus.PENDING;
      }

    } catch (error) {
      if (error instanceof EmailError) throw error;
      throw new EmailError(
        ERROR_CODES.EMAIL_SEND_FAILED,
        'Failed to get delivery status',
        { messageId },
        error as Error
      );
    }
  }
}

// Servicio de plantillas de email
export class EmailTemplateManager implements EmailTemplateService {
  private templates: Map<string, EmailTemplate> = new Map();

  constructor() {
    this.registerDefaultTemplates();
  }

  async render(templateName: string, data: Record<string, unknown>): Promise<string> {
    const template = this.templates.get(templateName);

    if (!template) {
      throw new EmailError(
        ERROR_CODES.TEMPLATE_NOT_FOUND,
        `Template '${templateName}' not found`,
        { templateName }
      );
    }

    try {
      return this.interpolateTemplate(template.html, data);
    } catch (error) {
      throw new EmailError(
        ERROR_CODES.TEMPLATE_RENDER_FAILED,
        `Failed to render template '${templateName}'`,
        { templateName, data },
        error as Error
      );
    }
  }

  registerTemplate(name: string, template: EmailTemplate): void {
    this.templates.set(name, template);
  }

  getTemplate(name: string): EmailTemplate | null {
    return this.templates.get(name) || null;
  }

  private interpolateTemplate(template: string, data: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }

  private registerDefaultTemplates(): void {
    // Plantilla de confirmación de reserva
    this.registerTemplate('booking-confirmation', {
      name: 'booking-confirmation',
      subject: 'Confirmación de Reserva - The Content Studio',
      html: `
        <h1>¡Gracias por tu reserva, {{name}}!</h1>
        <p>Hemos recibido tu solicitud de reserva para <strong>{{studio_space}}</strong>.</p>
        <h2>Detalles de la reserva:</h2>
        <ul>
          <li><strong>Fecha:</strong> {{preferred_date}}</li>
          <li><strong>Hora:</strong> {{preferred_time}}</li>
          <li><strong>Duración:</strong> {{package_duration}}</li>
          <li><strong>Participantes:</strong> {{participants}}</li>
          <li><strong>Precio total:</strong> €{{total_price}}</li>
        </ul>
        <p>Te contactaremos pronto para confirmar tu reserva.</p>
        <p>¡Gracias por elegir The Content Studio!</p>
      `,
      variables: ['name', 'studio_space', 'preferred_date', 'preferred_time', 'package_duration', 'participants', 'total_price']
    });

    // Plantilla de confirmación para admin
    this.registerTemplate('admin-booking-notification', {
      name: 'admin-booking-notification',
      subject: 'Nueva Reserva Recibida - The Content Studio',
      html: `
        <h1>Nueva reserva recibida</h1>
        <p>Se ha recibido una nueva solicitud de reserva.</p>
        <h2>Detalles del cliente:</h2>
        <ul>
          <li><strong>Nombre:</strong> {{name}}</li>
          <li><strong>Email:</strong> {{email}}</li>
          <li><strong>Teléfono:</strong> {{phone}}</li>
          <li><strong>Empresa:</strong> {{company}}</li>
        </ul>
        <h2>Detalles de la reserva:</h2>
        <ul>
          <li><strong>Espacio:</strong> {{studio_space}}</li>
          <li><strong>Fecha:</strong> {{preferred_date}}</li>
          <li><strong>Hora:</strong> {{preferred_time}}</li>
          <li><strong>Duración:</strong> {{package_duration}}</li>
          <li><strong>Tipo de sesión:</strong> {{session_type}}</li>
          <li><strong>Participantes:</strong> {{participants}}</li>
          <li><strong>Precio total:</strong> €{{total_price}}</li>
        </ul>
        {{#if notes}}
        <h2>Notas adicionales:</h2>
        <p>{{notes}}</p>
        {{/if}}
        <p><strong>ID de reserva:</strong> {{id}}</p>
      `,
      variables: ['name', 'email', 'phone', 'company', 'studio_space', 'preferred_date', 'preferred_time', 'package_duration', 'session_type', 'participants', 'total_price', 'notes', 'id']
    });

    // Plantilla de reserva confirmada
    this.registerTemplate('booking-confirmed', {
      name: 'booking-confirmed',
      subject: '✅ Reserva Confirmada - The Content Studio',
      html: `
        <h1>¡Tu reserva está confirmada, {{name}}!</h1>
        <p>Nos complace confirmar tu reserva en <strong>{{studio_space}}</strong>.</p>
        <h2>Detalles confirmados:</h2>
        <ul>
          <li><strong>Fecha:</strong> {{preferred_date}}</li>
          <li><strong>Hora:</strong> {{preferred_time}}</li>
          <li><strong>Duración:</strong> {{package_duration}}</li>
          <li><strong>Participantes:</strong> {{participants}}</li>
          <li><strong>Precio total:</strong> €{{total_price}}</li>
        </ul>
        <p>Te esperamos en The Content Studio. ¡Prepárate para crear contenido increíble!</p>
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      `,
      variables: ['name', 'studio_space', 'preferred_date', 'preferred_time', 'package_duration', 'participants', 'total_price']
    });

    // Plantilla de reserva cancelada
    this.registerTemplate('booking-cancelled', {
      name: 'booking-cancelled',
      subject: 'Reserva Cancelada - The Content Studio',
      html: `
        <h1>Reserva cancelada</h1>
        <p>Hola {{name}},</p>
        <p>Tu reserva para <strong>{{studio_space}}</strong> del {{preferred_date}} a las {{preferred_time}} ha sido cancelada.</p>
        {{#if reason}}
        <p><strong>Motivo:</strong> {{reason}}</p>
        {{/if}}
        <p>Si tienes alguna pregunta sobre esta cancelación, no dudes en contactarnos.</p>
        <p>Esperamos verte pronto en The Content Studio.</p>
      `,
      variables: ['name', 'studio_space', 'preferred_date', 'preferred_time', 'reason']
    });

    // Plantilla de contacto - confirmación
    this.registerTemplate('contact-confirmation', {
      name: 'contact-confirmation',
      subject: 'Mensaje Recibido - The Content Studio',
      html: `
        <h1>¡Gracias por contactarnos, {{name}}!</h1>
        <p>Hemos recibido tu mensaje y te responderemos lo antes posible.</p>
        <h2>Tu mensaje:</h2>
        <p><strong>Asunto:</strong> {{subject}}</p>
        <p><strong>Mensaje:</strong> {{message}}</p>
        <p>Nos pondremos en contacto contigo en un plazo de 24 horas.</p>
        <p>¡Gracias por tu interés en The Content Studio!</p>
      `,
      variables: ['name', 'subject', 'message']
    });

    // Plantilla de contacto - notificación admin
    this.registerTemplate('contact-admin-notification', {
      name: 'contact-admin-notification',
      subject: 'Nuevo Mensaje de Contacto - The Content Studio',
      html: `
        <h1>Nuevo mensaje de contacto</h1>
        <h2>Información del contacto:</h2>
        <ul>
          <li><strong>Nombre:</strong> {{name}}</li>
          <li><strong>Email:</strong> {{email}}</li>
          <li><strong>Teléfono:</strong> {{phone}}</li>
        </ul>
        <h2>Mensaje:</h2>
        <p><strong>Asunto:</strong> {{subject}}</p>
        <p><strong>Mensaje:</strong> {{message}}</p>
        <p>Responde al cliente lo antes posible.</p>
      `,
      variables: ['name', 'email', 'phone', 'subject', 'message']
    });
  }
}

// Service para generar emails específicos del negocio
export class BookingEmailService {
  constructor(
    private emailService: EmailService,
    private templateService: EmailTemplateService
  ) { }

  async sendBookingConfirmation(booking: any): Promise<EmailResult> {
    const html = await this.templateService.render('booking-confirmation', booking);

    return await this.emailService.send({
      to: booking.email,
      subject: 'Confirmación de Reserva - The Content Studio',
      html
    });
  }

  async sendAdminBookingNotification(booking: any, adminEmail: string): Promise<EmailResult> {
    const html = await this.templateService.render('admin-booking-notification', booking);

    return await this.emailService.send({
      to: adminEmail,
      subject: 'Nueva Reserva Recibida - The Content Studio',
      html
    });
  }

  async sendBookingConfirmed(booking: any): Promise<EmailResult> {
    const html = await this.templateService.render('booking-confirmed', booking);

    return await this.emailService.send({
      to: booking.email,
      subject: '✅ Reserva Confirmada - The Content Studio',
      html
    });
  }

  async sendBookingCancelled(booking: any, reason?: string): Promise<EmailResult> {
    const html = await this.templateService.render('booking-cancelled', {
      ...booking,
      reason
    });

    return await this.emailService.send({
      to: booking.email,
      subject: 'Reserva Cancelada - The Content Studio',
      html
    });
  }

  async sendContactConfirmation(contact: any): Promise<EmailResult> {
    const html = await this.templateService.render('contact-confirmation', contact);

    return await this.emailService.send({
      to: contact.email,
      subject: 'Mensaje Recibido - The Content Studio',
      html
    });
  }

  async sendContactAdminNotification(contact: any, adminEmail: string): Promise<EmailResult> {
    const html = await this.templateService.render('contact-admin-notification', contact);

    return await this.emailService.send({
      to: adminEmail,
      subject: 'Nuevo Mensaje de Contacto - The Content Studio',
      html
    });
  }
}

// Factory para crear servicios de email
export class EmailServiceFactory {
  constructor(private resendClient: ResendClient) { }

  createEmailService(defaultFromEmail?: string): ResendEmailService {
    return new ResendEmailService(this.resendClient, defaultFromEmail);
  }

  createTemplateService(): EmailTemplateManager {
    return new EmailTemplateManager();
  }

  createBookingEmailService(defaultFromEmail?: string): BookingEmailService {
    const emailService = this.createEmailService(defaultFromEmail);
    const templateService = this.createTemplateService();
    return new BookingEmailService(emailService, templateService);
  }
}