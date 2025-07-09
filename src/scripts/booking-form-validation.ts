// Validación de disponibilidad en tiempo real para el formulario de reservas
// The Content Studio

interface AvailabilityResponse {
  available: boolean;
  reason?: string;
  conflicts?: string[];
  requestedSlots?: string[];
  occupiedSlots?: string[];
}

export class BookingFormValidator {
  private dateInput: HTMLInputElement | null = null;
  private timeInput: HTMLInputElement | null = null;
  private packageInput: HTMLSelectElement | null = null;
  private studioSpaceInput: HTMLSelectElement | null = null;
  private submitButton: HTMLButtonElement | null = null;
  private availabilityMessage: HTMLDivElement | null = null;
  private validationTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    // Esperar a que el DOM esté cargado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupElements());
    } else {
      this.setupElements();
    }
  }

  private setupElements(): void {
    this.dateInput = document.getElementById('date') as HTMLInputElement;
    this.timeInput = document.getElementById('time') as HTMLInputElement;
    this.packageInput = document.getElementById('package') as HTMLSelectElement;
    this.studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;
    this.submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;

    if (!this.dateInput || !this.timeInput || !this.packageInput || !this.studioSpaceInput || !this.submitButton) {
      return;
    }

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const debouncedValidate = () => {
      if (this.validationTimeout) {
        clearTimeout(this.validationTimeout);
      }
      this.validationTimeout = setTimeout(() => this.validateAvailability(), 500);
    };

    this.dateInput?.addEventListener('change', debouncedValidate);
    this.timeInput?.addEventListener('change', debouncedValidate);
    this.packageInput?.addEventListener('change', debouncedValidate);
    this.studioSpaceInput?.addEventListener('change', debouncedValidate);
  }

  private createAvailabilityMessage(): void {
    if (this.availabilityMessage) return;

    this.availabilityMessage = document.createElement('div');
    this.availabilityMessage.id = 'availability-message';
    this.availabilityMessage.className = 'mt-2 p-3 rounded-lg text-sm';
    this.timeInput?.parentElement?.appendChild(this.availabilityMessage);
  }

  private showLoadingState(): void {
    if (!this.availabilityMessage) return;

    this.availabilityMessage.className = 'mt-2 p-3 rounded-lg text-sm bg-blue-50 border border-blue-200';
    this.availabilityMessage.innerHTML = `
      <div class="flex items-center">
        <svg class="animate-spin h-4 w-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-blue-700">Verificando disponibilidad...</span>
      </div>
    `;
  }

  private showAvailableState(): void {
    if (!this.availabilityMessage || !this.submitButton) return;

    this.availabilityMessage.className = 'mt-2 p-3 rounded-lg text-sm bg-green-50 border border-green-200';
    this.availabilityMessage.innerHTML = `
      <div class="flex items-center">
        <svg class="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span class="text-green-700 font-medium">✅ Horario disponible</span>
      </div>
    `;

    this.submitButton.disabled = false;
    this.submitButton.className = this.submitButton.className.replace(/opacity-50|cursor-not-allowed/g, '').trim();
  }

  private showUnavailableState(data: AvailabilityResponse): void {
    if (!this.availabilityMessage || !this.submitButton) return;

    let conflictMessage = '';
    if (data.conflicts && data.conflicts.length > 0) {
      conflictMessage = `<div class="mt-1 text-red-600 text-xs">Conflictos en: ${data.conflicts.join(', ')}</div>`;
    }

    this.availabilityMessage.className = 'mt-2 p-3 rounded-lg text-sm bg-red-50 border border-red-200';
    this.availabilityMessage.innerHTML = `
      <div class="flex items-start">
        <svg class="w-4 h-4 mr-2 mt-0.5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <div>
          <span class="text-red-700 font-medium">❌ ${data.reason || 'Horario no disponible'}</span>
          ${conflictMessage}
          <div class="mt-1 text-red-600 text-xs">Prueba con otro horario o reduce la duración del paquete.</div>
        </div>
      </div>
    `;

    this.submitButton.disabled = true;
    if (!this.submitButton.className.includes('opacity-50')) {
      this.submitButton.className += ' opacity-50 cursor-not-allowed';
    }
  }

  private showErrorState(): void {
    if (!this.availabilityMessage) return;

    this.availabilityMessage.className = 'mt-2 p-3 rounded-lg text-sm bg-yellow-50 border border-yellow-200';
    this.availabilityMessage.innerHTML = `
      <div class="flex items-center">
        <svg class="w-4 h-4 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <span class="text-yellow-700">⚠️ Error al verificar disponibilidad</span>
      </div>
    `;
  }

  private async validateAvailability(): Promise<void> {
    
    if (!this.dateInput?.value || !this.timeInput?.value || !this.packageInput?.value || !this.studioSpaceInput?.value) {
      return;
    }

    this.createAvailabilityMessage();
    this.showLoadingState();

    try {
      const packageDuration = parseInt(this.packageInput.value.replace('h', ''));
      const url = `/api/calendar/validate-availability?date=${this.dateInput.value}&time=${this.timeInput.value}&duration=${packageDuration}&studio_space=${this.studioSpaceInput.value}`;
      
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data: AvailabilityResponse = await response.json();
      
      if (data.available) {
        this.showAvailableState();
      } else {
        this.showUnavailableState(data);
      }
    } catch (error) {
      this.showErrorState();
    }
  }
}

// Función de inicialización exportada
export function initBookingValidation(): void {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // Check if form exists
  const bookingForm = document.getElementById('booking-form');
  if (!bookingForm) {
    return;
  }

  // Check if already initialized
  if ((window as any).bookingValidator || bookingForm.hasAttribute('data-validation-initialized')) {
    return;
  }
  
  try {
    const instance = new BookingFormValidator();
    (window as any).bookingValidator = instance;
    bookingForm.setAttribute('data-validation-initialized', 'true');
  } catch (error) {
    // Error al crear instancia
  }
}

// Auto-inicializar con mejor manejo del ciclo de vida para Astro
if (typeof document !== 'undefined') {
  const handleValidationInit = () => {
    const bookingForm = document.getElementById('booking-form');
    if (!bookingForm) {
      return;
    }

    if (bookingForm.hasAttribute('data-validation-initialized')) {
      return;
    }
    
    initBookingValidation();
  };

  // Múltiples estrategias de inicialización
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleValidationInit);
  } else {
    handleValidationInit();
    // También intentar con un pequeño retraso en caso de problemas de timing
    setTimeout(handleValidationInit, 100);
  }

  // Manejar transiciones de página de Astro
  document.addEventListener('astro:page-load', () => {
    setTimeout(handleValidationInit, 50);
  });
}