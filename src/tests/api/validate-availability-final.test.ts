// Test final y completo para validate-availability API
// Reemplaza todos los tests rotos con el patrón correcto

import { 
  createApiContext, 
  createFutureDate, 
  createTestBookingData,
  createSupabaseError,
  createSupabaseSuccess,
  TEST_CONSTANTS
} from '../helpers/api-helpers';

describe('API: validate-availability (Final)', () => {
  let mockSupabaseClient: any;
  
  beforeEach(() => {
    // Reset modules to ensure fresh imports
    jest.resetModules();
    
    // Get the global mock client
    mockSupabaseClient = (global as any).mockSupabaseClient;
    expect(mockSupabaseClient).toBeDefined();
    
    // Reset to clean state
    mockSupabaseClient.clearResponses();
    mockSupabaseClient.setDefaultResponse({ data: [], error: null });
  });

  describe('Validación de parámetros requeridos', () => {
    test('debe fallar si falta la fecha', async () => {
      const { GET } = await import('@/pages/api/calendar/validate-availability');
      
      const context = createApiContext(TEST_CONSTANTS.API_PATHS.VALIDATE_AVAILABILITY, {
        time: '14:00',
        studio_space: TEST_CONSTANTS.STUDIO_SPACES.PRINCIPAL
      });
      
      const response = await GET(context);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.available).toBe(false);
      expect(data.error).toBe(TEST_CONSTANTS.ERROR_MESSAGES.MISSING_PARAMS);
    });

    test('debe fallar si falta la hora', async () => {
      const { GET } = await import('@/pages/api/calendar/validate-availability');
      
      const context = createApiContext(TEST_CONSTANTS.API_PATHS.VALIDATE_AVAILABILITY, {
        date: createFutureDate(),
        studio_space: TEST_CONSTANTS.STUDIO_SPACES.PRINCIPAL
      });
      
      const response = await GET(context);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.available).toBe(false);
      expect(data.error).toBe(TEST_CONSTANTS.ERROR_MESSAGES.MISSING_PARAMS);
    });

    test('debe fallar si falta el espacio del estudio', async () => {
      const { GET } = await import('@/pages/api/calendar/validate-availability');
      
      const context = createApiContext(TEST_CONSTANTS.API_PATHS.VALIDATE_AVAILABILITY, {
        date: createFutureDate(),
        time: '14:00'
      });
      
      const response = await GET(context);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.available).toBe(false);
      expect(data.error).toBe(TEST_CONSTANTS.ERROR_MESSAGES.MISSING_PARAMS);
    });
  });

  describe('Validación con datos válidos', () => {
    test('debe procesar correctamente una solicitud válida sin conflictos', async () => {
      const { GET } = await import('@/pages/api/calendar/validate-availability');
      
      // Setup mock para respuesta sin conflictos
      mockSupabaseClient.setResponse('bookings', createSupabaseSuccess([]));

      const context = createApiContext(TEST_CONSTANTS.API_PATHS.VALIDATE_AVAILABILITY, {
        date: createFutureDate(),
        time: '10:00',
        duration: '2',
        studio_space: TEST_CONSTANTS.STUDIO_SPACES.PRINCIPAL
      });
      
      const response = await GET(context);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
      expect(data.requestedSlots).toBeDefined();
      expect(Array.isArray(data.requestedSlots)).toBe(true);
    });

    test('debe detectar conflicto con reserva existente', async () => {
      const { GET } = await import('@/pages/api/calendar/validate-availability');
      
      // Setup mock con una reserva existente
      const futureDate = createFutureDate();
      const existingBooking = createTestBookingData({
        preferred_date: futureDate,
        preferred_time: '14:00',
        package_duration: TEST_CONSTANTS.PACKAGE_DURATIONS.TWO_HOURS,
        studio_space: TEST_CONSTANTS.STUDIO_SPACES.PRINCIPAL
      });
      
      mockSupabaseClient.setResponse('bookings', createSupabaseSuccess([existingBooking]));
      
      const context = createApiContext(TEST_CONSTANTS.API_PATHS.VALIDATE_AVAILABILITY, {
        date: futureDate,
        time: '14:00',
        duration: '2',
        studio_space: TEST_CONSTANTS.STUDIO_SPACES.PRINCIPAL
      });
      
      const response = await GET(context);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(false);
      expect(data.reason).toBe(TEST_CONSTANTS.ERROR_MESSAGES.SLOT_OCCUPIED);
      expect(data.requestedSlots).toBeDefined();
    });

    test('debe permitir reserva en diferente espacio', async () => {
      const { GET } = await import('@/pages/api/calendar/validate-availability');
      
      // Mock sin reservas para el espacio consultado (black-zone)
      mockSupabaseClient.setResponse('bookings', createSupabaseSuccess([]));

      const futureDate = createFutureDate();
      
      const context = createApiContext(TEST_CONSTANTS.API_PATHS.VALIDATE_AVAILABILITY, {
        date: futureDate,
        time: '14:00',
        duration: '2',
        studio_space: TEST_CONSTANTS.STUDIO_SPACES.BLACK
      });
      
      const response = await GET(context);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
    });

    test('debe permitir reserva en horario diferente del mismo día', async () => {
      const { GET } = await import('@/pages/api/calendar/validate-availability');
      
      // Mock sin reservas en el horario consultado (10:00)
      mockSupabaseClient.setResponse('bookings', createSupabaseSuccess([]));

      const futureDate = createFutureDate();
      
      const context = createApiContext(TEST_CONSTANTS.API_PATHS.VALIDATE_AVAILABILITY, {
        date: futureDate,
        time: '10:00',
        duration: '2',
        studio_space: TEST_CONSTANTS.STUDIO_SPACES.PRINCIPAL
      });
      
      const response = await GET(context);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
    });
  });

  describe('Manejo de errores de base de datos', () => {
    test('debe manejar error de base de datos graciosamente', async () => {
      const { GET } = await import('@/pages/api/calendar/validate-availability');
      
      // Mock error de Supabase
      mockSupabaseClient.setResponse('bookings', createSupabaseError('Database error'));

      const context = createApiContext(TEST_CONSTANTS.API_PATHS.VALIDATE_AVAILABILITY, {
        date: createFutureDate(),
        time: '14:00',
        duration: '2',
        studio_space: TEST_CONSTANTS.STUDIO_SPACES.PRINCIPAL
      });
      
      const response = await GET(context);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.available).toBe(false);
      expect(data.error).toBe(TEST_CONSTANTS.ERROR_MESSAGES.AVAILABILITY_ERROR);
    });
  });

  describe('Validación de duración', () => {
    test('debe manejar duración por defecto (1 hora)', async () => {
      const { GET } = await import('@/pages/api/calendar/validate-availability');
      
      // Mock sin conflictos
      mockSupabaseClient.setResponse('bookings', createSupabaseSuccess([]));

      const futureDate = createFutureDate();

      const context = createApiContext(TEST_CONSTANTS.API_PATHS.VALIDATE_AVAILABILITY, {
        date: futureDate,
        time: '10:00',
        studio_space: TEST_CONSTANTS.STUDIO_SPACES.PRINCIPAL
      });
      
      const response = await GET(context);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
      expect(data.requestedSlots).toHaveLength(1); // 1 slot de 1 hora (duración por defecto)
    });

    test('debe manejar duración personalizada', async () => {
      const { GET } = await import('@/pages/api/calendar/validate-availability');
      
      // Mock sin conflictos
      mockSupabaseClient.setResponse('bookings', createSupabaseSuccess([]));

      const futureDate = createFutureDate();

      const context = createApiContext(TEST_CONSTANTS.API_PATHS.VALIDATE_AVAILABILITY, {
        date: futureDate,
        time: '10:00',
        duration: '240', // 4 horas en minutos
        studio_space: TEST_CONSTANTS.STUDIO_SPACES.PRINCIPAL
      });
      
      const response = await GET(context);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
      expect(data.requestedSlots).toHaveLength(4); // 4 slots de 1 hora cada uno
    });
  });

  describe('Diferentes espacios del estudio', () => {
    test('debe validar para zona principal', async () => {
      const { GET } = await import('@/pages/api/calendar/validate-availability');
      
      // Mock sin conflictos
      mockSupabaseClient.setResponse('bookings', createSupabaseSuccess([]));

      const futureDate = createFutureDate();

      const context = createApiContext(TEST_CONSTANTS.API_PATHS.VALIDATE_AVAILABILITY, {
        date: futureDate,
        time: '10:00',
        duration: '2',
        studio_space: TEST_CONSTANTS.STUDIO_SPACES.PRINCIPAL
      });
      
      const response = await GET(context);
      
      expect(response.status).toBe(200);
    });

    test('debe validar para zona negra', async () => {
      const { GET } = await import('@/pages/api/calendar/validate-availability');
      
      // Mock sin conflictos
      mockSupabaseClient.setResponse('bookings', createSupabaseSuccess([]));

      const futureDate = createFutureDate();

      const context = createApiContext(TEST_CONSTANTS.API_PATHS.VALIDATE_AVAILABILITY, {
        date: futureDate,
        time: '10:00',
        duration: '2',
        studio_space: TEST_CONSTANTS.STUDIO_SPACES.BLACK
      });
      
      const response = await GET(context);
      
      expect(response.status).toBe(200);
    });

    test('debe validar para ciclorama', async () => {
      const { GET } = await import('@/pages/api/calendar/validate-availability');
      
      // Mock sin conflictos
      mockSupabaseClient.setResponse('bookings', createSupabaseSuccess([]));

      const futureDate = createFutureDate();

      const context = createApiContext(TEST_CONSTANTS.API_PATHS.VALIDATE_AVAILABILITY, {
        date: futureDate,
        time: '10:00',
        duration: '2',
        studio_space: TEST_CONSTANTS.STUDIO_SPACES.CYCLORAMA
      });
      
      const response = await GET(context);
      
      expect(response.status).toBe(200);
    });
  });

  describe('Casos adicionales', () => {
    test('debe manejar múltiples formatos de duración', async () => {
      const { GET } = await import('@/pages/api/calendar/validate-availability');
      
      const testCases = [
        { duration: '60', expectedSlots: 1 },   // 60 minutos = 1 hora
        { duration: '120', expectedSlots: 2 },  // 120 minutos = 2 horas
        { duration: '180', expectedSlots: 3 },  // 180 minutos = 3 horas
      ];

      for (const testCase of testCases) {
        mockSupabaseClient.setResponse('bookings', createSupabaseSuccess([]));
        
        const context = createApiContext(TEST_CONSTANTS.API_PATHS.VALIDATE_AVAILABILITY, {
          date: createFutureDate(),
          time: '10:00',
          duration: testCase.duration,
          studio_space: TEST_CONSTANTS.STUDIO_SPACES.PRINCIPAL
        });
        
        const response = await GET(context);
        const data = await response.json();
        
        expect(response.status).toBe(200);
        expect(data.available).toBe(true);
        expect(data.requestedSlots).toHaveLength(testCase.expectedSlots);
      }
    });

    test('debe manejar todos los espacios del estudio', async () => {
      const { GET } = await import('@/pages/api/calendar/validate-availability');
      
      const studioSpaces = [
        TEST_CONSTANTS.STUDIO_SPACES.PRINCIPAL,
        TEST_CONSTANTS.STUDIO_SPACES.BLACK,
        TEST_CONSTANTS.STUDIO_SPACES.CYCLORAMA,
        TEST_CONSTANTS.STUDIO_SPACES.CREATIVE
      ];

      for (const studioSpace of studioSpaces) {
        mockSupabaseClient.setResponse('bookings', createSupabaseSuccess([]));
        
        const context = createApiContext(TEST_CONSTANTS.API_PATHS.VALIDATE_AVAILABILITY, {
          date: createFutureDate(),
          time: '14:00',
          duration: '2',
          studio_space: studioSpace
        });
        
        const response = await GET(context);
        const data = await response.json();
        
        expect(response.status).toBe(200);
        expect(data.available).toBe(true);
      }
    });
  });
});