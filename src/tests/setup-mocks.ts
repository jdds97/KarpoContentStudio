// Setup global mocks for Jest
import { createMockSupabaseClient, createSuccessResponse, createErrorResponse } from './utils/supabase-mock';

// Mock environment variables
process.env.SUPABASE_URL = 'https://mock-project.supabase.co';
process.env.SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

// Mock import.meta.env for ES modules
(global as any).importMeta = {
  env: {
    SUPABASE_URL: 'https://mock-project.supabase.co',
    SUPABASE_ANON_KEY: 'mock-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'mock-service-role-key'
  }
};

// Mock import.meta globally
(global as any).importMeta = {
  env: {
    SUPABASE_URL: 'https://mock-project.supabase.co',
    SUPABASE_ANON_KEY: 'mock-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'mock-service-role-key'
  }
};

// Create a more robust import.meta mock
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        SUPABASE_URL: 'https://mock-project.supabase.co',
        SUPABASE_ANON_KEY: 'mock-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'mock-service-role-key'
      }
    }
  },
  configurable: true,
  writable: true
});

// Mock fetch globally
global.fetch = jest.fn();

// Mock performance API
global.performance = {
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn().mockReturnValue([{ duration: 100 }]),
  now: jest.fn().mockReturnValue(Date.now()),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn()
} as any;

// Create global mock Supabase client
const mockSupabaseClient = createMockSupabaseClient();

// Mock Supabase modules globally
jest.doMock('@/lib/supabase', () => ({
  createSupabaseClient: jest.fn(() => mockSupabaseClient),
  createSupabaseAdmin: jest.fn(() => mockSupabaseClient)
}));

jest.doMock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

// Make mock client available globally
(global as any).mockSupabaseClient = mockSupabaseClient;

// Export helper functions globally
(global as any).createSuccessResponse = createSuccessResponse;
(global as any).createErrorResponse = createErrorResponse;
