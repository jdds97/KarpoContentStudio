// Tests actualizados para validate-availability - Funciona con lógica actual
import { GET } from '@/pages/api/calendar/validate-availability';

// Mock funcional de Supabase
const createMockChain = (finalResult: any) => ({
  select: jest.fn(() => ({
    eq: jest.fn(() => ({
      eq: jest.fn(() => ({
        in: jest.fn(() => Promise.resolve(finalResult))
      }))
    }))
  }))
});

const mockSupabaseAdmin = {
  from: jest.fn()
};

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: mockSupabaseAdmin
}));

describe('API: validate-availability (Actualizado)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseAdmin.from.mockReturnValue(
      createMockChain({ data: [], error: null })
    );
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
  });

  describe('Casos de disponibilidad', () => {
    test('debe retornar disponible sin conflictos', async () => {
      const request = new Request('http://localhost:4321/api/calendar/validate-availability?date=2025-07-04&time=14:00&duration=2&studio_space=principal-zone');
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
      expect(data.timeSlots).toEqual(['14:00', '15:00']);
    });

    test('debe detectar conflicto con reserva existente', async () => {
      mockSupabaseAdmin.from.mockReturnValue(
        createMockChain({
          data: [{
            preferred_date: '2025-07-04',
            preferred_time: '14:00',
            package_duration: '2h',
            studio_space: 'principal-zone',
            status: 'confirmed'
          }],
          error: null
        })
      );

      const request = new Request('http://localhost:4321/api/calendar/validate-availability?date=2025-07-04&time=14:00&duration=2&studio_space=principal-zone');
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(false);
      expect(data.reason).toBe('El horario solicitado está ocupado');
    });

    test('debe permitir reserva en diferente espacio', async () => {
      mockSupabaseAdmin.from.mockReturnValue(
        createMockChain({
          data: [{
            preferred_date: '2025-07-04',
            preferred_time: '14:00',
            package_duration: '2h',
            studio_space: 'principal-zone',
            status: 'confirmed'
          }],
          error: null
        })
      );

      const request = new Request('http://localhost:4321/api/calendar/validate-availability?date=2025-07-04&time=14:00&duration=2&studio_space=black-zone');
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
    });
  });

  describe('Validación de duración', () => {
    test('debe manejar duración de 1 hora', async () => {
      const request = new Request('http://localhost:4321/api/calendar/validate-availability?date=2025-07-04&time=21:00&duration=1&studio_space=principal-zone');
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
      expect(data.timeSlots).toEqual(['21:00']);
    });

    test('debe manejar duración de 8 horas', async () => {
      const request = new Request('http://localhost:4321/api/calendar/validate-availability?date=2025-07-04&time=08:00&duration=8&studio_space=principal-zone');
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
      expect(data.timeSlots).toEqual([
        '08:00', '09:00', '10:00', '11:00', 
        '12:00', '13:00', '14:00', '15:00'
      ]);
    });
  });

  describe('Casos extremos', () => {
    test('debe manejar múltiples reservas existentes', async () => {
      mockSupabaseAdmin.from.mockReturnValue(
        createMockChain({
          data: [
            {
              preferred_date: '2025-07-04',
              preferred_time: '14:00',
              package_duration: '2h',
              studio_space: 'principal-zone',
              status: 'confirmed'
            },
            {
              preferred_date: '2025-07-04',
              preferred_time: '17:00',
              package_duration: '2h',
              studio_space: 'principal-zone',
              status: 'confirmed'
            }
          ],
          error: null
        })
      );

      // Intentar reservar entre las dos reservas existentes
      const request = new Request('http://localhost:4321/api/calendar/validate-availability?date=2025-07-04&time=16:00&duration=2&studio_space=principal-zone');
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(false);
      expect(data.reason).toBe('El horario solicitado está ocupado');
    });

    test('debe manejar error de base de datos', async () => {
      mockSupabaseAdmin.from.mockReturnValue(
        createMockChain({
          data: null,
          error: { message: 'Database connection failed' }
        })
      );

      const request = new Request('http://localhost:4321/api/calendar/validate-availability?date=2025-07-04&time=14:00&duration=2&studio_space=principal-zone');
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.available).toBe(false);
      expect(data.error).toBe('Error al validar disponibilidad');
    });
  });
});
