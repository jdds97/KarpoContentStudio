import type { APIRoute } from 'astro';

// URLs del sitio (excluyendo admin)
const pages = [
  { url: '/', priority: 1.0 },
  { url: '/rates/', priority: 0.9 },
  { url: '/booking/', priority: 0.9 },
  { url: '/studio-spaces/', priority: 0.8 },
  { url: '/target-audiences/', priority: 0.8 },
  { url: '/contact/', priority: 0.7 },
  { url: '/faq/', priority: 0.7 },
  { url: '/terms/', priority: 0.3 },
  { url: '/privacy-policy/', priority: 0.3 },
  { url: '/booking/confirmation/', priority: 0.2 },
];

const baseUrl = 'https://contentstudiokrp.es';
const lastmod = new Date().toISOString();

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

export const GET: APIRoute = () => {
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
