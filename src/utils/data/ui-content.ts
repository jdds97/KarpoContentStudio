// Contenido de UI para componentes

import {
  Camera,
  Building2,
  Briefcase,
  Mic,
  Video,
  Users,
  Play,
  Brain,
  Building,
  Target,
  CheckCircle,
  Lightbulb,
  Edit,
  Phone,
  Package
} from '@/components/icons';

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
  },
  studioSpaces: {
    title: 'Nuestras Instalaciones',
    description: 'Conoce los diferentes espacios disponibles en The Content Studio, diseñados para adaptarse a cualquier tipo de producción fotográfica o audiovisual.'
  },
  additionalServices: {
    title: 'Servicios Adicionales',
    description: 'Personaliza tu experiencia en el estudio con servicios extra para producciones profesionales, eventos y sesiones especiales.'
  },
  equipment: {
    title: 'Equipamiento Incluido'
  }
} as const;

// Formularios - Labels y textos
export const FORM_LABELS = {
  contact: {
    title: 'Envíanos un Mensaje',
    description: '¿Tienes alguna pregunta o necesitas más información? Estamos aquí para ayudarte. Completa el formulario y te responderemos lo antes posible.',
    fields: {
      name: 'Nombre *',
      email: 'Email *',
      phone: 'Teléfono',
      subject: 'Asunto *',
      message: 'Mensaje *'
    },
    privacy: 'He leído y acepto la política de privacidad.',
    submit: 'Enviar Mensaje',
    whyContact: {
      title: '¿Por qué contactarnos?',
      reasons: [
        {
          icon: 'Phone',
          title: 'Respuesta Rápida',
          description: 'Te responderemos en menos de 24 horas'
        },
        {
          icon: 'Lightbulb',
          title: 'Asesoramiento Personalizado',
          description: 'Te ayudamos a elegir el mejor espacio para tu proyecto'
        },
        {
          icon: 'Target',
          title: 'Presupuesto a Medida',
          description: 'Opciones flexibles adaptadas a tu presupuesto'
        }
      ]
    },
    placeholder: {
      message: 'Cuéntanos más detalles sobre tu proyecto o consulta...'
    }
  },
  booking: {
    title: 'Solicita tu Reserva',
    personalInfo: 'Información Personal',
    sessionDetails: 'Detalles de la Sesión',
    additionalInfo: 'Información Adicional',
    fields: {
      name: 'Nombre Completo *',
      email: 'Email *',
      phone: 'Teléfono *',
      company: 'Empresa / Instagram (opcional)',
      studioArea: 'Área del Estudio *',
      package: 'Paquete de Horas *',
      date: 'Fecha Deseada *',
      time: 'Hora de Inicio *',
      participants: 'Número de Participantes *',
      sessionType: 'Tipo de Sesión *',
      description: 'Descripción del Proyecto *'
    },
    termsWithLinks: {
      prefix: 'He leído y acepto los ',
      termsLink: {
        href: '/terms',
        text: 'términos y condiciones',
        class: 'text-primary-black underline hover:text-primary-gray transition-colors'
      },
      middle: ' y la ',
      privacyLink: {
        href: '/privacy-policy', 
        text: 'política de privacidad',
        class: 'text-primary-black underline hover:text-primary-gray transition-colors'
      },
      suffix: '.'
    },
    submit: 'Enviar Solicitud de Reserva',
    note: '* La reserva no estará confirmada hasta recibir el pago. Te enviaremos un email con las instrucciones de pago.'
  }
} as const;

