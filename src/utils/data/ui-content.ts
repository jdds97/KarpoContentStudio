// Contenido de UI para componentes

import { Camera, Building2, Briefcase, Mic, Video, Users } from '@lucide/astro';

// Metadatos SEO
export const SEO_METADATA = {
  keywords: 'estudio fotográfico, alquiler estudio, fotografía, podcast, ciclorama, espacio creativo, sevilla, dos hermanas, estudio de contenido',
  author: 'The Content Studio',
  robots: 'index, follow',
  themeColor: '#ffffff'
} as const;

// Datos para TargetSection
export const TARGET_AUDIENCES = [
  {
    id: 'photographers',
    title: 'Fotógrafos',
    description: 'Profesionales y aficionados que buscan un entorno controlado para sus sesiones.',
    icon: Camera,
    href: '/target-audiences#photographers'
  },
  {
    id: 'brands',
    title: 'Marcas y Startups',
    description: 'Empresas que necesitan un espacio profesional para fotografía de producto y creación de contenido.',
    icon: Building2,
    href: '/target-audiences#brands'
  },
  {
    id: 'agencies',
    title: 'Agencias y Freelancers',
    description: 'Profesionales del marketing y la publicidad que necesitan un espacio multifuncional para sus proyectos.',
    icon: Briefcase,
    href: '/target-audiences#agencies'
  },
  {
    id: 'podcasters',
    title: 'Podcasters y Creadores',
    description: 'Creadores de contenido audiovisual y podcasters que buscan un espacio insonorizado y equipado.',
    icon: Mic,
    href: '/target-audiences#podcasters'
  }
] as const;

// Datos para WelcomeSection
export const WELCOME_SERVICES = [
  {
    id: 'photography',
    title: 'Fotografía',
    description: 'Espacio profesional para sesiones fotográficas de todo tipo, desde moda hasta retratos y productos.',
    icon: Camera
  },
  {
    id: 'content-creation',
    title: 'Creación de Contenido',
    description: 'El lugar perfecto para crear contenido audiovisual de alta calidad para tu marca o proyecto personal.',
    icon: Video
  },
  {
    id: 'podcast',
    title: 'Podcast y Social Media',
    description: 'Espacio equipado para la grabación de podcast y contenido para redes sociales con calidad profesional.',
    icon: Mic
  },
  {
    id: 'events',
    title: 'Eventos y Workshop',
    description: 'Organiza workshops, masterclasses y eventos en un espacio versátil y profesional.',
    icon: Users
  }
] as const;

// Datos para el carrusel
export const CAROUSEL_SLIDES = [
  {
    id: 'slide-1',
    image: '/images/carousel/slide-1.png',
    alt: 'Estudio fotográfico profesional en Sevilla',
    title: 'Estudio Fotográfico en Sevilla',
    description: 'Alquila un espacio profesional, versátil y equipado para tus sesiones de fotos, vídeos y proyectos creativos.',
    buttonText: 'Reserva tu sesión',
    buttonHref: '/booking'
  },
  {
    id: 'slide-2',
    image: '/images/carousel/slide-2.png',
    alt: 'Alquiler de plató para producciones audiovisuales',
    title: 'Plató Audiovisual para Empresas y Creativos',
    description: 'Realiza producciones de vídeo, fotografía de producto, moda o publicidad con la mejor luz y equipamiento.',
    buttonText: 'Ver espacios',
    buttonHref: '/studio-spaces'
  },
  {
    id: 'slide-3',
    image: '/images/carousel/slide-3.png',
    alt: 'Estudio para podcast y grabación de audio profesional',
    title: 'Podcast y Grabación de Audio Profesional',
    description: 'Reserva nuestro estudio insonorizado y crea tu podcast, entrevistas o cursos online con calidad premium.',
    buttonText: 'Solicita información',
    buttonHref: '/contact'
  }
] as const;

