// Mock completo de Supabase para tests
// Implementa toda la cadena de query builder que necesitan los tests

export interface MockSupabaseResponse {
  data: any[] | null;
  error: any;
  status?: number;
  statusText?: string;
}

export interface MockSupabaseQueryBuilder {
  select(columns?: string): MockSupabaseQueryBuilder;
  insert(values: any): MockSupabaseQueryBuilder;
  update(values: any): MockSupabaseQueryBuilder;
  delete(): MockSupabaseQueryBuilder;
  eq(column: string, value: any): MockSupabaseQueryBuilder;
  neq(column: string, value: any): MockSupabaseQueryBuilder;
  gt(column: string, value: any): MockSupabaseQueryBuilder;
  gte(column: string, value: any): MockSupabaseQueryBuilder;
  lt(column: string, value: any): MockSupabaseQueryBuilder;
  lte(column: string, value: any): MockSupabaseQueryBuilder;
  like(column: string, value: any): MockSupabaseQueryBuilder;
  ilike(column: string, value: any): MockSupabaseQueryBuilder;
  in(column: string, values: any[]): MockSupabaseQueryBuilder;
  is(column: string, value: any): MockSupabaseQueryBuilder;
  not(column: string, operator: string, value: any): MockSupabaseQueryBuilder;
  or(filters: string): MockSupabaseQueryBuilder;
  and(filters: string): MockSupabaseQueryBuilder;
  order(column: string, options?: { ascending?: boolean }): MockSupabaseQueryBuilder;
  limit(count: number): MockSupabaseQueryBuilder;
  offset(count: number): MockSupabaseQueryBuilder;
  range(from: number, to: number): MockSupabaseQueryBuilder;
  single(): MockSupabaseQueryBuilder;
  maybeSingle(): MockSupabaseQueryBuilder;
  csv(): MockSupabaseQueryBuilder;
  geojson(): MockSupabaseQueryBuilder;
  explain(options?: any): MockSupabaseQueryBuilder;
  rollback(): MockSupabaseQueryBuilder;
  returns(): MockSupabaseQueryBuilder;
  then(onFulfilled: (value: MockSupabaseResponse) => any, onRejected?: (reason: any) => any): Promise<any>;
  catch(onRejected: (reason: any) => any): Promise<any>;
  finally(onFinally: () => void): Promise<any>;
}

export interface MockSupabaseClient {
  from(table: string): MockSupabaseQueryBuilder;
  rpc(functionName: string, params?: any): MockSupabaseQueryBuilder;
  auth: {
    signUp(credentials: any): Promise<any>;
    signInWithPassword(credentials: any): Promise<any>;
    signOut(): Promise<any>;
    getSession(): Promise<any>;
    getUser(): Promise<any>;
  };
  storage: {
    from(bucketName: string): any;
  };
  realtime: {
    channel(name: string): any;
  };
}

class MockSupabaseQueryBuilderImpl implements MockSupabaseQueryBuilder {
  private _response: MockSupabaseResponse;
  private _table: string;
  private _operation: string = 'select';
  private _columns: string = '*';
  private _filters: any[] = [];
  private _data: any = null;

  constructor(table: string, response: MockSupabaseResponse) {
    this._table = table;
    this._response = response;
  }

  select(columns: string = '*'): MockSupabaseQueryBuilder {
    this._operation = 'select';
    this._columns = columns;
    return this;
  }

  insert(values: any): MockSupabaseQueryBuilder {
    this._operation = 'insert';
    this._data = values;
    return this;
  }

  update(values: any): MockSupabaseQueryBuilder {
    this._operation = 'update';
    this._data = values;
    return this;
  }

  delete(): MockSupabaseQueryBuilder {
    this._operation = 'delete';
    return this;
  }

  eq(column: string, value: any): MockSupabaseQueryBuilder {
    this._filters.push({ column, operator: 'eq', value });
    return this;
  }

  neq(column: string, value: any): MockSupabaseQueryBuilder {
    this._filters.push({ column, operator: 'neq', value });
    return this;
  }

  gt(column: string, value: any): MockSupabaseQueryBuilder {
    this._filters.push({ column, operator: 'gt', value });
    return this;
  }

  gte(column: string, value: any): MockSupabaseQueryBuilder {
    this._filters.push({ column, operator: 'gte', value });
    return this;
  }

  lt(column: string, value: any): MockSupabaseQueryBuilder {
    this._filters.push({ column, operator: 'lt', value });
    return this;
  }

  lte(column: string, value: any): MockSupabaseQueryBuilder {
    this._filters.push({ column, operator: 'lte', value });
    return this;
  }

  like(column: string, value: any): MockSupabaseQueryBuilder {
    this._filters.push({ column, operator: 'like', value });
    return this;
  }

  ilike(column: string, value: any): MockSupabaseQueryBuilder {
    this._filters.push({ column, operator: 'ilike', value });
    return this;
  }

  in(column: string, values: any[]): MockSupabaseQueryBuilder {
    this._filters.push({ column, operator: 'in', value: values });
    return this;
  }

  is(column: string, value: any): MockSupabaseQueryBuilder {
    this._filters.push({ column, operator: 'is', value });
    return this;
  }

  not(column: string, operator: string, value: any): MockSupabaseQueryBuilder {
    this._filters.push({ column, operator: `not.${operator}`, value });
    return this;
  }

