// Sistema centralizado para manejo de errores aplicando DRY y KISS

import type {
  BaseError,
  Result,
  LoggingService,
  LogContext
} from '@/types';

import { 
  AppError, 
  ValidationError, 
  DatabaseError, 
  EmailError, 
  AuthenticationError, 
  ComponentError,
  ERROR_CODES 
} from '@/types';

// =============================================================================
// INTERFACES DEL MANEJADOR DE ERRORES
// =============================================================================

export interface ErrorHandler {
  handle(error: Error | AppError, context?: ErrorContext): void;
  handleAsync(error: Error | AppError, context?: ErrorContext): Promise<void>;
  createResult<T>(error: Error | AppError): Result<T>;
  isRecoverable(error: Error | AppError): boolean;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorRecoveryStrategy {
  canRecover(error: Error | AppError): boolean;
  recover(error: Error | AppError, context?: ErrorContext): Promise<boolean>;
}

// =============================================================================
// ESTRATEGIAS DE RECUPERACIÓN DE ERRORES
// =============================================================================

class NetworkErrorRecoveryStrategy implements ErrorRecoveryStrategy {
  canRecover(error: Error | AppError): boolean {
    return error instanceof AppError && 
           (error.code === ERROR_CODES.NETWORK_ERROR || 
            error.code === ERROR_CODES.TIMEOUT_ERROR);
  }

  async recover(_error: Error | AppError, _context?: ErrorContext): Promise<boolean> {
    // Lógica de reconexión o reintento
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  }
}

class ValidationErrorRecoveryStrategy implements ErrorRecoveryStrategy {
  canRecover(error: Error | AppError): boolean {
    return error instanceof ValidationError;
  }

  async recover(): Promise<boolean> {
    // Los errores de validación no son recuperables automáticamente
    return false;
  }
}

class AuthenticationErrorRecoveryStrategy implements ErrorRecoveryStrategy {
  canRecover(error: Error | AppError): boolean {
    return error instanceof AuthenticationError && 
           error.code === ERROR_CODES.TOKEN_EXPIRED;
  }

  async recover(): Promise<boolean> {
    // Renovación de token
    try {
      // Lógica de renovación de token
      return true;
    } catch {
      return false;
    }
  }
}

// =============================================================================
// MANEJADOR PRINCIPAL DE ERRORES
// =============================================================================

export class CentralizedErrorHandler implements ErrorHandler {
  private recoveryStrategies: ErrorRecoveryStrategy[] = [];
  private logger?: LoggingService;

  constructor(logger?: LoggingService) {
    this.logger = logger;
    this.setupDefaultRecoveryStrategies();
  }

  private setupDefaultRecoveryStrategies(): void {
    this.recoveryStrategies = [
      new NetworkErrorRecoveryStrategy(),
      new ValidationErrorRecoveryStrategy(),
      new AuthenticationErrorRecoveryStrategy()
    ];
  }

  public handle(error: Error | AppError, context?: ErrorContext): void {
    const normalizedError = this.normalizeError(error);
    const logContext = this.createLogContext(context);

    // Registrar el error
    this.logError(normalizedError, logContext);

    // Intentar recuperación si es posible
    if (this.isRecoverable(normalizedError)) {
      this.attemptRecovery(normalizedError, context).catch(() => {
        // Si la recuperación falla, registrar como crítico
        this.logger?.critical('Error recovery failed', normalizedError, logContext);
      });
    }
  }

  public async handleAsync(error: Error | AppError, context?: ErrorContext): Promise<void> {
    const normalizedError = this.normalizeError(error);
    const logContext = this.createLogContext(context);

    // Registrar el error
    this.logError(normalizedError, logContext);

    // Intentar recuperación
    if (this.isRecoverable(normalizedError)) {
      const recovered = await this.attemptRecovery(normalizedError, context);
      if (!recovered) {
        this.logger?.critical('Error recovery failed', normalizedError, logContext);
      }
    }
  }

  public createResult<T>(error: Error | AppError): Result<T> {
    const normalizedError = this.normalizeError(error);
    
    return {
      success: false,
      error: {
        code: normalizedError.code,
        message: normalizedError.message,
        details: normalizedError.details,
        timestamp: normalizedError.timestamp
      }
    };
  }

  public isRecoverable(error: Error | AppError): boolean {
    return this.recoveryStrategies.some(strategy => strategy.canRecover(error));
  }

