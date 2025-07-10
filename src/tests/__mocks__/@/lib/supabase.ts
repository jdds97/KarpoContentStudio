// Mock manual para @/lib/supabase
import { createMockSupabaseClient } from '../../../utils/supabase-mock';

// Create a global mock instance that can be configured
export const mockSupabaseAdmin = createMockSupabaseClient();

// Export the mock functions that modules expect
export const createSupabaseClient = jest.fn().mockReturnValue(mockSupabaseAdmin);
export const createSupabaseAdmin = jest.fn().mockReturnValue(mockSupabaseAdmin);