// Opciones para formularios
export const FORM_OPTIONS = {
  studioAreas: [
    { value: '', label: 'Seleccionar área' },
    { value: 'principal', label: 'Zona Principal' },
    { value: 'black-zone', label: 'Zona Negra' },
    { value: 'cyclorama', label: 'Ciclorama' }
  ],
  sessionTypes: [
    { value: '', label: 'Seleccionar tipo' },
    { value: 'fotografia', label: 'Fotografía' },
    { value: 'video', label: 'Video/Filmación' },
    { value: 'podcast', label: 'Podcast' },
    { value: 'streaming', label: 'Streaming' },
    { value: 'evento', label: 'Evento' },
    { value: 'otro', label: 'Otro' }
  ],
  durations: [
    { value: '', label: 'Seleccionar duración' },
    { value: '1h', label: '1 hora (Express)' },
    { value: '2h', label: '2 horas (Estándar)' },
    { value: '3h', label: '3 horas' },
    { value: '4h', label: '4 horas (Medio día)' },
    { value: '6h', label: '6 horas' },
    { value: '8h', label: '8 horas (Día completo)' },
    { value: 'custom', label: 'Duración personalizada (contactar)' }
  ],
  participants: [
    { value: '', label: 'Seleccionar número' },
    { value: '1-2', label: '1-2 personas' },
    { value: '3-5', label: '3-5 personas' },
    { value: '6-10', label: '6-10 personas' },
    { value: '11-20', label: '11-20 personas' },
    { value: '20+', label: 'Más de 20 personas' }
  ],
  contactSubjects: [
    { value: '', label: 'Selecciona un asunto' },
    { value: 'reserva', label: 'Consulta sobre reserva' },
    { value: 'precios', label: 'Información de precios' },
    { value: 'equipamiento', label: 'Consulta sobre equipamiento' },
    { value: 'eventos', label: 'Eventos y workshops' },
    { value: 'colaboracion', label: 'Colaboraciones' },
    { value: 'otro', label: 'Otro' }
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
    title: 'Estudio Fotográfico Profesional en Sevilla - The Content Studio',
    description: 'El espacio donde tu creatividad cobra vida en Sevilla.',
    buttonText: 'Reserva tu sesión',
    buttonHref: '/booking'
  },
  targetAudiences: {
    title: 'Servicios Profesionales para Fotógrafos, Marcas y Creadores',
    description: 'Hemos diseñado nuestros espacios y servicios para diferentes perfiles profesionales y creativos. Descubre cómo The Content Studio puede ayudarte a elevar tus proyectos.'
  },
  studioSpaces: {
    title: 'Espacios y Salas de Estudio para Fotografía y Video',
    description: 'Descubre todos los espacios disponibles en The Content Studio, cada uno diseñado específicamente para diferentes tipos de producciones y necesidades creativas.'
  },
  rates: {
    title: 'Tarifas de Alquiler de Estudio Fotográfico en Sevilla',
    description: 'Ofrecemos opciones flexibles para adaptarnos a tus necesidades, desde alquileres por horas hasta membresías mensuales y anuales.'
  },
  contact: {
    title: 'Contacta con The Content Studio - Estudio en Sevilla',
    description: 'Estamos aquí para responder a tus preguntas y ayudarte a encontrar el espacio perfecto para tu próximo proyecto.'
  },
  faq: {
    title: 'Preguntas Frecuentes sobre Alquiler de Estudio Fotográfico',
    description: 'Encuentra respuestas a las preguntas más comunes sobre nuestro estudio, reservas y servicios.'
  },
  booking: {
    title: 'Reserva Tu Sesión de Estudio Fotográfico en Sevilla',
    description: 'Consulta la disponibilidad y completa el formulario para solicitar tu reserva. Te contactaremos para confirmar la disponibilidad y el pago.'
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
    icon: Paintbrush,
    title: 'Repintado de Ciclorama',
    description: 'Solicita un ciclorama recién pintado para tu sesión y consigue un fondo impecable.',
    price: '50€',
    priceNote: 'Por servicio',
    actionText: null,
    actionHref: null
  },
  {
    id: 'colorama-backgrounds',
    icon: Palette,
    title: 'Fondos Colorama',
    description: 'El uso de fondos de papel Colorama tiene un coste adicional por metro pisado.',
    price: '20€/metros',
    priceNote: 'Por metro pisado',
    actionText: null,
    actionHref: null
  },
  {
    id: 'production-assistance',
    icon: Users,
    title: 'Asistencia de Producción',
    description: 'Solicita apoyo de un asistente para montaje, iluminación o producción durante tu sesión.',
    price: 'Consultar',
    priceNote: null,
    actionText: 'Ver precios',
    actionHref: '/contact'
  },
  {
    id: 'equipment-rental',
    icon: Package,
    title: 'Alquiler de Equipo Extra',
    description: 'Disponemos de flashes, softboxes, fondos, cámaras y otros accesorios bajo demanda.',
    price: 'Consultar',
    priceNote: null,
    actionText: 'Ver precios',
    actionHref: '/contact'
  },
  {
    id: 'creative-studio-premium',
    icon: Users,
    title: 'Creative Studio Premium',
    description: 'Acceso al Creative Studio con cuatro fondos temáticos, TV 55" integrada, paneles acústicos y mobiliario modular para podcasting y contenido audiovisual profesional.',
    price: 'Incluido',
    priceNote: 'En tarifa de alquiler',
    actionText: 'Reservar',
    actionHref: '/booking'
  },
  {
    id: 'catering',
    icon: Coffee,
    title: 'Catering y Coffee Break',
    description: 'Ofrecemos opciones de coffee break y catering para eventos, workshops o sesiones largas.',
    price: 'Consultar',
    priceNote: null,
    actionText: 'Ver precios',
    actionHref: '/contact'
  },
  {
    id: 'extra-cleaning',
    icon: CheckCircle,
    title: 'Limpieza Extra',
    description: 'Para grupos grandes o usos especiales, se puede aplicar una tarifa de limpieza adicional.',
    price: 'Desde 50€',
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
      'Para grupos de más de 5 personas, se aplicará una tarifa desde 50€ por limpieza adicional.',
      'El uso de fondos de papel Colorama tiene un coste adicional de 20€ por metro pisado.'
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
      'Fondos de papel Colorama de 2,7m (blanco, verde chromakey, celeste, rojo, azul y otros colores)',
      'Plancha de metacrilato transparente de 2m x 1m para proteger fondos Colorama',
      'Pared de roble clásico y reverso en mármol gris móviles',
      'Zona black studio con 40m² de fondo negro mate',
      'Creative Studio: cuatro fondos temáticos únicos (ladrillo industrial, minimalista blanco, madera natural, elegante oscuro)'
    ]
  },
  creativeStudio: {
    title: 'Creative Studio - Equipamiento Especializado',
    items: [
      'Televisión Samsung 55 pulgadas empotrada en pared con conectividad HDMI y wireless',
      'Sistema de paneles acústicos decorativos integrados en el diseño',
      'Mobiliario modular: sofás, sillas ergonómicas, mesas ajustables y accesorios móviles',
      'Iluminación LED regulable específica para grabación de video y streaming',
      'Climatización independiente para sesiones largas de grabación',
      'Múltiples tomas de corriente y puertos USB distribuidos estratégicamente',
      'Área de almacenamiento para equipos personales durante la sesión',
      'Sistema de cableado oculto para estética limpia en grabaciones'
    ]
  },
  audio: {
    title: 'Audio Profesional',
    items: [
      '2 micrófonos de condensador Rode NT1-A para grabación de alta calidad',
      '2 micrófonos dinámicos Shure SM7B ideales para podcasting',
      'Interface de audio Focusrite Scarlett 4i4 para grabación multicanal',
      'Auriculares profesionales para monitorización en tiempo real',
      'Creative Studio: acústica optimizada con paneles especializados para grabación de audio premium'
    ]
  },
  amenities: {
    title: 'Comodidades',
    items: [
      'Zona de camerino con espejo y burros para vestuario',
      'Kitchenette con microondas, frigorífico y máquina de café',
      'WiFi de alta velocidad en todas las zonas del estudio',
      'Zona de carga/descarga directa junto a la entrada',
      'Creative Studio: climatización independiente y espacio de almacenamiento dedicado',
      'Configuración rápida entre escenarios sin interrumpir flujo de trabajo'
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
      value: 'contacto@contentstudiokrp.es',
      href: 'mailto:contacto@contentstudiokrp.es'
    }
  }
} as const;

