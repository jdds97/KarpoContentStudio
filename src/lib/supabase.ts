import { createClient } from "@supabase/supabase-js";

// Función para crear cliente Supabase con las variables de entorno
export function createSupabaseClient(runtime?: any) {
  // En Cloudflare Pages, las variables están en runtime.env
  // En desarrollo, están en import.meta.env o process.env
  const supabaseUrl = runtime?.env?.SUPABASE_URL || 
                     import.meta.env.SUPABASE_URL || 
                     process.env.SUPABASE_URL;
  const supabaseAnonKey = runtime?.env?.SUPABASE_ANON_KEY || 
                         import.meta.env.SUPABASE_ANON_KEY || 
                         process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(`Missing Supabase config: URL=${!!supabaseUrl}, Key=${!!supabaseAnonKey}`);
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: "pkce", // Para mejor seguridad con OAuth
    },
  });
}

// Cliente con privilegios de servicio (solo para server-side)
export function createSupabaseAdmin(runtime?: any) {
  // En desarrollo, Astro no tiene locals.runtime, usar variables de entorno directamente
  const supabaseUrl = runtime?.env?.SUPABASE_URL || 
                     import.meta.env.SUPABASE_URL || 
                     process.env.SUPABASE_URL;
  const supabaseServiceKey = runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || 
                            import.meta.env.SUPABASE_SERVICE_ROLE_KEY || 
                            process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = runtime?.env?.SUPABASE_ANON_KEY || 
                         import.meta.env.SUPABASE_ANON_KEY || 
                         process.env.SUPABASE_ANON_KEY;
  
  console.log('Supabase config check:', {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey,
    hasAnonKey: !!supabaseAnonKey,
    isRuntime: !!runtime,
    url: supabaseUrl?.substring(0, 30) + '...', // Solo primeros caracteres para debug
  });
  
  if (!supabaseUrl) {
    throw new Error(`Missing SUPABASE_URL`);
  }
  
  if (!supabaseServiceKey && !supabaseAnonKey) {
    throw new Error(`Missing SUPABASE_SERVICE_ROLE_KEY and SUPABASE_ANON_KEY`);
  }
  
  return createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Cliente por defecto para desarrollo (sin runtime)
// export const supabase = createSupabaseClient();
