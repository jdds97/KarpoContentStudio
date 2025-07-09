// Admin Login Handler - Clean Architecture
// Aplicando principios SOLID para manejo de autenticación de administradores

// Interfaces (Interface Segregation Principle)
interface LoginResponse {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

interface AuthenticationService {
  authenticate(formData: FormData): Promise<Response>;
}

interface UIStateManager {
  showLoading(): void;
  showSuccess(message: string): void;
  showError(message: string): void;
  resetState(): void;
}

interface RedirectService {
  redirectTo(url: string, delay?: number): void;
}

// Clase para manejo de estado de UI (Single Responsibility Principle)
class LoginUIStateManager implements UIStateManager {
  private submitButton: HTMLButtonElement | null;
  private messageDiv: HTMLDivElement | null;
  private originalButtonText: string;

  constructor() {
    this.submitButton = document.querySelector('form button[type="submit"]') as HTMLButtonElement;
    this.messageDiv = document.getElementById('message') as HTMLDivElement;
    this.originalButtonText = this.submitButton?.textContent || 'Iniciar Sesión';
  }

  public showLoading(): void {
    if (this.submitButton) {
      this.submitButton.disabled = true;
      this.submitButton.textContent = 'Iniciando sesión...';
    }
    this.hideMessage();
  }

  public showSuccess(message: string): void {
    this.showMessage(message, 'text-green-600');
  }

  public showError(message: string): void {
    this.showMessage(message, 'text-red-600');
    this.resetButton();
  }

  public resetState(): void {
    this.resetButton();
    this.hideMessage();
  }

  private showMessage(message: string, className: string): void {
    if (this.messageDiv) {
      this.messageDiv.className = `mt-4 text-center ${className}`;
      this.messageDiv.textContent = message;
    }
  }

  private hideMessage(): void {
    if (this.messageDiv) {
      this.messageDiv.className = 'mt-4 text-center hidden';
    }
  }

  private resetButton(): void {
    if (this.submitButton) {
      this.submitButton.disabled = false;
      this.submitButton.textContent = this.originalButtonText;
    }
  }
}

// Clase para manejo de redirección (Single Responsibility Principle)
class LoginRedirectService implements RedirectService {
  public redirectTo(url: string, delay: number = 1000): void {
    setTimeout(() => {
      window.location.href = url;
    }, delay);
  }
}

// Clase para servicio de autenticación (Single Responsibility Principle)
class AdminAuthenticationService implements AuthenticationService {
  private readonly authEndpoint = '/api/auth/signin';

  public async authenticate(formData: FormData): Promise<Response> {
    return await fetch(this.authEndpoint, {
      method: 'POST',
      body: formData
    });
  }
}

// Clase para validación de formulario (Single Responsibility Principle)
class LoginFormValidator {
  public validateForm(formData: FormData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !email.trim()) {
      errors.push('El email es obligatorio');
    } else if (!this.isValidEmail(email)) {
      errors.push('El formato del email no es válido');
    }

    if (!password || !password.trim()) {
      errors.push('La contraseña es obligatoria');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Clase principal para manejo del login (Single Responsibility Principle - Coordinación)
export class AdminLoginHandler {
  private form: HTMLFormElement | null = null;
  private uiManager: LoginUIStateManager;
  private authService: AdminAuthenticationService;
  private redirectService: LoginRedirectService;
  private validator: LoginFormValidator;
  private isSubmitting = false;

  constructor() {
    this.uiManager = new LoginUIStateManager();
    this.authService = new AdminAuthenticationService();
    this.redirectService = new LoginRedirectService();
    this.validator = new LoginFormValidator();
  }

  public initialize(): void {
    // Esperar a que el DOM esté cargado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupForm());
    } else {
      this.setupForm();
    }
  }

  private setupForm(): void {
    this.form = document.querySelector('form') as HTMLFormElement;
    
    if (this.form) {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }
  }

  private handleSubmit = async (e: Event): Promise<void> => {
    e.preventDefault();
    
    if (this.isSubmitting || !this.form) {
      return; // Prevenir envíos múltiples
    }

    await this.processLogin();
  }

  private async processLogin(): Promise<void> {
    if (!this.form) return;

    this.isSubmitting = true;
    this.uiManager.showLoading();

    try {
      const formData = new FormData(this.form);
      
      // Validar formulario
      const validation = this.validator.validateForm(formData);
      if (!validation.valid) {
        this.handleValidationErrors(validation.errors);
        return;
      }

      // Autenticar
      const response = await this.authService.authenticate(formData);
      const result = await response.json();
      
      this.handleAuthenticationResult(result);
      
    } catch (error) {
      this.handleNetworkError();
    } finally {
      this.isSubmitting = false;
    }
  }

  private handleValidationErrors(errors: string[]): void {
    const errorMessage = errors.join('. ');
    this.uiManager.showError(errorMessage);
  }

  private handleAuthenticationResult(result: LoginResponse): void {
    if (result.success && result.redirectTo) {
      this.handleLoginSuccess(result.redirectTo);
    } else {
      this.handleLoginError(result.error || 'Error al iniciar sesión');
    }
  }

  private handleLoginSuccess(redirectUrl: string): void {
    this.uiManager.showSuccess('Sesión iniciada correctamente. Redirigiendo...');
    this.redirectService.redirectTo(redirectUrl, 1000);
  }

  private handleLoginError(errorMessage: string): void {
    this.uiManager.showError(errorMessage);
  }

  private handleNetworkError(): void {
    this.uiManager.showError('Error de conexión. Inténtalo de nuevo.');
  }
}

// Factory function para crear el handler (Factory Pattern)
export function createAdminLoginHandler(): AdminLoginHandler {
  const handler = new AdminLoginHandler();
  handler.initialize();
  return handler;
}

// Función de inicialización para compatibilidad
export function initAdminLoginHandler(): void {
  createAdminLoginHandler();
}

// Auto-inicialización
if (typeof document !== 'undefined') {
  // Usar requestIdleCallback si está disponible
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => initAdminLoginHandler());
  } else {
    setTimeout(initAdminLoginHandler, 0);
  }
}