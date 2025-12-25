// Endpoint para obtener disponibilidad de un mes específico
import type { APIRoute } from "astro";
import { createSupabaseAdmin } from "@/lib/supabase";

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const supabaseAdmin = createSupabaseAdmin(locals.runtime);
    if (!supabaseAdmin) {
      throw new Error('Failed to create Supabase admin client');
    }
    const year = parseInt(url.searchParams.get("year") || new Date().getFullYear().toString());
    const month = parseInt(url.searchParams.get("month") || (new Date().getMonth() + 1).toString());
    const studioSpace = url.searchParams.get("studio_space") || "all";

    // Calcular primer y último día del mes
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Obtener todas las reservas del mes
    let query = supabaseAdmin
      .from('bookings')
      .select('*')
      .gte('preferred_date', startDateStr)
      .lte('preferred_date', endDateStr)
      .in('status', ['pending', 'confirmed']);

    if (studioSpace !== "all") {
      query = query.eq('studio_space', studioSpace);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      return new Response(
        JSON.stringify({ 
          error: "Error al obtener reservas" 
        }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Organizar reservas por fecha
    const bookingsByDate: Record<string, any[]> = {};
    bookings?.forEach(booking => {
      const date = booking.preferred_date;
      if (!bookingsByDate[date]) {
        bookingsByDate[date] = [];
      }
      bookingsByDate[date].push({
        id: booking.id,
        time: booking.preferred_time,
        studio_space: booking.studio_space,
        client_name: booking.name,
        status: booking.status,
        session_type: booking.session_type,
        duration: booking.package_duration
      });
    });

    // Generar calendario del mes
    const calendar = [];
    const daysInMonth = endDate.getDate();
    const firstDayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Días anteriores del mes (para completar la semana)
    const prevMonthDate = new Date(year, month - 1, 0); // Último día del mes anterior
    const prevMonthYear = month === 1 ? year - 1 : year;
    const prevMonthNum = month === 1 ? 12 : month - 1;
    const daysInPrevMonth = prevMonthDate.getDate();
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Ajustar para que lunes sea 0

    for (let i = daysFromPrevMonth; i > 0; i--) {
      const day = daysInPrevMonth - i + 1;
      const dateStr = `${prevMonthYear}-${String(prevMonthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      calendar.push({
        date: dateStr,
        day: day,
        isCurrentMonth: false,
        isToday: false,
        bookings: []
      });
    }

    // Días del mes actual
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    for (let day = 1; day <= daysInMonth; day++) {
      // Crear fecha en formato YYYY-MM-DD sin problemas de timezone
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      calendar.push({
        date: dateStr,
        day: day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        bookings: bookingsByDate[dateStr] || [],
        availableSlots: calculateAvailableSlots(dateStr, bookingsByDate[dateStr] || [], studioSpace)
      });
    }

    // Días del siguiente mes (para completar la última semana)
    const totalCells = Math.ceil(calendar.length / 7) * 7;
    const nextMonthYear = month === 12 ? year + 1 : year;
    const nextMonthNum = month === 12 ? 1 : month + 1;
    let dayCounter = 1;

    while (calendar.length < totalCells) {
      const dateStr = `${nextMonthYear}-${String(nextMonthNum).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
      calendar.push({
        date: dateStr,
        day: dayCounter,
        isCurrentMonth: false,
        isToday: false,
        bookings: []
      });
      dayCounter++;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        calendar,
        month: month,
        year: year,
        monthName: startDate.toLocaleDateString('es-ES', { month: 'long' }),
        totalBookings: bookings?.length || 0
      }), 
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: "Error interno del servidor" 
      }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

// Función para calcular slots disponibles en un día
function calculateAvailableSlots(_date: string, bookings: any[], _studioSpace: string) {
  const allSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];
  
  const bookedSlots = bookings.map(b => b.time);
  const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
  
  return {
    total: allSlots.length,
    available: availableSlots.length,
    booked: bookedSlots.length,
    availableSlots,
    bookedSlots
  };
}
