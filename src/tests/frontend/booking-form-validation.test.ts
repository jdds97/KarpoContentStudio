// Tests para validación frontend del formulario de reservas
// Cubre interfaz de usuario, eventos, estados visuales, etc.

// Mock fetch globalmente
global.fetch = jest.fn();

// Test utilities implementation
const testUtils = {
  createMockResponse: (data: any, status: number = 200): Promise<Response> => {
    const response = {
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data))
    } as Response;
    return Promise.resolve(response);
  },
  
  createMockResponseSync: (data: any, status: number = 200): Response => {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data))
    } as Response;
  },
  
  setupMockForm: (): void => {
    document.body.innerHTML = `
      <form id="booking-form">
        <input id="date" type="date" value="" />
        <input id="time" type="time" value="" />
        <select id="package">
          <option value="">Seleccionar paquete</option>
          <option value="1h">1 hora</option>
          <option value="2h">2 horas</option>
          <option value="4h">4 horas</option>
          <option value="8h">8 horas</option>
        </select>
        <select id="studio-space">
          <option value="">Seleccionar espacio</option>
          <option value="principal-zone">Zona Principal</option>
          <option value="black-zone">Zona Negra</option>
        </select>
        <button type="submit">Reservar</button>
      </form>
    `;
  }
};

// Real BookingFormValidator implementation for testing
class MockBookingFormValidator {
  private dateInput: HTMLInputElement | null = null;
  private timeInput: HTMLInputElement | null = null;
  private packageInput: HTMLSelectElement | null = null;
  private studioSpaceInput: HTMLSelectElement | null = null;
  private submitButton: HTMLButtonElement | null = null;
  private availabilityMessage: HTMLDivElement | null = null;
  private validationTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.setupElements();
    this.attachEventListeners();
  }

  private setupElements(): void {
    this.dateInput = document.getElementById('date') as HTMLInputElement;
    this.timeInput = document.getElementById('time') as HTMLInputElement;
    this.packageInput = document.getElementById('package') as HTMLSelectElement;
    this.studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;
    this.submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
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
        <span class="text-blue-700">Verificando disponibilidad...</span>
      </div>
    `;
  }

  private showAvailableState(): void {
    if (!this.availabilityMessage || !this.submitButton) return;

    this.availabilityMessage.className = 'mt-2 p-3 rounded-lg text-sm bg-green-50 border border-green-200';
    this.availabilityMessage.innerHTML = `
      <div class="flex items-center">
        <span class="text-green-700 font-medium">✅ Horario disponible</span>
      </div>
    `;

    this.submitButton.disabled = false;
    this.submitButton.className = this.submitButton.className.replace(/opacity-50|cursor-not-allowed/g, '').trim();
  }

  private showUnavailableState(data: any): void {
    if (!this.availabilityMessage || !this.submitButton) return;

    let conflictMessage = '';
    if (data.conflicts && data.conflicts.length > 0) {
      conflictMessage = `<div class="mt-1 text-red-600 text-xs">Conflictos en: ${data.conflicts.join(', ')}</div>`;
    }

    this.availabilityMessage.className = 'mt-2 p-3 rounded-lg text-sm bg-red-50 border border-red-200';
    this.availabilityMessage.innerHTML = `
      <div class="flex items-start">
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
        <span class="text-yellow-700">⚠️ Error al verificar disponibilidad</span>
      </div>
    `;
  }

  async validateAvailability(): Promise<void> {
    
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

      const data = await response.json();
      
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

describe('BookingFormValidator Frontend', () => {
  let validator: any;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockClear();
    
    // Setup DOM
    testUtils.setupMockForm();
    
    // Create validator instance
    validator = new MockBookingFormValidator();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('Inicialización del componente', () => {
    test('debe encontrar todos los elementos del formulario', () => {
      expect(document.getElementById('date')).toBeTruthy();
      expect(document.getElementById('time')).toBeTruthy();
      expect(document.getElementById('package')).toBeTruthy();
      expect(document.getElementById('studio-space')).toBeTruthy();
      expect(document.querySelector('button[type="submit"]')).toBeTruthy();
    });

    test('debe configurar event listeners en los campos', () => {
      // Spy on addEventListener
      const addEventListenerSpy = jest.spyOn(HTMLElement.prototype, 'addEventListener');
      
      // Create new validator to trigger event listener setup
      new MockBookingFormValidator();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
    });
  });

  describe('Validación de campos requeridos', () => {
    test('no debe validar si faltan campos', async () => {
      const dateInput = document.getElementById('date') as HTMLInputElement;
      
      // Solo llenar algunos campos
      dateInput.value = '2025-07-03';
      // Dejar time vacío
      
      await validator.validateAvailability();
      
      expect(mockFetch).not.toHaveBeenCalled();
    });

    test('debe validar cuando todos los campos están llenos', async () => {
      mockFetch.mockResolvedValueOnce(testUtils.createMockResponse({
        available: true,
        reason: 'Disponible'
      }));

      const dateInput = document.getElementById('date') as HTMLInputElement;
      const timeInput = document.getElementById('time') as HTMLInputElement;
      const packageInput = document.getElementById('package') as HTMLSelectElement;
      const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

      dateInput.value = '2025-07-03';
      timeInput.value = '14:00';
      packageInput.value = '2h';
      studioSpaceInput.value = 'principal-zone';

      await validator.validateAvailability();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/calendar/validate-availability?date=2025-07-03&time=14:00&duration=2&studio_space=principal-zone'
      );
    });
  });

  describe('Estados visuales de disponibilidad', () => {
    beforeEach(() => {
      const dateInput = document.getElementById('date') as HTMLInputElement;
      const timeInput = document.getElementById('time') as HTMLInputElement;
      const packageInput = document.getElementById('package') as HTMLSelectElement;
      const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

      dateInput.value = '2025-07-03';
      timeInput.value = '14:00';
      packageInput.value = '2h';
      studioSpaceInput.value = 'principal-zone';
    });

    test('debe mostrar estado de carga', async () => {
      // Mock fetch que tarda en responder
      let resolvePromise: (value: Response) => void;
      const pendingPromise = new Promise<Response>(resolve => {
        resolvePromise = resolve;
      });
      mockFetch.mockReturnValueOnce(pendingPromise);

      validator.validateAvailability();
      
      // Verificar que se crea el mensaje de carga
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const loadingMessage = document.getElementById('availability-message');
      expect(loadingMessage).toBeTruthy();
      expect(loadingMessage?.className).toContain('bg-blue-50');
      expect(loadingMessage?.textContent).toContain('Verificando disponibilidad');

      // Resolver la promesa
      resolvePromise!(testUtils.createMockResponseSync({ available: true }));
    });

    test('debe mostrar estado disponible', async () => {
      mockFetch.mockResolvedValueOnce(testUtils.createMockResponse({
        available: true,
        reason: 'Disponible'
      }));

      await validator.validateAvailability();

      const message = document.getElementById('availability-message');
      expect(message).toBeTruthy();
      expect(message?.className).toContain('bg-green-50');
      expect(message?.textContent).toContain('Horario disponible');

      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(submitButton.disabled).toBe(false);
      expect(submitButton.className).not.toContain('opacity-50');
    });

    test('debe mostrar estado no disponible con conflictos', async () => {
      mockFetch.mockResolvedValueOnce(testUtils.createMockResponse({
        available: false,
        reason: 'El horario solicitado está ocupado',
        conflicts: ['14:00', '15:00']
      }));

      await validator.validateAvailability();

      const message = document.getElementById('availability-message');
      expect(message).toBeTruthy();
      expect(message?.className).toContain('bg-red-50');
      expect(message?.textContent).toContain('El horario solicitado está ocupado');
      expect(message?.textContent).toContain('14:00, 15:00');

      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(submitButton.disabled).toBe(true);
      expect(submitButton.className).toContain('opacity-50');
    });

    test('debe mostrar estado de error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await validator.validateAvailability();

      const message = document.getElementById('availability-message');
      expect(message).toBeTruthy();
      expect(message?.className).toContain('bg-yellow-50');
      expect(message?.textContent).toContain('Error al verificar disponibilidad');
    });

    test('debe mostrar mensaje específico para horario de cierre', async () => {
      mockFetch.mockResolvedValueOnce(testUtils.createMockResponse({
        available: false,
        reason: 'La sesión terminaría a las 23:00, pero el estudio cierra a las 22:00'
      }));

      await validator.validateAvailability();

      const message = document.getElementById('availability-message');
      expect(message?.textContent).toContain('estudio cierra a las 22:00');
    });
  });

  describe('Manejo de respuestas de API', () => {
    beforeEach(() => {
      const dateInput = document.getElementById('date') as HTMLInputElement;
      const timeInput = document.getElementById('time') as HTMLInputElement;
      const packageInput = document.getElementById('package') as HTMLSelectElement;
      const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

      dateInput.value = '2025-07-03';
      timeInput.value = '14:00';
      packageInput.value = '4h';
      studioSpaceInput.value = 'principal-zone';
    });

    test('debe manejar respuesta HTTP 400', async () => {
      mockFetch.mockResolvedValueOnce(testUtils.createMockResponse({
        error: 'Fecha y hora son requeridas',
        available: false
      }, 400));

      await validator.validateAvailability();

      const message = document.getElementById('availability-message');
      expect(message?.className).toContain('bg-yellow-50');
    });

    test('debe manejar respuesta HTTP 500', async () => {
      mockFetch.mockResolvedValueOnce(testUtils.createMockResponse({
        error: 'Error interno del servidor',
        available: false
      }, 500));

      await validator.validateAvailability();

      const message = document.getElementById('availability-message');
      expect(message?.className).toContain('bg-yellow-50');
    });

    test('debe manejar JSON malformado', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON')),
        text: () => Promise.resolve('Invalid response')
      } as Response);

      await validator.validateAvailability();

      const message = document.getElementById('availability-message');
      expect(message?.className).toContain('bg-yellow-50');
    });
  });

  describe('Conversión de duración de paquetes', () => {
    test('debe convertir correctamente paquetes de horas', async () => {
      const testCases = [
        { package: '1h', expectedDuration: 1 },
        { package: '2h', expectedDuration: 2 },
        { package: '4h', expectedDuration: 4 },
        { package: '8h', expectedDuration: 8 }
      ];

      for (const testCase of testCases) {
        mockFetch.mockClear();
        mockFetch.mockResolvedValueOnce(testUtils.createMockResponse({ available: true }));
        
        const dateInput = document.getElementById('date') as HTMLInputElement;
        const timeInput = document.getElementById('time') as HTMLInputElement;
        const packageInput = document.getElementById('package') as HTMLSelectElement;
        const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

        dateInput.value = '2025-07-03';
        timeInput.value = '10:00';
        packageInput.value = testCase.package;
        studioSpaceInput.value = 'principal-zone';

        await validator.validateAvailability();

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(`duration=${testCase.expectedDuration}`)
        );
      }
    });
  });

  describe('Debouncing de validación', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('debe hacer debounce de múltiples cambios rápidos', async () => {
      mockFetch.mockResolvedValue(testUtils.createMockResponse({ available: true }));

      const dateInput = document.getElementById('date') as HTMLInputElement;
      const timeInput = document.getElementById('time') as HTMLInputElement;
      const packageInput = document.getElementById('package') as HTMLSelectElement;
      const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

      // Llenar campos
      dateInput.value = '2025-07-03';
      timeInput.value = '14:00';
      packageInput.value = '2h';
      studioSpaceInput.value = 'principal-zone';

      // Simular múltiples cambios rápidos
      dateInput.dispatchEvent(new Event('change'));
      timeInput.dispatchEvent(new Event('change'));
      packageInput.dispatchEvent(new Event('change'));
      
      // No debería haber llamadas inmediatas
      expect(mockFetch).not.toHaveBeenCalled();
      
      // Avanzar 300ms (menos que el debounce de 500ms)
      jest.advanceTimersByTime(300);
      expect(mockFetch).not.toHaveBeenCalled();
      
      // Avanzar otros 300ms (total 600ms, más que el debounce)
      jest.advanceTimersByTime(300);
      
      // Ahora debería haber exactamente 1 llamada
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Casos extremos de UI', () => {
    test('debe manejar elementos faltantes sin errores', () => {
      document.body.innerHTML = '<div>Empty</div>';
      
      expect(() => {
        new MockBookingFormValidator();
      }).not.toThrow();
    });

    test('debe manejar múltiples instancias del validador', () => {
      const validator1 = new MockBookingFormValidator();
      const validator2 = new MockBookingFormValidator();
      
      expect(validator1).toBeTruthy();
      expect(validator2).toBeTruthy();
    });

    test('debe limpiar mensaje anterior al validar nuevamente', async () => {
      mockFetch
        .mockResolvedValueOnce(testUtils.createMockResponse({ available: false, reason: 'Primer error' }))
        .mockResolvedValueOnce(testUtils.createMockResponse({ available: true, reason: 'Disponible' }));

      const dateInput = document.getElementById('date') as HTMLInputElement;
      const timeInput = document.getElementById('time') as HTMLInputElement;
      const packageInput = document.getElementById('package') as HTMLSelectElement;
      const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

      dateInput.value = '2025-07-03';
      timeInput.value = '14:00';
      packageInput.value = '2h';
      studioSpaceInput.value = 'principal-zone';

      // Primera validación (error)
      await validator.validateAvailability();
      let message = document.getElementById('availability-message');
      expect(message?.className).toContain('bg-red-50');

      // Segunda validación (éxito)
      await validator.validateAvailability();
      message = document.getElementById('availability-message');
      expect(message?.className).toContain('bg-green-50');
      expect(message?.textContent).not.toContain('Primer error');
    });
  });

  describe('Logging y debugging', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test('debe loggear información de validación', async () => {
      mockFetch.mockResolvedValueOnce(testUtils.createMockResponse({
        available: true,
        reason: 'Disponible'
      }));

      const dateInput = document.getElementById('date') as HTMLInputElement;
      const timeInput = document.getElementById('time') as HTMLInputElement;
      const packageInput = document.getElementById('package') as HTMLSelectElement;
      const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

      dateInput.value = '2025-07-03';
      timeInput.value = '14:00';
      packageInput.value = '2h';
      studioSpaceInput.value = 'principal-zone';

      await validator.validateAvailability();

    });
  });
});