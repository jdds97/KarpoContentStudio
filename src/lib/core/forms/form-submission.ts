// Form Submission System - Clean Architecture
// Aplicando principios SOLID para envío de formularios

// Interfaces (Interface Segregation Principle)
export interface FormSubmissionHandler {
  submit(formData: FormData): Promise<SubmissionResult>;
  canHandle(formType: string): boolean;
}

export interface SubmissionResult {
  success: boolean;
  data?: any;
  error?: string;
  redirectTo?: string;
  validationErrors?: Record<string, string[]>;
}

export interface FormSubmissionStrategy {
  execute(formData: FormData, endpoint: string): Promise<SubmissionResult>;
}

export interface RetryPolicy {
  shouldRetry(attempt: number, error: Error): boolean;
  getDelay(attempt: number): number;
  getMaxAttempts(): number;
}

// Tipos
export type SubmissionMethod = 'fetch' | 'action' | 'xhr';
export type FormType = 'contact' | 'booking' | 'login' | 'admin' | 'generic';

export interface SubmissionConfig {
  method: SubmissionMethod;
  endpoint: string;
  headers?: Record<string, string>;
  timeout?: number;
  retryPolicy?: RetryPolicy;
  validateBeforeSubmit?: boolean;
}

// Estrategias de envío (Strategy Pattern)
export class FetchSubmissionStrategy implements FormSubmissionStrategy {
  constructor(private config: SubmissionConfig) {}

  public async execute(formData: FormData, endpoint: string): Promise<SubmissionResult> {
    const controller = new AbortController();
    const timeoutId = this.config.timeout ? 
      setTimeout(() => controller.abort(), this.config.timeout) : null;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: this.config.headers,
        signal: controller.signal
      });

      if (timeoutId) clearTimeout(timeoutId);

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      return this.normalizeResult(result);
      
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Tiempo de espera agotado');
        }
        throw error;
      }
      throw new Error('Error desconocido en el envío');
    }
  }

  private normalizeResult(result: any): SubmissionResult {
    return {
      success: result.success || false,
      data: result.data,
      error: result.error,
      redirectTo: result.redirectTo,
      validationErrors: result.validationErrors
    };
  }
}

export class AstroActionSubmissionStrategy implements FormSubmissionStrategy {
  constructor(
    private config: SubmissionConfig,
    private actionFunction: (formData: FormData) => Promise<any>
  ) {}

