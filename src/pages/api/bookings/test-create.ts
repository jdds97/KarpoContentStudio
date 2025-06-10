// Endpoint simplificado para crear reservas de prueba
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    
    const bookingData = {
      name: formData.get("name")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      phone: formData.get("phone")?.toString() || "",
      company: formData.get("company")?.toString() || null,
      studio_space: formData.get("studio-space")?.toString() || "",
      package_duration: formData.get("package")?.toString() || "",
      preferred_date: formData.get("date")?.toString() || "",
      preferred_time: formData.get("time")?.toString() || "",
      participants: parseInt(formData.get("participants")?.toString() || "1"),
      session_type: formData.get("session-type")?.toString() || "",
      notes: formData.get("notes")?.toString() || null,
      status: 'pending' as const
    };

    console.log('Datos a insertar:', bookingData);

    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      return new Response(
        JSON.stringify({ 
          error: "Error al crear la reserva",
          details: error.message
        }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Reserva creada exitosamente",
        booking: data
      }), 
      { 
        status: 201,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : String(error)
      }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
