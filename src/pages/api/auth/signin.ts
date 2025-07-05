// Endpoint para iniciar sesión en el panel de administración
import type { APIRoute } from "astro";
import { createSupabaseClient } from "../../../lib/supabase";

export const prerender = false;

export const GET: APIRoute = async ({ redirect }) => {
  // Redirect GET requests to login page
  return redirect("/admin/login");
};

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const supabase = createSupabaseClient(locals?.runtime);
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Email y contraseña obligatorios" 
    }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { access_token, refresh_token } = data.session;
  cookies.set("sb-access-token", access_token, {
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "strict",
  });
  cookies.set("sb-refresh-token", refresh_token, {
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "strict",
  });
  
  return new Response(JSON.stringify({ 
    success: true, 
    redirectTo: "/admin/dashboard" 
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