// Datos de espacios del estudio para la página principal
export const HOME_STUDIO_SPACES = [
  {
    id: "cyclorama",
    title: "Ciclorama de Grandes Dimensiones",
    description: "Nuestro ciclorama de gran formato es el espacio ideal para producciones fotográficas y audiovisuales que requieren un entorno amplio, versátil y completamente personalizable.",
    image: "/images/spaces/cyclorama-optimized.webp",
    reverse: false,
    features: [
      "Grandes Dimensiones: 6m x 4m con más de 3m de altura",
      "Espacio Versátil para fotografía de moda, retratos y producciones audiovisuales",
      "Iluminación Sin Restricciones y total libertad para setups profesionales",
      "Fondos y Decorados Personalizables según las necesidades de cada sesión"
    ] as string[],
    idealFor: [
      "Fotografía y video de moda, editorial y publicidad",
      "Producciones de e-commerce con modelos o productos de gran tamaño",
      "Sesiones grupales con amplio espacio de movimiento",
      "Escenarios dinámicos con setups de iluminación avanzada"
    ] as string[]
  },
  {
    id: "color-backgrounds",
    title: "Zona de Fondos de Colores",
    description: "Nuestra zona de fondos de colores es el espacio perfecto para sesiones fotográficas y producciones audiovisuales que requieren versatilidad y personalización.",
    image: "/images/spaces/principal-optimized.webp",
    reverse: true,
    features: [
      "Fondos Intercambiables de 2.7m de ancho en variedad de colores",
      "Mobiliario y Accesorios Personalizables para ambientar tus sesiones",
      "Iluminación Adaptable para diferentes estilos visuales",
      "Fácil Montaje y Cambio Rápido de Fondos sin interrumpir el workflow"
    ] as string[],
    idealFor: [
      "Sesiones de retrato con fondos coloridos y llamativos",
      "Fotografía de moda y campañas publicitarias con escenografía personalizada",
      "Contenido para e-commerce con variedad de fondos para destacar productos",
      "Producciones audiovisuales con transiciones de colores y efectos visuales"
    ] as string[]
  }
];

