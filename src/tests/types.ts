// Types específicos para testing
export interface MockSupabaseChain {
  select: jest.Mock;
  eq: jest.Mock;
  in: jest.Mock;
}

export interface MockSupabaseClient {
  from: jest.Mock;
}

export interface TestApiResponse {
  available: boolean;
  error?: string;
  reason?: string;
  requestedSlots?: string[];
  timeSlots?: string[];
}

export interface TestBookingData {
  id?: number;
  preferred_date: string;
  preferred_time: string;
  package_duration: string;
  studio_space: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface TestSupabaseResponse {
  data: TestBookingData[] | null;
  error: { message: string } | null;
}

export interface TestApiContext {
  url: URL;
  request?: Request;
}

export interface TestValidationResult {
  valid: boolean;
  message: string;
  warnings?: string[];
}

// Tipos para contexto de Astro Actions
export interface MockAstroContext {
  locals: {
    runtime?: {
      env?: Record<string, string>;
    };
    user?: any;
    session?: any;
  };
  request: Request;
  params: Record<string, string | undefined>;
  url: URL;
  redirect: (url: string, status?: number) => Response;
  cookies: {
    get: (name: string) => { value: string } | undefined;
    set: (name: string, value: string, options?: any) => void;
    delete: (name: string, options?: any) => void;
  };
}

// Tipos para mocks de respuesta
export interface MockResponseInit {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
}

export interface MockFetchResponse {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  json: () => Promise<any>;
  text: () => Promise<string>;
  blob: () => Promise<Blob>;
  arrayBuffer: () => Promise<ArrayBuffer>;
  formData: () => Promise<FormData>;
}