  private normalizeError(error: Error | AppError): AppError {
    if (error instanceof AppError) {
      return error;
    }

    // Convertir errores nativos a AppError
    return new AppError(
      ERROR_CODES.UNKNOWN_ERROR,
      error.message || 'Error desconocido',
      { originalError: error.name },
      error
    );
  }

  private createLogContext(context?: ErrorContext): LogContext {
    return {
      userId: context?.userId,
      requestId: context?.requestId,
      component: context?.component,
      action: context?.action,
      metadata: context?.metadata
    };
  }

  private logError(error: AppError, context: LogContext): void {
    if (!this.logger) return;

    switch (error.constructor) {
      case ValidationError:
        this.logger.warn(error.message, context);
        break;
      case AuthenticationError:
        this.logger.warn(error.message, context);
        break;
      case ComponentError:
      case EmailError:
        this.logger.error(error.message, error, context);
        break;
      case DatabaseError:
        this.logger.critical(error.message, error, context);
        break;
      default:
        this.logger.error(error.message, error, context);
    }
  }

  private async attemptRecovery(error: AppError, context?: ErrorContext): Promise<boolean> {
    for (const strategy of this.recoveryStrategies) {
      if (strategy.canRecover(error)) {
        try {
          const recovered = await strategy.recover(error, context);
          if (recovered) {
            this.logger?.info('Error recovery successful', {
              component: context?.component,
              action: context?.action,
              errorCode: error.code
            });
            return true;
          }
        } catch (recoveryError) {
          this.logger?.error('Recovery strategy failed', recoveryError as Error, {
            component: context?.component,
            action: context?.action,
            originalErrorCode: error.code
          });
        }
      }
    }
    return false;
  }

  public addRecoveryStrategy(strategy: ErrorRecoveryStrategy): void {
    this.recoveryStrategies.push(strategy);
  }

  public removeRecoveryStrategy(strategy: ErrorRecoveryStrategy): void {
    const index = this.recoveryStrategies.indexOf(strategy);
    if (index > -1) {
      this.recoveryStrategies.splice(index, 1);
    }
  }
}

// =============================================================================
// FACTORY DE ERRORES
// =============================================================================

export class ErrorFactory {
  static validation(message: string, field?: string, value?: unknown): ValidationError {
    return new ValidationError(ERROR_CODES.VALIDATION_FAILED, message, field, value);
  }

  static requiredField(field: string): ValidationError {
    return new ValidationError(
      ERROR_CODES.REQUIRED_FIELD, 
      `${field} es requerido`, 
      field
    );
  }

  static invalidEmail(email: string): ValidationError {
    return new ValidationError(
      ERROR_CODES.INVALID_EMAIL, 
      'Formato de email inválido', 
      'email', 
      email
    );
  }

  static invalidPhone(phone: string): ValidationError {
    return new ValidationError(
      ERROR_CODES.INVALID_PHONE, 
      'Formato de teléfono inválido', 
      'phone', 
      phone
    );
  }

  static database(operation: string, details?: unknown, cause?: Error): DatabaseError {
    return new DatabaseError(
      ERROR_CODES.DB_QUERY_FAILED,
      `Operación de base de datos falló: ${operation}`,
      details,
      cause
    );
  }

  static recordNotFound(entity: string, id: string): DatabaseError {
    return new DatabaseError(
      ERROR_CODES.RECORD_NOT_FOUND,
      `${entity} con id ${id} no encontrado`,
      { entity, id }
    );
  }

  static email(operation: string, details?: unknown, cause?: Error): EmailError {
    return new EmailError(
      ERROR_CODES.EMAIL_SEND_FAILED,
      `Operación de email falló: ${operation}`,
      details,
      cause
    );
  }

  static templateNotFound(templateName: string): EmailError {
    return new EmailError(
      ERROR_CODES.TEMPLATE_NOT_FOUND,
      `Plantilla de email '${templateName}' no encontrada`,
      { templateName }
    );
  }

  static authentication(message: string, details?: unknown, cause?: Error): AuthenticationError {
    return new AuthenticationError(
      ERROR_CODES.AUTH_FAILED,
      message,
      details,
      cause
    );
  }

  static invalidCredentials(): AuthenticationError {
    return new AuthenticationError(
      ERROR_CODES.INVALID_CREDENTIALS,
      'Credenciales inválidas'
    );
  }

  static tokenExpired(): AuthenticationError {
    return new AuthenticationError(
      ERROR_CODES.TOKEN_EXPIRED,
      'Token de autenticación expirado'
    );
  }

  static component(componentName: string, message: string, details?: unknown, cause?: Error): ComponentError {
    return new ComponentError(
      ERROR_CODES.COMPONENT_INIT_FAILED,
      message,
      componentName,
      details,
      cause
    );
  }

