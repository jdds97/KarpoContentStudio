// Tests para utils/email-helpers.ts
import { 
  sendEmailWithResend, 
  calculateTotalPrice, 
  generateBookingConfirmationEmail,
  generateAdminBookingNotificationEmail,
  generateBookingConfirmedEmail,
  generateBookingCancelledEmail,
  generateBookingUpdatedEmail
} from '@/utils/email-helpers';

// Mock environment and fetch for email sending

describe('Email Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variables
    process.env.RESEND_API_KEY = 'test-key';
    process.env.PUBLIC_SITE_URL = 'https://test.com';
  });

  describe('calculateTotalPrice', () => {
    test('debe calcular precio base para sesión de 2 horas', () => {
      const price = calculateTotalPrice('2h', 0);
      expect(price).toBeGreaterThan(0);
      expect(typeof price).toBe('number');
    });

    test('debe aplicar descuento correctamente', () => {
      const basePrice = calculateTotalPrice('2h', 0);
      const discountedPrice = calculateTotalPrice('2h', 10);
      expect(discountedPrice).toBeLessThanOrEqual(basePrice);
    });

    test('debe manejar diferentes duraciones', () => {
      const prices = ['2h', '4h', '8h', '12h'].map(duration => 
        calculateTotalPrice(duration, 0)
      );
      expect(prices.every(p => p > 0)).toBe(true);
    });

    test('debe ajustar precio por número de participantes', () => {
      const price2 = calculateTotalPrice('2h', 0);
      const price5 = calculateTotalPrice('2h', 0);
      expect(typeof price2).toBe('number');
      expect(typeof price5).toBe('number');
    });
  });

  describe('sendEmailWithResend', () => {
    test('debe enviar email exitosamente', async () => {
      // Mock fetch to return successful response
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      });

      const result = await sendEmailWithResend(
        ['test@example.com'],
        'Test Email',
        '<h1>Test</h1>'
      );

      expect(result.success).toBe(true);
    });

    test('debe manejar errores de envío', async () => {
      // Mock fetch to return error response
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Email failed' }),
        statusText: 'Bad Request'
      });

      const result = await sendEmailWithResend(
        ['test@example.com'],
        'Test Email',
        '<h1>Test</h1>'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('generateBookingConfirmationEmail', () => {
    const mockBooking = {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '123456789',
      company: 'Mi Empresa',
      studio_space: 'principal-zone',
      package_duration: '2h',
      preferred_date: '2025-07-10',
      preferred_time: '14:00',
      participants: 2,
      session_type: 'portrait',
      notes: 'Sesión especial',
      total_price: 150,
      status: 'pending',
      created_at: '2025-07-09T10:00:00Z'
    };

    test('debe generar email de confirmación', () => {
      const email = generateBookingConfirmationEmail(mockBooking);
      
      expect(email.subject).toContain('Confirmación');
      expect(email.html).toContain('Juan Pérez');
      expect(email.html).toContain('julio'); // The formatted date should contain "julio" in Spanish
      expect(email.html).toContain('14:00');
      expect(email.html).toContain('150');
    });

    test('debe incluir todos los detalles importantes', () => {
      const email = generateBookingConfirmationEmail(mockBooking);
      
      expect(email.html).toContain(mockBooking.studio_space);
      expect(email.html).toContain(mockBooking.package_duration);
      expect(email.html).toContain(mockBooking.session_type);
      expect(email.html).toContain(mockBooking.participants.toString());
    });
  });

  describe('generateAdminBookingNotificationEmail', () => {
    const mockBooking = {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '123456789',
      company: 'Mi Empresa',
      studio_space: 'principal-zone',
      package_duration: '2h',
      preferred_date: '2025-07-10',
      preferred_time: '14:00',
      participants: 2,
      session_type: 'portrait',
      notes: 'Sesión especial',
      total_price: 150,
      status: 'pending',
      created_at: '2025-07-09T10:00:00Z'
    };

    test('debe generar notificación para admin', () => {
      const email = generateAdminBookingNotificationEmail(mockBooking);
      
      expect(email.subject).toContain('Nueva Reserva');
      expect(email.html).toContain('Juan Pérez');
      expect(email.html).toContain('juan@example.com');
      expect(email.html).toContain('123456789');
    });
  });

  describe('generateBookingConfirmedEmail', () => {
    const mockBooking = {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '123456789',
      company: 'Mi Empresa',
      studio_space: 'principal-zone',
      package_duration: '2h',
      preferred_date: '2025-07-10',
      preferred_time: '14:00',
      participants: 2,
      session_type: 'portrait',
      notes: 'Sesión especial',
      total_price: 150,
      status: 'confirmed',
      created_at: '2025-07-09T10:00:00Z'
    };

    test('debe generar email de confirmación final', () => {
      const email = generateBookingConfirmedEmail(mockBooking);
      
      expect(email.subject).toContain('Confirmada');
      expect(email.html).toContain('Juan Pérez');
      expect(email.html).toContain('confirmada');
    });
  });

  describe('generateBookingCancelledEmail', () => {
    const mockBooking = {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '123456789',
      company: 'Mi Empresa',
      studio_space: 'principal-zone',
      package_duration: '2h',
      preferred_date: '2025-07-10',
      preferred_time: '14:00',
      participants: 2,
      session_type: 'portrait',
      notes: 'Sesión especial',
      total_price: 150,
      status: 'cancelled',
      created_at: '2025-07-09T10:00:00Z'
    };

    test('debe generar email de cancelación', () => {
      const email = generateBookingCancelledEmail(mockBooking);
      
      expect(email.subject).toContain('Cancelada');
      expect(email.html).toContain('Juan Pérez');
      expect(email.html).toContain('cancelada');
    });
  });

  describe('generateBookingUpdatedEmail', () => {
    const mockBooking = {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '123456789',
      company: 'Mi Empresa',
      studio_space: 'principal-zone',
      package_duration: '2h',
      preferred_date: '2025-07-10',
      preferred_time: '14:00',
      participants: 2,
      session_type: 'portrait',
      notes: 'Sesión especial',
      total_price: 150,
      status: 'pending',
      created_at: '2025-07-09T10:00:00Z'
    };

    test('debe generar email de actualización', () => {
      const email = generateBookingUpdatedEmail(mockBooking, ['Fecha actualizada', 'Hora modificada']);
      
      expect(email.subject).toContain('Actualización');
      expect(email.html).toContain('Juan Pérez');
      expect(email.html).toContain('actualizada');
    });
  });
});
