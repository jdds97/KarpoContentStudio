// Discount Banner TypeScript implementation
// Copy discount code functionality and animations

class DiscountBannerManager {
  private copyButton: HTMLButtonElement | null;
  private notification: HTMLElement | null;

  constructor() {
    this.copyButton = null;
    this.notification = null;
    this.init();
  }

  private init(): void {
    this.bindElements();
    this.setupCopyFunctionality();
    this.setupCodeAnimation();
  }

  private bindElements(): void {
    this.copyButton = document.getElementById('copy-discount-code') as HTMLButtonElement;
    this.notification = document.getElementById('copy-notification');
  }

  private setupCopyFunctionality(): void {
    if (!this.copyButton || !this.notification) return;

    this.copyButton.addEventListener('click', async () => {
      const code = this.copyButton!.getAttribute('data-code');
      
      if (!code) {
        console.error('No se encontró el código a copiar');
        return;
      }
      
      await this.copyCodeToClipboard(code);
    });
  }

  private async copyCodeToClipboard(code: string): Promise<void> {
    if (!this.copyButton || !this.notification) return;

    const originalText = this.copyButton.innerHTML;
    this.copyButton.innerHTML = '⏳ Copiando...';
    this.copyButton.disabled = true;
    
    try {
      await navigator.clipboard.writeText(code);
      this.showSuccessState(originalText);
      
    } catch (err) {
      console.warn('Clipboard API no disponible, usando fallback');
      await this.fallbackCopy(code, originalText);
    }
  }

  private showSuccessState(originalText: string): void {
    if (!this.copyButton || !this.notification) return;

    // Cambiar botón a estado de éxito
    this.copyButton.innerHTML = '✅ ¡Copiado!';
    this.copyButton.classList.add('bg-green-500', 'text-white');
    this.copyButton.classList.remove('bg-white', 'text-gray-900', 'hover:bg-gray-100');
    
    // Mostrar notificación
    this.notification.classList.remove('opacity-0', 'translate-x-full');
    this.notification.classList.add('opacity-100', 'translate-x-0');
    
    // Restablecer después de 2 segundos
    setTimeout(() => {
      this.resetButtonState(originalText);
    }, 2000);
  }

  private async fallbackCopy(code: string, originalText: string): Promise<void> {
    if (!this.copyButton || !this.notification) return;

    const textArea = document.createElement('textarea');
    textArea.value = code;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      // Usar Clipboard API moderna si está disponible
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code).then(() => {
          this.showSuccessState(originalText);
        }).catch(() => {
          throw new Error('No se pudo copiar');
        });
      } else {
        // Fallback a execCommand solo si no hay Clipboard API
        const successful = (document as any).execCommand('copy');
        if (successful) {
          this.showSuccessState(originalText);
        } else {
          throw new Error('No se pudo copiar');
        }
      }
    } catch (fallbackErr) {
      this.showErrorState(originalText);
    }
    
    document.body.removeChild(textArea);
  }

  private showErrorState(originalText: string): void {
    if (!this.copyButton) return;

    this.copyButton.innerHTML = '❌ Error';
    this.copyButton.classList.add('bg-red-500', 'text-white');
    this.copyButton.classList.remove('bg-white', 'text-gray-900', 'hover:bg-gray-100');
    
    setTimeout(() => {
      this.resetButtonState(originalText);
    }, 2000);
  }

  private resetButtonState(originalText: string): void {
    if (!this.copyButton || !this.notification) return;

    this.copyButton.innerHTML = originalText;
    this.copyButton.disabled = false;
    this.copyButton.classList.remove('bg-green-500', 'bg-red-500', 'text-white');
    this.copyButton.classList.add('bg-white', 'text-gray-900', 'hover:bg-gray-100');
    
    // Ocultar notificación
    this.notification.classList.add('opacity-0', 'translate-x-full');
    this.notification.classList.remove('opacity-100', 'translate-x-0');
  }

  private setupCodeAnimation(): void {
    const codeElement = document.querySelector('[data-code]')?.previousElementSibling;
    if (codeElement) {
      setInterval(() => {
        codeElement.classList.add('animate-pulse');
        setTimeout(() => {
          codeElement.classList.remove('animate-pulse');
        }, 1000);
      }, 5000);
    }
  }
}

function initDiscountBanner(): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new DiscountBannerManager());
  } else {
    new DiscountBannerManager();
  }
}

export { DiscountBannerManager, initDiscountBanner };