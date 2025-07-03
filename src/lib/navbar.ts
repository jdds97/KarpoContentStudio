// Navbar TypeScript implementation
// Navigation active state management and smooth scrolling

class NavbarManager {
  constructor() {
    this.init();
  }

  private init(): void {
    this.updateActiveNavigation();
    this.setupEventListeners();
    this.enhanceSmoothScrolling();
  }

  private updateActiveNavigation(): void {
    const currentPath = window.location.pathname;
    
    // Limpiar todos los indicadores existentes
    document.querySelectorAll('.nav-indicator').forEach(indicator => {
      indicator.remove();
    });
    
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    // Añadir indicadores a elementos activos
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('data-href');
      const isActive = currentPath === href || (href === '/' && currentPath === '/');
      
      if (isActive) {
        // Para navegación desktop
        if (!link.querySelector('.nav-indicator')) {
          const indicator = document.createElement('span');
          indicator.className = 'block absolute left-0 -bottom-2 w-full h-1 bg-primary-black rounded-t nav-indicator';
          link.appendChild(indicator);
        }
      }
    });
    
    // Para navegación móvil
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      const href = link.getAttribute('data-href');
      const isActive = currentPath === href || (href === '/' && currentPath === '/');
      
      if (isActive) {
        link.classList.add('active');
      }
    });
  }

  private setupEventListeners(): void {
    // Ejecutar después de navegación SPA si existe
    document.addEventListener('astro:page-load', () => {
      this.updateActiveNavigation();
      this.enhanceSmoothScrolling();
    });
  }

  private enhanceSmoothScrolling(): void {
    document.addEventListener('click', (e: Event) => {
      if (!e.target) return;
      const link = (e.target as HTMLElement).closest('a[href*="#"]');
      if (link) {
        const href = link.getAttribute('href');
        const targetId = href && href.includes('#') ? href.split('#')[1] : null;
        
        if (targetId) {
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            e.preventDefault();
            
            // Scroll suave con offset para navbar fijo
            const navbarHeight = 100;
            const targetPosition = targetElement.offsetTop - navbarHeight;
            
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
            
            // Actualizar URL sin recargar
            if (href?.startsWith('/')) {
              history.pushState(null, '', href);
            } else {
              history.pushState(null, '', `${window.location.pathname}${href}`);
            }
          }
        }
      }
    });
  }
}

function initNavbar(): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new NavbarManager());
  } else {
    new NavbarManager();
  }
}

export { NavbarManager, initNavbar };