  static elementNotFound(selector: string, componentName: string): ComponentError {
    return new ComponentError(
      ERROR_CODES.ELEMENT_NOT_FOUND,
      `Elemento '${selector}' no encontrado`,
      componentName,
      { selector }
    );
  }

  static network(message: string, details?: unknown, cause?: Error): AppError {
    return new AppError(
      ERROR_CODES.NETWORK_ERROR,
      message,
      details,
      cause
    );
  }

  static timeout(operation: string, timeout: number): AppError {
    return new AppError(
      ERROR_CODES.TIMEOUT_ERROR,
      `Operación '${operation}' expiró después de ${timeout}ms`,
      { operation, timeout }
    );
  }

  static bookingConflict(date: string, time: string, space: string): AppError {
    return new AppError(
      ERROR_CODES.BOOKING_CONFLICT,
      `Conflicto de reserva detectado para ${space} el ${date} a las ${time}`,
      { date, time, space }
    );
  }

  static unavailableTime(date: string, time: string): AppError {
    return new AppError(
      ERROR_CODES.UNAVAILABLE_TIME,
      `Horario ${time} del ${date} no disponible`,
      { date, time }
    );
  }
}

// =============================================================================
// HELPERS DE RESULTADOS
// =============================================================================

export class ResultHelper {
  static success<T>(data: T): Result<T> {
    return {
      success: true,
      data
    };
  }

  static failure<T>(error: BaseError): Result<T> {
    return {
      success: false,
      error
    };
  }

  static fromError<T>(error: Error | AppError): Result<T> {
    const normalizedError = error instanceof AppError 
      ? error 
      : new AppError(ERROR_CODES.UNKNOWN_ERROR, error.message, undefined, error);

    return ResultHelper.failure({
      code: normalizedError.code,
      message: normalizedError.message,
      details: normalizedError.details,
      timestamp: normalizedError.timestamp
    });
  }

  static async fromPromise<T>(promise: Promise<T>): Promise<Result<T>> {
    try {
      const data = await promise;
      return ResultHelper.success(data);
    } catch (error) {
      return ResultHelper.fromError<T>(error as Error);
    }
  }

  static async safeExecute<T>(
    operation: () => Promise<T>,
    errorHandler?: ErrorHandler,
    context?: ErrorContext
  ): Promise<Result<T>> {
    try {
      const data = await operation();
      return ResultHelper.success(data);
    } catch (error) {
      const result = ResultHelper.fromError<T>(error as Error);
      
      if (errorHandler) {
        await errorHandler.handleAsync(error as Error, context);
      }
      
      return result;
    }
  }
}

// =============================================================================
// INSTANCIA GLOBAL DEL MANEJADOR DE ERRORES
// =============================================================================

let globalErrorHandler: CentralizedErrorHandler | null = null;

export function initializeErrorHandler(logger?: LoggingService): CentralizedErrorHandler {
  globalErrorHandler = new CentralizedErrorHandler(logger);
  return globalErrorHandler;
}

export function getErrorHandler(): CentralizedErrorHandler {
  if (!globalErrorHandler) {
    globalErrorHandler = new CentralizedErrorHandler();
  }
  return globalErrorHandler;
}

// =============================================================================
// FUNCIONES DE CONVENIENCIA
// =============================================================================

export function handleError(error: Error | AppError, context?: ErrorContext): void {
  getErrorHandler().handle(error, context);
}

export async function handleErrorAsync(error: Error | AppError, context?: ErrorContext): Promise<void> {
  await getErrorHandler().handleAsync(error, context);
}

export function createErrorResult<T>(error: Error | AppError): Result<T> {
  return getErrorHandler().createResult<T>(error);
}

export function isRecoverableError(error: Error | AppError): boolean {
  return getErrorHandler().isRecoverable(error);
}

// =============================================================================
// DECORADORES
// =============================================================================

export function HandleErrors(componentName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        const context: ErrorContext = {
          component: componentName || target.constructor.name,
          action: propertyKey
        };
        
        await handleErrorAsync(error as Error, context);
        throw error;
      }
    };

    return descriptor;
  };
}

export function SafeExecute(errorHandler?: ErrorHandler) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const context: ErrorContext = {
        component: target.constructor.name,
        action: propertyKey
      };

      return await ResultHelper.safeExecute(
        () => originalMethod.apply(this, args),
        errorHandler || getErrorHandler(),
        context
      );
    };

    return descriptor;
  };
}