// Admin Dashboard Handler - Clean Architecture
// Aplicando principios SOLID para manejo del dashboard de administración

// Interfaces (Interface Segregation Principle)
interface BookingData {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  studio_space: string;
  package_duration: string;
  preferred_date: string;
  preferred_time: string;
  participants: number;
  session_type?: string;
  status: string;
  notes?: string;
  created_at: string;
}

interface FilterManager {
  filterByStatus(status: string): void;
}

interface ModalManager {
  showModal(modalId: string): void;
  hideModal(modalId: string): void;
  setupModalEvents(): void;
}

interface ExportManager {
  exportToCSV(): void;
}

interface NotificationManager {
  setupAutoHide(): void;
}

// Clase para manejo de filtros (Single Responsibility Principle)
class DashboardFilterManager implements FilterManager {
  public filterByStatus(status: string): void {
    const rows = document.querySelectorAll('tr[data-status]') as NodeListOf<HTMLElement>;
    const select = document.getElementById('status-filter') as HTMLSelectElement;
    
    if (status && select) {
      select.value = status;
    } else {
      status = select?.value || 'all';
    }
    
    rows.forEach(row => {
      const shouldShow = status === 'all' || row.dataset.status === status;
      row.style.display = shouldShow ? '' : 'none';
    });
  }

  public setupFilterEvents(): void {
    // Botones de filtro
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        this.filterByStatus(target.dataset.filter || '');
      });
    });
    
    // Select de filtro
    const select = document.getElementById('status-filter') as HTMLSelectElement;
    if (select) {
      select.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        this.filterByStatus(target.value);
      });
    }
  }
}

// Clase para manejo de modales (Single Responsibility Principle)
class DashboardModalManager implements ModalManager {
  public showModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  public hideModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  public setupModalEvents(): void {
    // Botones de cerrar
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const modalId = target.getAttribute('data-modal-id');
        if (modalId) {
          this.hideModal(modalId);
        }
      });
    });
    
    // Cerrar al hacer clic fuera del modal
    document.querySelectorAll('[data-modal]').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          (modal as HTMLElement).classList.add('hidden');
        }
      });
    });
  }

  // Métodos específicos para tipos de modal
  public showViewModal(bookingId: string): void {
    this.showModal(`view-modal-${bookingId}`);
  }

  public showEditModal(bookingId: string): void {
    this.showModal(`edit-modal-${bookingId}`);
  }

  public showCancelModal(bookingId: string): void {
    this.showModal(`cancel-modal-${bookingId}`);
  }
}

// Clase para manejo de exportación (Single Responsibility Principle)
class DashboardExportManager implements ExportManager {
  constructor(private bookingsData: BookingData[]) {}

  public exportToCSV(): void {
    if (!this.bookingsData || this.bookingsData.length === 0) {
      this.showNoDataAlert();
      return;
    }

    const csvContent = this.generateCSVContent();
    this.downloadCSVFile(csvContent);
  }

  public setupExportEvents(): void {
    const exportBtn = document.getElementById('export-csv');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportToCSV());
    }
  }

  private generateCSVContent(): string {
    const headers = [
      'ID', 'Nombre', 'Email', 'Teléfono', 'Empresa', 'Espacio', 
      'Duración', 'Fecha', 'Hora', 'Participantes', 'Tipo Sesión', 
      'Estado', 'Notas', 'Creado'
    ];

    const csvRows = this.bookingsData.map(booking => [
      booking.id,
      `"${booking.name}"`,
      booking.email,
      booking.phone,
      `"${booking.company || ''}"`,
      booking.studio_space,
      booking.package_duration,
      booking.preferred_date,
      booking.preferred_time,
      booking.participants,
      `"${booking.session_type || ''}"`,
      booking.status,
      `"${(booking.notes || '').replace(/"/g, '""')}"`,
      booking.created_at
    ].join(','));

    return [headers.join(','), ...csvRows].join('\n');
  }

  private downloadCSVFile(content: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const filename = `reservas_${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private showNoDataAlert(): void {
    alert('No hay reservas para exportar');
  }
}

// Clase para manejo de notificaciones (Single Responsibility Principle)
class DashboardNotificationManager implements NotificationManager {
  private readonly autoHideDelay = 4000;

  public setupAutoHide(): void {
    document.querySelectorAll('.fixed.top-4.right-4').forEach(notification => {
      setTimeout(() => {
        notification.remove();
      }, this.autoHideDelay);
    });
  }
}

// Clase principal del dashboard (Single Responsibility Principle - Coordinación)
export class AdminDashboardHandler {
  private filterManager: DashboardFilterManager;
  private modalManager: DashboardModalManager;
  private exportManager: DashboardExportManager;
  private notificationManager: DashboardNotificationManager;

  constructor(private bookingsData: BookingData[]) {
    this.filterManager = new DashboardFilterManager();
    this.modalManager = new DashboardModalManager();
    this.exportManager = new DashboardExportManager(bookingsData);
    this.notificationManager = new DashboardNotificationManager();
  }

  public initialize(): void {
    // Hacer datos disponibles globalmente (temporal para compatibilidad)
    (window as any).bookingsData = this.bookingsData;

    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
    } else {
      this.setupEventListeners();
    }
  }

  private setupEventListeners(): void {
    this.filterManager.setupFilterEvents();
    this.modalManager.setupModalEvents();
    this.exportManager.setupExportEvents();
    this.notificationManager.setupAutoHide();

    // Exponer métodos necesarios globalmente (para compatibilidad con templates)
    this.exposeGlobalMethods();
  }

  private exposeGlobalMethods(): void {
    (window as any).filterByStatus = (status: string) => 
      this.filterManager.filterByStatus(status);
    
    (window as any).showViewModal = (bookingId: string) => 
      this.modalManager.showViewModal(bookingId);
    
    (window as any).showEditModal = (bookingId: string) => 
      this.modalManager.showEditModal(bookingId);
    
    (window as any).showCancelModal = (bookingId: string) => 
      this.modalManager.showCancelModal(bookingId);
    
    (window as any).exportToCSV = () => 
      this.exportManager.exportToCSV();
  }
}

// Factory function para crear el handler (Factory Pattern)
export function createAdminDashboardHandler(bookingsData: BookingData[]): AdminDashboardHandler {
  const handler = new AdminDashboardHandler(bookingsData);
  handler.initialize();
  return handler;
}

// Función de inicialización para compatibilidad con código existente
export function initializeDashboard(bookingsData: BookingData[]): void {
  createAdminDashboardHandler(bookingsData);
}

// Mantener compatibilidad con la función original
export { initializeDashboard as initAdminDashboardHandler };