// Tests para API de validación de disponibilidad - Lógica Actual
import { GET } from '@/pages/api/calendar/validate-availability';

// Mock de Supabase que simula la lógica real
const mockSupabaseResponse = {
  data: [
    {
      id: 1,
      preferred_date: '2025-07-03',
      preferred_time: '14:00',
      package_duration: '2h',
      studio_space: 'principal-zone',
      status: 'confirmed'
    }
  ],
  error: null
};

// Mock global de supabase
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            in: jest.fn(() => Promise.resolve(mockSupabaseResponse))
          }))
        }))
      }))
    }))
  }
}));

describe('API: validate-availability (Lógica Actual)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validación de parámetros requeridos', () => {
    test('debe fallar si falta la fecha', async () => {
      const request = new Request('http://localhost:4321/api/calendar/validate-availability?time=14:00&studio_space=principal-zone');
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.available).toBe(false);
      expect(data.error).toBe('Parámetros requeridos: date, time, studio_space');
    });

    test('debe fallar si falta la hora', async () => {
      const request = new Request('http://localhost:4321/api/calendar/validate-availability?date=2025-07-04&studio_space=principal-zone');
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.available).toBe(false);
      expect(data.error).toBe('Parámetros requeridos: date, time, studio_space');
    });

    test('debe fallar si falta el espacio del estudio', async () => {
      const request = new Request('http://localhost:4321/api/calendar/validate-availability?date=2025-07-04&time=14:00');
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.available).toBe(false);
      expect(data.error).toBe('Parámetros requeridos: date, time, studio_space');
    });
  });

  describe('Validación con datos válidos', () => {
    test('debe procesar correctamente una solicitud válida sin conflictos', async () => {
      // Mock para no tener reservas conflictivas
      const { supabaseAdmin } = await import('@/lib/supabase');
      supabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              in: jest.fn(() => Promise.resolve({
                data: [], // Sin reservas existentes
                error: null
              }))
            }))
          }))
        }))
      });

      const request = new Request('http://localhost:4321/api/calendar/validate-availability?date=2025-07-04&time=10:00&duration=2&studio_space=principal-zone');
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
      expect(data.timeSlots).toBeDefined();
      expect(Array.isArray(data.timeSlots)).toBe(true);
    });

    test('debe detectar conflicto con reserva existente', async () => {
      // Usar el mock por defecto que tiene una reserva en 14:00
      const request = new Request('http://localhost:4321/api/calendar/validate-availability?date=2025-07-03&time=14:00&duration=2&studio_space=principal-zone');
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(false);
      expect(data.reason).toBe('El horario solicitado está ocupado');
      expect(data.timeSlots).toBeDefined();
    });

    test('debe permitir reserva en diferente espacio', async () => {
      // Mock con reserva en principal-zone pero consultamos black-zone
      const request = new Request('http://localhost:4321/api/calendar/validate-availability?date=2025-07-03&time=14:00&duration=2&studio_space=black-zone');
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
    });

    test('debe permitir reserva en horario diferente del mismo día', async () => {
      // Reserva existente a las 14:00, consultamos 10:00
      const request = new Request('http://localhost:4321/api/calendar/validate-availability?date=2025-07-03&time=10:00&duration=2&studio_space=principal-zone');
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
    });
  });

  describe('Manejo de errores de base de datos', () => {
    test('debe manejar error de base de datos graciosamente', async () => {
      // Mock error de Supabase
      const { supabaseAdmin } = await import('@/lib/supabase');
      supabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              in: jest.fn(() => Promise.resolve({
                data: null,
                error: { message: 'Database error' }
              }))
            }))
          }))
        }))
      });

      const request = new Request('http://localhost:4321/api/calendar/validate-availability?date=2025-07-04&time=14:00&duration=2&studio_space=principal-zone');
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.available).toBe(false);
      expect(data.error).toBe('Error al validar disponibilidad');
    });
  });

  describe('Validación de duración', () => {
    test('debe manejar duración por defecto (2 horas)', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase');
      supabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              in: jest.fn(() => Promise.resolve({
                data: [],
                error: null
              }))
            }))
          }))
        }))
      });

      const request = new Request('http://localhost:4321/api/calendar/validate-availability?date=2025-07-04&time=10:00&studio_space=principal-zone');
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
      expect(data.timeSlots).toHaveLength(2); // 2 slots de 1 hora cada uno
    });

    test('debe manejar duración personalizada', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase');
      supabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              in: jest.fn(() => Promise.resolve({
                data: [],
                error: null
              }))
            }))
          }))
        }))
      });

      const request = new Request('http://localhost:4321/api/calendar/validate-availability?date=2025-07-04&time=10:00&duration=4&studio_space=principal-zone');
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
      expect(data.timeSlots).toHaveLength(4); // 4 slots de 1 hora cada uno
    });
  });

  describe('Diferentes espacios del estudio', () => {
    test('debe validar para zona principal', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase');
      supabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              in: jest.fn(() => Promise.resolve({
                data: [],
                error: null
              }))
            }))
          }))
        }))
      });

      const request = new Request('http://localhost:4321/api/calendar/validate-availability?date=2025-07-04&time=10:00&duration=2&studio_space=principal-zone');
      
      const response = await GET({ request } as any);
      
      expect(response.status).toBe(200);
    });

    test('debe validar para zona negra', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase');
      supabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              in: jest.fn(() => Promise.resolve({
                data: [],
                error: null
              }))
            }))
          }))
        }))
      });

      const request = new Request('http://localhost:4321/api/calendar/validate-availability?date=2025-07-04&time=10:00&duration=2&studio_space=black-zone');
      
      const response = await GET({ request } as any);
      
      expect(response.status).toBe(200);
    });

    test('debe validar para ciclorama', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase');
      supabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              in: jest.fn(() => Promise.resolve({
                data: [],
                error: null
              }))
            }))
          }))
        }))
      });

      const request = new Request('http://localhost:4321/api/calendar/validate-availability?date=2025-07-04&time=10:00&duration=2&studio_space=cyclorama');
      
      const response = await GET({ request } as any);
      
      expect(response.status).toBe(200);
    });
  });
});
