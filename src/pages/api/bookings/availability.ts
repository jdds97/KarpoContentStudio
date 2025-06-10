// Endpoint para verificar disponibilidad en tiempo real
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ url }) => {
  try {
    const studioSpace = url.searchParams.get("studio_space");
    const date = url.searchParams.get("date");
    const time = url.searchParams.get("time");

    if (!studioSpace || !date || !time) {
      return new Response(
        JSON.stringify({ 
          error: "Parámetros studio_space, date y time son obligatorios" 
        }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Verificar disponibilidad
    const { data: isAvailable, error } = await supabase
      .rpc('check_availability', {
        p_studio_space: studioSpace,
        p_date: date,
        p_time: time
      });

    if (error) {
      console.error('Error checking availability:', error);
      return new Response(
        JSON.stringify({ 
          error: "Error al verificar disponibilidad" 
        }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        available: isAvailable,
        studio_space: studioSpace,
        date: date,
        time: time
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
