// Endpoint para cerrar sesión
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });
  return redirect("/admin/login");
};
