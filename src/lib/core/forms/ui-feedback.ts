// Sistema de feedback de UI

import type {
  UIFeedbackManager,
  ButtonStateManager,
  NotificationManager,
  NotificationConfig
} from '@/types';
import { NotificationType } from '@/types';

// Clase para manejo de estado de botones
export class FormButtonStateManager implements ButtonStateManager {
  private button: HTMLButtonElement | null;
  private originalText: string;
  private originalClasses: string;

  constructor(button: HTMLButtonElement | string) {
    if (typeof button === 'string') {
      this.button = document.querySelector(button) as HTMLButtonElement;
    } else {
      this.button = button;
    }
    
    if (this.button) {
      this.originalText = this.button.textContent || '';
      this.originalClasses = this.button.className;
    } else {
      this.originalText = '';
      this.originalClasses = '';
    }
  }

  public setLoading(loadingText: string = 'Cargando...'): void {
    if (!this.button) return;

    this.button.disabled = true;
    this.button.textContent = loadingText;
    this.button.classList.add('loading', 'opacity-50', 'cursor-not-allowed');
  }

  public resetState(): void {
    if (!this.button) return;

    this.button.disabled = false;
    this.button.textContent = this.originalText;
    this.button.className = this.originalClasses;
  }

  public disable(): void {
    if (!this.button) return;
    this.button.disabled = true;
  }

  public enable(): void {
    if (!this.button) return;
    this.button.disabled = false;
  }

  public isDisabled(): boolean {
    return this.button?.disabled || false;
  }
}

// Clase para manejo de mensajes en elementos específicos
export class ElementUIFeedbackManager implements UIFeedbackManager {
  private element: HTMLElement | null;

  constructor(elementId: string | HTMLElement) {
    if (typeof elementId === 'string') {
      this.element = document.getElementById(elementId);
    } else {
      this.element = elementId;
    }
  }

  public showSuccess(message: string): void {
    this.showMessage(message, NotificationType.SUCCESS);
  }

  public showError(message: string): void {
    this.showMessage(message, NotificationType.ERROR);
  }

  public showWarning(message: string): void {
    this.showMessage(message, NotificationType.WARNING);
  }

  public showLoading(message: string = 'Cargando...'): void {
    this.showMessage(message, NotificationType.LOADING);
  }

  public hide(): void {
    if (!this.element) return;
    this.element.classList.add('hidden');
  }

  public clear(): void {
    if (!this.element) return;
    this.element.textContent = '';
    this.element.className = 'hidden';
  }

  private showMessage(message: string, type: NotificationType): void {
    if (!this.element) return;

    this.element.classList.remove('hidden');
    this.element.className = this.getMessageClasses(type);
    this.element.textContent = message;
  }

  private getMessageClasses(type: NotificationType): string {
    const baseClasses = 'mt-4 p-3 rounded-lg text-sm';
    
    switch (type) {
      case NotificationType.SUCCESS:
        return `${baseClasses} bg-green-50 border border-green-200 text-green-700`;
      case NotificationType.ERROR:
        return `${baseClasses} bg-red-50 border border-red-200 text-red-700`;
      case NotificationType.WARNING:
        return `${baseClasses} bg-yellow-50 border border-yellow-200 text-yellow-700`;
      case NotificationType.LOADING:
        return `${baseClasses} bg-blue-50 border border-blue-200 text-blue-700`;
      default:
        return `${baseClasses} bg-gray-50 border border-gray-200 text-gray-700`;
    }
  }
}

// Clase para notificaciones tipo toast
export class ToastNotificationManager implements NotificationManager {
  private container: HTMLElement | null = null;
  private notifications: Map<string, HTMLElement> = new Map();
  private defaultConfig: NotificationConfig = {
    duration: 4000,
    persistent: false,
    position: 'top-right',
    showCloseButton: true
  };

  constructor(config: Partial<NotificationConfig> = {}) {
    this.defaultConfig = { ...this.defaultConfig, ...config };
    this.createContainer();
  }

  public show(message: string, type: NotificationType, duration?: number): void {
    const notificationId = this.generateId();
    const notification = this.createNotification(message, type, notificationId);
    
    if (this.container) {
      this.container.appendChild(notification);
      this.notifications.set(notificationId, notification);

      // Auto-ocultado si no es persistente
      const finalDuration = duration || this.defaultConfig.duration;
      if (!this.defaultConfig.persistent && finalDuration && finalDuration > 0) {
        setTimeout(() => {
          this.hideNotification(notificationId);
        }, finalDuration);
      }
    }
  }

  public hide(): void {
    const lastNotification = Array.from(this.notifications.values()).pop();
    if (lastNotification) {
      const id = lastNotification.getAttribute('data-notification-id');
      if (id) {
        this.hideNotification(id);
      }
    }
  }

