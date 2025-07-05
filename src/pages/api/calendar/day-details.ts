// API optimizada para obtener detalles de un día específico
import type { APIRoute } from "astro";
import { createSupabaseAdmin } from "@/lib/supabase";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const supabaseAdmin = createSupabaseAdmin();
  try {
    const date = url.searchParams.get("date");
    const studioSpace = url.searchParams.get("studio_space") || "all";

    if (!date) {
      return new Response(
        JSON.stringify({ error: "Fecha requerida" }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Obtener reservas para el día específico
    let query = supabaseAdmin
      .from('bookings')
      .select('preferred_time, studio_space, package_duration, status, session_type, name')
      .eq('preferred_date', date)
      .in('status', ['pending', 'confirmed'])
      .order('preferred_time');

    if (studioSpace !== "all") {
      query = query.eq('studio_space', studioSpace);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error('Error fetching day bookings:', error);
      return new Response(
        JSON.stringify({ 
          error: "Error al obtener reservas del día",
          occupied_slots: []
        }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Calcular slots ocupados y pendientes por separado
    const occupiedSlots: string[] = [];
    const pendingSlots: string[] = [];
    const bookingDetails: any[] = [];

    bookings?.forEach(booking => {

      // Calcular slots ocupados por esta reserva
      const slots = calculateOccupiedSlots(
        booking.preferred_time, 
        booking.package_duration
      );
      
      // Separar por estado
      if (booking.status === 'pending') {
        pendingSlots.push(...slots);
      } else if (booking.status === 'confirmed') {
        occupiedSlots.push(...slots);
      }
      
      // Agregar detalles de la reserva
      bookingDetails.push({
        start_time: booking.preferred_time,
        duration: booking.package_duration,
        studio_space: booking.studio_space,
        session_type: booking.session_type,
        status: booking.status,
        client_name: booking.name?.split(' ')[0] || 'Cliente', // Solo primer nombre
        occupied_slots: slots
      });
    });

    // Eliminar duplicados y ordenar
    const uniqueOccupiedSlots = [...new Set(occupiedSlots)].sort();
    const uniquePendingSlots = [...new Set(pendingSlots)].sort();

    // Generar todos los horarios disponibles
    const allSlots = [
      '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
      '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
    ];

    const availableSlots = allSlots.filter(slot => 
      !uniqueOccupiedSlots.includes(slot) && !uniquePendingSlots.includes(slot)
    );

    return new Response(
      JSON.stringify({
        success: true,
        date,
        studio_space: studioSpace,
        occupied_slots: uniqueOccupiedSlots,
        pending_slots: uniquePendingSlots,
        available_slots: availableSlots,
        total_slots: allSlots.length,
        available_count: availableSlots.length,
        occupied_count: uniqueOccupiedSlots.length,
        pending_count: uniquePendingSlots.length,
        bookings: bookingDetails
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Unexpected error in day-details:', error);
    return new Response(
      JSON.stringify({ 
        error: "Error interno del servidor",
        occupied_slots: []
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

// Función para calcular slots ocupados por una reserva
function calculateOccupiedSlots(startTime: string, packageDuration: string): string[] {
  const allSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  // Normalizar el tiempo a formato HH:00
  let normalizedTime = startTime;
  if (startTime && !startTime.includes(':')) {
    // Si viene como "10" convertir a "10:00"
    normalizedTime = `${startTime.padStart(2, '0')}:00`;
  } else if (startTime && startTime.length === 8) {
    // Si viene como "10:00:00" convertir a "10:00"
    normalizedTime = startTime.substring(0, 5);
  } else if (startTime && startTime.length === 5) {
    // Si viene como "10:30" convertir a "10:00"
    normalizedTime = startTime.substring(0, 2) + ':00';
  }

  // Parsear duración (ej: "2h" -> 2)
  const duration = parseInt(packageDuration?.replace('h', '') || '1');
  const startIndex = allSlots.indexOf(normalizedTime);
  
  if (startIndex === -1) {
    return [];
  }

  const occupiedSlots = [];
  for (let i = 0; i < duration; i++) {
    const slotIndex = startIndex + i;
    if (slotIndex < allSlots.length) {
      occupiedSlots.push(allSlots[slotIndex]);
    }
  }

  return occupiedSlots;
}