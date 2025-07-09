// API wrapper para actualizar reservas - Usa Actions centralizadas
import type { APIRoute } from "astro";
import { createSupabaseClient } from "../../../lib/supabase";
import { actions } from "astro:actions";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseClient();
  try {
    // Verificar autenticación
    const accessToken = cookies.get("sb-access-token");
    const refreshToken = cookies.get("sb-refresh-token");

    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "No autorizado" 
      }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Verificar sesión
    const { error: sessionError } = await supabase.auth.setSession({
      refresh_token: refreshToken.value,
      access_token: accessToken.value,
    });

    if (sessionError) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Sesión inválida" 
      }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Obtener datos del body
    const updateData = await request.json();

    if (!updateData.id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "ID de reserva es obligatorio" 
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }


    // Preparar FormData para la action
    const formData = new FormData();
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // Usar la action centralizada de updateBooking
    const result = await actions.updateBooking(formData);


    // Procesar resultado de la acción
    if (result.error) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: result.error.message || 'Error al procesar la actualización' 
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!result.data?.success) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: result.data?.error || 'Error desconocido en la actualización' 
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }


    return new Response(JSON.stringify({
      success: true,
      booking: result.data.data?.booking,
      message: result.data.message || "Reserva actualizada exitosamente"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: "Error interno del servidor"
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
