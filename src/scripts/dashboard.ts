// Scripts del dashboard de administración
import type { BookingData } from '../utils/admin/dashboard-utils';

// Datos globales de reservas
declare global {
  interface Window {
    bookingsData: BookingData[];
  }
}

// Filtrar por estado
export function filterByStatus(status?: string) {
  const rows = document.querySelectorAll('tr[data-status]');
  const select = document.getElementById('status-filter') as HTMLSelectElement;
  
  if (status) {
    if (select) select.value = status;
  } else {
    status = select?.value || 'all';
  }
  
  rows.forEach(row => {
    const htmlRow = row as HTMLElement;
    if (status === 'all' || htmlRow.dataset.status === status) {
      htmlRow.style.display = '';
    } else {
      htmlRow.style.display = 'none';
    }
  });
}

// Mostrar notificaciones elegantes
export function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const notification = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  
  notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Mostrar notificación
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 100);
  
  // Ocultar después de 4 segundos
  setTimeout(() => {
    notification.classList.add('translate-x-full');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 4000);
}

// Ver detalles de reserva
export function viewBooking(id: string) {
  const booking = window.bookingsData.find(b => b.id === id);
  if (!booking) {
    showNotification('No se encontraron detalles para esta reserva', 'error');
    return;
  }
  
  const detailsHtml = `
    <div class="space-y-4">
      <h3 class="text-xl font-bold text-black mb-4">Detalles de Reserva</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div><strong>Cliente:</strong> ${booking.name}</div>
        <div><strong>Email:</strong> ${booking.email}</div>
        <div><strong>Teléfono:</strong> ${booking.phone}</div>
        <div><strong>Empresa:</strong> ${booking.company || 'No especificada'}</div>
        <div><strong>Espacio:</strong> ${booking.studio_space}</div>
        <div><strong>Duración:</strong> ${booking.package_duration}</div>
        <div><strong>Fecha:</strong> ${new Date(booking.preferred_date).toLocaleDateString('es-ES')}</div>
        <div><strong>Hora:</strong> ${booking.preferred_time}</div>
        <div><strong>Participantes:</strong> ${booking.participants}</div>
        <div><strong>Tipo:</strong> ${booking.session_type || 'No especificado'}</div>
        <div><strong>Estado:</strong> ${booking.status}</div>
        <div><strong>Creado:</strong> ${new Date(booking.created_at).toLocaleDateString('es-ES')}</div>
      </div>
      ${booking.notes ? `<div class="mt-4"><strong>Notas:</strong><br><div class="bg-gray-100 p-3 rounded mt-2">${booking.notes}</div></div>` : ''}
    </div>
  `;
  
  createModal(detailsHtml, [
    { text: 'Cerrar', onClick: 'closeModal', class: 'bg-gray-500 hover:bg-gray-600' },
    { text: 'Editar', onClick: `editBooking('${id}')`, class: 'bg-blue-500 hover:bg-blue-600' }
  ]);
}

// Crear modal genérico
function createModal(content: string, buttons: Array<{text: string, onClick: string, class: string}>) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      ${content}
      <div class="mt-6 flex justify-end space-x-3">
        ${buttons.map(btn => `
          <button onclick="${btn.onClick === 'closeModal' ? 'this.closest(\'.fixed\').remove()' : `this.closest('.fixed').remove(); ${btn.onClick}`}" 
                  class="text-white px-4 py-2 rounded transition-colors duration-200 ${btn.class}">
            ${btn.text}
          </button>
        `).join('')}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Cerrar modal al hacer clic fuera
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Exportar a CSV
export function exportToCSV() {
  if (!window.bookingsData || window.bookingsData.length === 0) {
    showNotification('No hay reservas para exportar', 'error');
    return;
  }
  
  // Crear CSV
  const headers = [
    'ID', 'Nombre', 'Email', 'Teléfono', 'Empresa', 'Espacio', 
    'Duración', 'Fecha', 'Hora', 'Participantes', 'Tipo Sesión', 
    'Estado', 'Notas', 'Creado', 'Actualizado'
  ];
  
  const csvContent = [
    headers.join(','),
    ...window.bookingsData.map(booking => [
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
      booking.created_at,
      booking.updated_at || ''
    ].join(','))
  ].join('\n');
  
  // Descargar archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `reservas_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Inicializar dashboard
export function initDashboard() {
  document.addEventListener('DOMContentLoaded', function() {
    const select = document.getElementById('status-filter');
    if (select) {
      select.addEventListener('change', (e) => {
        filterByStatus((e.target as HTMLSelectElement).value);
      });
    }
  });
}

// Hacer funciones globales para compatibilidad
if (typeof window !== 'undefined') {
  window.filterByStatus = filterByStatus;
  window.viewBooking = viewBooking;
  window.exportToCSV = exportToCSV;
  window.showNotification = showNotification;
}

// Declaraciones globales para TypeScript
declare global {
  interface Window {
    filterByStatus: typeof filterByStatus;
    viewBooking: typeof viewBooking;
    exportToCSV: typeof exportToCSV;
    showNotification: typeof showNotification;
  }
}