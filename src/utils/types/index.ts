// Tipos TypeScript para el proyecto

// Re-exportar tipos del archivo de target audiences
export type { TargetAudience } from '@/utils/data/target-audiences';
export type { PricingOption, PricingSection } from '@/utils/data/pricing-data';
export type { FaqQuestion, FaqCategory } from '@/utils/data/faq-data';

// Tipos para componentes de Layout
export interface LayoutProps {
  title: string;
  description?: string;
  image?: string;
  canonical?: string;
  type?: "website" | "article";
}

// Tipos para SEO
export interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  canonical?: string;
  type?: "website" | "article";
}

// Tipos para botones
export interface ButtonProps {
  href?: string;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline" | "custom" | "table";
  fullWidth?: boolean;
  class?: string;
  children?: any;
}

// Tipos para Hero Section
export interface HeroSectionProps {
  title: string;
  description: string;
  image: string;
  overlayClass?: string;
  textClass?: string;
  buttonText?: string;
  buttonHref?: string;
}

// Tipos para CTA Section
export interface CtaSectionProps {
  title: string;
  description: string;
  primaryText: string;
  primaryHref: string;
  secondaryText?: string;
  secondaryHref?: string;
  bgClass?: string;
  textClass?: string;
}

// Tipos para AccordionItem
export interface AccordionItemProps {
  question: string;
  answer: string;
  index: number;
  categoryIndex?: number;
}

// Tipos para FAQ
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

// Tipos para datos estructurados
export interface Address {
  "@type": "PostalAddress";
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
}

export interface GeoCoordinates {
  "@type": "GeoCoordinates";
  latitude: number;
  longitude: number;
}

export interface OpeningHours {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string[];
  opens: string;
  closes: string;
}

export interface BusinessStructuredData {
  "@context": string;
  "@type": string;
  name: string;
  image: string[];
  address: Address;
  geo: GeoCoordinates;
  telephone: string;
  email: string;
  url: string;
  priceRange: string;
  openingHoursSpecification: OpeningHours[];
}

// Tipos para formularios
export interface FormData {
  [key: string]: string | number | boolean;
}

export interface FormConfig {
  id: string;
  successMessage: {
    title: string;
    description: string;
  };
}

// Tipos para navegación
export interface NavigationLink {
  href: string;
  label: string;
  isActive?: boolean;
}

// Tipos para espacios del estudio
export interface StudioSpace {
  id: string;
  title: string;
  description: string;
  features: string[];
  image: string;
  gallery?: string[];
}

// Tipos para testimonios
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  content: string;
  avatar?: string;
  rating?: number;
}

// Tipos para Servicios Adicionales
export interface AdditionalService {
  id: string;
  icon: string;
  title: string;
  description: string;
  price: string;
  priceNote: string | null;
  actionText: string | null;
  actionHref: string | null;
}
