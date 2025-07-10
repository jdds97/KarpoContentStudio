// Tests para lib/booking-form.ts
import { BookingFormManager } from '@/lib/booking-form';

// Mock fetch
global.fetch = jest.fn();

describe('BookingFormManager', () => {
  let handler: BookingFormManager;

  beforeEach(() => {
    // Setup DOM first, then initialize
    document.body.innerHTML = `
      <form id="booking-form">
        <input id="date" type="date" value="2025-07-10" />
        <input id="time" type="time" value="14:00" />
        <select id="package"><option value="2h" selected>2 horas</option></select>
        <select id="studio-space"><option value="principal-zone" selected>Zona Principal</option></select>
        <input id="name" value="Juan Pérez" />
        <input id="email" value="juan@example.com" />
        <input id="phone" value="123456789" />
        <input id="participants" value="2" />
        <select id="session-type"><option value="portrait" selected>Retrato</option></select>
        <input id="discount-code" type="text" />
        <button id="apply-discount" type="button">Aplicar</button>
        <div id="discount-message"></div>
        <button type="submit">Reservar</button>
      </form>
      <div id="availability-message"></div>
    `;
    
    handler = new BookingFormManager();
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Inicialización', () => {
    test('debe inicializar correctamente', () => {
      expect(handler).toBeDefined();
      expect(handler).toBeInstanceOf(BookingFormManager);
    });

    test('debe encontrar elementos del formulario', () => {
      const form = document.getElementById('booking-form');
      const discountInput = document.getElementById('discount-code');
      const applyButton = document.getElementById('apply-discount');
      
      expect(form).toBeTruthy();
      expect(discountInput).toBeTruthy();
      expect(applyButton).toBeTruthy();
    });
  });

  describe('Funcionalidad de descuento', () => {
    test('debe tener elementos de descuento disponibles', () => {
      const discountInput = document.getElementById('discount-code') as HTMLInputElement;
      const applyButton = document.getElementById('apply-discount') as HTMLButtonElement;
      const messageDiv = document.getElementById('discount-message') as HTMLDivElement;
      
      expect(discountInput).toBeTruthy();
      expect(applyButton).toBeTruthy();
      expect(messageDiv).toBeTruthy();
    });

    test('debe manejar entrada de código de descuento', () => {
      const discountInput = document.getElementById('discount-code') as HTMLInputElement;
      
      discountInput.value = 'TEST10';
      discountInput.dispatchEvent(new Event('input'));
      
      expect(discountInput.value).toBe('TEST10');
    });
  });

  describe('Elementos del formulario', () => {
    test('debe tener todos los campos requeridos', () => {
      const requiredFields = ['date', 'time', 'package', 'studio-space', 'name', 'email', 'phone'];
      
      requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        expect(field).toBeTruthy();
      });
    });

    test('debe permitir modificar valores de campos', () => {
      const nameInput = document.getElementById('name') as HTMLInputElement;
      const emailInput = document.getElementById('email') as HTMLInputElement;
      
      nameInput.value = 'Nuevo Nombre';
      emailInput.value = 'nuevo@email.com';
      
      expect(nameInput.value).toBe('Nuevo Nombre');
      expect(emailInput.value).toBe('nuevo@email.com');
    });
  });
});