// Testimonios
export const TESTIMONIALS = [
  {
    id: 'alejandro-rodriguez',
    quote: 'Como fotógrafo profesional, el ciclorama de The Content Studio ha sido un descubrimiento increíble. El espacio, la iluminación y el equipamiento son exactamente lo que necesitaba para mis sesiones editoriales.',
    author: {
      name: 'Alejandro Rodríguez',
      role: 'Fotógrafo de Moda',
      initials: 'AR'
    }
  },
  {
    id: 'laura-martinez',
    quote: 'Nuestra startup acaba de lanzar su primera colección y gracias a las sesiones en The Content Studio, nuestras fotos de producto destacan por encima de la competencia. Una inversión que realmente ha valido la pena.',
    author: {
      name: 'Laura Martínez',
      role: 'Fundadora, StyleCraft',
      initials: 'LM'
    }
  },
  {
    id: 'carlos-garcia',
    quote: 'Llevamos grabando nuestro podcast en The Content Studio durante 6 meses y la diferencia en calidad de audio y visual es asombrosa. Además, el equipo es siempre atento y profesional.',
    author: {
      name: 'Carlos García',
      role: 'Podcaster, Futuristas Podcast',
      initials: 'CG'
    }
  }
] as const;

// Contenido para secciones descriptivas
export const SECTION_CONTENT = {
  welcome: {
    title: 'Bienvenido a The Content Studio',
    description: 'En The Content Studio, hemos creado un espacio donde las ideas toman forma, las marcas brillan y el contenido cobra vida. Ya sea para una sesión de fotos, rodajes, podcast o un evento especial, aquí encontrarás el escenario perfecto para dar rienda suelta a tu creatividad.'
  },
  target: {
    title: 'Bienvenido a The Content Studio',
    description: 'Nuestro estudio está especialmente diseñado para estos profesionales y empresas:'
  },
  pricing: {
    title: 'Nuestras Tarifas',
    description: 'Encuentra el paquete perfecto para tu proyecto. Desde sesiones rápidas hasta producciones completas.'
  },
  testimonials: {
    title: 'Lo Que Dicen Nuestros Clientes',
    description: 'Conoce las experiencias de quienes ya han confiado en The Content Studio para sus proyectos.'
  }
} as const;

// Formularios - Labels y textos
export const FORM_LABELS = {
  contact: {
    title: 'Envíanos un Mensaje',
    fields: {
      name: 'Nombre *',
      email: 'Email *',
      phone: 'Teléfono',
      subject: 'Asunto *',
      message: 'Mensaje *'
    },
    privacy: 'He leído y acepto la política de privacidad.',
    submit: 'Enviar Mensaje'
  },
  booking: {
    title: 'Solicita tu Reserva',
    personalInfo: 'Información Personal',
    sessionDetails: 'Detalles de la Sesión',
    fields: {
      name: 'Nombre Completo *',
      email: 'Email *',
      phone: 'Teléfono *',
      company: 'Empresa / Instagram (opcional)',
      sessionType: 'Tipo de Sesión *',
      date: 'Fecha Preferida *',
      duration: 'Duración Estimada *',
      participants: 'Número de Participantes *',
      equipment: 'Equipamiento Adicional',
      description: 'Descripción del Proyecto *'
    },
    submit: 'Enviar Solicitud de Reserva'
  }
} as const;

// Opciones para formularios
export const FORM_OPTIONS = {
  studioAreas: [
    { value: '', label: 'Seleccionar área' },
    { value: 'cyclorama', label: 'Ciclorama' },
    { value: 'color-backgrounds', label: 'Zona de Fondos de Colores' },
    { value: 'black-zone', label: 'Black Zone' },
    { value: 'creative-studio', label: 'Creative Studio' },
    { value: 'full-studio', label: 'Estudio Completo' }
  ],
  sessionTypes: [
    { value: '', label: 'Seleccionar tipo' },
    { value: 'photography', label: 'Sesión de Fotos' },
    { value: 'video', label: 'Grabación de Video' },
    { value: 'podcast', label: 'Podcast/Audio' },
    { value: 'workshop', label: 'Workshop/Evento' },
    { value: 'corporate', label: 'Evento Corporativo' },
    { value: 'other', label: 'Otro' }
  ],
  durations: [
    { value: '', label: 'Seleccionar duración' },
    { value: '2h', label: '2 horas' },
    { value: '4h', label: '4 horas (Medio día)' },
    { value: '8h', label: '8 horas (Día completo)' },
    { value: '12h', label: '12 horas (Jornada extendida)' },
    { value: 'custom', label: 'Duración personalizada' }
  ],
  participants: [
    { value: '', label: 'Seleccionar número' },
    { value: '1-2', label: '1-2 personas' },
    { value: '3-5', label: '3-5 personas' },
    { value: '6-10', label: '6-10 personas' },
    { value: '11-20', label: '11-20 personas' },
    { value: '20+', label: 'Más de 20 personas' }
  ]
} as const;

