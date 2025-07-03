// Utilidades para el dashboard de administración
export interface BookingData {
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
  updated_at?: string;
}

export interface StatusInfo {
  color: string;
  text: string;
  icon: string;
}

// Función para obtener información del badge de estado
export const getStatusBadge = (status: string): StatusInfo => {
  switch (status) {
    case 'pending':
      return { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        text: 'Pendiente', 
        icon: 'Clock' 
      };
    case 'confirmed':
      return { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        text: 'Confirmada', 
        icon: 'CheckCircle' 
      };
    case 'completed':
      return { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        text: 'Completada', 
        icon: 'CheckCircle' 
      };
    case 'cancelled':
      return { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        text: 'Cancelada', 
        icon: 'XCircle' 
      };
    default:
      return { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        text: status, 
        icon: 'AlertCircle' 
      };
  }
};

// Función para formatear la duración del paquete
export const formatPackageDuration = (packageDuration: string): string => {
  if (!packageDuration) return 'No especificado';
  return packageDuration.replace('h', ' horas');
};

// Función para calcular estadísticas
export const calculateStats = (bookings: BookingData[]) => {
  const totalBookings = bookings?.length || 0;
  const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0;
  const confirmedBookings = bookings?.filter(b => b.status === 'confirmed').length || 0;
  const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;

  return {
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings
  };
};

// Función para exportar a CSV
export const generateCSV = (bookings: BookingData[]): string => {
  const headers = [
    'ID', 'Nombre', 'Email', 'Teléfono', 'Empresa', 'Espacio', 
    'Duración', 'Fecha', 'Hora', 'Participantes', 'Tipo Sesión', 
    'Estado', 'Notas', 'Creado', 'Actualizado'
  ];
  
  const csvContent = [
    headers.join(','),
    ...bookings.map(booking => [
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

  return csvContent;
};