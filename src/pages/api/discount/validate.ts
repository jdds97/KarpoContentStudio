// API para validar códigos de descuento
import type { APIRoute } from "astro";
import { createSupabaseAdmin } from "@/lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const supabaseAdmin = createSupabaseAdmin();
  try {
    const { code } = await request.json();
    
    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({
          valid: false,
          message: 'Código requerido'
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    const upperCode = code.toUpperCase().trim();
    
    // Buscar el código en la base de datos
    const { data: discountData, error } = await supabaseAdmin
      .from('discount_codes')
      .select('*')
      .eq('code', upperCode)
      .eq('active', true)
      .single();
    
    if (error || !discountData) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: 'Código de descuento inválido o no encontrado'
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    // Verificar límite de uso
    if (discountData.usage_count >= discountData.max_uses) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: `Este código ha alcanzado su límite de uso (${discountData.max_uses} usos)`
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    // Verificar fecha de expiración si existe
    if (discountData.expires_at && new Date(discountData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: 'Este código de descuento ha expirado'
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    // Código válido
    return new Response(
      JSON.stringify({
        valid: true,
        code: discountData.code,
        description: discountData.description,
        percentage: discountData.discount_percentage,
        minHours: discountData.min_hours,
        remainingUses: discountData.max_uses - discountData.usage_count,
        message: `Código válido: ${discountData.description}`
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
    
  } catch (error) {
    console.error('Error validating discount code:', error);
    return new Response(
      JSON.stringify({
        valid: false,
        message: 'Error interno al validar el código'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};