// Endpoint de prueba para verificar conexión con Supabase
import type { APIRoute } from "astro";
import { supabase, supabaseAdmin } from "../../../lib/supabase";

export const GET: APIRoute = async () => {
  try {
    // 1. Probar conexión básica
    const { data: connectionTest, error: connectionError } = await supabase
      .from('bookings')
      .select('count', { count: 'exact', head: true });

    if (connectionError) {
      console.error('Connection error:', connectionError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Error de conexión con Supabase",
          details: connectionError.message
        }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // 2. Probar función RPC de disponibilidad
    const { data: availabilityTest, error: rpcError } = await supabase
      .rpc('check_availability', {
        p_studio_space: 'Zona Principal',
        p_date: '2025-06-15',
        p_time: '10:00'
      });

    // 3. Obtener configuración del estudio
    const { data: config, error: configError } = await supabase
      .from('studio_config')
      .select('*');

    // 4. Probar con privilegios de admin
    const { data: adminTest, error: adminError } = await supabaseAdmin
      .from('bookings')
      .select('count', { count: 'exact', head: true });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "✅ Conexión con Supabase exitosa",
        tests: {
          basicConnection: {
            success: !connectionError,
            totalBookings: connectionTest || 0,
            error: connectionError?.message || null
          },
          rpcFunction: {
            success: !rpcError,
            availabilityResult: availabilityTest,
            error: rpcError?.message || null
          },
          studioConfig: {
            success: !configError,
            configItems: config?.length || 0,
            config: config || [],
            error: configError?.message || null
          },
          adminAccess: {
            success: !adminError,
            hasAdminAccess: !adminError,
            error: adminError?.message || null
          }
        },
        timestamp: new Date().toISOString()
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
        success: false,
        error: "Error inesperado",
        details: error instanceof Error ? error.message : String(error)
      }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
