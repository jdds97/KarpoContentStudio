// Implementación concreta de servicios de base de datos usando Supabase
import { 
  DatabaseError, 
  AuthenticationError, 
  BookingStatus,
  ERROR_CODES
} from '@/types';
import type { 
  DatabaseService, 
  BookingRepository, 
  BookingEntity, 
  AuthenticationService,
  LoginCredentials,
  AuthResult,
  UserData,
  UserSession,
  CreateBookingData,
  ID
} from '@/types';

// Mock de Supabase client - en producción usarías el real
interface SupabaseClient {
  from(table: string): SupabaseQueryBuilder;
  auth: SupabaseAuth;
}

interface SupabaseQueryBuilder {
  select(columns?: string): SupabaseQueryBuilder;
  insert(data: any): SupabaseQueryBuilder;
  update(data: any): SupabaseQueryBuilder;
  delete(): SupabaseQueryBuilder;
  eq(column: string, value: any): SupabaseQueryBuilder;
  gte(column: string, value: any): SupabaseQueryBuilder;
  lte(column: string, value: any): SupabaseQueryBuilder;
  in(column: string, values: any[]): SupabaseQueryBuilder;
  single(): Promise<{ data: any; error: any }>;
  then(callback: (result: { data: any; error: any }) => void): Promise<any>;
}

interface SupabaseAuth {
  signInWithPassword(credentials: { email: string; password: string }): Promise<{ data: any; error: any }>;
  signOut(): Promise<{ error: any }>;
  getSession(): Promise<{ data: { session: any }; error: any }>;
  setSession(session: { access_token: string; refresh_token: string }): Promise<{ data: any; error: any }>;
}

// Implementación del servicio de base de datos con Supabase
export class SupabaseDatabaseService implements DatabaseService {
  constructor(private client: SupabaseClient) {}

  async query<T = unknown>(): Promise<T[]> {
    // En Supabase, normalmente usarías rpc() para consultas SQL personalizadas
    throw new DatabaseError(
      ERROR_CODES.CONFIGURATION_ERROR,
      'Use specific methods instead of raw SQL'
    );
  }

  async queryOne<T = unknown>(): Promise<T | null> {
    throw new DatabaseError(
      ERROR_CODES.CONFIGURATION_ERROR,
      'Use specific methods instead of raw SQL'
    );
  }

  async insert<T = unknown>(table: string, data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await this.client
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) {
        throw new DatabaseError(
          ERROR_CODES.DB_QUERY_FAILED,
          error.message,
          { table, data },
          error
        );
      }

      return result;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(
        ERROR_CODES.DB_QUERY_FAILED,
        'Failed to insert record',
        { table, data },
        error as Error
      );
    }
  }

  async update<T = unknown>(table: string, id: ID, data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await this.client
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new DatabaseError(
          ERROR_CODES.DB_QUERY_FAILED,
          error.message,
          { table, id, data },
          error
        );
      }

      return result;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(
        ERROR_CODES.DB_QUERY_FAILED,
        'Failed to update record',
        { table, id, data },
        error as Error
      );
    }
  }

  async delete(table: string, id: ID): Promise<boolean> {
    try {
      const { error } = await this.client
        .from(table)
        .delete()
        .eq('id', id);

      if (error) {
        throw new DatabaseError(
          ERROR_CODES.DB_QUERY_FAILED,
          error.message,
          { table, id },
          error
        );
      }

      return true;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(
        ERROR_CODES.DB_QUERY_FAILED,
        'Failed to delete record',
        { table, id },
        error as Error
      );
    }
  }

  async transaction<T>(callback: (db: DatabaseService) => Promise<T>): Promise<T> {
    // Supabase no tiene transacciones explícitas en el cliente
    // En un escenario real, usarías stored procedures o manejarías transacciones en el servidor
    return await callback(this);
  }
}

// Implementación del repositorio de reservas
export class SupabaseBookingRepository implements BookingRepository {
  constructor(private client: SupabaseClient) {}

  async create(booking: CreateBookingData): Promise<BookingEntity> {
    try {
      const bookingData = {
        ...booking,
        status: BookingStatus.PENDING,
        created_at: new Date().toISOString()
      };

      const { data, error } = await this.client
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) {
        throw new DatabaseError(
          ERROR_CODES.DB_QUERY_FAILED,
          error.message,
          booking,
          error
        );
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(
        ERROR_CODES.DB_QUERY_FAILED,
        'Failed to create booking',
        booking,
        error as Error
      );
    }
  }