// Paquetes de contenido
export const CONTENT_PACKAGES = {
  header: {
    title: "Paquetes de Creación de Contenido",
    subtitle: "Contenido profesional mensual para marcas que quieren destacar",
    description: "Creamos todo tu contenido mensual en una sola jornada, desde reels hasta fotos para tu feed o stories. Tú solo vienes al estudio, y nosotros nos encargamos de que tengas contenido de calidad y coherente, listo para publicar."
  },
  packages: [
    {
      id: "pack-inicia",
      name: "Pack Inicia",
      price: "550€/mes",
      badge: null,
      description: "La puerta de entrada para marcas que comienzan su presencia digital",
      borderColor: "border-primary-beige",
      headerBg: "bg-primary-beige",
      headerTextColor: "text-primary-black",
      isPopular: false,
      features: [
        { icon: Video, text: "Media jornada de producción (4h)", isBold: false },
        { icon: Camera, text: "8 fotografías editadas", isBold: false },
        { icon: Play, text: "5 vídeos tipo reel", isBold: false },
        { icon: Target, text: "Entrega optimizada para redes", isBold: false },
        { icon: CheckCircle, text: "Moodboard previo para marcar el estilo visual", isBold: false },
        { icon: Lightbulb, text: "Ideal para 2 publicaciones + 1–2 reels semanales", isBold: true }
      ],
      buttonText: "Reservar Pack Inicia",
      buttonLink: "/booking?package=pack-inicia&price=550",
      buttonVariant: "primary" as const,
      buttonClass: "h-14 text-base"
    },
    {
      id: "pack-impulsa",
      name: "Pack Impulsa",
      price: "800€/mes",
      badge: "Más Popular",
      description: "Para marcas con actividad regular que quieren mantener ritmo y calidad",
      borderColor: "border-primary-black",
      headerBg: "bg-primary-black",
      headerTextColor: "text-primary-white",
      isPopular: true,
      features: [
        { icon: Video, text: "Jornada completa de producción (8h)", isBold: false },
        { icon: Camera, text: "16 fotografías editadas", isBold: false },
        { icon: Play, text: "10 reels optimizados para redes", isBold: false },
        { icon: Target, text: "Entrega organizada por tipo de contenido", isBold: false },
        { icon: CheckCircle, text: "Dirección creativa + moodboard", isBold: false },
        { icon: Lightbulb, text: "Ideal para 4 publicaciones + 2–3 reels semanales", isBold: true }
      ],
      buttonText: "Reservar Pack Impulsa",
      buttonLink: "/booking?package=pack-impulsa&price=800",
      buttonVariant: "custom" as const,
      buttonClass: "bg-primary-beige text-primary-black hover:bg-primary-gray hover:text-primary-white font-medium py-4 h-14 text-base transition-all duration-300 inline-flex items-center justify-center rounded"
    },
    {
      id: "pack-potencia",
      name: "Pack Potencia",
      price: "1200€/mes",
      badge: null,
      description: "Para marcas con estrategia sólida que buscan volumen, estilo y consistencia",
      borderColor: "border-primary-gray",
      headerBg: "bg-primary-gray",
      headerTextColor: "text-primary-white",
      isPopular: false,
      features: [
        { icon: Video, text: "Jornada completa + sets y luces premium", isBold: false },
        { icon: Camera, text: "30 fotografías editadas", isBold: false },
        { icon: Video, text: "16 reels con edición avanzada", isBold: false },
        { icon: Smartphone, text: "Kit de stories con subtítulos y llamadas a la acción", isBold: false },
        { icon: CheckCircle, text: "Plan visual mensual + opción de programación en Meta Suite", isBold: false },
        { icon: Lightbulb, text: "Ideal para 4+ publicaciones y reels semanales + historias diarias", isBold: true }
      ],
      buttonText: "Reservar Pack Potencia",
      buttonLink: "/booking?package=pack-potencia&price=1200",
      buttonVariant: "primary" as const,
      buttonClass: "h-14 text-base"
    }
  ],
  additionalServices: {
    title: "Servicios Adicionales",
    services: [
      { icon: Smartphone, title: "Programación de publicaciones", subtitle: "+80€/mes" },
      { icon: Brain, title: "Análisis mensual", subtitle: "de rendimiento" },
      { icon: Edit, title: "Guiones creativos", subtitle: "para reels o storytelling" },
      { icon: Phone, title: "Asesoría estratégica", subtitle: "en contenido" }
    ]
  },
  whyChooseUs: {
    title: "¿Por qué elegirnos?",
    reasons: [
      { icon: Building, title: "Estudio profesional", subtitle: "en el centro de la ciudad", isFullWidth: false },
      { icon: Video, title: "Espacios versátiles", subtitle: "con equipo técnico incluido", isFullWidth: false },
      { icon: Users, title: "Fotógrafos expertos", subtitle: "a tu servicio", isFullWidth: false },
      { icon: RotateCcw, title: "Flujo eficiente", subtitle: "contenido mensual en 1 jornada", isFullWidth: false },
      { icon: Target, title: "Acompañamiento creativo", subtitle: "y soporte en redes", isFullWidth: true }
    ]
  }
} as const;

