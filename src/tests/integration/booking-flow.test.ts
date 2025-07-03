// Tests de integración completos para el flujo de reservas
// Simula escenarios reales de usuario desde inicio a fin

import { BookingFormValidator } from '@/scripts/booking-form-validation';

describe('Flujo completo de reservas - Integración', () => {
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
    global.fetch = mockFetch;
    testUtils.setupMockForm();
    // Create a real validator instance
    new BookingFormValidator();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('Escenarios de éxito completos', () => {
    test('Usuario reserva sesión de 2 horas sin conflictos', async () => {
      // Mock API respuesta exitosa
      mockFetch.mockResolvedValueOnce(testUtils.createMockResponse({
        available: true,
        reason: 'Disponible',
        requestedSlots: ['14:00', '15:00'],
        occupiedSlots: [],
        conflicts: []
      }));

      // Simular entrada del usuario - TODOS los campos requeridos
      const dateInput = document.getElementById('date') as HTMLInputElement;
      const timeInput = document.getElementById('time') as HTMLInputElement;
      const packageInput = document.getElementById('package') as HTMLSelectElement;
      const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

      // Llenar todos los campos primero
      dateInput.value = '2025-07-03';
      timeInput.value = '14:00';
      packageInput.value = '2h';
      studioSpaceInput.value = 'principal-zone';

      // Simular cambio de campo para activar validación (último campo)
      studioSpaceInput.dispatchEvent(new Event('change'));

      // Esperar a que se procese la validación (debounce de 500ms + procesamiento)
      await new Promise(resolve => setTimeout(resolve, 700));

      // Verificar llamada a API
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/calendar/validate-availability?date=2025-07-03&time=14:00&duration=2&studio_space=principal-zone'
      );

      // Verificar estado visual
      const message = document.getElementById('availability-message');
      expect(message?.textContent).toContain('Horario disponible');

      // Verificar botón habilitado
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(submitButton.disabled).toBe(false);
    });

    test('Usuario cambia de paquete y se revalida automáticamente', async () => {
      // Primera validación: 2 horas disponible
      mockFetch.mockResolvedValueOnce(testUtils.createMockResponse({
        available: true,
        reason: 'Disponible'
      }));

      // Segunda validación: 4 horas no disponible por horario de cierre
      mockFetch.mockResolvedValueOnce(testUtils.createMockResponse({
        available: false,
        reason: 'La sesión terminaría a las 23:00, pero el estudio cierra a las 22:00'
      }));

      const dateInput = document.getElementById('date') as HTMLInputElement;
      const timeInput = document.getElementById('time') as HTMLInputElement;
      const packageInput = document.getElementById('package') as HTMLSelectElement;
      const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

      // Configuración inicial - TODOS los campos
      dateInput.value = '2025-07-03';
      timeInput.value = '19:00';
      packageInput.value = '2h';
      studioSpaceInput.value = 'principal-zone';

      // Primera validación
      studioSpaceInput.dispatchEvent(new Event('change'));
      await new Promise(resolve => setTimeout(resolve, 700));

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('duration=2')
      );

      // Cambiar a paquete de 4 horas
      packageInput.value = '4h';
      packageInput.dispatchEvent(new Event('change'));
      await new Promise(resolve => setTimeout(resolve, 700));

      // Verificar segunda llamada
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('duration=4')
      );

      // Verificar mensaje de error por horario de cierre
      const message = document.getElementById('availability-message');
      expect(message?.textContent).toContain('estudio cierra a las 22:00');
    });
  });

  describe('Escenarios de conflictos reales', () => {
    test('Usuario intenta reservar horario parcialmente ocupado', async () => {
      mockFetch.mockResolvedValueOnce(testUtils.createMockResponse({
        available: false,
        reason: 'El horario solicitado está ocupado',
        requestedSlots: ['14:00', '15:00', '16:00', '17:00'],
        occupiedSlots: ['15:00', '16:00'],
        conflicts: ['15:00', '16:00']
      }));

      const dateInput = document.getElementById('date') as HTMLInputElement;
      const timeInput = document.getElementById('time') as HTMLInputElement;
      const packageInput = document.getElementById('package') as HTMLSelectElement;
      const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

      // Llenar TODOS los campos requeridos
      dateInput.value = '2025-07-03';
      timeInput.value = '14:00';
      packageInput.value = '4h';
      studioSpaceInput.value = 'principal-zone';

      // Activar validación con el último campo
      studioSpaceInput.dispatchEvent(new Event('change'));
      await new Promise(resolve => setTimeout(resolve, 700));

      const message = document.getElementById('availability-message');
      expect(message?.textContent).toContain('El horario solicitado está ocupado');
      expect(message?.textContent).toContain('15:00, 16:00');
      expect(message?.textContent).toContain('Prueba con otro horario');

      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(submitButton.disabled).toBe(true);
    });

    test('Usuario encuentra horario disponible en espacio diferente', async () => {
      // Primera llamada: zona principal ocupada
      mockFetch.mockResolvedValueOnce(testUtils.createMockResponse({
        available: false,
        reason: 'El horario solicitado está ocupado',
        conflicts: ['14:00', '15:00']
      }));

      // Segunda llamada: zona negra disponible
      mockFetch.mockResolvedValueOnce(testUtils.createMockResponse({
        available: true,
        reason: 'Disponible'
      }));

      const dateInput = document.getElementById('date') as HTMLInputElement;
      const timeInput = document.getElementById('time') as HTMLInputElement;
      const packageInput = document.getElementById('package') as HTMLSelectElement;
      const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

      // Llenar TODOS los campos requeridos
      dateInput.value = '2025-07-03';
      timeInput.value = '14:00';
      packageInput.value = '2h';
      studioSpaceInput.value = 'principal-zone';

      // Primera validación
      studioSpaceInput.dispatchEvent(new Event('change'));
      await new Promise(resolve => setTimeout(resolve, 700));

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('studio_space=principal-zone')
      );

      let message = document.getElementById('availability-message');
      expect(message?.textContent).toContain('El horario solicitado está ocupado');

      // Cambiar a zona negra
      studioSpaceInput.value = 'black-zone';
      studioSpaceInput.dispatchEvent(new Event('change'));
      await new Promise(resolve => setTimeout(resolve, 700));

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('studio_space=black-zone')
      );

      message = document.getElementById('availability-message');
      expect(message?.textContent).toContain('Horario disponible');
    });
  });

  describe('Escenarios de horario de cierre', () => {
    test('Usuario intenta sesión de 8 horas desde las 15:00', async () => {
      mockFetch.mockResolvedValueOnce(testUtils.createMockResponse({
        available: false,
        reason: 'La sesión terminaría a las 23:00, pero el estudio cierre a las 22:00'
      }));

      const dateInput = document.getElementById('date') as HTMLInputElement;
      const timeInput = document.getElementById('time') as HTMLInputElement;
      const packageInput = document.getElementById('package') as HTMLSelectElement;
      const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

      // Llenar TODOS los campos requeridos
      dateInput.value = '2025-07-03';
      timeInput.value = '15:00';
      packageInput.value = '8h';
      studioSpaceInput.value = 'principal-zone';

      // Activar validación con el último campo
      studioSpaceInput.dispatchEvent(new Event('change'));
      await new Promise(resolve => setTimeout(resolve, 700));

      const message = document.getElementById('availability-message');
      expect(message?.textContent).toContain('estudio cierre a las 22:00');

      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(submitButton.disabled).toBe(true);
    });

    test('Usuario ajusta a horario válido dentro del cierre', async () => {
      // Primera validación: fuera de horario
      mockFetch.mockResolvedValueOnce(testUtils.createMockResponse({
        available: false,
        reason: 'La sesión terminaría a las 23:00, pero el estudio cierre a las 22:00'
      }));

      // Segunda validación: dentro del horario
      mockFetch.mockResolvedValueOnce(testUtils.createMockResponse({
        available: true,
        reason: 'Disponible'
      }));

      const dateInput = document.getElementById('date') as HTMLInputElement;
      const timeInput = document.getElementById('time') as HTMLInputElement;
      const packageInput = document.getElementById('package') as HTMLSelectElement;
      const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

      // Llenar TODOS los campos requeridos
      dateInput.value = '2025-07-03';
      timeInput.value = '19:00';
      packageInput.value = '4h';
      studioSpaceInput.value = 'principal-zone';

      // Primera validación (falla)
      studioSpaceInput.dispatchEvent(new Event('change'));
      await new Promise(resolve => setTimeout(resolve, 700));

      let message = document.getElementById('availability-message');
      expect(message?.textContent).toContain('estudio cierre');

      // Ajustar horario
      timeInput.value = '18:00';
      timeInput.dispatchEvent(new Event('change'));
      await new Promise(resolve => setTimeout(resolve, 700));

      message = document.getElementById('availability-message');
      expect(message?.textContent).toContain('Horario disponible');
    });
  });

  describe('Escenarios de error de red', () => {
    test('Usuario experimenta error de red y reintenta', async () => {
      // Primera llamada: error de red
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Segunda llamada: éxito
      mockFetch.mockResolvedValueOnce(testUtils.createMockResponse({
        available: true,
        reason: 'Disponible'
      }));

      const dateInput = document.getElementById('date') as HTMLInputElement;
      const timeInput = document.getElementById('time') as HTMLInputElement;
      const packageInput = document.getElementById('package') as HTMLSelectElement;
      const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

      // Llenar TODOS los campos requeridos
      dateInput.value = '2025-07-03';
      timeInput.value = '14:00';
      packageInput.value = '2h';
      studioSpaceInput.value = 'principal-zone';

      // Primera validación (error)
      studioSpaceInput.dispatchEvent(new Event('change'));
      await new Promise(resolve => setTimeout(resolve, 700));

      let message = document.getElementById('availability-message');
      expect(message?.textContent).toContain('Error al verificar disponibilidad');

      // Reintento (cambiar campo para reactivar validación)
      packageInput.value = '3h';
      packageInput.dispatchEvent(new Event('change'));
      await new Promise(resolve => setTimeout(resolve, 700));

      message = document.getElementById('availability-message');
      expect(message?.textContent).toContain('Horario disponible');
    });

    test('Usuario experimenta múltiples errores de API', async () => {
      // Tres errores consecutivos
      mockFetch
        .mockResolvedValueOnce(testUtils.createMockResponse({}, 500))
        .mockResolvedValueOnce(testUtils.createMockResponse({}, 400))
        .mockRejectedValueOnce(new Error('Timeout'));

      const dateInput = document.getElementById('date') as HTMLInputElement;
      const timeInput = document.getElementById('time') as HTMLInputElement;
      const packageInput = document.getElementById('package') as HTMLSelectElement;
      const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

      // Llenar TODOS los campos requeridos
      dateInput.value = '2025-07-03';
      timeInput.value = '14:00';
      packageInput.value = '2h';
      studioSpaceInput.value = 'principal-zone';

      // Error 500
      studioSpaceInput.dispatchEvent(new Event('change'));
      await new Promise(resolve => setTimeout(resolve, 700));

      let message = document.getElementById('availability-message');
      expect(message?.className).toContain('bg-yellow-50');

      // Error 400
      packageInput.value = '3h';
      packageInput.dispatchEvent(new Event('change'));
      await new Promise(resolve => setTimeout(resolve, 700));

      message = document.getElementById('availability-message');
      expect(message?.className).toContain('bg-yellow-50');

      // Error timeout
      studioSpaceInput.value = 'black-zone';
      studioSpaceInput.dispatchEvent(new Event('change'));
      await new Promise(resolve => setTimeout(resolve, 700));

      message = document.getElementById('availability-message');
      expect(message?.className).toContain('bg-yellow-50');
    });
  });

  describe('Escenarios de fecha pasada', () => {
    test('Usuario intenta reservar fecha de ayer', async () => {
      mockFetch.mockResolvedValueOnce(testUtils.createMockResponse({
        available: false,
        reason: 'La fecha seleccionada ya ha pasado'
      }));

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];

      const dateInput = document.getElementById('date') as HTMLInputElement;
      const timeInput = document.getElementById('time') as HTMLInputElement;
      const packageInput = document.getElementById('package') as HTMLSelectElement;
      const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

      // Llenar TODOS los campos requeridos
      dateInput.value = dateStr;
      timeInput.value = '14:00';
      packageInput.value = '2h';
      studioSpaceInput.value = 'principal-zone';

      // Activar validación con el último campo
      studioSpaceInput.dispatchEvent(new Event('change'));
      await new Promise(resolve => setTimeout(resolve, 700));

      const message = document.getElementById('availability-message');
      expect(message?.textContent).toContain('fecha seleccionada ya ha pasado');

      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(submitButton.disabled).toBe(true);
    });
  });

  describe('Escenarios complejos de usuario real', () => {
    test('Usuario explora múltiples opciones antes de encontrar disponibilidad', async () => {
      const responses = [
        // Primer intento: conflicto
        testUtils.createMockResponse({
          available: false,
          reason: 'El horario solicitado está ocupado',
          conflicts: ['14:00', '15:00']
        }),
        // Segundo intento: fuera de horario
        testUtils.createMockResponse({
          available: false,
          reason: 'La sesión terminaría a las 23:00, pero el estudio cierre a las 22:00'
        }),
        // Tercer intento: éxito
        testUtils.createMockResponse({
          available: true,
          reason: 'Disponible'
        })
      ];

      mockFetch
        .mockResolvedValueOnce(responses[0])
        .mockResolvedValueOnce(responses[1])
        .mockResolvedValueOnce(responses[2]);

      const dateInput = document.getElementById('date') as HTMLInputElement;
      const timeInput = document.getElementById('time') as HTMLInputElement;
      const packageInput = document.getElementById('package') as HTMLSelectElement;
      const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

      // Configuración base - TODOS los campos requeridos
      dateInput.value = '2025-07-03';
      studioSpaceInput.value = 'principal-zone';

      // Primer intento: 14:00, 2h (conflicto)
      timeInput.value = '14:00';
      packageInput.value = '2h';
      studioSpaceInput.dispatchEvent(new Event('change'));
      await new Promise(resolve => setTimeout(resolve, 700));

      let message = document.getElementById('availability-message');
      expect(message?.textContent).toContain('El horario solicitado está ocupado');

      // Segundo intento: 19:00, 4h (fuera de horario)
      timeInput.value = '19:00';
      packageInput.value = '4h';
      timeInput.dispatchEvent(new Event('change'));
      await new Promise(resolve => setTimeout(resolve, 700));

      message = document.getElementById('availability-message');
      expect(message?.textContent).toContain('estudio cierre');

      // Tercer intento: 10:00, 3h (éxito)
      timeInput.value = '10:00';
      packageInput.value = '3h';
      timeInput.dispatchEvent(new Event('change'));
      await new Promise(resolve => setTimeout(resolve, 700));

      message = document.getElementById('availability-message');
      expect(message?.textContent).toContain('Horario disponible');

      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(submitButton.disabled).toBe(false);
    });
  });
});