  async findById(id: string): Promise<BookingEntity | null> {
    try {
      const { data, error } = await this.client
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new DatabaseError(
          ERROR_CODES.RECORD_NOT_FOUND,
          error.message,
          { id },
          error
        );
      }

      return data || null;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(
        ERROR_CODES.DB_QUERY_FAILED,
        'Failed to find booking',
        { id },
        error as Error
      );
    }
  }

  async findByEmail(email: string): Promise<BookingEntity[]> {
    try {
      const { data, error } = await this.client
        .from('bookings')
        .select('*')
        .eq('email', email);

      if (error) {
        throw new DatabaseError('BOOKING_FIND_BY_EMAIL_FAILED', error.message, { email }, error);
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('BOOKING_FIND_BY_EMAIL_ERROR', 'Failed to find bookings by email', { email }, error as Error);
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<BookingEntity[]> {
    try {
      const { data, error } = await this.client
        .from('bookings')
        .select('*')
        .gte('preferred_date', startDate.toISOString().split('T')[0])
        .lte('preferred_date', endDate.toISOString().split('T')[0]);

      if (error) {
        throw new DatabaseError('BOOKING_FIND_BY_DATE_RANGE_FAILED', error.message, { startDate, endDate }, error);
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('BOOKING_FIND_BY_DATE_RANGE_ERROR', 'Failed to find bookings by date range', { startDate, endDate }, error as Error);
    }
  }

  async update(id: string, data: Partial<BookingEntity>): Promise<BookingEntity> {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      const { data: result, error } = await this.client
        .from('bookings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new DatabaseError('BOOKING_UPDATE_FAILED', error.message, { id, data }, error);
      }

      return result;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('BOOKING_UPDATE_ERROR', 'Failed to update booking', { id, data }, error as Error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.client
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) {
        throw new DatabaseError('BOOKING_DELETE_FAILED', error.message, { id }, error);
      }

      return true;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('BOOKING_DELETE_ERROR', 'Failed to delete booking', { id }, error as Error);
    }
  }

  async findByStatus(status: BookingStatus): Promise<BookingEntity[]> {
    try {
      const { data, error } = await this.client
        .from('bookings')
        .select('*')
        .eq('status', status);

      if (error) {
        throw new DatabaseError('BOOKING_FIND_BY_STATUS_FAILED', error.message, { status }, error);
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('BOOKING_FIND_BY_STATUS_ERROR', 'Failed to find bookings by status', { status }, error as Error);
    }
  }

  async findConflicts(date: Date, timeSlots: string[], studioSpace?: string): Promise<BookingEntity[]> {
    try {
      let query = this.client
        .from('bookings')
        .select('*')
        .eq('preferred_date', date.toISOString().split('T')[0])
        .in('preferred_time', timeSlots)
        .in('status', [BookingStatus.PENDING, BookingStatus.CONFIRMED]);

      if (studioSpace) {
        query = query.eq('studio_space', studioSpace);
      }

      const { data, error } = await query;

      if (error) {
        throw new DatabaseError('BOOKING_FIND_CONFLICTS_FAILED', error.message, { date, timeSlots, studioSpace }, error);
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('BOOKING_FIND_CONFLICTS_ERROR', 'Failed to find booking conflicts', { date, timeSlots, studioSpace }, error as Error);
    }
  }
}

// Implementación del servicio de autenticación con Supabase
export class SupabaseAuthenticationService implements AuthenticationService {
  constructor(private client: SupabaseClient) {}

  async authenticate(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        throw new AuthenticationError(
          ERROR_CODES.AUTH_FAILED,
          error.message,
          credentials,
          error
        );
      }

      if (!data.user || !data.session) {
        throw new AuthenticationError(
          ERROR_CODES.AUTH_FAILED,
          'No session created',
          credentials
        );
      }

      const userData: UserData = {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name,
        roles: data.user.app_metadata?.roles || ['user'],
        permissions: data.user.app_metadata?.permissions || []
      };

      return {
        success: true,
        user: userData,
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: new Date(data.session.expires_at! * 1000)
      };

    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown authentication error'
      };
    }
  }

  async validateToken(token: string): Promise<UserSession | null> {
    try {
      // En un escenario real, validarías el token con Supabase
      const { data, error } = await this.client.auth.getSession();

      if (error || !data.session) {
        return null;
      }

      return {
        id: data.session.user.id,
        userId: data.session.user.id,
        email: data.session.user.email!,
        roles: data.session.user.app_metadata?.roles || ['user'],
        permissions: data.session.user.app_metadata?.permissions || [],
        expiresAt: new Date(data.session.expires_at! * 1000),
        createdAt: new Date(data.session.user.created_at!)
      };

    } catch (error) {
      throw new AuthenticationError('TOKEN_VALIDATION_FAILED', 'Failed to validate token', { token }, error as Error);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      // En Supabase, el refresh se maneja automáticamente
      const { data, error } = await this.client.auth.getSession();

      if (error || !data.session) {
        throw new AuthenticationError('REFRESH_FAILED', 'Failed to refresh token', { refreshToken }, error);
      }

      const userData: UserData = {
        id: data.session.user.id,
        email: data.session.user.email!,
        name: data.session.user.user_metadata?.name,
        roles: data.session.user.app_metadata?.roles || ['user'],
        permissions: data.session.user.app_metadata?.permissions || []
      };

      return {
        success: true,
        user: userData,
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: new Date(data.session.expires_at! * 1000)
      };

    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown refresh error'
      };
    }
  }

  async logout(token: string): Promise<boolean> {
    try {
      const { error } = await this.client.auth.signOut();

      if (error) {
        throw new AuthenticationError('LOGOUT_FAILED', error.message, { token }, error);
      }

      return true;
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      throw new AuthenticationError('LOGOUT_ERROR', 'Failed to logout', { token }, error as Error);
    }
  }

  async createSession(user: UserData): Promise<UserSession> {
    // En Supabase, las sesiones se crean automáticamente durante la autenticación
    return {
      id: `session_${user.id}_${Date.now()}`,
      userId: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      createdAt: new Date()
    };
  }
}

// Factory para crear servicios Supabase
export class SupabaseServiceFactory {
  constructor(private client: SupabaseClient) {}

  createDatabaseService(): SupabaseDatabaseService {
    return new SupabaseDatabaseService(this.client);
  }

  createBookingRepository(): SupabaseBookingRepository {
    return new SupabaseBookingRepository(this.client);
  }

  createAuthenticationService(): SupabaseAuthenticationService {
    return new SupabaseAuthenticationService(this.client);
  }
}