  or(filters: string): MockSupabaseQueryBuilder {
    this._filters.push({ operator: 'or', value: filters });
    return this;
  }

  and(filters: string): MockSupabaseQueryBuilder {
    this._filters.push({ operator: 'and', value: filters });
    return this;
  }

  order(column: string, options: { ascending?: boolean } = {}): MockSupabaseQueryBuilder {
    this._filters.push({ column, operator: 'order', value: options });
    return this;
  }

  limit(count: number): MockSupabaseQueryBuilder {
    this._filters.push({ operator: 'limit', value: count });
    return this;
  }

  offset(count: number): MockSupabaseQueryBuilder {
    this._filters.push({ operator: 'offset', value: count });
    return this;
  }

  range(from: number, to: number): MockSupabaseQueryBuilder {
    this._filters.push({ operator: 'range', value: [from, to] });
    return this;
  }

  single(): MockSupabaseQueryBuilder {
    this._filters.push({ operator: 'single' });
    return this;
  }

  maybeSingle(): MockSupabaseQueryBuilder {
    this._filters.push({ operator: 'maybeSingle' });
    return this;
  }

  csv(): MockSupabaseQueryBuilder {
    this._filters.push({ operator: 'csv' });
    return this;
  }

  geojson(): MockSupabaseQueryBuilder {
    this._filters.push({ operator: 'geojson' });
    return this;
  }

  explain(options?: any): MockSupabaseQueryBuilder {
    this._filters.push({ operator: 'explain', value: options });
    return this;
  }

  rollback(): MockSupabaseQueryBuilder {
    this._filters.push({ operator: 'rollback' });
    return this;
  }

  returns(): MockSupabaseQueryBuilder {
    this._filters.push({ operator: 'returns' });
    return this;
  }

  then(onFulfilled: (value: MockSupabaseResponse) => any, onRejected?: (reason: any) => any): Promise<any> {
    return Promise.resolve(this._response).then(onFulfilled, onRejected);
  }

  catch(onRejected: (reason: any) => any): Promise<any> {
    return Promise.resolve(this._response).catch(onRejected);
  }

  finally(onFinally: () => void): Promise<any> {
    return Promise.resolve(this._response).finally(onFinally);
  }
}

export class MockSupabaseClientImpl implements MockSupabaseClient {
  private _defaultResponse: MockSupabaseResponse = { data: [], error: null };
  private _customResponses: Map<string, MockSupabaseResponse> = new Map();

  constructor(defaultResponse?: MockSupabaseResponse) {
    if (defaultResponse) {
      this._defaultResponse = defaultResponse;
    }
  }

  setResponse(table: string, response: MockSupabaseResponse): void {
    this._customResponses.set(table, response);
  }

  setDefaultResponse(response: MockSupabaseResponse): void {
    this._defaultResponse = response;
  }

  clearResponses(): void {
    this._customResponses.clear();
  }

  from(table: string): MockSupabaseQueryBuilder {
    const response = this._customResponses.get(table) || this._defaultResponse;
    return new MockSupabaseQueryBuilderImpl(table, response);
  }

  rpc(functionName: string, params?: any): MockSupabaseQueryBuilder {
    const response = this._customResponses.get(`rpc:${functionName}`) || this._defaultResponse;
    return new MockSupabaseQueryBuilderImpl(`rpc:${functionName}`, response);
  }

  auth = {
    signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null })
  };

  storage = {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: null, error: null }),
      download: jest.fn().mockResolvedValue({ data: null, error: null }),
      remove: jest.fn().mockResolvedValue({ data: null, error: null }),
      list: jest.fn().mockResolvedValue({ data: [], error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'mock-url' } })
    })
  };

  realtime = {
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
      unsubscribe: jest.fn().mockReturnThis()
    })
  };
}

// Factory functions para crear mocks
export function createMockSupabaseClient(defaultResponse?: MockSupabaseResponse): MockSupabaseClientImpl {
  return new MockSupabaseClientImpl(defaultResponse);
}

export function createMockSupabaseAdmin(defaultResponse?: MockSupabaseResponse): MockSupabaseClientImpl {
  return new MockSupabaseClientImpl(defaultResponse);
}

// Helper functions para crear respuestas comunes
export function createSuccessResponse(data: any[] = []): MockSupabaseResponse {
  return { data, error: null };
}

export function createErrorResponse(error: any): MockSupabaseResponse {
  return { data: null, error };
}

export function createEmptyResponse(): MockSupabaseResponse {
  return { data: [], error: null };
}

// Helper para configurar mocks globales
export function setupSupabaseMocks() {
  // Mock de variables de entorno
  process.env.SUPABASE_URL = 'https://mock-project.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'mock-anon-key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

  // Mock del módulo completo de Supabase
  jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => createMockSupabaseClient())
  }));

  // Mock de nuestros helpers de Supabase
  jest.mock('@/lib/supabase', () => ({
    createSupabaseClient: jest.fn(() => createMockSupabaseClient()),
    createSupabaseAdmin: jest.fn(() => createMockSupabaseAdmin())
  }));
}

// Export default para facilitar importación
export default {
  createMockSupabaseClient,
  createMockSupabaseAdmin,
  createSuccessResponse,
  createErrorResponse,
  createEmptyResponse,
  setupSupabaseMocks,
  MockSupabaseClientImpl,
  MockSupabaseQueryBuilderImpl
};