// Tests de integración para Actions - Lógica Actual
import { server } from '@/actions/index';

// Helper para crear FormData desde objeto
function createFormData(data: Record<string, string | number>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, String(value));
  });
  return formData;
}

// Mock de Supabase para las actions
const mockBookingData = {
  id: 1,
  name: 'Juan Pérez',
  email: 'juan@example.com',
  phone: '123456789',
  studio_space: 'principal-zone',
  package_duration: '2h',
  preferred_date: '2025-07-05',
  preferred_time: '14:00',
  participants: 2,
  session_type: 'portrait',
  total_price: 150,
  status: 'pending',
  created_at: '2025-07-03T10:00:00.000Z'
};

const mockSupabaseAdmin = {
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({
          data: mockBookingData,
          error: null
        }))
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { ...mockBookingData, status: 'confirmed' },
            error: null
          }))
        }))
      }))
    })),
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({
          data: mockBookingData,
          error: null
        }))
      }))
    }))
  }))
};

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: mockSupabaseAdmin
}));

// Mock de fetch para validación de disponibilidad
global.fetch = jest.fn();

// Mock de email helpers
jest.mock('@/utils/email-helpers', () => ({
  sendEmailWithResend: jest.fn(() => Promise.resolve({ success: true })),
  calculateTotalPrice: jest.fn(() => 150),
  generateBookingConfirmationEmail: jest.fn(() => ({
    subject: 'Confirmación de reserva',
    html: '<h1>Reserva confirmada</h1>'
  })),
  generateAdminBookingNotificationEmail: jest.fn(() => ({
    subject: 'Nueva reserva',
    html: '<h1>Nueva reserva recibida</h1>'
  })),
  generateBookingConfirmedEmail: jest.fn(() => ({
    subject: 'Reserva confirmada',
    html: '<h1>Tu reserva está confirmada</h1>'
  })),
  generateBookingCancelledEmail: jest.fn(() => ({
    subject: 'Reserva cancelada',
    html: '<h1>Reserva cancelada</h1>'
  })),
  generateBookingUpdatedEmail: jest.fn(() => ({
    subject: 'Reserva actualizada',
    html: '<h1>Reserva actualizada</h1>'
  }))
}));

