// Endpoint para crear una nueva reserva
import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  try {
    // Detectar el tipo de contenido
    const contentType = request.headers.get("content-type") || "";
    let requestData: any = {};

    if (contentType.includes("application/json")) {
      // Manejar JSON
      requestData = await request.json();
    } else {
      // Manejar FormData
      const formData = await request.formData();
      requestData = Object.fromEntries(formData.entries());
    }

    // Mapear los datos al formato de la base de datos
    const bookingData = {
      name: requestData.client_name || requestData.name || "",
      email: requestData.client_email || requestData.email || "",
      phone: requestData.client_phone || requestData.phone || "",
      company: requestData.client_company || requestData.company || null,
      studio_space: requestData.studio_space || requestData["studio-space"] || "",
      package_duration: requestData.session_duration || requestData.package_duration || requestData.package || "",
      preferred_date: requestData.booking_date || requestData.preferred_date || requestData.date || "",
      preferred_time: requestData.booking_time || requestData.preferred_time || requestData.time || "",
      participants: parseInt(requestData.num_participants?.split('-')[0] || requestData.participants || "1"),
      session_type: requestData.session_type || requestData["session-type"] || "",
      notes: requestData.special_requirements || requestData.notes || null,
      status: 'pending'
    };

    // Validaciones básicas
    if (!bookingData.name || !bookingData.email || !bookingData.phone) {
      return new Response(
        JSON.stringify({ 
          error: "Nombre, email y teléfono son campos obligatorios" 
        }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    if (!bookingData.studio_space || !bookingData.preferred_date || !bookingData.preferred_time) {
      return new Response(
        JSON.stringify({ 
          error: "Área del estudio, fecha y hora son campos obligatorios" 
        }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    // Verificar disponibilidad antes de crear la reserva
    const { data: availabilityCheck, error: availabilityError } = await supabaseAdmin
      .rpc('check_availability', {
        p_studio_space: bookingData.studio_space,
        p_date: bookingData.preferred_date,
        p_time: bookingData.preferred_time
      });

    if (availabilityError) {
      console.error('Error checking availability:', availabilityError);
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

    if (!availabilityCheck) {
      return new Response(
        JSON.stringify({ 
          error: "La fecha y hora seleccionadas no están disponibles" 
        }), 
        { 
          status: 409,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Insertar la reserva
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating booking:', insertError);
      return new Response(
        JSON.stringify({ 
          error: "Error al crear la reserva. Por favor, inténtalo de nuevo.",
          details: insertError.message
        }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Respuesta exitosa
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Reserva creada exitosamente",
        booking: insertData
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
        error: "Error interno del servidor" 
      }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