// Contenido para CtaSection
export const CTA_CONTENT = {
  default: {
    title: '¿Listo para Reservar?',
    description: 'Elige el espacio que mejor se adapte a tus necesidades y da el primer paso para crear contenido excepcional.',
    primaryText: 'Reserva Ahora',
    primaryHref: '/booking'
  },
  elevateContent: {
    title: '¿Listo para Elevar tu Contenido?',
    description: 'Sea cual sea tu perfil profesional, en The Content Studio encontrarás el espacio perfecto para dar vida a tus ideas.',
    primaryText: 'Reserva Ahora',
    primaryHref: '/booking'
  },
  personalizedQuote: {
    title: '¿Necesitas un Presupuesto Personalizado?',
    description: 'Si buscas una solución a medida para tus necesidades específicas, contáctanos y te prepararemos una propuesta personalizada.',
    primaryText: 'Reserva Ahora',
    primaryHref: '/booking',
    secondaryText: 'Solicitar Presupuesto',
    secondaryHref: '/contact'
  },
  readyToCreate: {
    title: '¿Listo para crear algo único?',
    description: 'Da el siguiente paso y reserva tu sesión en un espacio pensado para inspirar, conectar y potenciar tu creatividad. ¡Haz que tu proyecto destaque en Sevilla!',
    primaryText: 'Reserva Ahora',
    primaryHref: '/booking'
  }
} as const;

// Contenido para HeroSection
export const HERO_CONTENT = {
  home: {
    title: 'The Content Studio',
    description: 'El espacio donde tu creatividad cobra vida en Sevilla.',
    buttonText: 'Reserva tu sesión',
    buttonHref: '/booking'
  },
  targetAudiences: {
    title: '¿Para Quién es The Content Studio?',
    description: 'Hemos diseñado nuestros espacios y servicios para diferentes perfiles profesionales y creativos. Descubre cómo The Content Studio puede ayudarte a elevar tus proyectos.'
  },
  studioSpaces: {
    title: 'Nuestros Espacios',
    description: 'Descubre todos los espacios disponibles en The Content Studio, cada uno diseñado específicamente para diferentes tipos de producciones y necesidades creativas.'
  },
  rates: {
    title: 'Tarifas y Planes',
    description: 'Ofrecemos opciones flexibles para adaptarnos a tus necesidades, desde alquileres por horas hasta membresías mensuales y anuales.'
  },
  contact: {
    title: 'Contacto',
    description: 'Estamos aquí para responder a tus preguntas y ayudarte a encontrar el espacio perfecto para tu próximo proyecto.'
  },
  faq: {
    title: 'Preguntas Frecuentes',
    description: 'Encuentra respuestas a las preguntas más comunes sobre nuestro estudio, reservas y servicios.'
  }
} as const;

// Contenido para FAQ
export const FAQ_CONTENT = {
  contact: {
    title: '¿No encuentras lo que buscas?',
    description: 'Si tienes alguna pregunta que no hemos resuelto aquí, no dudes en contactarnos. Estaremos encantados de ayudarte.',
    buttonText: 'Contáctanos'
  }
} as const;

// Servicios adicionales
export const ADDITIONAL_SERVICES = [
  {
    id: 'cyclorama-repaint',
    icon: 'Paintbrush',
    title: 'Repintado de Ciclorama',
    description: 'Solicita un ciclorama recién pintado para tu sesión y consigue un fondo impecable.',
    price: '50€',
    priceNote: 'Por servicio',
    actionText: null,
    actionHref: null
  },
  {
    id: 'colorama-backgrounds',
    icon: 'Palette',
    title: 'Fondos Colorama',
    description: 'El uso de fondos de papel Colorama tiene un coste adicional de 10€ por metro pisado.',
    price: '10€/m',
    priceNote: 'Por metro pisado',
    actionText: null,
    actionHref: null
  },
  {
    id: 'production-assistance',
    icon: 'Users',
    title: 'Asistencia de Producción',
    description: 'Solicita apoyo de un asistente para montaje, iluminación o producción durante tu sesión.',
    price: 'Consultar',
    priceNote: null,
    actionText: 'Ver precios',
    actionHref: '/contact'
  },
  {
    id: 'equipment-rental',
    icon: 'Package',
    title: 'Alquiler de Equipo Extra',
    description: 'Disponemos de flashes, softboxes, fondos, cámaras y otros accesorios bajo demanda.',
    price: 'Consultar',
    priceNote: null,
    actionText: 'Ver precios',
    actionHref: '/contact'
  },
  {
    id: 'catering',
    icon: 'Coffee',
    title: 'Catering y Coffee Break',
    description: 'Ofrecemos opciones de coffee break y catering para eventos, workshops o sesiones largas.',
    price: 'Consultar',
    priceNote: null,
    actionText: 'Ver precios',
    actionHref: '/contact'
  },
  {
    id: 'extra-cleaning',
    icon: 'CheckCircle',
    title: 'Limpieza Extra',
    description: 'Para grupos grandes o usos especiales, se puede aplicar una tarifa de limpieza adicional.',
    price: 'Desde 12€',
    priceNote: 'Según uso',
    actionText: null,
    actionHref: null
  }
] as const;

