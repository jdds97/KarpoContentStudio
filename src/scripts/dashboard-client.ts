// Scripts del lado del cliente para el dashboard
export function initializeDashboard(bookings: any[]) {
  // Datos globales
  (window as any).bookingsData = bookings;
  
  // Event listeners
  document.addEventListener('DOMContentLoaded', function() {
    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        filterByStatus(target.dataset.filter || '');
      });
    });
    
    const select = document.getElementById('status-filter') as HTMLSelectElement;
    if (select) {
      select.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        filterByStatus(target.value);
      });
    }
    
    // Exportar CSV
    const exportBtn = document.getElementById('export-csv');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportToCSV);
    }
    
    // Cerrar modales
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const modalId = target.getAttribute('data-modal-id');
        if (modalId) {
          const modal = document.getElementById(modalId);
          if (modal) modal.classList.add('hidden');
        }
      });
    });
    
    // Cerrar modal al hacer clic fuera
    document.querySelectorAll('[data-modal]').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          (modal as HTMLElement).classList.add('hidden');
        }
      });
    });
    
    // Auto-ocultar notificaciones
    document.querySelectorAll('.fixed.top-4.right-4').forEach(notification => {
      setTimeout(() => notification.remove(), 4000);
    });
  });
}

// Funciones de filtrado
function filterByStatus(status: string) {
  const rows = document.querySelectorAll('tr[data-status]') as NodeListOf<HTMLElement>;
  const select = document.getElementById('status-filter') as HTMLSelectElement;
  
  if (status && select) {
    select.value = status;
  } else {
    status = select?.value || 'all';
  }
  
  rows.forEach(row => {
    if (status === 'all' || row.dataset.status === status) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

// Funciones de modales
function showViewModal(bookingId: string) {
  const modal = document.getElementById(`view-modal-${bookingId}`);
  if (modal) modal.classList.remove('hidden');
}

function showEditModal(bookingId: string) {
  const modal = document.getElementById(`edit-modal-${bookingId}`);
  if (modal) modal.classList.remove('hidden');
}

function showCancelModal(bookingId: string) {
  const modal = document.getElementById(`cancel-modal-${bookingId}`);
  if (modal) modal.classList.remove('hidden');
}

// Función de exportación
function exportToCSV() {
  const bookingsData = (window as any).bookingsData;
  if (!bookingsData || bookingsData.length === 0) {
    alert('No hay reservas para exportar');
    return;
  }
  
  const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Empresa', 'Espacio', 'Duración', 'Fecha', 'Hora', 'Participantes', 'Tipo Sesión', 'Estado', 'Notas', 'Creado'];
  const csvContent = [
    headers.join(','),
    ...bookingsData.map((booking: any) => [
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
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.setAttribute('href', URL.createObjectURL(blob));
  link.setAttribute('download', `reservas_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Hacer funciones globales
(window as any).filterByStatus = filterByStatus;
(window as any).showViewModal = showViewModal;
(window as any).showEditModal = showEditModal;
(window as any).showCancelModal = showCancelModal;
(window as any).exportToCSV = exportToCSV;