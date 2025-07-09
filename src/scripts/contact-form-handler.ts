// Contact Form Handler - Clean Architecture
// Aplicando principios SOLID para manejo de formularios de contacto

// Removed unused imports
import { NotificationType } from '@/types';
import { handleError } from '@/lib/core/error-handler';

// Interface para el estado de envío
interface SubmissionState {
  isSubmitting: boolean;
  originalText: string | null;
  button: HTMLButtonElement | null;
}

// Interface para la respuesta del servidor
interface ContactFormResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Enum para tipos de resultado - usando NotificationType centralizado
type ResultType = NotificationType.SUCCESS | NotificationType.ERROR | 'connection-error';

// Clase para manejo de UI feedback (Single Responsibility Principle)
class UIFeedbackManager {
  private resultDiv: HTMLDivElement | null;

  constructor() {
    this.resultDiv = document.getElementById('contact-result') as HTMLDivElement;
  }

  public showResult(type: ResultType, message: string): void {
    if (!this.resultDiv) return;

    this.resultDiv.classList.remove('hidden');
    this.resultDiv.className = this.getResultClasses(type);
    this.resultDiv.textContent = message;
  }

  public hideResult(): void {
    if (!this.resultDiv) return;
    this.resultDiv.classList.add('hidden');
  }

  private getResultClasses(type: ResultType): string {
    const baseClasses = 'p-4 rounded-md';
    
    switch (type) {
      case NotificationType.SUCCESS:
        return `${baseClasses} bg-green-50 border border-green-200 text-green-700`;
      case NotificationType.ERROR:
      case 'connection-error':
        return `${baseClasses} bg-red-50 border border-red-200 text-red-700`;
      default:
        return baseClasses;
    }
  }
}

// Clase para manejo de estado de botón (Single Responsibility Principle)
class ButtonStateManager {
  private submissionState: SubmissionState;

  constructor() {
    this.submissionState = {
      isSubmitting: false,
      originalText: null,
      button: null
    };
  }

  public setLoadingState(form: HTMLFormElement): void {
    this.submissionState.isSubmitting = true;
    this.submissionState.button = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    
    if (this.submissionState.button) {
      this.submissionState.originalText = this.submissionState.button.textContent;
      this.submissionState.button.disabled = true;
      this.submissionState.button.textContent = 'Enviando...';
    }
  }

  public resetState(): void {
    this.submissionState.isSubmitting = false;
    
    if (this.submissionState.button && this.submissionState.originalText) {
      this.submissionState.button.disabled = false;
      this.submissionState.button.textContent = this.submissionState.originalText;
    }
  }

  public get isSubmitting(): boolean {
    return this.submissionState.isSubmitting;
  }
}

// Clase principal para manejo del formulario de contacto (Single Responsibility Principle)
export class ContactFormHandler {
  private form: HTMLFormElement | null = null;
  private uiManager: UIFeedbackManager;
  private buttonManager: ButtonStateManager;
  private retryAttempts = 0;
  private readonly maxRetryAttempts = 10;
  private readonly retryDelay = 100;

  constructor() {
    this.uiManager = new UIFeedbackManager();
    this.buttonManager = new ButtonStateManager();
  }

  // Método principal de inicialización
  public initialize(): void {
    // Esperar a que el DOM esté cargado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.findFormWithRetry());
    } else {
      this.findFormWithRetry();
    }
  }

  // Método de limpieza
  public cleanup(): void {
    if (this.form) {
      this.form.removeEventListener('submit', this.handleSubmit.bind(this));
    }
  }

  // Búsqueda del formulario con reintentos
  private findFormWithRetry(): void {
    this.retryAttempts++;
    
    if (this.retryAttempts > this.maxRetryAttempts) {
      return;
    }

    // Buscar por acción ya que el formulario usa Astro actions
    this.form = document.querySelector('form[method="POST"]') as HTMLFormElement;
    
    if (this.form && this.form.action) {
      this.setupForm();
    } else {
      setTimeout(() => this.findFormWithRetry(), this.retryDelay);
    }
  }

  // Configuración del formulario
  private setupForm(): void {
    if (!this.form) return;

    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }

  // Manejador del evento submit
  private handleSubmit = async (e: Event): Promise<void> => {
    e.preventDefault();
    
    if (this.buttonManager.isSubmitting || !this.form) {
      return;
    }

    await this.processFormSubmission();
  }

  // Procesamiento del envío del formulario
  private async processFormSubmission(): Promise<void> {
    if (!this.form) return;

    this.buttonManager.setLoadingState(this.form);
    this.uiManager.hideResult();

    try {
      const formData = new FormData(this.form);
      const response = await this.submitForm(formData);
      const result = await response.json();
      
      this.handleSubmissionResult(result);
      
    } catch (error) {
      handleError(error as Error, {
        component: 'ContactFormHandler',
        action: 'processFormSubmission'
      });
      this.handleConnectionError();
    } finally {
      this.buttonManager.resetState();
    }
  }

  // Envío del formulario
  private async submitForm(formData: FormData): Promise<Response> {
    if (!this.form) {
      throw new Error('Form not found');
    }

    return await fetch(this.form.action, {
      method: 'POST',
      body: formData
    });
  }

  // Manejo del resultado del envío
  private handleSubmissionResult(result: ContactFormResponse): void {
    if (result.success) {
      this.handleSuccess(result.message || 'Mensaje enviado correctamente');
    } else {
      this.handleError(result.error || 'Error al enviar el mensaje');
    }
  }

  // Manejo de éxito
  private handleSuccess(message: string): void {
    this.uiManager.showResult(NotificationType.SUCCESS, message);
    this.resetForm();
  }

  // Manejo de error del servidor
  private handleError(message: string): void {
    this.uiManager.showResult(NotificationType.ERROR, message);
  }

  // Manejo de error de conexión
  private handleConnectionError(): void {
    this.uiManager.showResult(
      'connection-error', 
      'Error de conexión. Por favor, inténtalo de nuevo.'
    );
  }

  // Resetear formulario
  private resetForm(): void {
    if (this.form) {
      this.form.reset();
    }
  }
}

// Factory function para crear el handler (Factory Pattern)
export function createContactFormHandler(): ContactFormHandler {
  const handler = new ContactFormHandler();
  handler.initialize();
  return handler;
}

// Función de inicialización para compatibilidad
export function initContactFormHandler(): void {
  createContactFormHandler();
}

// Auto-inicialización
if (typeof document !== 'undefined') {
  // Usar requestIdleCallback si está disponible
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => initContactFormHandler());
  } else {
    setTimeout(initContactFormHandler, 0);
  }
}