// Información de reservas
export const BOOKING_INFO = {
  calendar: {
    title: "Disponibilidad en Tiempo Real"
  },
  form: {
    title: "Solicitud de Reserva"
  },
  importantInfo: {
    title: "Información Importante",
    items: [
      "Horario: Lunes - Domingo de 8:00 a 23:00",
      "Pago completo requerido para confirmación",
      "Cancelación: reembolso total con 48h antelación",
      "Reserva mínima: 2 horas"
    ]
  },
  helpSection: {
    title: "¿Necesitas Ayuda?",
    description: "Contacta directamente para presupuestos personalizados o dudas específicas.",
    contacts: [
      {
        label: "Teléfono:",
        value: "+34 633 811 994",
        href: "tel:+34633811994"
      },
      {
        label: "Email:",
        value: "contacto@contentstudiokrp.es",
        href: "mailto:contacto@contentstudiokrp.es"
      }
    ]
  }
} as const;

// Términos y normas de uso
export const BOOKING_TERMS = {
  title: 'Normas de Uso',
  subtitle: 'Guía de Uso y Normas del Estudio',
  description: 'Para garantizar una experiencia óptima y mantener nuestro espacio en perfectas condiciones, te pedimos que leas y sigas estas normas:',
  sections: [
    {
      id: 'studio-use',
      icon: 'Building2',
      title: 'Uso del Estudio',
      rules: [
        'La limpieza NO está incluida en la tarifa de alquiler. El estudio debe dejarse tal como se encontró.',
        'Tu tiempo de alquiler incluye montaje, desmontaje y limpieza. No hay margen extra entre reservas.',
        'Para mantener la comodidad y seguridad: Zona A: Máximo 8 personas. Zona B: Máximo 6 personas.'
      ]
    },
    {
      id: 'audio-recording',
      icon: 'Mic',
      title: 'Grabación de Sonido',
      rules: [
        'El estudio NO es completamente insonorizado. Aunque hemos optimizado la acústica, pueden filtrarse sonidos externos.',
        'Si necesitas una grabación sin interrupciones, consulta con nosotros la disponibilidad en horarios de menor ruido.'
      ]
    },
    {
      id: 'cleaning-fees',
      icon: 'Sparkles',
      title: 'Tarifas de Limpieza',
      rules: [
        'Para sesiones con 1-5 personas, la limpieza básica está incluida.',
        'Para grupos de 6 o más personas, se aplicará un recargo desde 50€ por limpieza.',
        'Tarifa de limpieza adicional (desde 50€) en caso de uso inadecuado del ciclorama, mobiliario o restos de comida/bebida.'
      ]
    },
    {
      id: 'cancellation-policy',
      icon: 'XCircle',
      title: 'Política de Cancelación',
      rules: [
        'Puedes cancelar o reprogramar tu sesión con hasta 48 horas de anticipación para recibir un reembolso total (excepto tarifas de procesamiento).',
        'Cancelaciones con menos de 48 horas no son reembolsables.'
      ]
    }
  ],
  linkText: 'Ver todas las normas'
} as const;


