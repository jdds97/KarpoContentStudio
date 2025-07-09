// Service Locator para gestión centralizada de dependencias

import type {
  DatabaseService,
  BookingRepository,
  EmailService,
  EmailTemplateService,
  AuthenticationService,
  AuthorizationService,
  CacheService,
  LoggingService,
  ConfigurationService,
  AvailabilityService,
  NotificationService
} from '@/types';

// Tipos para el registro de servicios
type ServiceKey = string;
type ServiceFactory<T = any> = () => T;
type ServiceInstance<T = any> = T;

interface ServiceRegistration<T = any> {
  factory: ServiceFactory<T>;
  singleton: boolean;
  instance?: ServiceInstance<T>;
}

// Interfaz del Service Locator
export interface IServiceLocator {
  register<T>(key: ServiceKey, factory: ServiceFactory<T>, singleton?: boolean): void;
  registerInstance<T>(key: ServiceKey, instance: T): void;
  get<T>(key: ServiceKey): T;
  has(key: ServiceKey): boolean;
  clear(): void;
  remove(key: ServiceKey): boolean;
}

// Implementación del Service Locator
export class ServiceLocator implements IServiceLocator {
  private static instance: ServiceLocator;
  private services: Map<ServiceKey, ServiceRegistration> = new Map();

  private constructor() {}

  public static getInstance(): ServiceLocator {
    if (!ServiceLocator.instance) {
      ServiceLocator.instance = new ServiceLocator();
    }
    return ServiceLocator.instance;
  }

  public register<T>(key: ServiceKey, factory: ServiceFactory<T>, singleton: boolean = true): void {
    this.services.set(key, {
      factory,
      singleton
    });
  }

  public registerInstance<T>(key: ServiceKey, instance: T): void {
    this.services.set(key, {
      factory: () => instance,
      singleton: true,
      instance
    });
  }

  public get<T>(key: ServiceKey): T {
    const registration = this.services.get(key);
    
    if (!registration) {
      throw new Error(`Service '${key}' not registered`);
    }

    if (registration.singleton) {
      if (!registration.instance) {
        registration.instance = registration.factory();
      }
      return registration.instance as T;
    }

    return registration.factory() as T;
  }

  public has(key: ServiceKey): boolean {
    return this.services.has(key);
  }

  public clear(): void {
    this.services.clear();
  }

  public remove(key: ServiceKey): boolean {
    return this.services.delete(key);
  }

  // Métodos de conveniencia para servicios comunes
  public getDatabaseService(): DatabaseService {
    return this.get<DatabaseService>('database');
  }

  public getBookingRepository(): BookingRepository {
    return this.get<BookingRepository>('bookingRepository');
  }

  public getEmailService(): EmailService {
    return this.get<EmailService>('email');
  }

  public getEmailTemplateService(): EmailTemplateService {
    return this.get<EmailTemplateService>('emailTemplate');
  }

  public getAuthenticationService(): AuthenticationService {
    return this.get<AuthenticationService>('authentication');
  }

  public getAuthorizationService(): AuthorizationService {
    return this.get<AuthorizationService>('authorization');
  }

  public getCacheService(): CacheService {
    return this.get<CacheService>('cache');
  }

  public getLoggingService(): LoggingService {
    return this.get<LoggingService>('logging');
  }

  public getConfigurationService(): ConfigurationService {
    return this.get<ConfigurationService>('configuration');
  }

  public getAvailabilityService(): AvailabilityService {
    return this.get<AvailabilityService>('availability');
  }

  public getNotificationService(): NotificationService {
    return this.get<NotificationService>('notification');
  }
}

// Constantes para llaves de servicios
export const ServiceKeys = {
  DATABASE: 'database',
  BOOKING_REPOSITORY: 'bookingRepository',
  EMAIL: 'email',
  EMAIL_TEMPLATE: 'emailTemplate',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  CACHE: 'cache',
  LOGGING: 'logging',
  CONFIGURATION: 'configuration',
  AVAILABILITY: 'availability',
  NOTIFICATION: 'notification'
} as const;

// Builder para configuración del Service Locator
export class ServiceLocatorBuilder {
  private locator: ServiceLocator;

  constructor() {
    this.locator = ServiceLocator.getInstance();
  }

  public withDatabaseService(factory: ServiceFactory<DatabaseService>): ServiceLocatorBuilder {
    this.locator.register(ServiceKeys.DATABASE, factory);
    return this;
  }

  public withBookingRepository(factory: ServiceFactory<BookingRepository>): ServiceLocatorBuilder {
    this.locator.register(ServiceKeys.BOOKING_REPOSITORY, factory);
    return this;
  }

  public withEmailService(factory: ServiceFactory<EmailService>): ServiceLocatorBuilder {
    this.locator.register(ServiceKeys.EMAIL, factory);
    return this;
  }

  public withEmailTemplateService(factory: ServiceFactory<EmailTemplateService>): ServiceLocatorBuilder {
    this.locator.register(ServiceKeys.EMAIL_TEMPLATE, factory);
    return this;
  }

  public withAuthenticationService(factory: ServiceFactory<AuthenticationService>): ServiceLocatorBuilder {
    this.locator.register(ServiceKeys.AUTHENTICATION, factory);
    return this;
  }

