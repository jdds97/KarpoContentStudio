/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly PUBLIC_SUPABASE_URL: string;
    readonly PUBLIC_SUPABASE_ANON_KEY: string;
    readonly SUPABASE_SERVICE_ROLE_KEY: string;
  }
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Extend Astro.locals to include runtime for server islands
declare namespace App {
  interface Locals {
    runtime?: {
      env: {
        PUBLIC_SUPABASE_URL: string;
        PUBLIC_SUPABASE_ANON_KEY: string;
        SUPABASE_SERVICE_ROLE_KEY: string;
      };
    };
  }
}

// Tipos para las funciones del calendario
declare global {
  interface Window {
    selectTimeSlot: (time: string, date: string) => void;
    scrollToForm: () => void;
  }
}
