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
  SEO_METADATA,
  COOKIE_BANNER_CONTENT,
  HOME_STUDIO_SPACES,
  CONTENT_PACKAGES,
  BOOKING_INFO,
  STUDIO_SPACES_FULL,
  BOOKING_TERMS,
  PRICING_TABLE,
  BOOKING_CALENDAR,
  BOOKING_SIDEBAR,
  BOOKING_FORM_MESSAGES,
  CALENDAR_PAGE
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

// Schemas de validación
export {
  createBookingSchema,
  confirmBookingSchema,
  updateBookingSchema,
  cancelBookingSchema,
  discountValidationSchema,
  contactFormSchema,
  type CreateBookingInput,
  type ConfirmBookingInput,
  type UpdateBookingInput,
  type CancelBookingInput,
  type DiscountValidationInput,
  type ContactFormInput
} from './data/schemas';

// Utilidades de email y funciones generadoras
export {
  sendEmailWithResend,
  PACKAGE_PRICES,
  calculateTotalPrice,
  generateBookingConfirmationEmail,
  generateBookingConfirmedEmail,
  generateBookingCancelledEmail,
  generateAdminBookingNotificationEmail,
  generateBookingUpdatedEmail,
} from './email-helpers';

// Templates de email (datos puros)
export {
  BOOKING_CONFIRMATION_TEMPLATE,
  BOOKING_CONFIRMED_TEMPLATE,
  BOOKING_CANCELLED_TEMPLATE,
  ADMIN_NOTIFICATION_TEMPLATE,
  BOOKING_UPDATED_TEMPLATE,
  BOOKING_REMINDER_TEMPLATE,
  BOOKING_CONFIRMATION_TEMPLATE_ENHANCED
} from './data/email-templates';

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
