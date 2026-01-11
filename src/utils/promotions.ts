// Sistema de promociones - The Content Studio
// Actualmente no hay promociones activas

export interface Promotion {
  id: string;
  name: string;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  code: string;
  description: string;
  appliesTo: 'all' | 'standard' | 'memberships';
}

// Sin promociones activas
export const ACTIVE_PROMOTIONS: Promotion[] = [];

/**
 * Obtiene la promoción activa actual (si existe)
 */
export function getActivePromotion(): Promotion | null {
  return null;
}

/**
 * Verifica si hay una promoción activa
 */
export function hasActivePromotion(): boolean {
  return false;
}

/**
 * Calcula el precio con descuento
 */
export function calculateDiscountedPrice(originalPrice: number, discountPercentage: number): number {
  return Math.round(originalPrice * (1 - discountPercentage / 100));
}

/**
 * Formatea la fecha de fin de promoción
 */
export function formatPromotionEndDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Obtiene los días restantes de la promoción
 */
export function getPromotionDaysRemaining(promo: Promotion): number {
  return 0;
}

// Precios actuales (sin descuento - 60€/hora)
export const ORIGINAL_PRICES: Record<string, number> = {
  '1h': 60,
  '2h': 120,
  '3h': 180,
  '4h': 240,
  '6h': 360,
  '8h': 480,
  '12h': 720
};

/**
 * Obtiene el precio actual (sin descuento)
 */
export function getCurrentPrice(packageDuration: string): { original: number; current: number; hasDiscount: boolean; discountPercentage: number } {
  const original = ORIGINAL_PRICES[packageDuration] || 0;

  return {
    original,
    current: original,
    hasDiscount: false,
    discountPercentage: 0
  };
}

/**
 * Genera los datos de precio para mostrar en la UI
 */
export function getPricingDisplayData() {
  return {
    hasPromotion: false,
    promotion: null,
    endDateFormatted: null,
    daysRemaining: 0,
    packages: Object.entries(ORIGINAL_PRICES).map(([duration, originalPrice]) => {
      return {
        duration,
        originalPrice,
        currentPrice: originalPrice,
        hasDiscount: false,
        discountPercentage: 0,
        savings: 0
      };
    })
  };
}
