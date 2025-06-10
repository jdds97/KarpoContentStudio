// Endpoint para listar reservas (solo admin)
import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../../lib/supabase";

export const GET: APIRoute = async ({ url, cookies }) => {
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
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const status = url.searchParams.get("status");
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      return new Response(
        JSON.stringify({ error: "Error al obtener reservas" }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        bookings: data,
        total: count,
        page,
        totalPages: Math.ceil((count || 0) / limit)
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
