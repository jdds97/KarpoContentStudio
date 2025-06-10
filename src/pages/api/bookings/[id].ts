// Endpoint para actualizar el estado de una reserva
import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../../lib/supabase";

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  // Verificar autenticación
  const accessToken = cookies.get("sb-access-token");
  if (!accessToken) {
    return new Response(
      JSON.stringify({ error: "No autorizado" }), 
      { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const bookingId = params.id;
    const { status } = await request.json();

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: "ID de reserva requerido" }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return new Response(
        JSON.stringify({ error: "Estado inválido" }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking:', error);
      return new Response(
        JSON.stringify({ error: "Error al actualizar reserva" }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        booking: data
      }), 
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
