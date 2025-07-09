// Component Initializer - Patrón consistente para inicialización de componentes
// Aplicando principios SOLID y patrones de diseño

// Interfaces base (Interface Segregation Principle)
export interface ComponentHandler {
  initialize(): void;
  cleanup?(): void;
  isInitialized(): boolean;
}

export interface InitializationStrategy {
  shouldInitialize(): boolean;
  execute(handler: ComponentHandler): void;
}

export interface ComponentConfig {
  name: string;
  selector?: string;
  retryAttempts?: number;
  retryDelay?: number;
  useIdleCallback?: boolean;
  autoCleanup?: boolean;
}

// Tipos para eventos del ciclo de vida
export type ComponentEventType = 'initialized' | 'cleanup' | 'error' | 'retry';

export interface ComponentEvent {
  type: ComponentEventType;
  componentName: string;
  timestamp: Date;
  data?: any;
}

// Clase base abstracta para handlers de componentes (Template Method Pattern)
export abstract class BaseComponentHandler implements ComponentHandler {
  protected isComponentInitialized = false;
  protected readonly componentName: string;

  constructor(componentName: string) {
    this.componentName = componentName;
  }

  public initialize(): void {
    if (this.isComponentInitialized) {
      return;
    }

    try {
      this.beforeInitialize();
      this.doInitialize();
      this.afterInitialize();
      this.isComponentInitialized = true;
      this.emitEvent('initialized');
    } catch (error) {
      this.handleInitializationError(error);
    }
  }

  public cleanup(): void {
    if (!this.isComponentInitialized) {
      return;
    }

    try {
      this.doCleanup();
      this.isComponentInitialized = false;
      this.emitEvent('cleanup');
    } catch (error) {
      this.emitEvent('error', { error });
    }
  }

  public isInitialized(): boolean {
    return this.isComponentInitialized;
  }

  // Template methods (Template Method Pattern)
  protected beforeInitialize(): void {
    // Hook para acciones antes de la inicialización
  }

  protected abstract doInitialize(): void;

  protected afterInitialize(): void {
    // Hook para acciones después de la inicialización
  }

  protected doCleanup(): void {
    // Implementación por defecto de limpieza
  }

  protected handleInitializationError(error: any): void {
    this.emitEvent('error', { error });
  }

  protected emitEvent(type: ComponentEventType, data?: any): void {
    ComponentEventBus.emit({
      type,
      componentName: this.componentName,
      timestamp: new Date(),
      data
    });
  }
}

// Event Bus para comunicación entre componentes (Observer Pattern)
class ComponentEventBus {
  private static listeners: Map<ComponentEventType, ((event: ComponentEvent) => void)[]> = new Map();

  static on(eventType: ComponentEventType, listener: (event: ComponentEvent) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
  }

  static off(eventType: ComponentEventType, listener: (event: ComponentEvent) => void): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  static emit(event: ComponentEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          // Silenciar errores en listeners para evitar cascadas
        }
      });
    }
  }
}

// Estrategias de inicialización (Strategy Pattern)
class DOMReadyStrategy implements InitializationStrategy {
  shouldInitialize(): boolean {
    return document.readyState !== 'loading';
  }

  execute(handler: ComponentHandler): void {
    if (this.shouldInitialize()) {
      handler.initialize();
    } else {
      document.addEventListener('DOMContentLoaded', () => handler.initialize());
    }
  }
}

class IdleCallbackStrategy implements InitializationStrategy {
  shouldInitialize(): boolean {
    return 'requestIdleCallback' in window;
  }

  execute(handler: ComponentHandler): void {
    if (this.shouldInitialize()) {
      requestIdleCallback(() => handler.initialize());
    } else {
      // Fallback a setTimeout
      setTimeout(() => handler.initialize(), 0);
    }
  }
}

class AstroTransitionStrategy implements InitializationStrategy {
  shouldInitialize(): boolean {
    return typeof document !== 'undefined';
  }

  execute(handler: ComponentHandler): void {
    // Inicialización inmediata
    new DOMReadyStrategy().execute(handler);
    
    // Re-inicialización en transiciones de Astro
    document.addEventListener('astro:page-load', () => {
      if (!handler.isInitialized()) {
        handler.initialize();
      }
    });
  }
}

// Clase principal para inicialización de componentes (Facade Pattern)
export class ComponentInitializer {
  private static instance: ComponentInitializer;
  private registeredComponents: Map<string, ComponentHandler> = new Map();
  private cleanupHandlers: Set<() => void> = new Set();

  private constructor() {
    this.setupGlobalCleanup();
  }