// Datos completos de espacios del estudio para la página studio-spaces
export const STUDIO_SPACES_FULL = [
  {
    id: "cyclorama",
    title: "Ciclorama de Grandes Dimensiones",
    description: "Nuestro ciclorama de gran formato es el espacio ideal para producciones fotográficas y audiovisuales que requieren un entorno amplio, versátil y completamente personalizable.",
    image: "/images/spaces/cyclorama-optimized.webp",
    features: [
      "Grandes Dimensiones: 6m x 4m con más de 3m de altura",
      "Espacio Versátil para fotografía de moda, retratos y producciones audiovisuales",
      "Iluminación Sin Restricciones y total libertad para setups profesionales",
      "Fondos y Decorados Personalizables según las necesidades de cada sesión",
      "Amplia Movilidad para el Equipo de fotografía y producción",
      "Acceso a Equipamiento Profesional incluido en el alquiler",
      "Fácil Acceso y Comodidad para transporte de equipos"
    ] as string[],
    idealFor: [
      "Fotografía y video de moda, editorial y publicidad",
      "Producciones de e-commerce con modelos o productos de gran tamaño",
      "Sesiones grupales con amplio espacio de movimiento",
      "Escenarios dinámicos con setups de iluminación avanzada"
    ] as string[]
  },
  {
    id: "color-backgrounds",
    title: "Zona de Fondos de Colores",
    description: "Nuestra zona de fondos de colores es el espacio perfecto para sesiones fotográficas y producciones audiovisuales que requieren versatilidad y personalización. Diseñada para adaptarse a cualquier concepto creativo, ofrece un amplio abanico de posibilidades para crear imágenes únicas y dinámicas.",
    image: "/images/spaces/sample.webp",
    reverse: true,
    features: [
      "Fondos Intercambiables de 2.7m de ancho en variedad de colores",
      "Mobiliario y Accesorios Personalizables para ambientar tus sesiones",
      "Iluminación Adaptable para diferentes estilos visuales",
      "Ambientes Dinámicos desde retratos hasta fotografía de moda",
      "Fácil Montaje y Cambio Rápido de Fondos sin interrumpir el workflow"
    ] as string[],
    idealFor: [
      "Sesiones de retrato con fondos coloridos y llamativos",
      "Fotografía de moda y campañas publicitarias con escenografía personalizada",
      "Contenido para e-commerce con variedad de fondos para destacar productos",
      "Producciones audiovisuales con transiciones de colores y efectos visuales"
    ] as string[]
  },
  {
    id: "black-zone",
    title: "Black Zone",
    description: "Nuestra Black Zone es el escenario ideal para creadores que buscan un fondo oscuro con un ambiente sofisticado, dramático y versátil. Perfecta para jugar con luces, sombras y contrastes, esta zona se adapta a sesiones fotográficas, producciones audiovisuales y contenido artístico con un estilo único.",
    image: "/images/spaces/black-zone-optimized.webp",
    features: [
      "Fondo Negro Profundo para contraste intenso y efecto cinematográfico",
      "Espacio para Sesiones con Vehículos gracias a su acceso directo y amplitud",
      "Iluminación Versátil para Juegos de Luces y Sombras",
      "Mobiliario y Props Personalizables para crear ambientes únicos",
      "Superficie Amplia con más de 40 metros cuadrados",
      "Perfecto para Contenido Cinematográfico y Editorial"
    ] as string[],
    idealFor: [
      "Retratos y sesiones editoriales con un look sofisticado y contrastes definidos",
      "Fotografía y video de coches y motos, con acceso directo al set",
      "Producciones audiovisuales con estética minimalista y cinematográfica",
      "Contenido de branding y publicidad que requiera un ambiente elegante y versátil"
    ] as string[]
  },
  {
    id: "creative-studio",
    title: "Creative Studio",
    description: "Nuestra zona Creative Studio es el corazón creativo de The Content Studio, un espacio único diseñado especialmente para podcasters, creadores de contenido y profesionales que buscan un entorno con personalidad propia. Con cuatro paredes temáticas completamente diferentes, cada escenario ofrece un estilo visual distintivo que permite grabar contenido variado sin necesidad de cambiar de ubicación.",
    image: "/images/spaces/cyclorama-optimized.webp",
    reverse: true,
    features: [
      "Cuatro Escenarios Únicos en Un Solo Espacio: Pared industrial de ladrillo visto, acabado minimalista blanco, textura de madera natural y fondo oscuro elegante",
      "Equipamiento Audiovisual Integrado: Televisión 55 pulgadas empotrada en pared para presentaciones, streaming y contenido interactivo",
      "Acústica Optimizada: Paneles acústicos decorativos que mejoran la calidad de audio sin comprometer la estética visual",
      "Iluminación Profesional Especializada: Sistema de luces LED regulables y flashes profesionales adaptados para grabación de video y fotografía",
      "Mobiliario Modular y Versátil: Sillas, mesas, sofás y accesorios que se pueden reorganizar según las necesidades de cada producción",
      "Zona de Podcasting Premium: Espacio específicamente diseñado para grabación de audio profesional con micrófonos de condensador y dinámicos",
      "Ambiente Controlado: Climatización independiente y aislamiento acústico para sesiones largas de grabación",
      "Configuración Rápida: Cambio de escenario en menos de 5 minutos sin interrumpir el flujo de trabajo",
      "Conectividad Avanzada: WiFi de alta velocidad, múltiples tomas de corriente y puertos de conexión para equipos técnicos",
      "Espacio de Almacenamiento: Área dedicada para guardar equipos personales y accesorios durante la sesión"
    ] as string[],
    idealFor: [
      "Podcasters Profesionales que buscan grabar episodios con diferentes ambientes visuales y máxima calidad de audio",
      "Creadores de Contenido para YouTube, Instagram y TikTok que necesitan fondos atractivos y versátiles para sus videos",
      "Empresas y Startups que requieren grabar contenido corporativo, testimoniales y presentaciones con imagen profesional",
      "Influencers y Personal Branding que buscan crear contenido premium para redes sociales y plataformas digitales",
      "Educadores y Formadores Online que necesitan un entorno profesional para cursos, masterclasses y webinars",
      "Agencias de Marketing que desarrollan campañas audiovisuales para diferentes clientes con estéticas variadas",
      "Entrevistas y Charlas Profesionales con invitados, ideal para contenido B2B y networking empresarial",
      "Streaming en Vivo y Eventos Virtuales con calidad broadcast y múltiples opciones de fondo",
      "Fotografía de Retrato Corporativo y Personal Branding con acabados únicos y personalizados",
      "Producciones de Video Marketing y Storytelling para marcas que buscan diferenciarse visualmente"
    ] as string[]
  }
] as const;

