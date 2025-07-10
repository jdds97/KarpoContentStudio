// Tests para lib/supabase.ts
import { createSupabaseClient, createSupabaseAdmin } from '@/lib/supabase';

// Mock supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null }))
    }
  }))
}));

describe('Supabase Client', () => {
  beforeEach(() => {
    // Mock environment variables
    process.env.PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  });

  describe('createSupabaseClient', () => {
    test('debe crear cliente Supabase público', () => {
      const client = createSupabaseClient();
      expect(client).toBeDefined();
      expect(client.from).toBeDefined();
      expect(client.auth).toBeDefined();
    });

    test('debe poder hacer queries básicas', async () => {
      const client = createSupabaseClient();
      const result = await client.from('bookings').select('*');
      expect(result).toBeDefined();
    });
  });

  describe('createSupabaseAdmin', () => {
    test('debe crear cliente admin de Supabase', () => {
      const admin = createSupabaseAdmin();
      expect(admin).toBeDefined();
      expect(admin.from).toBeDefined();
    });

    test('debe tener permisos de admin', async () => {
      const admin = createSupabaseAdmin();
      const result = await admin.from('bookings').select('*');
      expect(result).toBeDefined();
    });
  });
});