  static getInstance(): ComponentInitializer {
    if (!ComponentInitializer.instance) {
      ComponentInitializer.instance = new ComponentInitializer();
    }
    return ComponentInitializer.instance;
  }

  // Método principal para registrar e inicializar componentes
  public register(handler: ComponentHandler, config: ComponentConfig): void {
    const strategy = this.selectStrategy(config);
    
    // Verificar si el componente debe inicializarse
    if (config.selector && !document.querySelector(config.selector)) {
      return; // Componente no está presente en el DOM
    }

    // Registrar el componente
    this.registeredComponents.set(config.name, handler);

    // Aplicar estrategia de inicialización
    if (config.retryAttempts && config.retryAttempts > 0) {
      this.initializeWithRetry(handler, config, strategy);
    } else {
      strategy.execute(handler);
    }

    // Configurar cleanup automático si está habilitado
    if (config.autoCleanup !== false) {
      this.setupComponentCleanup(handler);
    }
  }

  // Método de conveniencia para inicialización simple
  public initializeComponent(
    handlerFactory: () => ComponentHandler,
    config: Partial<ComponentConfig> = {}
  ): void {
    const fullConfig: ComponentConfig = {
      name: 'anonymous',
      retryAttempts: 3,
      retryDelay: 100,
      useIdleCallback: true,
      autoCleanup: true,
      ...config
    };

    const handler = handlerFactory();
    this.register(handler, fullConfig);
  }

  // Obtener un componente registrado
  public getComponent(name: string): ComponentHandler | undefined {
    return this.registeredComponents.get(name);
  }

  // Limpiar todos los componentes
  public cleanupAll(): void {
    this.registeredComponents.forEach(handler => {
      if (handler.cleanup) {
        handler.cleanup();
      }
    });
    this.registeredComponents.clear();
    
    this.cleanupHandlers.forEach(cleanup => cleanup());
    this.cleanupHandlers.clear();
  }

  private selectStrategy(config: ComponentConfig): InitializationStrategy {
    if (config.useIdleCallback) {
      return new IdleCallbackStrategy();
    }
    return new AstroTransitionStrategy();
  }

  private initializeWithRetry(
    handler: ComponentHandler,
    config: ComponentConfig,
    strategy: InitializationStrategy
  ): void {
    let attempts = 0;
    const maxAttempts = config.retryAttempts || 3;
    const delay = config.retryDelay || 100;

    const tryInitialize = () => {
      attempts++;
      
      try {
        strategy.execute(handler);
        
        // Verificar si la inicialización fue exitosa
        setTimeout(() => {
          if (!handler.isInitialized() && attempts < maxAttempts) {
            ComponentEventBus.emit({
              type: 'retry',
              componentName: config.name,
              timestamp: new Date(),
              data: { attempt: attempts, maxAttempts }
            });
            setTimeout(tryInitialize, delay);
          }
        }, 50);
        
      } catch (error) {
        if (attempts < maxAttempts) {
          setTimeout(tryInitialize, delay);
        }
      }
    };

    tryInitialize();
  }

  private setupComponentCleanup(handler: ComponentHandler): void {
    if (handler.cleanup) {
      const cleanup = () => handler.cleanup!();
      this.cleanupHandlers.add(cleanup);
    }
  }

  private setupGlobalCleanup(): void {
    if (typeof document !== 'undefined') {
      // Cleanup en transiciones de Astro
      document.addEventListener('astro:before-preparation', () => {
        this.cleanupAll();
      });

      // Cleanup en unload de página
      window.addEventListener('beforeunload', () => {
        this.cleanupAll();
      });
    }
  }
}

// Funciones de conveniencia para uso común
export const componentInitializer = ComponentInitializer.getInstance();

export function initializeComponent(
  handlerFactory: () => ComponentHandler,
  config: Partial<ComponentConfig> = {}
): void {
  componentInitializer.initializeComponent(handlerFactory, config);
}

export function registerComponentHandler(
  handler: ComponentHandler,
  config: ComponentConfig
): void {
  componentInitializer.register(handler, config);
}

export function getComponentHandler(name: string): ComponentHandler | undefined {
  return componentInitializer.getComponent(name);
}

// Decorator para auto-registro de componentes (Decorator Pattern)
export function AutoInitialize(config: Partial<ComponentConfig> = {}) {
  return function <T extends new (...args: any[]) => ComponentHandler>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        
        const fullConfig: ComponentConfig = {
          name: constructor.name,
          ...config
        };
        
        componentInitializer.register(this, fullConfig);
      }
    };
  };
}

// Export del Event Bus para uso externo
export { ComponentEventBus };