// Tabla de precios
export const PRICING_TABLE = {
  headers: {
    service: 'Servicio',
    duration: 'Duración',
    price: 'Precio',
    action: ''
  },
  actions: {
    book: 'Reservar',
    contact: 'Contactar'
  },
  notes: {
    title: 'Notas Importantes'
  },
  alternativePayment: {
    prefix: 'o'
  }
} as const;

// Calendario de reservas
export const BOOKING_CALENDAR = {
  title: 'Disponibilidad',
  filter: {
    allAreas: 'Todas las áreas'
  },
  operatingHours: {
    title: 'Horarios de Operación',
    schedule: 'Lunes - Domingo: 8:00 - 23:00'
  },
  status: {
    loading: 'Cargando calendario...'
  },
  legend: {
    available: 'Disponible',
    partial: 'Parcial',
    occupied: 'Ocupado',
    past: 'Pasado'
  },
  dayDetails: {
    title: 'Detalles del día',
    pastDay: 'Este día ya ha pasado.',
    fullyAvailable: '✅ Día completamente disponible',
    availableHours: 'Horarios disponibles: 8:00 - 23:00',
    existingBookings: 'Reservas existentes:',
    availableSlots: 'Horarios disponibles:',
    slotsText: 'espacios',
    slotsOf: 'de',
    makeBooking: 'Hacer reserva'
  }
} as const;

