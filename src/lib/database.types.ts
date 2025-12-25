// Tipos para Supabase Database
export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          company: string | null;
          studio_space: string;
          package_duration: string;
          preferred_date: string;
          preferred_time: string;
          participants: number;
          session_type: string;
          notes: string | null;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          discount_code: string | null;
          discount_percentage: number;
          total_price: number | null;
          confirmed_at: string | null;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          company?: string | null;
          studio_space: string;
          package_duration: string;
          preferred_date: string;
          preferred_time: string;
          participants: number;
          session_type: string;
          notes?: string | null;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          discount_code?: string | null;
          discount_percentage?: number;
          total_price?: number | null;
          confirmed_at?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          company?: string | null;
          studio_space?: string;
          package_duration?: string;
          preferred_date?: string;
          preferred_time?: string;
          participants?: number;
          session_type?: string;
          notes?: string | null;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          discount_code?: string | null;
          discount_percentage?: number;
          total_price?: number | null;
          confirmed_at?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      studio_config: {
        Row: {
          id: string;
          key: string;
          value: any;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: any;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: any;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      availability: {
        Row: {
          id: string;
          studio_space: string;
          date: string;
          time_slot: string;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          studio_space: string;
          date: string;
          time_slot: string;
          is_available?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          studio_space?: string;
          date?: string;
          time_slot?: string;
          is_available?: boolean;
          created_at?: string;
        };
      };
      discount_codes: {
        Row: {
          id: string;
          code: string;
          description: string;
          discount_percentage: number;
          min_hours: number;
          max_uses: number;
          usage_count: number;
          active: boolean;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          description: string;
          discount_percentage: number;
          min_hours?: number;
          max_uses?: number;
          usage_count?: number;
          active?: boolean;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          description?: string;
          discount_percentage?: number;
          min_hours?: number;
          max_uses?: number;
          usage_count?: number;
          active?: boolean;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      check_availability: {
        Args: {
          p_studio_space: string;
          p_date: string;
          p_time: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Tipos específicos para el formulario de reserva
export type BookingFormData = Database['public']['Tables']['bookings']['Insert'];
export type BookingStatus = Database['public']['Tables']['bookings']['Row']['status'];
export type Booking = Database['public']['Tables']['bookings']['Row'];

// Tipos para códigos de descuento
export type DiscountCode = Database['public']['Tables']['discount_codes']['Row'];
export type DiscountCodeInsert = Database['public']['Tables']['discount_codes']['Insert'];
export type DiscountCodeUpdate = Database['public']['Tables']['discount_codes']['Update'];