  public async execute(formData: FormData): Promise<SubmissionResult> {
    try {
      // Apply timeout if configured
      const timeoutMs = this.config.timeout || 30000;
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Action timeout')), timeoutMs)
      );
      
      const result = await Promise.race([
        this.actionFunction(formData),
        timeoutPromise
      ]);
      
      if (result.error) {
        return {
          success: false,
          error: result.error.message || 'Error en la acción',
          validationErrors: result.error.fields
        };
      }

      return {
        success: true,
        data: result.data
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

// Políticas de reintentos (Strategy Pattern)
export class ExponentialBackoffRetryPolicy implements RetryPolicy {
  constructor(
    private maxAttempts: number = 3,
    private baseDelay: number = 1000,
    private maxDelay: number = 10000
  ) {}

  shouldRetry(attempt: number, error: Error): boolean {
    if (attempt >= this.maxAttempts) return false;
    
    // No reintentar errores de validación o autenticación
    const message = error.message.toLowerCase();
    if (message.includes('validación') || 
        message.includes('authentication') || 
        message.includes('authorization') ||
        message.includes('unauthorized')) {
      return false;
    }
    
    return true;
  }

  getDelay(attempt: number): number {
    const delay = this.baseDelay * Math.pow(2, attempt - 1);
    return Math.min(delay, this.maxDelay);
  }

  getMaxAttempts(): number {
    return this.maxAttempts;
  }
}

export class FixedDelayRetryPolicy implements RetryPolicy {
  constructor(
    private maxAttempts: number = 3,
    private delay: number = 1000
  ) {}

  shouldRetry(attempt: number): boolean {
    return attempt < this.maxAttempts;
  }

  getDelay(): number {
    return this.delay;
  }

  getMaxAttempts(): number {
    return this.maxAttempts;
  }
}

export class NoRetryPolicy implements RetryPolicy {
  shouldRetry(): boolean {
    return false;
  }

  getDelay(): number {
    return 0;
  }

  getMaxAttempts(): number {
    return 1;
  }
}

// Manejadores específicos por tipo de formulario (Single Responsibility Principle)
export class ContactFormSubmissionHandler implements FormSubmissionHandler {
  private strategy: FormSubmissionStrategy;

  constructor(endpoint: string = '/api/contact') {
    const config: SubmissionConfig = {
      method: 'fetch',
      endpoint,
      timeout: 10000,
      retryPolicy: new ExponentialBackoffRetryPolicy(2, 1000),
      validateBeforeSubmit: true
    };
    
    this.strategy = new FetchSubmissionStrategy(config);
  }

  canHandle(formType: string): boolean {
    return formType === 'contact';
  }

  async submit(formData: FormData): Promise<SubmissionResult> {
    return await this.strategy.execute(formData, '/api/contact');
  }
}

export class BookingFormSubmissionHandler implements FormSubmissionHandler {
  private strategy: FormSubmissionStrategy;

  constructor(actionFunction?: (formData: FormData) => Promise<any>) {
    if (actionFunction) {
      const config: SubmissionConfig = {
        method: 'action',
        endpoint: '',
        timeout: 15000,
        retryPolicy: new NoRetryPolicy(), // Las actions de Astro no necesitan reintentos
        validateBeforeSubmit: true
      };
      
      this.strategy = new AstroActionSubmissionStrategy(config, actionFunction);
    } else {
      throw new Error('Action function is required for booking form submission');
    }
  }

  canHandle(formType: string): boolean {
    return formType === 'booking';
  }

  async submit(formData: FormData): Promise<SubmissionResult> {
    return await this.strategy.execute(formData, '');
  }
}

export class LoginFormSubmissionHandler implements FormSubmissionHandler {
  private strategy: FormSubmissionStrategy;

  constructor(endpoint: string = '/api/auth/signin') {
    const config: SubmissionConfig = {
      method: 'fetch',
      endpoint,
      timeout: 8000,
      retryPolicy: new FixedDelayRetryPolicy(2, 1000),
      validateBeforeSubmit: true
    };
    
    this.strategy = new FetchSubmissionStrategy(config);
  }

  canHandle(formType: string): boolean {
    return formType === 'login';
  }

  async submit(formData: FormData): Promise<SubmissionResult> {
    return await this.strategy.execute(formData, '/api/auth/signin');
  }
}

// Clase principal para manejo de envío de formularios (Facade Pattern)
export class FormSubmissionManager {
  private handlers: Map<string, FormSubmissionHandler> = new Map();
  private defaultRetryPolicy: RetryPolicy = new ExponentialBackoffRetryPolicy();

  public registerHandler(formType: string, handler: FormSubmissionHandler): void {
    this.handlers.set(formType, handler);
  }

  public async submit(
    formType: string, 
    formData: FormData,
    retryPolicy?: RetryPolicy
  ): Promise<SubmissionResult> {
    const handler = this.handlers.get(formType);
    
    if (!handler) {
      throw new Error(`No handler registered for form type: ${formType}`);
    }

    const policy = retryPolicy || this.defaultRetryPolicy;
    return await this.submitWithRetry(handler, formData, policy);
  }

  private async submitWithRetry(
    handler: FormSubmissionHandler,
    formData: FormData,
    retryPolicy: RetryPolicy
  ): Promise<SubmissionResult> {
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < retryPolicy.getMaxAttempts()) {
      attempt++;
      
      try {
        return await handler.submit(formData);
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (!retryPolicy.shouldRetry(attempt, lastError)) {
          break;
        }
        
        if (attempt < retryPolicy.getMaxAttempts()) {
          const delay = retryPolicy.getDelay(attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    return {
      success: false,
      error: lastError?.message || 'Error desconocido después de varios intentos'
    };
  }

  public getHandler(formType: string): FormSubmissionHandler | undefined {
    return this.handlers.get(formType);
  }

  public hasHandler(formType: string): boolean {
    return this.handlers.has(formType);
  }

  public removeHandler(formType: string): boolean {
    return this.handlers.delete(formType);
  }

  public clearHandlers(): void {
    this.handlers.clear();
  }
}

// Factory para crear manejadores comunes (Factory Pattern)
export class FormSubmissionHandlerFactory {
  static createContactHandler(endpoint?: string): ContactFormSubmissionHandler {
    return new ContactFormSubmissionHandler(endpoint);
  }

  static createBookingHandler(actionFunction: (formData: FormData) => Promise<any>): BookingFormSubmissionHandler {
    return new BookingFormSubmissionHandler(actionFunction);
  }

  static createLoginHandler(endpoint?: string): LoginFormSubmissionHandler {
    return new LoginFormSubmissionHandler(endpoint);
  }

  static createGenericHandler(config: SubmissionConfig): FormSubmissionHandler {
    return new class implements FormSubmissionHandler {
      private strategy = new FetchSubmissionStrategy(config);

      canHandle(formType: string): boolean {
        return formType === 'generic';
      }

      async submit(formData: FormData): Promise<SubmissionResult> {
        return await this.strategy.execute(formData, config.endpoint);
      }
    };
  }
}

// Instancia global del manager
export const formSubmissionManager = new FormSubmissionManager();

// Registrar handlers por defecto
formSubmissionManager.registerHandler('contact', FormSubmissionHandlerFactory.createContactHandler());
formSubmissionManager.registerHandler('login', FormSubmissionHandlerFactory.createLoginHandler());