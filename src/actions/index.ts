// Actions para manejo de reservas con integración de Resend
import { defineAction } from 'astro:actions';
import { createSupabaseAdmin } from '@/lib/supabase';
import { 
  createBookingSchema,
  confirmBookingSchema,
  updateBookingSchema,
  cancelBookingSchema,
  contactFormSchema
} from '@/utils/data/schemas';
import { 
  sendEmailWithResend,
  calculateTotalPrice,
  generateBookingConfirmationEmail,
  generateAdminBookingNotificationEmail,
  generateBookingConfirmedEmail,
  generateBookingCancelledEmail,
  generateBookingUpdatedEmail,
  generateContactConfirmationEmail,
  generateContactNotificationEmail
} from '@/utils/email-helpers';

// Action para crear una nueva reserva
const createBooking = defineAction({
  accept: 'form',
  input: createBookingSchema,
  handler: async (input, context) => {
    const supabaseAdmin = createSupabaseAdmin(context.locals.runtime);
    console.log('=== CREATE BOOKING ACTION CALLED ===');
    console.log('Input received:', Object.keys(input));
    
    try {
      // Convertir paquete a duración numérica para validación (1h -> 1, 2h -> 2, etc.)
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
        console.warn('Could not validate availability, proceeding with booking');
      }

      // Aplicar descuento si hay código válido
      let discountPercentage = 0;
      let finalDiscountCode = '';
      
      if (input['applied-discount-code']) {
        // Validar código de descuento
        const discountResponse = await fetch(`${siteUrl}/api/discount/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: input['applied-discount-code'] })
        });
        
        if (discountResponse.ok) {
          const discountData = await discountResponse.json();
          if (discountData.valid) {
            discountPercentage = discountData.percentage || 0;
            finalDiscountCode = input['applied-discount-code'];
          }
        }
      }

      // Calcular precio total usando la función centralizada
      const totalPrice = calculateTotalPrice(input.package, discountPercentage);

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
          discount_code: finalDiscountCode || null,
          discount_percentage: discountPercentage,
          total_price: totalPrice,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        return {
          success: false,
          error: 'Error al crear la reserva. Por favor, inténtalo de nuevo.',
          data: null
        };
      }

      // Enviar emails de confirmación con Resend
      try {
        // Email al cliente
        const { subject: clientSubject, html: clientHtml } = generateBookingConfirmationEmail(booking);
        const clientEmailResult = await sendEmailWithResend(input.email, clientSubject, clientHtml, context.locals.runtime);
        
        // Email al estudio/administración
        const studioEmail = context.locals.runtime?.env?.ADMIN_EMAIL || 'contacto@contentstudiokrp.es';
        const { subject: studioSubject, html: studioHtml } = generateAdminBookingNotificationEmail(booking);
        const studioEmailResult = await sendEmailWithResend(studioEmail, studioSubject, studioHtml, context.locals.runtime);
        
        if (!clientEmailResult.success) {
          console.warn('Failed to send client confirmation email:', clientEmailResult.error);
        }
        
        if (!studioEmailResult.success) {
          console.warn('Failed to send studio notification email:', studioEmailResult.error);
        }
      } catch (emailError) {
        console.warn('Email notification failed:', emailError);
        // No fallar la reserva si el email falla
      }

      return {
        success: true,
        message: 'Reserva creada exitosamente. Te hemos enviado un email de confirmación.',
        data: { booking }
      };

    } catch (error) {
      console.error('Error in createBooking action:', error);
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
      // Verificar password de admin
      const adminPassword = context.locals.runtime?.env?.ADMIN_PASSWORD || 'admin123';
      if (input.adminPassword !== adminPassword) {
        return {
          success: false,
          error: 'Password de administrador incorrecto.',
          data: null
        };
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
        console.error('Error confirming booking:', error);
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
        console.warn('Failed to send confirmation email:', emailError);
      }

      return {
        success: true,
        message: 'Reserva confirmada exitosamente.',
        data: { booking }
      };

    } catch (error) {
      console.error('Error in confirmBooking action:', error);
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
        console.error('Error fetching current booking:', fetchError);
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
        console.error('Error updating booking:', error);
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
          console.warn('Failed to send update notification email:', emailError);
        }
      }

      return {
        success: true,
        message: 'Reserva actualizada exitosamente.',
        data: { booking }
      };

    } catch (error) {
      console.error('Error in updateBooking action:', error);
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
        console.error('Error cancelling booking:', error);
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
        console.warn('Failed to send cancellation email:', emailError);
      }

      return {
        success: true,
        message: 'Reserva cancelada exitosamente.',
        data: { booking }
      };

    } catch (error) {
      console.error('Error in cancelBooking action:', error);
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
    console.log('=== CONTACT FORM ACTION CALLED ===');
    console.log('Input received:', Object.keys(input));
    
    try {
      const adminEmail = context.locals.runtime?.env?.ADMIN_EMAIL || 'contacto@contentstudiokrp.es';
      
      // Enviar emails usando las funciones centralizadas
      try {
        // Email al cliente
        const { subject: clientSubject, html: clientHtml } = generateContactConfirmationEmail(input);
        const clientEmailResult = await sendEmailWithResend(input.email, clientSubject, clientHtml, context.locals.runtime);
        
        // Email al admin
        const { subject: adminSubject, html: adminHtml } = generateContactNotificationEmail(input);
        const adminEmailResult = await sendEmailWithResend(adminEmail, adminSubject, adminHtml, context.locals.runtime);
        
        if (!clientEmailResult.success) {
          console.warn('Failed to send client confirmation email:', clientEmailResult.error);
        }
        
        if (!adminEmailResult.success) {
          console.warn('Failed to send admin notification email:', adminEmailResult.error);
        }
        
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
        console.error('Email sending failed:', emailError);
        return {
          success: false,
          error: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.',
          data: null
        };
      }

    } catch (error) {
      console.error('Error in contactForm action:', error);
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


