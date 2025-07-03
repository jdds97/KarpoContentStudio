/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Tipos para las funciones del calendario
declare global {
  interface Window {
    selectTimeSlot: (time: string, date: string) => void;
    scrollToForm: () => void;
  }
}
