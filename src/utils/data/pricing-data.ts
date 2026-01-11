// Datos de precios y tarifas

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

export const pricingSections: PricingSection[] = [
  {
    id: 'standard',
    title: 'Alquiler por Horas',
    items: [
      {
        id: 'base-rental',
        service: 'Sesión Estándar',
        duration: '2 horas',
        durationCode: '2h',
        price: '120€ +IVA',
        action: 'book',
        actionHref: '/booking?duration=2h'
      },
      {
        id: 'half-day',
        service: 'Medio día',
        duration: '4 horas',
        durationCode: '4h',
        price: '240€ +IVA',
        action: 'book',
        actionHref: '/booking?duration=4h'
      },
      {
        id: 'full-day',
        service: 'Día completo',
        duration: '8 horas',
        durationCode: '8h',
        price: '480€ +IVA',
        action: 'book',
        actionHref: '/booking?duration=8h'
      },
      {
        id: 'extended-day',
        service: 'Jornada Extendida',
        duration: '12 horas',
        durationCode: '12h',
        price: '720€ +IVA',
        action: 'book',
        actionHref: '/booking?duration=12h'
      }
    ]
  },
  {
    id: 'memberships',
    title: 'Membresía Mensual',
    items: [
      {
        id: 'monthly-membership',
        service: 'Membresía Mensual',
        duration: '10h/mes + 20% descuento en horas extra',
        price: '250€/mes +IVA',
        action: 'contact',
        actionHref: '/contact'
      }
    ]
  }
];

// Notas importantes sobre las tarifas
export const pricingNotes = [
  'Todas las tarifas incluyen acceso a ciclorama, zonas de set, cocina, camerino y mobiliario básico.',
  'Para grupos de más de 5 personas, se aplicará una tarifa desde 50€ por limpieza básica.',
  'El uso de fondos de papel Colorama tiene un coste adicional de 20€ por metro pisado.',
  'Para propuestas personalizadas o paquetes especiales, contáctanos directamente.'
];