describe('Actions: createBooking (Lógica Actual)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch success por defecto
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ available: true })
    });
  });

  describe('Creación exitosa de reserva', () => {
    test('debe crear reserva exitosamente con todos los campos', async () => {
      const formData = new FormData();
      formData.append('name', 'Juan Pérez');
      formData.append('email', 'juan@example.com');
      formData.append('phone', '123456789');
      formData.append('company', 'Mi Empresa');
      formData.append('studio-space', 'principal-zone');
      formData.append('package', '2h');
      formData.append('date', '2025-07-05');
      formData.append('time', '14:00');
      formData.append('participants', '2');
      formData.append('session-type', 'portrait');
      formData.append('notes', 'Sesión especial');

      const result = await server.createBooking(formData);

      expect(result.data?.success).toBe(true);
      expect(result.data?.message).toContain('Reserva creada exitosamente');
      expect(result.data?.data?.booking).toBeDefined();
    });

    test('debe validar disponibilidad antes de crear reserva', async () => {
      const formData = createFormData({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '123456789',
        'studio-space': 'principal-zone',
        package: '2h',
        date: '2025-07-05',
        time: '14:00',
        participants: '2',
        'session-type': 'portrait'
      });

      await server.createBooking(formData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/calendar/validate-availability')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('date=2025-07-05&time=14:00&duration=2&studio_space=principal-zone')
      );
    });

    test('debe rechazar reserva si no está disponible', async () => {
      // Mock fetch para simular no disponibilidad
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ 
          available: false,
          reason: 'Horario ocupado'
        })
      });

      const formData = createFormData({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '123456789',
        'studio-space': 'principal-zone',
        package: '2h',
        date: '2025-07-05',
        time: '14:00',
        participants: '2',
        'session-type': 'portrait'
      });

      const result = await server.createBooking(formData);

      expect(result.data?.success).toBe(false);
      expect(result.data?.error).toContain('Horario ocupado');
    });

    test('debe proceder con reserva si validación falla', async () => {
      // Mock fetch para simular error en validación
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const formData = createFormData({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '123456789',
        'studio-space': 'principal-zone',
        package: '2h',
        date: '2025-07-05',
        time: '14:00',
        participants: '2',
        'session-type': 'portrait'
      });

      const result = await server.createBooking(formData);

      expect(result.data?.success).toBe(true);
      expect(result.data?.message).toContain('Reserva creada exitosamente');
    });
  });

  describe('Manejo de descuentos', () => {
    test('debe aplicar descuento válido', async () => {
      // Mock fetch para descuento
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ available: true })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            valid: true,
            percentage: 10 
          })
        });

      const formData = createFormData({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '123456789',
        'studio-space': 'principal-zone',
        package: '2h',
        date: '2025-07-05',
        time: '14:00',
        participants: '2',
        'session-type': 'portrait',
        'applied-discount-code': 'DESCUENTO10'
      });

      const result = await server.createBooking(formData);

      expect(result.data?.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/discount/validate'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ code: 'DESCUENTO10' })
        })
      );
    });

    test('debe ignorar descuento inválido', async () => {
      // Mock fetch para descuento inválido
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ available: true })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            valid: false 
          })
        });

      const formData = createFormData({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '123456789',
        'studio-space': 'principal-zone',
        package: '2h',
        date: '2025-07-05',
        time: '14:00',
        participants: '2',
        'session-type': 'portrait',
        'applied-discount-code': 'INVALID'
      });

      const result = await server.createBooking(formData);

      expect(result.data?.success).toBe(true);
      // Debe usar precio sin descuento
    });
  });

  describe('Conversión de duración de paquete', () => {
    test('debe convertir 1h a 1', async () => {
      const formData = createFormData({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '123456789',
        'studio-space': 'principal-zone',
        package: '1h',
        date: '2025-07-05',
        time: '14:00',
        participants: '2',
        'session-type': 'portrait'
      });

      await server.createBooking(formData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('duration=1')
      );
    });

    test('debe convertir 4h a 4', async () => {
      const formData = createFormData({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '123456789',
        'studio-space': 'principal-zone',
        package: '4h',
        date: '2025-07-05',
        time: '14:00',
        participants: '2',
        'session-type': 'portrait'
      });

      await server.createBooking(formData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('duration=4')
      );
    });

    test('debe convertir 8h a 8', async () => {
      const formData = createFormData({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '123456789',
        'studio-space': 'principal-zone',
        package: '8h',
        date: '2025-07-05',
        time: '14:00',
        participants: '2',
        'session-type': 'portrait'
      });

      await server.createBooking(formData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('duration=8')
      );
    });
  });

  describe('Manejo de errores', () => {
    test('debe manejar error de base de datos', async () => {
      // Mock error de Supabase
      (mockSupabaseAdmin.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Database error' }
            }))
          }))
        }))
      });

      const formData = createFormData({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '123456789',
        'studio-space': 'principal-zone',
        package: '2h',
        date: '2025-07-05',
        time: '14:00',
        participants: '2',
        'session-type': 'portrait'
      });

      const result = await server.createBooking(formData);

      expect(result.data?.success).toBe(false);
      expect(result.data?.error).toBe('Error al crear la reserva. Por favor, inténtalo de nuevo.');
    });
  });
});

describe('Actions: confirmBooking (Lógica Actual)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe confirmar reserva con password correcto', async () => {
    // Mock environment variable
    process.env.ADMIN_PASSWORD = 'admin123';

    const formData = createFormData({
      bookingId: '1',
      adminPassword: 'admin123'
    });

    const result = await server.confirmBooking(formData);

    expect(result.data?.success).toBe(true);
    expect(result.data?.message).toBe('Reserva confirmada exitosamente.');
  });

  test('debe rechazar con password incorrecto', async () => {
    process.env.ADMIN_PASSWORD = 'admin123';

    const formData = createFormData({
      bookingId: '1',
      adminPassword: 'wrong-password'
    });

    const result = await server.confirmBooking(formData);

    expect(result.data?.success).toBe(false);
    expect(result.data?.error).toBe('Password de administrador incorrecto.');
  });
});

describe('Actions: updateBooking (Lógica Actual)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe actualizar reserva exitosamente', async () => {
    const formData = createFormData({
      id: '1',
      preferred_date: '2025-07-06',
      preferred_time: '15:00'
    });

    const result = await server.updateBooking(formData);

    expect(result.data?.success).toBe(true);
    expect(result.data?.message).toBe('Reserva actualizada exitosamente.');
  });
});

describe('Actions: cancelBooking (Lógica Actual)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe cancelar reserva exitosamente', async () => {
    const formData = createFormData({
      bookingId: '1',
      reason: 'Cambio de planes'
    });

    const result = await server.cancelBooking(formData);

    expect(result.data?.success).toBe(true);
    expect(result.data?.message).toBe('Reserva cancelada exitosamente.');
  });
});
