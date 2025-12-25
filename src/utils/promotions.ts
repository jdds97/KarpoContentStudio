// Sistema de promociones temporales - The Content Studio
// Gestiona descuentos automáticos por fecha

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

// Promoción activa: 40% hasta el 28 de Febrero 2026
export const ACTIVE_PROMOTIONS: Promotion[] = [
  {
    id: 'opening-2026',
    name: 'Promoción de Apertura',
    discountPercentage: 40,
    startDate: new Date('2024-12-01'),
    endDate: new Date('2026-02-28T23:59:59'),
    code: 'APERTURA40',
    description: 'Descuento especial de apertura - 40% en todos los paquetes estándar',
    appliesTo: 'standard'
  }
];

/**
 * Obtiene la promoción activa actual (si existe)
 */
export function getActivePromotion(): Promotion | null {
  const now = new Date();

  return ACTIVE_PROMOTIONS.find(promo =>
    now >= promo.startDate && now <= promo.endDate
  ) || null;
}

/**
 * Verifica si hay una promoción activa
 */
export function hasActivePromotion(): boolean {
  return getActivePromotion() !== null;
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
  const now = new Date();
  const diffTime = promo.endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Precios originales (sin descuento)
export const ORIGINAL_PRICES: Record<string, number> = {
  '1h': 85,
  '2h': 150,
  '3h': 225,
  '4h': 300,
  '6h': 450,
  '8h': 600,
  '12h': 850
};

/**
 * Obtiene el precio actual (con o sin descuento según la fecha)
 */
export function getCurrentPrice(packageDuration: string): { original: number; current: number; hasDiscount: boolean; discountPercentage: number } {
  const original = ORIGINAL_PRICES[packageDuration] || 0;
  const promo = getActivePromotion();

  if (promo && promo.appliesTo !== 'memberships') {
    const current = calculateDiscountedPrice(original, promo.discountPercentage);
    return {
      original,
      current,
      hasDiscount: true,
      discountPercentage: promo.discountPercentage
    };
  }

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
  const promo = getActivePromotion();

  return {
    hasPromotion: !!promo,
    promotion: promo,
    endDateFormatted: promo ? formatPromotionEndDate(promo.endDate) : null,
    daysRemaining: promo ? getPromotionDaysRemaining(promo) : 0,
    packages: Object.entries(ORIGINAL_PRICES).map(([duration, originalPrice]) => {
      const priceData = getCurrentPrice(duration);
      return {
        duration,
        originalPrice,
        currentPrice: priceData.current,
        hasDiscount: priceData.hasDiscount,
        discountPercentage: priceData.discountPercentage,
        savings: originalPrice - priceData.current
      };
    })
  };
}
