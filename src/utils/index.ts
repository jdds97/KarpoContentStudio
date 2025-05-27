// Archivo principal de exportación de utils

// Datos
export { businessStructuredData } from './data/structured-data';
export { targetAudiences, type TargetAudience } from './data/target-audiences';
export { pricingSections, annualMembershipDetails, pricingNotes, type PricingOption, type PricingSection } from './data/pricing-data';
export { faqCategories, type FaqQuestion, type FaqCategory } from './data/faq-data';

// Constantes
export { 
  CONTACT_INFO, 
  SITE_URLS, 
  DEFAULT_SEO, 
  OPENING_HOURS, 
  NAVIGATION_LINKS, 
  FORM_CONFIG 
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
  Testimonial
} from './types';