// Sidebar de reservas
export const BOOKING_SIDEBAR = {
  info: {
    title: 'Información de Reserva',
    schedule: {
      title: 'Horario de Reservas',
      time: 'Lunes - Domingo: 8:00 - 23:00'
    },
    payment: {
      title: 'Pago',
      description: 'Se requiere pago completo para confirmar la reserva.'
    },
    cancellation: {
      title: 'Cancelaciones',
      description: 'Reembolso completo si se cancela con 48h de antelación.'
    },
    minTime: {
      title: 'Tiempo Mínimo',
      description: 'La reserva mínima es de 2 horas.'
    }
  },
  help: {
    title: '¿Necesitas Ayuda?',
    description: 'Si tienes dudas o necesitas un presupuesto personalizado, no dudes en contactarnos.',
    contact: 'Contactar'
  },
  faq: {
    title: 'Preguntas Frecuentes',
    description: 'Encuentra respuestas a las preguntas más comunes sobre reservas y servicios.',
    link: 'Ver todas las preguntas'
  }
} as const;

// Formulario de reservas - mensajes y estados
export const BOOKING_FORM_MESSAGES = {
  availability: {
    notAvailable: 'La fecha y hora seleccionadas no están disponibles. Por favor, elige otra opción.',
    insufficientDuration: 'No hay suficientes horas consecutivas disponibles para la duración seleccionada.',
    exceedsOperatingHours: 'La duración seleccionada excede el horario de operación del estudio.'
  },
  loading: {
    sending: 'Enviando...',
    submit: 'Enviar Solicitud'
  },
  errors: {
    availability: 'Error checking availability:',
    calendar: 'Error al verificar disponibilidad del calendario',
    duration: 'Error al verificar disponibilidad de duración'
  }
} as const;

// Página de calendario
export const CALENDAR_PAGE = {
  sidebar: {
    operatingHours: {
      title: 'Horarios de Operación',
      schedule: 'Lunes - Domingo:',
      time: '8:00 - 23:00'
    },
    sessionTypes: {
      title: 'Tipos de Sesión',
      types: [
        { color: 'bg-green-500', label: 'Sesión de Fotos' },
        { color: 'bg-blue-500', label: 'Grabación de Video' },
        { color: 'bg-purple-500', label: 'Streaming en Vivo' },
        { color: 'bg-orange-500', label: 'Evento Corporativo' }
      ]
    },
    duration: {
      title: 'Duración de Sesiones',
      durations: [
        { time: '2 horas', type: 'Básico' },
        { time: '4 horas', type: 'Estándar' },
        { time: '6 horas', type: 'Premium' },
        { time: '8 horas', type: 'Profesional' },
        { time: 'Día completo', type: 'Full Day' }
      ]
    },
    cta: {
      title: '¿Listo para reservar?',
      description: 'Selecciona un día disponible y crea tu reserva',
      buttonText: 'Hacer Reserva'
    }
  }
} as const;

// Banner de cookies
export const COOKIE_BANNER_CONTENT = {
  banner: {
    title: 'Utilizamos cookies',
    description: 'Utilizamos cookies propias y de terceros para mejorar tu experiencia y personalizar el contenido. Al continuar navegando, aceptas nuestra política de cookies.',
    buttons: {
      configure: 'Configurar',
      acceptAll: 'Aceptar todas',
      close: 'Cerrar banner'
    }
  },
  modal: {
    title: 'Configuración de Cookies',
    description: 'Utilizamos cookies para mejorar tu experiencia de navegación, personalizar contenido y analizar el tráfico. Puedes configurar qué cookies aceptar.',
    cookieTypes: {
      essential: {
        title: 'Cookies Esenciales',
        description: 'Estas cookies son necesarias para el funcionamiento básico del sitio web. No pueden desactivarse.'
      },
      analytics: {
        title: 'Cookies Analíticas',
        description: 'Nos ayudan a entender cómo interactúas con nuestro sitio web mediante la recopilación de información anónima.'
      },
      marketing: {
        title: 'Cookies de Marketing',
        description: 'Se utilizan para realizar un seguimiento de los visitantes a través de los sitios web para mostrar anuncios relevantes.'
      }
    },
    footer: {
      text: 'Para más información, consulta nuestra',
      privacyLink: {
        href: '/privacy-policy',
        text: 'Política de Privacidad'
      },
      termsLink: {
        href: '/terms',
        text: 'Términos de Uso'
      }
    },
    buttons: {
      savePreferences: 'Guardar Preferencias',
      acceptAll: 'Aceptar Todas'
    }
  }
} as const;
