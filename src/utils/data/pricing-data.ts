// Datos de precios y tarifas
import { getActivePromotion } from '@/utils/promotions';

export interface PricingOption {
  id: string;
  service: string;
  duration: string;
  durationCode?: string; // Para incluir en la URL (2h, 4h, 8h, 12h)
  price: string;
  action: 'book' | 'contact';
  actionHref: string;
}

export interface PricingSection {
  id: string;
  title: string;
  items: PricingOption[];
}

// Función para generar href con código de promoción si está activa
function getBookingHref(durationCode?: string): string {
  const promo = getActivePromotion();
  if (promo && durationCode) {
    return `/booking?code=${promo.code}&duration=${durationCode}`;
  }
  return '/booking';
}

export const pricingSections: PricingSection[] = [
  {
    id: 'standard',
    title: 'Paquetes Estándar',
    items: [
      {
        id: 'base-rental',
        service: 'Alquiler Base',
        duration: '2 horas',
        durationCode: '2h',
        price: '150€ +IVA',
        action: 'book',
        actionHref: getBookingHref('2h')
      },
      {
        id: 'half-day',
        service: 'Medio día',
        duration: '4 horas',
        durationCode: '4h',
        price: '300€ +IVA',
        action: 'book',
        actionHref: getBookingHref('4h')
      },
      {
        id: 'full-day',
        service: 'Día completo',
        duration: '8 horas',
        durationCode: '8h',
        price: '600€ +IVA',
        action: 'book',
        actionHref: getBookingHref('8h')
      },
      {
        id: 'extended-day',
        service: 'Jornada Extendida',
        duration: '12 horas',
        durationCode: '12h',
        price: '850€ +IVA',
        action: 'book',
        actionHref: getBookingHref('12h')
      }
    ]
  },
  {
    id: 'memberships',
    title: 'Membresías Mensuales',
    items: [
      {
        id: 'basic-membership',
        service: 'Básica',
        duration: '8h/mes + 10% descuento en horas extra',
        price: '250€/mes +IVA',
        action: 'contact',
        actionHref: '/contact'
      },
      {
        id: 'pro-membership',
        service: 'Pro',
        duration: '16h/mes + 15% descuento en horas extra',
        price: '400€/mes +IVA',
        action: 'contact',
        actionHref: '/contact'
      },
      {
        id: 'vip-membership',
        service: 'VIP',
        duration: '30h/mes + 20% descuento en horas extra + prioridad en reservas',
        price: '700€/mes +IVA',
        action: 'contact',
        actionHref: '/contact'
      }
    ]
  },
  {
    id: 'events',
    title: 'Tarifas Especiales - Eventos y Producciones',
    items: [
      {
        id: 'workshop',
        service: 'Workshop / Masterclass',
        duration: '4 horas',
        price: '400€ +IVA',
        action: 'contact',
        actionHref: '/contact'
      },
      {
        id: 'private-event',
        service: 'Evento privado + catering',
        duration: '8 horas',
        price: '800€ +IVA',
        action: 'contact',
        actionHref: '/contact'
      },
      {
        id: 'full-production',
        service: 'Producción completa',
        duration: 'Personalizado',
        price: 'Desde 1.000€ +IVA',
        action: 'contact',
        actionHref: '/contact'
      }
    ]
  },
  {
    id: 'annual',
    title: 'Membresía Anual Pro+',
    items: [
      {
        id: 'annual-pro-plus',
        service: 'Membresía Anual Pro+',
        duration: '1 año',
        price: '6.800€/año +IVA',
        action: 'contact',
        actionHref: '/contact'
      }
    ]
  }
];

// Detalles adicionales para la membresía anual
export const annualMembershipDetails = {
  features: [
    '360 horas/año (30 h/mes)',
    'Prioridad máxima en reservas',
    '25% descuento en horas extra',
    '2 sesiones con asistente de producción incluidas',
    'Hasta 6 usos de ciclorama sin suplemento de limpieza',
    'Facturación anual deducible'
  ],
  alternativePayment: '3.500€ x 2 (semestral) +IVA'
};

// Notas importantes sobre las tarifas
export const pricingNotes = [
  'Todas las tarifas incluyen acceso a ciclorama, zonas de set, cocina, camerino y mobiliario básico.',
  'Para grupos de más de 5 personas, se aplicará una tarifa desde 50€ por limpieza básica.',
  'El uso de fondos de papel Colorama tiene un coste adicional de 20€ por metro pisado.',
  'Para propuestas personalizadas o paquetes especiales, contáctanos directamente.'
];
