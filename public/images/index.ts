// Centralización de imports de imágenes para optimización con Astro
import logoMain from './logos/logo-optimized.webp';
import logoWhite from './logos/logo-white-optimized.webp';
import logoOriginal from './logos/logo-optimized-original.webp';

import spacesPrincipal from './spaces/principal-optimized.webp';
import spacesBlackZone from './spaces/black-zone-optimized.webp';
import spacesCyclorama from './spaces/cyclorama-optimized.webp';
import spacesSample from './spaces/sample.webp';

export const images = {
  logos: {
    main: logoMain,
    white: logoWhite,
    original: logoOriginal,
  },
  spaces: {
    principal: spacesPrincipal,
    blackZone: spacesBlackZone,
    cyclorama: spacesCyclorama,
    sample: spacesSample,
  }
} as const;

// Mapeo para mantener compatibilidad con las rutas existentes
export const imageMap = {
  '/images/logos/logo-optimized.webp': logoMain,
  '/images/logos/logo-white-optimized.webp': logoWhite,
  '/images/logos/logo-optimized-original.webp': logoOriginal,
  '/images/spaces/principal-optimized.webp': spacesPrincipal,
  '/images/spaces/black-zone-optimized.webp': spacesBlackZone,
  '/images/spaces/cyclorama-optimized.webp': spacesCyclorama,
  '/images/spaces/sample.webp': spacesSample,
} as const;
