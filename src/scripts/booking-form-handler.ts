// Manejador de formulario de reservas

import { initBookingValidation } from '@/scripts/booking-form-validation';
import { actions } from 'astro:actions';
import { navigate } from 'astro:transitions/client';
import { BaseComponentHandler, AutoInitialize } from '@/lib/component-initializer';
import { handleError, ErrorFactory } from '@/lib/core/error-handler';
import type { ID } from '@/types';

// Interface para el estado de envío
interface SubmissionState {
  isSubmitting: boolean;
  originalText: string | null;
  button: HTMLButtonElement | null;
}

// Interface para la respuesta de la action
interface BookingActionResult {
  data?: {
    success: boolean;
    error?: any;
    data?: any;
    message?: string;
    booking?: {
      id: ID;
    };
  } | undefined;
  error?: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
}

// Clase principal que maneja el formulario de reservas
@AutoInitialize({
  name: 'BookingFormHandler',
  selector: '#booking-form',
  retryAttempts: 3,
  useIdleCallback: true
})
export class BookingFormHandler extends BaseComponentHandler {
  private form: HTMLFormElement | null = null;
  private submissionState: SubmissionState;
  private retryAttempts = 0;
  private readonly maxRetryAttempts = 10;
  private readonly retryDelay = 100;

  constructor() {
    super('BookingFormHandler');
    this.submissionState = {
      isSubmitting: false,
      originalText: null,
      button: null
    };
  }

  // Implementación del método abstracto
  protected doInitialize(): void {
    this.findFormWithRetry();
  }

  // Implementación del método de limpieza
  protected doCleanup(): void {
    if (this.form) {
      // Remover event listeners si es necesario
      this.form.removeEventListener('submit', this.handleSubmit.bind(this));
    }
  }

  // Búsqueda del formulario con reintentos (robustez)
  private findFormWithRetry(): void {
    this.retryAttempts++;
    
    if (this.retryAttempts > this.maxRetryAttempts) {
      return; // Fallar silenciosamente después de max intentos
    }

    this.form = document.getElementById('booking-form') as HTMLFormElement;
    
    if (this.form) {
      this.setupForm();
    } else {
      setTimeout(() => this.findFormWithRetry(), this.retryDelay);
    }
  }

  // Configuración del formulario una vez encontrado
  private setupForm(): void {
    if (!this.form) return;

    try {
      // Inicializar validación de formulario
      initBookingValidation();
      
      // Configurar manejo de envío
      this.setupFormSubmission();
      
    } catch (error) {
      handleError(
        ErrorFactory.component('BookingFormHandler', 'Failed to setup form', { error }),
        { component: 'BookingFormHandler', action: 'setupForm' }
      );
    }
  }

  // Configuración del manejo de envío
  private setupFormSubmission(): void {
    if (!this.form) return;

    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }

  // Manejador del evento submit (arrow function para mantener contexto)
  private handleSubmit = async (e: Event): Promise<void> => {
    e.preventDefault();
    
    if (this.submissionState.isSubmitting || !this.form) {
      return; // Prevenir envíos múltiples
    }

    await this.processFormSubmission();
  }

  // Procesamiento principal del envío del formulario
  private async processFormSubmission(): Promise<void> {
    if (!this.form) return;

    this.setLoadingState();

    try {
      const formData = new FormData(this.form);
      const result = await this.submitBookingAction(formData);
      
      await this.handleSubmissionResult(result);
      
    } catch (error) {
      handleError(error as Error, {
        component: 'BookingFormHandler',
        action: 'processFormSubmission'
      });
      this.handleSubmissionError();
    }
  }

  // Llamada a la action de Astro
  private async submitBookingAction(formData: FormData): Promise<BookingActionResult> {
    return await actions.createBooking(formData);
  }

  // Manejo del resultado del envío
  private async handleSubmissionResult(result: BookingActionResult): Promise<void> {
    if (result.error) {
      this.handleActionError();
    } else if (result.data?.booking?.id) {
      this.handleActionSuccess(result.data.booking.id);
    }
  }

  // Manejo de error en la action
  private handleActionError(): void {
    this.resetLoadingState();
    this.fallbackToNormalSubmission();
  }

  // Manejo de éxito en la action
  private handleActionSuccess(bookingId: string): void {
    navigate(`/booking/confirmation?id=${bookingId}`);
  }

  // Manejo de errores de envío
  private handleSubmissionError(): void {
    this.resetLoadingState();
    this.fallbackToNormalSubmission();
  }

  // Establecer estado de carga
  private setLoadingState(): void {
    this.submissionState.isSubmitting = true;
    this.submissionState.button = this.form?.querySelector('button[type="submit"]') as HTMLButtonElement;
    
    if (this.submissionState.button) {
      this.submissionState.originalText = this.submissionState.button.textContent;
      this.submissionState.button.disabled = true;
      this.submissionState.button.textContent = 'Enviando...';
    }
  }

  // Resetear estado de carga
  private resetLoadingState(): void {
    this.submissionState.isSubmitting = false;
    
    if (this.submissionState.button && this.submissionState.originalText) {
      this.submissionState.button.disabled = false;
      this.submissionState.button.textContent = this.submissionState.originalText;
    }
  }

  // Fallback a envío normal del formulario
  private fallbackToNormalSubmission(): void {
    if (!this.form) return;

    // Remover el event listener para permitir envío normal
    this.form.removeEventListener('submit', this.handleSubmit);
    this.form.submit();
  }
}

// Factory function para crear el handler (Factory Pattern)
export function createBookingFormHandler(): BookingFormHandler {
  return new BookingFormHandler();
}

// Función de inicialización para compatibilidad con el código existente
export function initBookingFormHandler(): void {
  createBookingFormHandler();
}