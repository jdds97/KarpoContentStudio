// Jest setup file
/// <reference types="jest" />
import '@testing-library/jest-dom';

// Mock window.fetch for API tests
(global as any).fetch = jest.fn();

// Mock Request and Response for Node.js environment
global.Request = class MockRequest {
  private _url: string;
  private _method: string;
  private _headers: Headers;
  
  constructor(input: string | Request, init?: RequestInit) {
    this._url = typeof input === 'string' ? input : input.url;
    this._method = init?.method || 'GET';
    this._headers = new Headers(init?.headers || {});
  }
  
  get url() { return this._url; }
  get method() { return this._method; }
  get headers() { return this._headers; }
} as any;

// Mock Response for Node.js environment
global.Response = class MockResponse {
  private _body: any;
  private _status: number;
  private _headers: Headers;
  
  constructor(body?: any, init?: ResponseInit) {
    this._body = body;
    this._status = init?.status || 200;
    this._headers = new Headers(init?.headers || {});
  }
  
  get status() { return this._status; }
  get ok() { return this._status >= 200 && this._status < 300; }
  get headers() { return this._headers; }
  
  async json() {
    if (typeof this._body === 'string') {
      return JSON.parse(this._body);
    }
    return this._body;
  }
  
  async text() {
    if (typeof this._body === 'string') {
      return this._body;
    }
    return JSON.stringify(this._body);
  }
} as any;

// Mock Headers if not available
if (typeof global.Headers === 'undefined') {
  global.Headers = class MockHeaders {
    private _headers: Map<string, string> = new Map();
    
    constructor(init?: any) {
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this._headers.set(key.toLowerCase(), String(value));
        });
      }
    }
    
    get(name: string) { return this._headers.get(name.toLowerCase()) || null; }
    set(name: string, value: string) { this._headers.set(name.toLowerCase(), value); }
    has(name: string) { return this._headers.has(name.toLowerCase()); }
  } as any;
}

// Mock console methods to reduce noise in tests
const originalConsole = console;
global.console = {
  ...originalConsole,
  // Keep error and warn for debugging
  error: originalConsole.error,
  warn: originalConsole.warn,
  // Suppress info and log in tests unless needed
  info: jest.fn(),
  log: jest.fn(),
};

// Mock window location safely
if (typeof window !== 'undefined' && !window.location.href.includes('localhost')) {
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
    },
    writable: true,
  });
}

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  (fetch as jest.Mock).mockClear();
});

// Global test utilities
(global as any).testUtils = {
  createMockResponse: (data: any, status = 200) => {
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    } as Response);
  },
  
  createMockElement: (id: string, tag = 'div', attributes = {}) => {
    const element = document.createElement(tag);
    element.id = id;
    Object.assign(element, attributes);
    return element;
  },
  
  setupMockForm: () => {
    document.body.innerHTML = `
      <form id="booking-form">
        <input id="date" type="date" value="" />
        <input id="time" type="time" value="" />
        <select id="package">
          <option value="">Seleccionar paquete</option>
          <option value="1h">1 hora</option>
          <option value="2h">2 horas</option>
          <option value="3h">3 horas</option>
          <option value="4h">4 horas</option>
          <option value="6h">6 horas</option>
          <option value="8h">8 horas</option>
        </select>
        <select id="studio-space">
          <option value="">Seleccionar espacio</option>
          <option value="principal-zone">Zona Principal</option>
          <option value="black-zone">Zona Negra</option>
          <option value="cyclorama">Ciclorama</option>
          <option value="creative-studio">Estudio Creativo</option>
        </select>
        <button type="submit">Reservar</button>
      </form>
    `;
  }
};

// Type declarations for global utilities
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        createMockResponse: (data: any, status?: number) => Promise<Response>;
        createMockElement: (id: string, tag?: string, attributes?: any) => HTMLElement;
        setupMockForm: () => void;
      };
    }
  }
  
  var testUtilsGlobal: {
    createMockResponse: (data: any, status?: number) => Promise<Response>;
    createMockElement: (id: string, tag?: string, attributes?: any) => HTMLElement;
    setupMockForm: () => void;
  };
}