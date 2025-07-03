// Tests funcionales para la lógica actual de booking
import { GET } from '@/pages/api/calendar/validate-availability';

// Mock simple de Supabase para tests funcionales
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

describe('Tests Funcionales - Lógica Actual', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('API validate-availability: Casos Reales', () => {
    test('Usuario reserva 2h en zona principal - Sin conflictos', async () => {
      // Sin reservas existentes
      mockSupabaseAdmin.from.mockReturnValue(
        createMockChain({ data: [], error: null })
      );

      const request = new Request(
        'http://localhost:4321/api/calendar/validate-availability?date=2025-07-05&time=10:00&duration=2&studio_space=principal-zone'
      );
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
      expect(data.timeSlots).toEqual(['10:00', '11:00']);
    });

    test('Usuario reserva 2h en zona principal - Con conflicto', async () => {
      // Reserva existente en 10:00-12:00
      mockSupabaseAdmin.from.mockReturnValue(
        createMockChain({
          data: [{
            preferred_date: '2025-07-05',
            preferred_time: '10:00',
            package_duration: '2h',
            studio_space: 'principal-zone',
            status: 'confirmed'
          }],
          error: null
        })
      );

      const request = new Request(
        'http://localhost:4321/api/calendar/validate-availability?date=2025-07-05&time=10:00&duration=2&studio_space=principal-zone'
      );
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(false);
      expect(data.reason).toBe('El horario solicitado está ocupado');
    });

    test('Usuario reserva en zona negra cuando principal está ocupada', async () => {
      // Reserva en principal-zone pero consulta black-zone
      mockSupabaseAdmin.from.mockReturnValue(
        createMockChain({
          data: [{
            preferred_date: '2025-07-05',
            preferred_time: '10:00',
            package_duration: '2h',
            studio_space: 'principal-zone', // Diferente espacio
            status: 'confirmed'
          }],
          error: null
        })
      );

      const request = new Request(
        'http://localhost:4321/api/calendar/validate-availability?date=2025-07-05&time=10:00&duration=2&studio_space=black-zone'
      );
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
    });

    test('Usuario reserva sesión de 8h (día completo)', async () => {
      mockSupabaseAdmin.from.mockReturnValue(
        createMockChain({ data: [], error: null })
      );

      const request = new Request(
        'http://localhost:4321/api/calendar/validate-availability?date=2025-07-05&time=09:00&duration=8&studio_space=principal-zone'
      );
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
      expect(data.timeSlots).toHaveLength(8);
      expect(data.timeSlots).toEqual([
        '09:00', '10:00', '11:00', '12:00', 
        '13:00', '14:00', '15:00', '16:00'
      ]);
    });

    test('Usuario intenta reservar con parámetros faltantes', async () => {
      const request = new Request(
        'http://localhost:4321/api/calendar/validate-availability?date=2025-07-05&time=10:00'
        // Falta studio_space
      );
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.available).toBe(false);
      expect(data.error).toBe('Parámetros requeridos: date, time, studio_space');
    });

    test('Sistema maneja error de base de datos graciosamente', async () => {
      mockSupabaseAdmin.from.mockReturnValue(
        createMockChain({
          data: null,
          error: { message: 'Database connection failed' }
        })
      );

      const request = new Request(
        'http://localhost:4321/api/calendar/validate-availability?date=2025-07-05&time=10:00&duration=2&studio_space=principal-zone'
      );
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.available).toBe(false);
      expect(data.error).toBe('Error al validar disponibilidad');
    });
  });

  describe('Validación de Duración de Paquetes', () => {
    beforeEach(() => {
      mockSupabaseAdmin.from.mockReturnValue(
        createMockChain({ data: [], error: null })
      );
    });

    test('Paquete 1h genera 1 slot', async () => {
      const request = new Request(
        'http://localhost:4321/api/calendar/validate-availability?date=2025-07-05&time=14:00&duration=1&studio_space=principal-zone'
      );
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(data.timeSlots).toEqual(['14:00']);
    });

    test('Paquete 3h genera 3 slots', async () => {
      const request = new Request(
        'http://localhost:4321/api/calendar/validate-availability?date=2025-07-05&time=14:00&duration=3&studio_space=principal-zone'
      );
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(data.timeSlots).toEqual(['14:00', '15:00', '16:00']);
    });

    test('Paquete 6h genera 6 slots', async () => {
      const request = new Request(
        'http://localhost:4321/api/calendar/validate-availability?date=2025-07-05&time=10:00&duration=6&studio_space=principal-zone'
      );
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(data.timeSlots).toEqual([
        '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'
      ]);
    });

    test('Sin duración usa valor por defecto (2h)', async () => {
      const request = new Request(
        'http://localhost:4321/api/calendar/validate-availability?date=2025-07-05&time=14:00&studio_space=principal-zone'
      );
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(data.timeSlots).toEqual(['14:00', '15:00']);
    });
  });

  describe('Validación de Espacios del Estudio', () => {
    beforeEach(() => {
      mockSupabaseAdmin.from.mockReturnValue(
        createMockChain({ data: [], error: null })
      );
    });

    test('Zona Principal (principal-zone)', async () => {
      const request = new Request(
        'http://localhost:4321/api/calendar/validate-availability?date=2025-07-05&time=14:00&duration=2&studio_space=principal-zone'
      );
      
      const response = await GET({ request } as any);
      
      expect(response.status).toBe(200);
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('bookings');
    });

    test('Zona Negra (black-zone)', async () => {
      const request = new Request(
        'http://localhost:4321/api/calendar/validate-availability?date=2025-07-05&time=14:00&duration=2&studio_space=black-zone'
      );
      
      const response = await GET({ request } as any);
      
      expect(response.status).toBe(200);
    });

    test('Ciclorama (cyclorama)', async () => {
      const request = new Request(
        'http://localhost:4321/api/calendar/validate-availability?date=2025-07-05&time=14:00&duration=2&studio_space=cyclorama'
      );
      
      const response = await GET({ request } as any);
      
      expect(response.status).toBe(200);
    });

    test('Estudio Creativo (creative-studio)', async () => {
      const request = new Request(
        'http://localhost:4321/api/calendar/validate-availability?date=2025-07-05&time=14:00&duration=2&studio_space=creative-studio'
      );
      
      const response = await GET({ request } as any);
      
      expect(response.status).toBe(200);
    });
  });

  describe('Escenarios Complejos', () => {
    test('Múltiples reservas en el mismo día, diferentes espacios', async () => {
      mockSupabaseAdmin.from.mockReturnValue(
        createMockChain({
          data: [
            {
              preferred_date: '2025-07-05',
              preferred_time: '10:00',
              package_duration: '2h',
              studio_space: 'principal-zone',
              status: 'confirmed'
            },
            {
              preferred_date: '2025-07-05',
              preferred_time: '14:00',
              package_duration: '2h',
              studio_space: 'black-zone',
              status: 'confirmed'
            }
          ],
          error: null
        })
      );

      // Consulta para principal-zone a las 12:00 (después de la reserva de 10:00-12:00)
      const request = new Request(
        'http://localhost:4321/api/calendar/validate-availability?date=2025-07-05&time=12:00&duration=2&studio_space=principal-zone'
      );
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(true); // No hay conflicto porque 12:00-14:00 no solapa con 10:00-12:00
    });

    test('Solapamiento parcial de horarios', async () => {
      mockSupabaseAdmin.from.mockReturnValue(
        createMockChain({
          data: [{
            preferred_date: '2025-07-05',
            preferred_time: '14:00',
            package_duration: '3h', // 14:00-17:00
            studio_space: 'principal-zone',
            status: 'confirmed'
          }],
          error: null
        })
      );

      // Nueva reserva 15:00-17:00 (solapa con 15:00, 16:00)
      const request = new Request(
        'http://localhost:4321/api/calendar/validate-availability?date=2025-07-05&time=15:00&duration=2&studio_space=principal-zone'
      );
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(false);
      expect(data.reason).toBe('El horario solicitado está ocupado');
    });

    test('Reservas en diferentes fechas no interfieren', async () => {
      mockSupabaseAdmin.from.mockReturnValue(
        createMockChain({
          data: [{
            preferred_date: '2025-07-04', // Día diferente
            preferred_time: '14:00',
            package_duration: '2h',
            studio_space: 'principal-zone',
            status: 'confirmed'
          }],
          error: null
        })
      );

      const request = new Request(
        'http://localhost:4321/api/calendar/validate-availability?date=2025-07-05&time=14:00&duration=2&studio_space=principal-zone'
      );
      
      const response = await GET({ request } as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
    });
  });
});
