// Actions para manejo de reservas con integración de Resend
import { createSupabaseAdmin } from '@/lib/supabase';
import {
  cancelBookingSchema,
  confirmBookingSchema,
  contactFormSchema,
  createBookingSchema,
  updateBookingSchema
} from '@/utils/data/schemas';
import {
  calculateTotalPrice,
  generateAdminBookingNotificationEmail,
  generateBookingCancelledEmail,
  generateBookingConfirmationEmail,
  generateBookingConfirmedEmail,
  generateBookingUpdatedEmail,
  generateContactConfirmationEmail,
  generateContactNotificationEmail,
  sendEmailWithResend,
  sendReviewRequestEmail
} from '@/utils/email-helpers';
import { defineAction } from 'astro:actions';

// Action para crear una nueva reserva
const createBooking = defineAction({
  accept: 'form',
  input: createBookingSchema,
  handler: async (input, context) => {
    const supabaseAdmin = createSupabaseAdmin(context.locals.runtime);
    
    try {
      // Convertir paquete a duración numérica para validación
      const durationHours = parseInt(input.package.replace('h', ''));
      
      // Validar disponibilidad antes de crear la reserva
      const siteUrl = context.locals.runtime?.env?.PUBLIC_SITE_URL || 'https://contentstudiokrp.es';
      const availabilityResponse = await fetch(`${siteUrl}/api/calendar/validate-availability?date=${input.date}&time=${input.time}&duration=${durationHours}&studio_space=${input['studio-space']}`);
      
      if (availabilityResponse.ok) {
        const availabilityData = await availabilityResponse.json();
        if (!availabilityData.available) {
          return {
            success: false,
            error: availabilityData.reason || 'El horario seleccionado ya no está disponible. Por favor, elige otro horario.',
            data: null
          };
        }
      } else {
      }

      // Calcular precio total usando la función centralizada (sin descuentos)
      const totalPrice = calculateTotalPrice(input.package);

      // Crear la reserva en la base de datos
      const { data: booking, error } = await supabaseAdmin
        .from('bookings')
        .insert({
          name: input.name,
          email: input.email,
          phone: input.phone,
          company: input.company || null,
          studio_space: input['studio-space'],
          package_duration: input.package,
          preferred_date: input.date,
          preferred_time: input.time,
          participants: parseInt(input.participants),
          session_type: input['session-type'],
          notes: input.notes || null,
          discount_code: null,
          discount_percentage: 0,
          total_price: totalPrice,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: 'Error al crear la reserva. Por favor, inténtalo de nuevo.',
          data: null
        };
      }

      // Enviar emails de confirmación con Resend (con delay para evitar rate limit)
      try {
        // Email al cliente
        const { subject: clientSubject, html: clientHtml } = generateBookingConfirmationEmail(booking);
        await sendEmailWithResend(input.email, clientSubject, clientHtml, context.locals.runtime);
        
        // Delay de 1 segundo para evitar el límite de tasa de Resend (2 req/sec)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Email al estudio/administración
        const studioEmail = context.locals.runtime?.env?.ADMIN_EMAIL || 'contacto@contentstudiokrp.es';
        const { subject: studioSubject, html: studioHtml } = generateAdminBookingNotificationEmail(booking);
        await sendEmailWithResend(studioEmail, studioSubject, studioHtml, context.locals.runtime);
        
      } catch (emailError) {
        // No fallar la reserva si el email falla
        console.error('Error enviando emails:', emailError);
      }

      return {
        success: true,
        message: 'Reserva creada exitosamente. Te hemos enviado un email de confirmación.',
        data: { booking }
      };

    } catch (error) {
      return {
        success: false,
        error: 'Error interno del servidor.',
        data: null
      };
    }
  }
});

