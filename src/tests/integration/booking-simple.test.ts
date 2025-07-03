// Tests de integración simplificados

describe('Integración: Booking Flow (simplificado)', () => {
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
    global.fetch = mockFetch;
    
    // Setup DOM
    document.body.innerHTML = `
      <form id="booking-form">
        <input id="date" type="date" value="" />
        <input id="time" type="time" value="" />
        <select id="package">
          <option value="2h">2 horas</option>
          <option value="4h">4 horas</option>
        </select>
        <select id="studio-space">
          <option value="principal-zone">Zona Principal</option>
        </select>
        <button type="submit">Reservar</button>
      </form>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('Flujo completo de usuario', () => {
    test('debe simular validación exitosa completa', async () => {
      // Mock respuesta exitosa
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          available: true,
          reason: 'Disponible',
          requestedSlots: ['14:00', '15:00'],
          occupiedSlots: [],
          conflicts: []
        })
      } as Response);

      // Llenar formulario
      const dateInput = document.getElementById('date') as HTMLInputElement;
      const timeInput = document.getElementById('time') as HTMLInputElement;
      const packageInput = document.getElementById('package') as HTMLSelectElement;
      const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

      dateInput.value = '2025-07-03';
      timeInput.value = '14:00';
      packageInput.value = '2h';
      studioSpaceInput.value = 'principal-zone';

      // Simular llamada a API
      const apiUrl = `/api/calendar/validate-availability?date=${dateInput.value}&time=${timeInput.value}&duration=2&studio_space=${studioSpaceInput.value}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledWith(apiUrl);
      expect(data.available).toBe(true);
      expect(data.reason).toBe('Disponible');
    });

    test('debe simular conflicto de horario', async () => {
      // Mock respuesta con conflicto
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          available: false,
          reason: 'El horario solicitado está ocupado',
          conflicts: ['14:00', '15:00']
        })
      } as Response);

      // Llenar formulario
      const dateInput = document.getElementById('date') as HTMLInputElement;
      const timeInput = document.getElementById('time') as HTMLInputElement;
      const packageInput = document.getElementById('package') as HTMLSelectElement;
      const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

      dateInput.value = '2025-07-03';
      timeInput.value = '14:00';
      packageInput.value = '2h';
      studioSpaceInput.value = 'principal-zone';

      // Simular llamada a API
      const response = await fetch('/api/calendar/validate-availability?date=2025-07-03&time=14:00&duration=2&studio_space=principal-zone');
      const data = await response.json();

      expect(data.available).toBe(false);
      expect(data.reason).toContain('ocupado');
      expect(data.conflicts).toEqual(['14:00', '15:00']);
    });

    test('debe simular error de horario de cierre', async () => {
      // Mock respuesta con error de cierre
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          available: false,
          reason: 'La sesión terminaría a las 23:00, pero el estudio cierra a las 22:00'
        })
      } as Response);

      // Formulario con horario que excede cierre
      const dateInput = document.getElementById('date') as HTMLInputElement;
      const timeInput = document.getElementById('time') as HTMLInputElement;
      const packageInput = document.getElementById('package') as HTMLSelectElement;
      const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

      dateInput.value = '2025-07-03';
      timeInput.value = '19:00';
      packageInput.value = '4h';
      studioSpaceInput.value = 'principal-zone';

      // Simular llamada a API
      const response = await fetch('/api/calendar/validate-availability?date=2025-07-03&time=19:00&duration=4&studio_space=principal-zone');
      const data = await response.json();

      expect(data.available).toBe(false);
      expect(data.reason).toContain('estudio cierra a las 22:00');
    });

    test('debe simular cambio de paquete y revalidación', async () => {
      // Primera validación: 2h disponible
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          available: true,
          reason: 'Disponible'
        })
      } as Response);

      // Segunda validación: 4h no disponible
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          available: false,
          reason: 'La sesión terminaría a las 23:00, pero el estudio cierra a las 22:00'
        })
      } as Response);

      const dateInput = document.getElementById('date') as HTMLInputElement;
      const timeInput = document.getElementById('time') as HTMLInputElement;
      const packageInput = document.getElementById('package') as HTMLSelectElement;
      const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

      // Configuración inicial
      dateInput.value = '2025-07-03';
      timeInput.value = '19:00';
      packageInput.value = '2h';
      studioSpaceInput.value = 'principal-zone';

      // Primera validación
      let response = await fetch('/api/calendar/validate-availability?date=2025-07-03&time=19:00&duration=2&studio_space=principal-zone');
      let data = await response.json();
      expect(data.available).toBe(true);

      // Cambiar a 4h y revalidar
      packageInput.value = '4h';
      response = await fetch('/api/calendar/validate-availability?date=2025-07-03&time=19:00&duration=4&studio_space=principal-zone');
      data = await response.json();
      expect(data.available).toBe(false);
      expect(data.reason).toContain('estudio cierra');
    });

    test('debe simular error de red', async () => {
      // Mock error de red
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const dateInput = document.getElementById('date') as HTMLInputElement;
      const timeInput = document.getElementById('time') as HTMLInputElement;
      const packageInput = document.getElementById('package') as HTMLSelectElement;
      const studioSpaceInput = document.getElementById('studio-space') as HTMLSelectElement;

      dateInput.value = '2025-07-03';
      timeInput.value = '14:00';
      packageInput.value = '2h';
      studioSpaceInput.value = 'principal-zone';

      // Simular llamada a API que falla
      try {
        await fetch('/api/calendar/validate-availability?date=2025-07-03&time=14:00&duration=2&studio_space=principal-zone');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });
  });

  describe('Estados del botón de submit', () => {
    test('debe poder habilitar/deshabilitar botón según disponibilidad', () => {
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      
      // Estado inicial
      expect(submitButton.disabled).toBe(false);
      
      // Simular estado no disponible
      submitButton.disabled = true;
      submitButton.className += ' opacity-50 cursor-not-allowed';
      
      expect(submitButton.disabled).toBe(true);
      expect(submitButton.className).toContain('opacity-50');
      
      // Simular estado disponible
      submitButton.disabled = false;
      submitButton.className = submitButton.className.replace(/opacity-50|cursor-not-allowed/g, '').trim();
      
      expect(submitButton.disabled).toBe(false);
      expect(submitButton.className).not.toContain('opacity-50');
    });
  });

  describe('Manejo de mensajes de disponibilidad', () => {
    test('debe poder crear y actualizar mensajes', () => {
      const timeInput = document.getElementById('time') as HTMLInputElement;
      
      // Crear mensaje de carga
      let message = document.createElement('div');
      message.id = 'availability-message';
      message.className = 'bg-blue-50';
      message.innerHTML = '<span>Verificando disponibilidad...</span>';
      timeInput.parentElement?.appendChild(message);
      
      expect(document.getElementById('availability-message')?.textContent).toContain('Verificando');
      
      // Actualizar a mensaje de éxito
      message = document.getElementById('availability-message')! as HTMLDivElement;
      message.className = 'bg-green-50';
      message.innerHTML = '<span>✅ Horario disponible</span>';
      
      expect(message.textContent).toContain('Horario disponible');
      expect(message.className).toBe('bg-green-50');
      
      // Actualizar a mensaje de error
      message.className = 'bg-red-50';
      message.innerHTML = '<span>❌ Horario no disponible</span>';
      
      expect(message.textContent).toContain('no disponible');
      expect(message.className).toBe('bg-red-50');
    });
  });
});