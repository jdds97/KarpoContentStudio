// Datos estructurados JSON-LD para Schema.org
export const businessStructuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "The Content Studio",
  "image": [
    "https://thecontentstudio.es/images/spaces/cyclorama-optimized.webp",
    "https://thecontentstudio.es/images/spaces/sample.webp",
    "https://thecontentstudio.es/images/spaces/black-zone-optimized.webp"
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Calle La Red Veintisiete, nº 6",
    "addressLocality": "Sevilla",
    "addressRegion": "Sevilla",
    "postalCode": "41700",
    "addressCountry": "ES"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 37.4101,
    "longitude": -5.9416
  },
  "telephone": "+34633811994",
  "email": "contacto@contentstudiokrp.es",
  "url": "https://thecontentstudio.es",
  "priceRange": "€€",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "08:00",
      "closes": "23:00"
    }
  ]
};
