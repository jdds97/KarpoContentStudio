// Test básico para verificar configuración

describe('Configuración básica de tests', () => {
  test('Jest funciona correctamente', () => {
    expect(1 + 1).toBe(2);
  });

  test('Environment setup funciona', () => {
    expect(typeof document).toBe('object');
    expect(typeof window).toBe('object');
  });

  test('Test utils están disponibles', () => {
    expect((global as any).testUtils).toBeDefined();
    expect(typeof (global as any).testUtils.createMockResponse).toBe('function');
  });

  test('Fetch mock está configurado', () => {
    expect(global.fetch).toBeDefined();
    expect(jest.isMockFunction(global.fetch)).toBe(true);
  });
});