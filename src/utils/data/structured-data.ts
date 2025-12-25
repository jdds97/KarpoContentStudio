// Datos estructurados JSON-LD para Schema.org

// Schema LocalBusiness mejorado para SEO
export const businessStructuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://contentstudiokrp.es/#business",
  "name": "The Content Studio",
  "alternateName": "Content Studio KRP",
  "description": "Estudio fotográfico profesional en Sevilla para alquiler por horas. Ciclorama 6x4m, zona podcast con tratamiento acústico, fondos de colores y equipamiento profesional incluido. Ideal para fotografía, video, podcast y eventos.",
  "image": [
    "https://contentstudiokrp.es/images/spaces/cyclorama-optimized.webp",
    "https://contentstudiokrp.es/images/spaces/sample.webp",
    "https://contentstudiokrp.es/images/spaces/black-zone-optimized.webp"
  ],
  "logo": "https://contentstudiokrp.es/images/logos/logo-optimized.webp",
  "url": "https://contentstudiokrp.es",
  "telephone": "+34633811994",
  "email": "contacto@contentstudiokrp.es",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Calle La Red Veintisiete, nº 6",
    "addressLocality": "Dos Hermanas",
    "addressRegion": "Sevilla",
    "postalCode": "41700",
    "addressCountry": "ES"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 37.4101,
    "longitude": -5.9416
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "Sevilla"
    },
    {
      "@type": "City",
      "name": "Dos Hermanas"
    }
  ],
  "priceRange": "€€",
  "currenciesAccepted": "EUR",
  "paymentAccepted": "Transferencia bancaria, Bizum",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "opens": "08:00",
    "closes": "23:00"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Servicios de estudio fotográfico",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Alquiler de Ciclorama",
          "description": "Ciclorama profesional de 6x4 metros con más de 3 metros de altura, ideal para fotografía de moda, producto y video corporativo"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Creative Studio para Podcast",
          "description": "Espacio con tratamiento acústico, 4 fondos temáticos, TV 55 pulgadas y mobiliario modular para grabación de podcast y videopodcast"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Zona de Fondos de Colores",
          "description": "Fondos Colorama intercambiables de 2.7m en variedad de colores para fotografía de producto y retratos"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Black Zone",
          "description": "Espacio oscuro para fotografía dramática, retratos de alta gama y producciones audiovisuales con alto contraste"
        }
      }
    ]
  },
  "sameAs": [
    "https://instagram.com/contentstudiokrp.es"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "reviewCount": "15"
  }
};

// Schema FAQPage para rich snippets en Google
export const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta alquilar el estudio fotográfico?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ofrecemos tarifas flexibles según la duración de tu sesión. Consulta nuestra página de tarifas para ver precios actualizados. ¡Actualmente tenemos 40% de descuento con el código APERTURA40 hasta febrero 2026!"
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuántas zonas tiene el estudio?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El estudio cuenta con cuatro zonas diferenciadas: el Ciclorama de 6x4 metros, la Zona de Fondos de Colores con fondos Colorama intercambiables, la Black Zone para fotografía dramática, y el Creative Studio especializado para podcast y contenido audiovisual."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cómo puedo reservar el estudio?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Puedes reservar directamente desde nuestra web en la sección de Reservas, donde verás la disponibilidad en tiempo real. También puedes contactarnos por teléfono (+34 633 811 994) o email (contacto@contentstudiokrp.es)."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuál es el tiempo mínimo de reserva?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El tiempo mínimo de reserva es de 2 horas. Este tiempo incluye montaje, desmontaje y limpieza del espacio utilizado."
      }
    },
    {
      "@type": "Question",
      "name": "¿El equipamiento está incluido en el precio?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí, todo el equipamiento profesional está incluido en el precio de alquiler: flashes Godox, paneles LED, modificadores de luz, WiFi de alta velocidad, zona de maquillaje y camerino, y acceso a todas las zonas del estudio."
      }
    },
    {
      "@type": "Question",
      "name": "¿Puedo cancelar o modificar mi reserva?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí, puedes cancelar o modificar tu reserva con al menos 48 horas de antelación para recibir un reembolso completo (excluyendo costes de procesamiento). Las cancelaciones con menos de 48 horas no son reembolsables."
      }
    },
    {
      "@type": "Question",
      "name": "¿El estudio es adecuado para grabar podcast?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí, contamos con el Creative Studio, un espacio especialmente diseñado para podcasters con tratamiento acústico, cuatro fondos temáticos diferentes, televisión de 55 pulgadas integrada, micrófonos profesionales y mobiliario modular."
      }
    },
    {
      "@type": "Question",
      "name": "¿Dónde está ubicado el estudio?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Estamos ubicados en Calle La Red Veintisiete, nº 6, en Dos Hermanas (Sevilla). Tenemos excelente conexión, cerca de la S-40 y con acceso directo desde la A-92. Hay zona de carga y descarga en la puerta."
      }
    }
  ]
};

// Schema WebSite para búsqueda interna
export const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "The Content Studio",
  "url": "https://contentstudiokrp.es",
  "description": "Estudio fotográfico profesional en Sevilla para alquiler por horas",
  "inLanguage": "es-ES"
};
