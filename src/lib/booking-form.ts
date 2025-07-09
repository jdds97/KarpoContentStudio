// Booking Form TypeScript implementation
// Calendar synchronization and discount code validation

interface CalendarSelectionEvent extends CustomEvent {
  detail: {
    date: string | null;
    time: string | null;
    space: string;
    duration: string;
  };
}

interface DiscountValidationResponse {
  valid: boolean;
  message: string;
  description?: string;
  percentage?: number;
  minHours?: number;
}

class BookingFormManager {
  private discountInput: HTMLInputElement | null;
  private applyButton: HTMLButtonElement | null;
  private messageDiv: HTMLDivElement | null;
  private form: HTMLFormElement | null;

  constructor() {
    this.discountInput = null;
    this.applyButton = null;
    this.messageDiv = null;
    this.form = null;
    this.init();
  }

  private init(): void {
    this.bindElements();
    this.setupCalendarSync();
    this.setupDiscountFunctionality();
    this.setupFormValidation();
    this.handleURLPreselection();
  }

  private bindElements(): void {
    this.form = document.getElementById('booking-form') as HTMLFormElement;
    this.discountInput = document.getElementById('discount-code') as HTMLInputElement;
    this.applyButton = document.getElementById('apply-discount') as HTMLButtonElement;
    this.messageDiv = document.getElementById('discount-message') as HTMLDivElement;
  }

  private setupCalendarSync(): void {
    window.addEventListener('calendar:selectionChanged', (event: Event) => {
      const customEvent = event as CalendarSelectionEvent;
      const { date, time, space, duration } = customEvent.detail;
      
      this.updateFormFields(date, time, space, duration);
      this.showSyncNotification('Datos sincronizados desde el calendario');
    });
  }

  private updateFormFields(date: string | null, time: string | null, space: string, duration: string): void {
    const dateInput = document.getElementById('date') as HTMLInputElement;
    const timeInput = document.getElementById('time') as HTMLInputElement;
    const spaceSelect = document.getElementById('studio-space') as HTMLSelectElement;
    const packageSelect = document.getElementById('package') as HTMLSelectElement;
    
    if (dateInput && date) {
      dateInput.value = date;
      this.highlightField(dateInput);
    }
    
    if (timeInput && time) {
      timeInput.value = time;
      this.highlightField(timeInput);
    }
    
    if (spaceSelect && space && space !== 'all') {
      spaceSelect.value = space;
      this.highlightField(spaceSelect);
    }
    
    if (packageSelect && duration) {
      packageSelect.value = duration.toString();
      this.highlightField(packageSelect);
    }
  }

  private highlightField(element: HTMLElement): void {
    element.style.background = '#dcfce7';
    setTimeout(() => element.style.background = '', 1000);
  }

  private showSyncNotification(message: string): void {
    const notification = document.createElement('div');
    notification.className = 'sync-notification fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  private setupFormValidation(): void {
    if (!this.form) return;
    
    const dateInput = document.getElementById('date') as HTMLInputElement;
    const timeInput = document.getElementById('time') as HTMLInputElement;
    const spaceSelect = document.getElementById('studio-space') as HTMLSelectElement;
    
    const validateFormCoherence = (): void => {
      // Get form values for validation
      dateInput?.value;
      timeInput?.value;
      spaceSelect?.value;
      
    };
    
    [dateInput, timeInput, spaceSelect].forEach(element => {
      element?.addEventListener('change', validateFormCoherence);
    });
  }

  private handleURLPreselection(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedDate = urlParams.get('date');
    
    if (preselectedDate) {
      const dateInput = document.getElementById('date') as HTMLInputElement;
      if (dateInput) {
        dateInput.value = preselectedDate;
      }
    }
  }