  public withAuthorizationService(factory: ServiceFactory<AuthorizationService>): ServiceLocatorBuilder {
    this.locator.register(ServiceKeys.AUTHORIZATION, factory);
    return this;
  }

  public withCacheService(factory: ServiceFactory<CacheService>): ServiceLocatorBuilder {
    this.locator.register(ServiceKeys.CACHE, factory);
    return this;
  }

  public withLoggingService(factory: ServiceFactory<LoggingService>): ServiceLocatorBuilder {
    this.locator.register(ServiceKeys.LOGGING, factory);
    return this;
  }

  public withConfigurationService(factory: ServiceFactory<ConfigurationService>): ServiceLocatorBuilder {
    this.locator.register(ServiceKeys.CONFIGURATION, factory);
    return this;
  }

  public withAvailabilityService(factory: ServiceFactory<AvailabilityService>): ServiceLocatorBuilder {
    this.locator.register(ServiceKeys.AVAILABILITY, factory);
    return this;
  }

  public withNotificationService(factory: ServiceFactory<NotificationService>): ServiceLocatorBuilder {
    this.locator.register(ServiceKeys.NOTIFICATION, factory);
    return this;
  }

  public build(): ServiceLocator {
    return this.locator;
  }
}

// Decorador para inyección de dependencias
export function Inject(serviceKey: ServiceKey) {
  return function (target: any, _propertyKey: string | symbol | undefined, parameterIndex: number) {
    // En tiempo de ejecución, resolver el servicio
    const locator = ServiceLocator.getInstance();
    const service = locator.get(serviceKey);
    
    // Almacenar la metadata para usar en el constructor
    if (!target._injectionMetadata) {
      target._injectionMetadata = {};
    }
    target._injectionMetadata[parameterIndex] = service;
  };
}

// Clase base para servicios que requieren inyección de dependencias
export abstract class Injectable {
  constructor(...args: any[]) {
    // Resolver dependencias inyectadas
    const metadata = (this.constructor as any)._injectionMetadata;
    if (metadata) {
      Object.keys(metadata).forEach(index => {
        const paramIndex = parseInt(index);
        if (args[paramIndex] === undefined) {
          args[paramIndex] = metadata[paramIndex];
        }
      });
    }
  }
}

// Funciones de conveniencia para acceso global
export const serviceLocator = ServiceLocator.getInstance();

export function getService<T>(key: ServiceKey): T {
  return serviceLocator.get<T>(key);
}

export function getDatabaseService(): DatabaseService {
  return serviceLocator.getDatabaseService();
}

export function getBookingRepository(): BookingRepository {
  return serviceLocator.getBookingRepository();
}

export function getEmailService(): EmailService {
  return serviceLocator.getEmailService();
}

export function getEmailTemplateService(): EmailTemplateService {
  return serviceLocator.getEmailTemplateService();
}

export function getAuthenticationService(): AuthenticationService {
  return serviceLocator.getAuthenticationService();
}

export function getLoggingService(): LoggingService {
  return serviceLocator.getLoggingService();
}

export function getConfigurationService(): ConfigurationService {
  return serviceLocator.getConfigurationService();
}

// Configuración por defecto para desarrollo
export function configureDefaultServices(): ServiceLocator {
  const builder = new ServiceLocatorBuilder();

  // Configurar servicios mock para desarrollo
  builder
    .withDatabaseService(() => {
      throw new Error('Database service not configured');
    })
    .withBookingRepository(() => {
      throw new Error('Booking repository not configured');
    })
    .withEmailService(() => {
      throw new Error('Email service not configured');
    })
    .withEmailTemplateService(() => {
      throw new Error('Email template service not configured');
    })
    .withAuthenticationService(() => {
      throw new Error('Authentication service not configured');
    })
    .withLoggingService(() => ({
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      critical: () => {}
    }))
    .withConfigurationService(() => ({
      get: (_key: string, defaultValue?: any) => defaultValue,
      set: () => {},
      has: () => false,
      getAll: () => ({}),
      reload: async () => {}
    }));

  return builder.build();
}

// Configuración para producción con servicios reales
export function configureProductionServices(config: {
  supabaseClient?: any;
  resendClient?: any;
  cacheClient?: any;
  loggerConfig?: any;
}): ServiceLocator {
  const builder = new ServiceLocatorBuilder();

  if (config.supabaseClient) {
    // Importar dinámicamente para evitar dependencias circulares
    import('./implementations/supabase-service').then(({ SupabaseServiceFactory }) => {
      const factory = new SupabaseServiceFactory(config.supabaseClient);
      
      builder
        .withDatabaseService(() => factory.createDatabaseService())
        .withBookingRepository(() => factory.createBookingRepository())
        .withAuthenticationService(() => factory.createAuthenticationService());
    });
  }

  if (config.resendClient) {
    import('./implementations/resend-service').then(({ EmailServiceFactory }) => {
      const factory = new EmailServiceFactory(config.resendClient);
      
      builder
        .withEmailService(() => factory.createEmailService())
        .withEmailTemplateService(() => factory.createTemplateService());
    });
  }

  return builder.build();
}