// Action para confirmar booking (admin)
const confirmBooking = defineAction({
  accept: 'form',
  input: confirmBookingSchema,
  handler: async (input, context) => {
    const supabaseAdmin = createSupabaseAdmin(context.locals.runtime);
    try {
      // Verificar autenticación: primero Supabase Auth, luego password legacy
      const isSupabaseAuth = input.adminPassword === '__SUPABASE_AUTH__';

      if (isSupabaseAuth) {
        // Verificar sesión de Supabase usando cookies
        const accessToken = context.cookies.get('sb-access-token');
        const refreshToken = context.cookies.get('sb-refresh-token');

        if (!accessToken || !refreshToken) {
          return {
            success: false,
            error: 'Sesión no válida. Por favor, inicia sesión de nuevo.',
            data: null
          };
        }

        // La sesión existe, continuar (ya fue validada en la página)
      } else {
        // Verificación legacy con password
        const adminPassword = context.locals.runtime?.env?.ADMIN_PASSWORD || 'admin123';
        if (input.adminPassword !== adminPassword) {
          return {
            success: false,
            error: 'Password de administrador incorrecto.',
            data: null
          };
        }
      }

      // Actualizar estado de la reserva
      const { data: booking, error } = await supabaseAdmin
        .from('bookings')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', input.bookingId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: 'Error al confirmar la reserva.',
          data: null
        };
      }

      // Enviar email de confirmación al cliente
      try {
        const { subject, html } = generateBookingConfirmedEmail(booking);
        await sendEmailWithResend(booking.email, subject, html, context.locals.runtime);
      } catch (emailError) {
      }

      return {
        success: true,
        message: 'Reserva confirmada exitosamente.',
        data: { booking }
      };

    } catch (error) {
      return {
        success: false,
        error: 'Error interno del servidor.',
        data: null
      };
    }
  }
});

// Action para actualizar booking
const updateBooking = defineAction({
  accept: 'form',
  input: updateBookingSchema,
  handler: async (input, context) => {
    const supabaseAdmin = createSupabaseAdmin(context.locals.runtime);
    try {
      const { id, ...updateData } = input;
      
      // Obtener la reserva actual para comparar cambios
      const { data: currentBooking, error: fetchError } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        return {
          success: false,
          error: 'Error al obtener la reserva actual.',
          data: null
        };
      }
      
      // Remover campos undefined
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      // Detectar cambios significativos para email
      const significantChanges: string[] = [];
      if (cleanData.preferred_date && cleanData.preferred_date !== currentBooking.preferred_date) {
        const oldDate = new Date(currentBooking.preferred_date).toLocaleDateString('es-ES');
        const newDate = new Date(cleanData.preferred_date).toLocaleDateString('es-ES');
        significantChanges.push(`Fecha cambiada de ${oldDate} a ${newDate}`);
      }
      if (cleanData.preferred_time && cleanData.preferred_time !== currentBooking.preferred_time) {
        significantChanges.push(`Hora cambiada de ${currentBooking.preferred_time} a ${cleanData.preferred_time}`);
      }
      if (cleanData.total_price && cleanData.total_price !== currentBooking.total_price) {
        significantChanges.push(`Precio actualizado de €${currentBooking.total_price} a €${cleanData.total_price}`);
      }
      if (cleanData.studio_space && cleanData.studio_space !== currentBooking.studio_space) {
        significantChanges.push(`Espacio cambiado de ${currentBooking.studio_space} a ${cleanData.studio_space}`);
      }

      const { data: booking, error } = await supabaseAdmin
        .from('bookings')
        .update({
          ...cleanData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: 'Error al actualizar la reserva.',
          data: null
        };
      }

      // Enviar email de actualización si hay cambios significativos
      if (significantChanges.length > 0) {
        try {
          const { subject, html } = generateBookingUpdatedEmail(booking, significantChanges);
          await sendEmailWithResend(booking.email, subject, html, context.locals.runtime);
        } catch (emailError) {
        }
      }

      // Enviar email de solicitud de reseña si el estado cambió a 'completed'
      if (cleanData.status === 'completed' && currentBooking.status !== 'completed') {
        try {
          // Delay de 1 segundo para evitar rate limit
          await new Promise(resolve => setTimeout(resolve, 1000));
          await sendReviewRequestEmail(booking, context.locals.runtime);
        } catch (emailError) {
          console.error('Error enviando email de reseña:', emailError);
        }
      }

      return {
        success: true,
        message: cleanData.status === 'completed'
          ? 'Reserva completada. Se ha enviado solicitud de reseña al cliente.'
          : 'Reserva actualizada exitosamente.',
        data: { booking }
      };

    } catch (error) {
      return {
        success: false,
        error: 'Error interno del servidor.',
        data: null
      };
    }
  }
});