  private setupDiscountFunctionality(): void {
    this.applyButton?.addEventListener('click', () => this.applyDiscount());
    
    this.discountInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.applyDiscount();
      }
    });
    
    this.discountInput?.addEventListener('input', () => {
      this.resetDiscountState();
    });
  }

  private async validateDiscountCodeAsync(code: string): Promise<DiscountValidationResponse> {
    try {
      const response = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.toUpperCase().trim() })
      });
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      return { valid: false, message: 'Error al validar el código' };
    }
  }

  private showMessage(text: string, type: 'success' | 'error' | 'info'): void {
    if (!this.messageDiv) return;

    this.messageDiv.classList.remove('hidden', 'text-green-600', 'text-red-600', 'text-blue-600');
    
    switch (type) {
      case 'success':
        this.messageDiv.classList.add('text-green-600');
        break;
      case 'error':
        this.messageDiv.classList.add('text-red-600');
        break;
      case 'info':
        this.messageDiv.classList.add('text-blue-600');
        break;
    }
    
    this.messageDiv.textContent = text;
    this.messageDiv.classList.remove('hidden');
  }

  private async applyDiscount(): Promise<void> {
    if (!this.discountInput || !this.applyButton) return;

    const code = this.discountInput.value.trim();
    
    if (!code) {
      this.showMessage('Por favor, introduce un código', 'error');
      return;
    }
    
    const packageSelect = document.querySelector('select[name="package"]') as HTMLSelectElement;
    if (!packageSelect || !packageSelect.value) {
      this.showMessage('Primero selecciona un paquete de duración para aplicar el descuento.', 'error');
      return;
    }
    
    this.applyButton.textContent = 'Validando...';
    this.applyButton.disabled = true;
    
    try {
      const validation = await this.validateDiscountCodeAsync(code);
      
      if (validation.valid) {
        const selectedHours = parseInt(packageSelect.value.replace('h', ''));
        if (validation.minHours && selectedHours < validation.minHours) {
          this.showMessage(`Este código requiere un mínimo de ${validation.minHours} horas. Selecciona un paquete más largo.`, 'error');
          this.resetApplyButton();
          return;
        }
        
        this.applySuccessfulDiscount(code, validation);
        
      } else {
        this.showMessage(validation.message, 'error');
        this.resetDiscountState();
      }
      
    } catch (error) {
      this.showMessage('Error al validar el código. Inténtalo de nuevo.', 'error');
      this.resetApplyButton();
    }
  }

  private applySuccessfulDiscount(code: string, validation: DiscountValidationResponse): void {
    if (!this.discountInput || !this.applyButton) return;

    this.showMessage(`✅ ${validation.description} aplicado correctamente`, 'success');
    
    this.discountInput.classList.add('bg-green-100', 'border-green-400');
    this.discountInput.classList.remove('border-green-300');
    
    this.applyButton.textContent = '✓ Aplicado';
    this.applyButton.classList.add('bg-green-700');
    this.applyButton.disabled = true;
    
    this.addHiddenDiscountField(code);
    
    setTimeout(() => {
      if (validation.percentage) {
        this.showMessage(`🎉 ${validation.description} - Ahorrarás ${validation.percentage}% en tu reserva`, 'success');
      }
    }, 1000);
  }

  private addHiddenDiscountField(code: string): void {
    let hiddenInput = document.querySelector('input[name="applied-discount-code"]') as HTMLInputElement;
    if (!hiddenInput) {
      hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.name = 'applied-discount-code';
      this.discountInput?.parentNode?.appendChild(hiddenInput);
    }
    hiddenInput.value = code.toUpperCase().trim();
  }

  private resetDiscountState(): void {
    if (!this.discountInput?.classList.contains('bg-green-100')) return;

    if (this.discountInput) {
      this.discountInput.classList.remove('bg-green-100', 'border-green-400');
      this.discountInput.classList.add('border-green-300');
    }

    this.resetApplyButton();
    this.messageDiv?.classList.add('hidden');
    
    const hiddenInput = document.querySelector('input[name="applied-discount-code"]');
    hiddenInput?.remove();
  }

  private resetApplyButton(): void {
    if (!this.applyButton) return;

    this.applyButton.textContent = 'Aplicar';
    this.applyButton.classList.remove('bg-green-700');
    this.applyButton.disabled = false;
  }
}

function initBookingForm(): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new BookingFormManager());
  } else {
    new BookingFormManager();
  }
}

export { BookingFormManager, initBookingForm };