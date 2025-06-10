// Script para manejar el formulario de reservas con Supabase
export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  studioSpace: string;
  package: string;
  date: string;
  time: string;
  participants: number;
  sessionType: string;
  notes?: string;
}

export class BookingFormHandler {
  private form: HTMLFormElement;
  private submitButton: HTMLButtonElement;
  private loadingState: boolean = false;

  constructor(formId: string) {
    this.form = document.getElementById(formId) as HTMLFormElement;
    this.submitButton = this.form.querySelector('button[type="submit"]') as HTMLButtonElement;
    this.init();
  }

  private init() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    this.setupAvailabilityCheck();
  }

  private setupAvailabilityCheck() {
    const studioSpaceSelect = this.form.querySelector('#studio-space') as HTMLSelectElement;
    const dateInput = this.form.querySelector('#date') as HTMLInputElement;
    const timeInput = this.form.querySelector('#time') as HTMLInputElement;

    const checkAvailability = async () => {
      if (!studioSpaceSelect.value || !dateInput.value || !timeInput.value) {
        return;
      }

      try {
        const params = new URLSearchParams({
          studio_space: studioSpaceSelect.value,
          date: dateInput.value,
          time: timeInput.value
        });

        const response = await fetch(`/api/bookings/availability?${params}`);
        const data = await response.json();

        if (!data.available) {
          this.showMessage('La fecha y hora seleccionadas no están disponibles. Por favor, elige otra opción.', 'warning');
        }
      } catch (error) {
        console.error('Error checking availability:', error);
      }
    };

    // Debounce para evitar demasiadas consultas
    let timeout: NodeJS.Timeout;
    const debouncedCheck = () => {
      clearTimeout(timeout);
      timeout = setTimeout(checkAvailability, 500);
    };

    studioSpaceSelect.addEventListener('change', debouncedCheck);
    dateInput.addEventListener('change', debouncedCheck);
    timeInput.addEventListener('change', debouncedCheck);
  }

  private async handleSubmit(event: Event) {
    event.preventDefault();
    
    if (this.loadingState) return;

    this.setLoadingState(true);

    try {
      const formData = new FormData(this.form);
      
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        this.showMessage('¡Reserva enviada exitosamente! Te contactaremos pronto para confirmar los detalles.', 'success');
        this.form.reset();
      } else {
        this.showMessage(result.error || 'Error al enviar la reserva', 'error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      this.showMessage('Error de conexión. Por favor, inténtalo de nuevo.', 'error');
    } finally {
      this.setLoadingState(false);
    }
  }

  private setLoadingState(loading: boolean) {
    this.loadingState = loading;
    this.submitButton.disabled = loading;
    this.submitButton.textContent = loading ? 'Enviando...' : 'Enviar Solicitud';
  }

  private showMessage(message: string, type: 'success' | 'error' | 'warning') {
    // Remover mensaje anterior si existe
    const existingMessage = document.querySelector('.booking-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Crear nuevo mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `booking-message p-4 rounded-md mb-4 ${
      type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
      type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
      'bg-red-100 text-red-800 border border-red-200'
    }`;
    messageDiv.textContent = message;

    // Insertar antes del formulario
    this.form.parentNode?.insertBefore(messageDiv, this.form);

    // Auto-remover después de 5 segundos para mensajes de éxito
    if (type === 'success') {
      setTimeout(() => {
        messageDiv.remove();
      }, 5000);
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new BookingFormHandler('booking-form');
});
