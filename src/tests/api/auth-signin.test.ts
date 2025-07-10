// Tests para pages/api/auth/signin.ts
import { GET, POST } from '@/pages/api/auth/signin';

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  createSupabaseAdmin: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn()
    }
  }))
}));

describe('API: /api/auth/signin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    test('debe procesar login exitoso', async () => {
      const { createSupabaseAdmin } = require('@/lib/supabase');
      const mockSupabase = createSupabaseAdmin();
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: '123', email: 'admin@test.com' } },
        error: null
      });

      const request = new Request('http://localhost/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@test.com', password: 'password' })
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    test('debe rechazar credenciales inválidas', async () => {
      const { createSupabaseAdmin } = require('@/lib/supabase');
      const mockSupabase = createSupabaseAdmin();
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' }
      });

      const request = new Request('http://localhost/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'wrong@test.com', password: 'wrongpass' })
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    test('debe validar datos requeridos', async () => {
      const request = new Request('http://localhost/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Sin email ni password
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('GET', () => {
    test('debe retornar método no permitido', async () => {
      const request = new Request('http://localhost/api/auth/signin');
      const response = await GET(request);
      expect(response.status).toBe(405);
    });
  });
});