  public clear(): void {
    this.notifications.forEach((_, id) => {
      this.hideNotification(id);
    });
  }

  private createContainer(): void {
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = this.getContainerClasses();
    document.body.appendChild(this.container);
  }

  private createNotification(message: string, type: NotificationType, id: string): HTMLElement {
    const notification = document.createElement('div');
    notification.setAttribute('data-notification-id', id);
    notification.className = this.getNotificationClasses(type);
    
    const content = document.createElement('div');
    content.className = 'flex items-start';
    
    const icon = this.createIcon(type);
    const messageElement = document.createElement('div');
    messageElement.className = 'ml-3 flex-1';
    messageElement.textContent = message;
    
    content.appendChild(icon);
    content.appendChild(messageElement);
    
    if (this.defaultConfig.showCloseButton) {
      const closeButton = this.createCloseButton(id);
      content.appendChild(closeButton);
    }
    
    notification.appendChild(content);
    return notification;
  }

  private createIcon(type: NotificationType): HTMLElement {
    const icon = document.createElement('div');
    icon.className = 'flex-shrink-0';
    
    switch (type) {
      case NotificationType.SUCCESS:
        icon.innerHTML = '✅';
        break;
      case NotificationType.ERROR:
        icon.innerHTML = '❌';
        break;
      case NotificationType.WARNING:
        icon.innerHTML = '⚠️';
        break;
      case NotificationType.LOADING:
        icon.innerHTML = '⏳';
        break;
      default:
        icon.innerHTML = 'ℹ️';
    }
    
    return icon;
  }

  private createCloseButton(notificationId: string): HTMLElement {
    const button = document.createElement('button');
    button.className = 'ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600';
    button.innerHTML = '✕';
    button.addEventListener('click', () => {
      this.hideNotification(notificationId);
    });
    return button;
  }

  private hideNotification(id: string): void {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        this.notifications.delete(id);
      }, 300);
    }
  }

  private getContainerClasses(): string {
    const baseClasses = 'fixed z-50 space-y-2';
    
    switch (this.defaultConfig.position) {
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      case 'center':
        return `${baseClasses} top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`;
      default:
        return `${baseClasses} top-4 right-4`;
    }
  }

  private getNotificationClasses(type: NotificationType): string {
    const baseClasses = 'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 transform transition-all duration-300 ease-in-out';
    
    switch (type) {
      case NotificationType.SUCCESS:
        return `${baseClasses} border-l-4 border-green-400`;
      case NotificationType.ERROR:
        return `${baseClasses} border-l-4 border-red-400`;
      case NotificationType.WARNING:
        return `${baseClasses} border-l-4 border-yellow-400`;
      case NotificationType.LOADING:
        return `${baseClasses} border-l-4 border-blue-400`;
      default:
        return `${baseClasses} border-l-4 border-gray-400`;
    }
  }

  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

// Facade para manejo simplificado de UI feedback
export class FormUIFeedbackFacade {
  private messageManager: ElementUIFeedbackManager;
  private buttonManager: FormButtonStateManager;
  private toastManager: ToastNotificationManager;

  constructor(
    messageElementId: string,
    submitButton: string | HTMLButtonElement,
    toastConfig?: Partial<NotificationConfig>
  ) {
    this.messageManager = new ElementUIFeedbackManager(messageElementId);
    this.buttonManager = new FormButtonStateManager(submitButton);
    this.toastManager = new ToastNotificationManager(toastConfig);
  }

  // Métodos de conveniencia para estados comunes
  public showFormLoading(message?: string): void {
    this.buttonManager.setLoading();
    this.messageManager.showLoading(message);
  }

  public showFormSuccess(message: string, useToast: boolean = false): void {
    this.buttonManager.resetState();
    
    if (useToast) {
      this.toastManager.show(message, NotificationType.SUCCESS);
      this.messageManager.hide();
    } else {
      this.messageManager.showSuccess(message);
    }
  }

  public showFormError(message: string, useToast: boolean = false): void {
    this.buttonManager.resetState();
    
    if (useToast) {
      this.toastManager.show(message, NotificationType.ERROR);
      this.messageManager.hide();
    } else {
      this.messageManager.showError(message);
    }
  }

  public resetForm(): void {
    this.buttonManager.resetState();
    this.messageManager.clear();
  }

  public clearAll(): void {
    this.resetForm();
    this.toastManager.clear();
  }

  // Getters para acceso directo a los managers
  public get messages(): ElementUIFeedbackManager {
    return this.messageManager;
  }

  public get buttons(): FormButtonStateManager {
    return this.buttonManager;
  }

  public get toasts(): ToastNotificationManager {
    return this.toastManager;
  }
}