// Action para cancelar booking
const cancelBooking = defineAction({
  accept: 'form',
  input: cancelBookingSchema,
  handler: async (input, context) => {
    const supabaseAdmin = createSupabaseAdmin(context.locals.runtime);
    try {
      const { data: booking, error } = await supabaseAdmin
        .from('bookings')
        .update({
          status: 'cancelled',
          cancellation_reason: input.reason || null,
          cancelled_at: new Date().toISOString()
        })
        .eq('id', input.bookingId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: 'Error al cancelar la reserva.',
          data: null
        };
      }

      // Enviar email de cancelación
      try {
        const { subject, html } = generateBookingCancelledEmail(booking, input.reason);
        await sendEmailWithResend(booking.email, subject, html, context.locals.runtime);
      } catch (emailError) {
      }

      return {
        success: true,
        message: 'Reserva cancelada exitosamente.',
        data: { booking }
      };

    } catch (error) {
      return {
        success: false,
        error: 'Error interno del servidor.',
        data: null
      };
    }
  }
});

// Action para formulario de contacto
const contactForm = defineAction({
  accept: 'form',
  input: contactFormSchema,
  handler: async (input, context) => {
    
    try {
      const adminEmail = context.locals.runtime?.env?.ADMIN_EMAIL || 'contacto@contentstudiokrp.es';
      
      // Enviar emails usando las funciones centralizadas (con delay para evitar rate limit)
      try {
        // Email al cliente
        const { subject: clientSubject, html: clientHtml } = generateContactConfirmationEmail(input);
        const clientEmailResult = await sendEmailWithResend(input.email, clientSubject, clientHtml, context.locals.runtime);
        
        // Delay de 1 segundo para evitar el límite de tasa de Resend (2 req/sec)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Email al admin
        const { subject: adminSubject, html: adminHtml } = generateContactNotificationEmail(input);
        const adminEmailResult = await sendEmailWithResend(adminEmail, adminSubject, adminHtml, context.locals.runtime);
        
        
        // Si al menos uno de los emails se envió, consideramos exitoso
        if (clientEmailResult.success || adminEmailResult.success) {
          return {
            success: true,
            message: 'Mensaje enviado exitosamente. Te hemos enviado una confirmación por email.',
            data: null
          };
        } else {
          return {
            success: false,
            error: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.',
            data: null
          };
        }
      } catch (emailError) {
        console.error('Error al enviar emails de contacto:', emailError);
        return {
          success: false,
          error: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.',
          data: null
        };
      }

    } catch (error) {
      console.error('Error en contactForm action:', error);
      
      // Si es un error de validación de Zod
      if (error && typeof error === 'object' && 'issues' in error) {
        const validationError = error as any;
        const firstIssue = validationError.issues?.[0];
        return {
          success: false,
          error: firstIssue?.message || 'Error de validación en el formulario.',
          data: null
        };
      }
      
      return {
        success: false,
        error: 'Error interno del servidor.',
        data: null
      };
    }
  }
});

// Exportación requerida por Astro Actions
export const server = {
  createBooking,
  confirmBooking,
  updateBooking,
  cancelBooking,
  contactForm
};