// Información de pago y políticas
export const PAYMENT_INFO = {
  reservation: {
    title: 'Política de Reserva',
    items: [
      'La reserva mínima es de 2 horas.',
      'Para confirmar la reserva es necesario realizar el pago completo por adelantado.',
      'Recibirás un email con los datos de pago y confirmación tras enviar tu solicitud.'
    ]
  },
  cancellation: {
    title: 'Política de Cancelación',
    items: [
      'Reembolso completo si se cancela con al menos 48h de antelación (excepto comisiones de pago).',
      'Cancelaciones con menos de 48h no son reembolsables.',
      'Puedes reprogramar tu sesión con 48h de antelación sin coste adicional.'
    ]
  },
  methods: {
    title: 'Métodos de Pago',
    items: [
      'Transferencia bancaria (se facilitarán los datos tras la solicitud).',
      'Bizum (consultar disponibilidad).',
      'En casos especiales, se puede consultar la opción de pago en efectivo.'
    ]
  },
  notes: {
    title: 'Notas Importantes',
    items: [
      'El tiempo de alquiler incluye montaje, desmontaje y limpieza. No hay margen extra entre reservas.',
      'Para grupos de más de 5 personas, se aplicará una tarifa de limpieza adicional.',
      'El uso de fondos de papel Colorama tiene un coste adicional de 10€ por metro pisado.'
    ]
  },
  footer: {
    text: '¿Tienes dudas sobre el proceso de pago o necesitas factura?',
    linkText: 'Contáctanos',
    linkHref: '/contact',
    restText: 'y te ayudamos.'
  }
} as const;

// Equipamiento del estudio
export const STUDIO_EQUIPMENT = {
  lighting: {
    title: 'Iluminación',
    items: [
      '2 flashes Godox AD600Pro con modificadores',
      '4 flashes Godox SK400II con beauty dish y softboxes',
      '2 paneles LED bicolor Godox LC500R',
      'Reflectores, difusores y soportes variados'
    ]
  },
  backgrounds: {
    title: 'Fondos',
    items: [
      'Ciclorama blanco de 6m x 4m',
      'Fondos de papel Colorama de 2,7m (blanco, verde chromakey, celeste)',
      'Pared de roble clásico y reverso en mármol gris móviles',
      'Zona black studio con 40m² de fondo negro mate'
    ]
  },
  audio: {
    title: 'Audio',
    items: [
      '2 micrófonos de condensador Rode NT1-A',
      '2 micrófonos dinámicos Shure SM7B',
      'Interface de audio Focusrite Scarlett 4i4',
      'Auriculares profesionales para monitorización'
    ]
  },
  amenities: {
    title: 'Comodidades',
    items: [
      'Zona de camerino con espejo y burros para vestuario',
      'Kitchenette con microondas, frigorífico y máquina de café',
      'WiFi de alta velocidad en todas las zonas',
      'Zona de carga/descarga directa junto a la entrada'
    ]
  }
} as const;

// Información de contacto y mapa
export const CONTACT_MAP_CONTENT = {
  title: '¿Dónde Estamos?',
  description: 'Encuentra nuestra ubicación y visítanos para conocer el estudio en persona.',
  sections: {
    address: {
      title: 'Dirección',
      lines: ['Calle La Red Veintisiete, nº 6', 'Sevilla, España']
    },
    phone: {
      title: 'Teléfono',
      value: '+34 633 811 994',
      href: 'tel:+34633811994'
    },
    email: {
      title: 'Email',
      value: 'info@thecontentstudio.es',
      href: 'mailto:info@thecontentstudio.es'
    }
  }
} as const;
