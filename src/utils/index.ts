// Archivo principal de exportación de utils

// Datos
export { businessStructuredData } from './data/structured-data';
export { targetAudiences, type TargetAudience } from './data/target-audiences';
export { pricingSections, annualMembershipDetails, pricingNotes, type PricingOption, type PricingSection } from './data/pricing-data';
export { faqCategories, type FaqQuestion, type FaqCategory } from './data/faq-data';
export { 
  TARGET_AUDIENCES, 
  WELCOME_SERVICES, 
  CAROUSEL_SLIDES, 
  TESTIMONIALS, 
  SECTION_CONTENT,
  FORM_LABELS,
  FORM_OPTIONS,
  CTA_CONTENT,
  HERO_CONTENT,
  FAQ_CONTENT,
  ADDITIONAL_SERVICES,
  PAYMENT_INFO,
  STUDIO_EQUIPMENT,
  CONTACT_MAP_CONTENT,
  SEO_METADATA
} from './data/ui-content';

// Constantes
export { 
  CONTACT_INFO, 
  SITE_URLS, 
  DEFAULT_SEO, 
  OPENING_HOURS, 
  NAVIGATION_LINKS, 
  FORM_CONFIG,
  SOCIAL_MEDIA,
  COMPANY_INFO,
  OPENING_HOURS_DISPLAY,
  LEGAL_LINKS
} from './constants/site-config';

// Tipos
export type {
  LayoutProps,
  SEOProps,
  ButtonProps,
  HeroSectionProps,
  CtaSectionProps,
  AccordionItemProps,
  FAQItem,
  BusinessStructuredData,
  FormData,
  FormConfig,
  NavigationLink,
  StudioSpace,
  Testimonial,
  AdditionalService
} from './types';
