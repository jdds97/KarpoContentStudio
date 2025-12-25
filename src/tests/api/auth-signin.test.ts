// Tests para pages/api/auth/signin.ts
import { GET, POST } from '@/pages/api/auth/signin';

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  createSupabaseClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({
        data: {
          user: { id: '123', email: 'admin@test.com' },
          session: { access_token: 'mock-token', refresh_token: 'mock-refresh' }
        },
        error: null
      })
    }
  }))
}));

// Helper para crear contexto de API
const createAuthContext = (request: Request, overrides: any = {}) => ({
  request,
  redirect: jest.fn((url: string) => new Response(null, {
    status: 302,
    headers: { Location: url }
  })),
  cookies: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  },
  locals: {
    runtime: {
      env: {
        SUPABASE_URL: 'https://mock-project.supabase.co',
        SUPABASE_ANON_KEY: 'mock-anon-key'
      }
    }
  },
  ...overrides
});

describe('API: /api/auth/signin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    test('debe procesar login exitoso', async () => {
      const { createSupabaseClient } = require('@/lib/supabase');
      const mockSupabase = createSupabaseClient();
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: '123', email: 'admin@test.com' },
          session: { access_token: 'mock-token', refresh_token: 'mock-refresh' }
        },
        error: null
      });

      // Usar FormData en lugar de JSON
      const formData = new FormData();
      formData.append('email', 'admin@test.com');
      formData.append('password', 'password');

      const request = new Request('http://localhost/api/auth/signin', {
        method: 'POST',
        body: formData
      });

      const context = createAuthContext(request);
      const response = await POST(context as any);
      expect(response.status).toBe(200);
    });

    test('debe rechazar credenciales inválidas', async () => {
      const { createSupabaseClient } = require('@/lib/supabase');
      const mockSupabase = createSupabaseClient();
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' }
      });

      const formData = new FormData();
      formData.append('email', 'wrong@test.com');
      formData.append('password', 'wrongpass');

      const request = new Request('http://localhost/api/auth/signin', {
        method: 'POST',
        body: formData
      });

      const context = createAuthContext(request);
      const response = await POST(context as any);
      expect(response.status).toBe(400);
    });

    test('debe validar datos requeridos', async () => {
      const formData = new FormData();
      // Sin email ni password

      const request = new Request('http://localhost/api/auth/signin', {
        method: 'POST',
        body: formData
      });

      const context = createAuthContext(request);
      const response = await POST(context as any);
      expect(response.status).toBe(400);
    });
  });

  describe('GET', () => {
    test('debe redirigir al login', async () => {
      const request = new Request('http://localhost/api/auth/signin');
      const context = createAuthContext(request);
      const response = await GET(context as any);
      expect(response.status).toBe(302);
      expect(context.redirect).toHaveBeenCalledWith('/admin/login');
    });
  });
});
