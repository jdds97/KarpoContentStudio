// Schemas de validación para formularios y acciones
import { z } from 'astro:schema';

// Schema para crear booking
export const createBookingSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  company: z.string().optional(),
  'studio-space': z.string().min(1, 'El espacio del estudio es requerido'),
  package: z.string().min(1, 'El paquete es requerido'),
  date: z.string().min(1, 'La fecha es requerida'),
  time: z.string().min(1, 'La hora es requerida'),
  participants: z.string().min(1, 'El número de participantes es requerido'),
  'session-type': z.string().min(1, 'El tipo de sesión es requerido'),
  notes: z.string().optional(),
  'discount-code': z.string().optional(),
  'applied-discount-code': z.string().optional(),
  terms: z.string().refine(val => val === 'true', 'Debes aceptar los términos y condiciones')
});

// Schema para confirmar booking
export const confirmBookingSchema = z.object({
  bookingId: z.string().min(1, 'ID de reserva requerido'),
  adminPassword: z.string().min(1, 'Password de admin requerido')
});

// Schema para actualizar booking
export const updateBookingSchema = z.object({
  id: z.string().min(1, 'ID de reserva requerido'),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  studio_space: z.string().optional(),
  package_duration: z.string().optional(),
  preferred_date: z.string().optional(),
  preferred_time: z.string().optional(),
  participants: z.number().optional(),
  session_type: z.string().optional(),
  discount_code: z.string().optional(),
  discount_percentage: z.number().optional(),
  total_price: z.number().optional(),
  notes: z.string().optional()
});

// Schema para cancelar booking
export const cancelBookingSchema = z.object({
  bookingId: z.string().min(1, 'ID de reserva requerido'),
  reason: z.string().optional()
});

// Schema para validar códigos de descuento
export const discountValidationSchema = z.object({
  code: z.string().min(1, 'Código de descuento requerido')
});

// Schema para contacto
export const contactFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'El asunto es requerido'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres')
});

// Tipos derivados de los schemas
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type ConfirmBookingInput = z.infer<typeof confirmBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type DiscountValidationInput = z.infer<typeof discountValidationSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
