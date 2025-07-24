import type { APIRoute } from "astro";
import { createSupabaseAdmin } from "@/lib/supabase";

export const prerender = false;

// Helper function to parse package duration
function parseDuration(packageValue: string): number {
  if (!packageValue) return 60;
  
  // Handle both duration parameter and package formats
  if (packageValue.includes('h')) {
    return parseInt(packageValue.replace('h', '')) * 60;
  }
  
  return parseInt(packageValue) || 60;
}

// Helper function to generate hourly slots
function generateTimeSlots(startTime: string, durationMinutes: number): string[] {
  const slots: string[] = [];
  const start = new Date(`2000-01-01T${startTime}:00`);
  const hours = Math.ceil(durationMinutes / 60);
  
  for (let i = 0; i < hours; i++) {
    const slotTime = new Date(start.getTime() + i * 60 * 60 * 1000);
    const timeStr = slotTime.toTimeString().slice(0, 5);
    slots.push(timeStr);
  }
  
  return slots;
}

export const GET: APIRoute = async ({ url, locals }) => {
  const supabaseAdmin = createSupabaseAdmin(locals.runtime);
  try {
    const date = url.searchParams.get("date");
    const time = url.searchParams.get("time");
    const studioSpace = url.searchParams.get("studio_space");
    const packageParam = url.searchParams.get("package") || url.searchParams.get("duration");
    
    // Parse duration from package or duration parameter
    const durationMinutes = parseDuration(packageParam || "60");

    if (!date || !time || !studioSpace) {
      return new Response(
        JSON.stringify({ 
          error: "Fecha y hora son requeridas",
          available: false
        }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Validate date is not in the past
    const requestedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (requestedDate < today) {
      return new Response(
        JSON.stringify({ 
          available: false,
          reason: "La fecha seleccionada ya ha pasado",
          date,
          time,
          studio_space: studioSpace
        }), 
        { 
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return new Response(
        JSON.stringify({ 
          available: false,
          reason: "Horario inválido",
          date,
          time,
          studio_space: studioSpace
        }), 
        { 
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Check if session ends before 22:00 (studio closing time)
    const sessionStart = new Date(`${date}T${time}:00`);
    const sessionEnd = new Date(sessionStart.getTime() + durationMinutes * 60000);
    const closingTime = new Date(`${date}T22:00:00`);
    
    if (sessionEnd > closingTime) {
      const endTimeStr = sessionEnd.toTimeString().slice(0, 5);
      return new Response(
        JSON.stringify({ 
          available: false,
          reason: `La sesión terminaría a las ${endTimeStr}, pero el estudio cierra a las 22:00`,
          date,
          time,
          studio_space: studioSpace
        }), 
        { 
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Check for invalid duration (0 or negative)
    if (durationMinutes <= 0) {
      return new Response(
        JSON.stringify({ 
          available: false,
          reason: "Duración inválida",
          date,
          time,
          studio_space: studioSpace,
          requestedSlots: []
        }), 
        { 
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Obtener reservas existentes para validar disponibilidad
    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select('preferred_time, package_duration, status')
      .eq('preferred_date', date)
      .eq('studio_space', studioSpace)
      .in('status', ['pending', 'confirmed']);

    if (error) {
      console.error('Error fetching bookings:', error);
      return new Response(
        JSON.stringify({ 
          error: "Error al validar disponibilidad",
          available: false
        }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Generate requested time slots
    const requestedSlots = generateTimeSlots(time, durationMinutes);
    
    // Find conflicts with existing bookings
    const conflicts: string[] = [];
    const requestedStartTime = new Date(`${date}T${time}:00`);
    const requestedEndTime = new Date(requestedStartTime.getTime() + durationMinutes * 60000);

    bookings?.forEach(booking => {
      const bookingStartTime = new Date(`${date}T${booking.preferred_time}:00`);
      let bookingDurationMinutes = 60; // default
      
      // Parse package duration from booking
      if (booking.package_duration) {
        if (typeof booking.package_duration === 'string' && booking.package_duration.includes('h')) {
          bookingDurationMinutes = parseInt(booking.package_duration.replace('h', '')) * 60;
        } else {
          bookingDurationMinutes = parseInt(booking.package_duration) || 60;
        }
      }
      
      const bookingEndTime = new Date(bookingStartTime.getTime() + bookingDurationMinutes * 60000);

      // Check for overlap
      if (requestedStartTime < bookingEndTime && requestedEndTime > bookingStartTime) {
        // Add conflicting hours to conflicts array
        const bookingSlots = generateTimeSlots(booking.preferred_time, bookingDurationMinutes);
        bookingSlots.forEach(slot => {
          if (requestedSlots.includes(slot) && !conflicts.includes(slot)) {
            conflicts.push(slot);
          }
        });
      }
    });

    const isAvailable = conflicts.length === 0;
    
    // Prepare response
    const response = {
      available: isAvailable,
      date,
      time,
      studio_space: studioSpace,
      duration: durationMinutes,
      requestedSlots,
      conflicts: conflicts.length > 0 ? conflicts : undefined
    };

    // Add reason based on availability
    if (isAvailable) {
      (response as any).reason = "Disponible";
    } else if (conflicts.length > 0) {
      (response as any).reason = "El horario solicitado está ocupado";
    }

    return new Response(
      JSON.stringify(response), 
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Error in validate-availability:', error);
    return new Response(
      JSON.stringify({ 
        error: "Error interno del servidor",
        available: false
      }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};