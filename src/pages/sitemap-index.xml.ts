import type { APIRoute } from 'astro';

// Generar fecha actual en formato ISO
const getLastmod = () => {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
};

const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://contentstudiokrp.es/sitemap-0.xml</loc>
    <lastmod>2026-01-11</lastmod>
  </sitemap>
</sitemapindex>`;

export const GET: APIRoute = () => {
  return new Response(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
