import ogImageSrc from "@images/social.png";

export const SITE = {
  title: "Karpo Content Studio",
  tagline: "Capturando Momentos, Creando Recuerdos",
  description: "Karpo Estudio de Contenido ofrece servicios profesionales de fotografía para capturar tus momentos más preciados. Nuestros fotógrafos expertos aseguran calidad superior y creatividad en cada toma. Comienza a explorar y contacta a nuestro equipo para servicios de fotografía excepcionales.",
  description_short: "Karpo Estudio de Contenido ofrece servicios profesionales de fotografía para capturar tus momentos más preciados.",
  url: "https://karpostudiocontent.com",
  author: "Karpo Estudio de Contenido",
};

export const SEO = {
  title: SITE.title,
  description: SITE.description,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    inLanguage: "es-ES",
    "@id": SITE.url,
    url: SITE.url,
    name: SITE.title,
    description: SITE.description,
    isPartOf: {
      "@type": "WebSite",
      url: SITE.url,
      name: SITE.title,
      description: SITE.description,
    },
  },
};

export const OG = {
  locale: "en_US",
  type: "website",
  url: SITE.url,
  title: `${SITE.title}: : Hardware Tools & Construction Services`,
  description: "Equip your projects with ScrewFast's top-quality hardware tools and expert construction services. Trusted by industry leaders, ScrewFast offers simplicity, affordability, and reliability. Experience the difference with user-centric design and cutting-edge tools. Start exploring now!",
  image: ogImageSrc,
};
