// Lógica del servidor para el dashboard de administración
import { createSupabaseClient } from "../../lib/supabase";
import { actions } from 'astro:actions';
import type { APIContext } from 'astro';

export interface DashboardData {
  bookings: any[];
  stats: {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
  };
  userEmail?: string;
  successMessage?: string;
  errorMessage?: string;
}

// Obtener datos del dashboard
export async function getDashboardData(): Promise<Pick<DashboardData, 'bookings' | 'stats'>> {
  const supabase = createSupabaseClient();
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  const totalBookings = bookings?.length || 0;
  const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0;
  const confirmedBookings = bookings?.filter(b => b.status === 'confirmed').length || 0;
  const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;

  return {
    bookings: bookings || [],
    stats: {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings
    }
  };
}

// Manejar acciones POST
export async function handleDashboardActions(context: APIContext): Promise<Response | null> {
  if (context.request.method !== 'POST') {
    return null;
  }

  const formData = await context.request.formData();
  const action = formData.get('_action') as string;
  
  if (action === 'confirmBooking') {
    const bookingId = formData.get('bookingId') as string;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const confirmFormData = new FormData();
    confirmFormData.append('bookingId', bookingId);
    confirmFormData.append('adminPassword', adminPassword);
    
    const result = await context.callAction(actions.confirmBooking, confirmFormData);
    
    if (result.data?.success) {
      return context.redirect('/admin/dashboard?success=confirmed');
    } else {
      return context.redirect(`/admin/dashboard?error=${encodeURIComponent(result.error?.message || 'Error al confirmar reserva')}`);
    }
  } else if (action === 'updateBooking') {
    const result = await context.callAction(actions.updateBooking, formData);
    
    if (result.data?.success) {
      return context.redirect('/admin/dashboard?success=updated');
    } else {
      return context.redirect(`/admin/dashboard?error=${encodeURIComponent(result.error?.message || 'Error al actualizar reserva')}`);
    }
  } else if (action === 'cancelBooking') {
    const result = await context.callAction(actions.cancelBooking, formData);
    
    if (result.data?.success) {
      return context.redirect('/admin/dashboard?success=cancelled');
    } else {
      return context.redirect(`/admin/dashboard?error=${encodeURIComponent(result.error?.message || 'Error al cancelar reserva')}`);
    }
  }

  return null;
}

// Obtener mensajes de estado de URL
export function getStatusMessages(url: URL): Pick<DashboardData, 'successMessage' | 'errorMessage'> {
  const successMessage = url.searchParams.get('success');
  const errorMessage = url.searchParams.get('error');
  
  return {
    successMessage: successMessage || undefined,
    errorMessage: errorMessage || undefined
  };
}