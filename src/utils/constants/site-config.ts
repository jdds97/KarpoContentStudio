// Constantes del proyecto

// Información de contacto
export const CONTACT_INFO = {
  phone: '+34633811994',
  email: 'info@thecontentstudio.es',
  address: {
    street: 'Calle La Red Veintisiete, nº 6',
    city: 'Sevilla',
    region: 'Sevilla',
    postalCode: '41700',
    country: 'ES'
  },
  coordinates: {
    latitude: 37.4101,
    longitude: -5.9416
  }
} as const;

// URLs del sitio
export const SITE_URLS = {
  main: 'https://thecontentstudio.es',
  booking: '/booking',
  contact: '/contact',
  terms: '/terms',
  privacy: '/privacy-policy'
} as const;

// Configuración SEO por defecto
export const DEFAULT_SEO = {
  siteName: 'The Content Studio',
  description: 'Tu espacio creativo para sesiones de fotos, rodajes, podcast y eventos especiales.',
  locale: 'es_ES',
  type: 'website'
} as const;

// Horarios de apertura
export const OPENING_HOURS = {
  weekdays: { opens: '09:00', closes: '20:00' },
  saturday: { opens: '10:00', closes: '18:00' },
  sunday: { opens: 'Closed', closes: 'Closed' }
} as const;

// Enlaces de navegación
export const NAVIGATION_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/studio-spaces', label: 'Estudio' },
  { href: '/target-audiences', label: 'Público' },
  { href: '/rates', label: 'Tarifas' },
  { href: '/calendar', label: 'Calendario' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contacto' }
] as const;

// Configuración de formularios
export const FORM_CONFIG = {
  booking: {
    id: 'booking-form',
    successMessage: {
      title: '¡Solicitud Enviada!',
      description: 'Hemos recibido tu solicitud de reserva. En breve recibirás un email con información sobre el pago y la confirmación de tu reserva.'
    }
  },
  contact: {
    id: 'contact-form',
    successMessage: {
      title: '¡Mensaje Enviado!',
      description: 'Hemos recibido tu mensaje. Te responderemos en breve.'
    }
  }
} as const;

// Redes sociales
export const SOCIAL_MEDIA = {
  instagram: {
    url: 'https://instagram.com/thecontentstudio.es',
    username: '@thecontentstudio.es',
    label: 'Instagram'
  }
} as const;

// Información de empresa
export const COMPANY_INFO = {
  name: 'The Content Studio',
  description: 'Tu espacio creativo donde las ideas toman forma, las marcas brillan y el contenido cobra vida.',
  tagline: 'El espacio donde tu creatividad cobra vida en Sevilla.',
  copyright: 'Todos los derechos reservados.',
  logo: {
    main: '/images/logos/logo-optimized.webp',
    white: '/images/logos/logo-white-optimized.webp',
    alt: 'The Content Studio'
  }
} as const;

// Horarios formateados para mostrar
export const OPENING_HOURS_DISPLAY = [
  'Lunes - Viernes: 9:00 - 20:00',
  'Sábado: 10:00 - 18:00',
  'Domingo: Cerrado'
] as const;

// Links legales
export const LEGAL_LINKS = [
  { href: '/privacy-policy', label: 'Política de Privacidad' },
  { href: '/terms', label: 'Términos de Uso' }
] as const;
