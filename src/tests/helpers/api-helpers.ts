// Helpers comunes para tests de API
import type { TestSupabaseResponse, TestApiContext, MockSupabaseChain } from '../types';
import { createMockSupabaseClient, createMockSupabaseAdmin, createSuccessResponse, createErrorResponse, type MockSupabaseResponse } from '../utils/supabase-mock';

/**
 * Crea una cadena de mocks para Supabase (legacy - mejor usar createMockSupabaseClient)
 */
export const createMockChain = (finalResult: TestSupabaseResponse): MockSupabaseChain => ({
  select: jest.fn(() => ({
    eq: jest.fn(() => ({
      eq: jest.fn(() => ({
        in: jest.fn(() => Promise.resolve(finalResult))
      }))
    }))
  }))
});

/**
 * Crea un cliente mock de Supabase configurado
 */
export const createConfiguredSupabaseMock = (response?: MockSupabaseResponse) => {
  const client = createMockSupabaseClient(response);
  return client;
};

/**
 * Crea un cliente admin mock de Supabase configurado
 */
export const createConfiguredSupabaseAdminMock = (response?: MockSupabaseResponse) => {
  const client = createMockSupabaseAdmin(response);
  return client;
};

/**
 * Crea una URL de test con parámetros
 */
export const createTestUrl = (path: string, params: Record<string, string> = {}): URL => {
  const url = new URL(`http://localhost:4321${path}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url;
};

/**
 * Crea un contexto de API para testing
 */
export const createApiContext = (path: string, params: Record<string, string> = {}): TestApiContext => {
  const url = createTestUrl(path, params);
  const request = new Request(url.toString());
  return { url, request };
};

/**
 * Crea una fecha futura para tests
 */
export const createFutureDate = (daysFromNow: number = 7): string => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysFromNow);
  return futureDate.toISOString().split('T')[0];
};

/**
 * Crea datos de booking de prueba
 */
export const createTestBookingData = (overrides: Partial<{
  preferred_date: string;
  preferred_time: string;
  package_duration: string;
  studio_space: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}> = {}) => ({
  preferred_date: createFutureDate(),
  preferred_time: '14:00',
  package_duration: '2h',
  studio_space: 'principal-zone',
  status: 'confirmed' as const,
  ...overrides
});

/**
 * Crea respuesta de error de Supabase
 */
export const createSupabaseError = (message: string): TestSupabaseResponse => ({
  data: null,
  error: { message }
});

/**
 * Crea respuesta exitosa de Supabase
 */
export const createSupabaseSuccess = (data: any[] = []): TestSupabaseResponse => ({
  data,
  error: null
});

/**
 * Constantes de test
 */
export const TEST_CONSTANTS = {
  API_PATHS: {
    VALIDATE_AVAILABILITY: '/api/calendar/validate-availability'
  },
  STUDIO_SPACES: {
    PRINCIPAL: 'principal-zone',
    BLACK: 'black-zone',
    CYCLORAMA: 'cyclorama',
    CREATIVE: 'creative-studio'
  },
  PACKAGE_DURATIONS: {
    ONE_HOUR: '1h',
    TWO_HOURS: '2h',
    THREE_HOURS: '3h',
    FOUR_HOURS: '4h',
    SIX_HOURS: '6h',
    EIGHT_HOURS: '8h'
  },
  ERROR_MESSAGES: {
    MISSING_PARAMS: 'Fecha y hora son requeridas',
    AVAILABILITY_ERROR: 'Error al validar disponibilidad',
    INTERNAL_ERROR: 'Error interno del servidor',
    SLOT_OCCUPIED: 'El horario solicitado está ocupado'
  }
};