import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import 'dotenv/config';

// Only use Cloudflare adapter when CF_PAGES=1 is set by Cloudflare Pages
const isCloudflarePages = process.env.CF_PAGES === '1';

export default defineConfig({
  site: 'https://contentstudiokrp.es',
  output: 'server',
  integrations: [sitemap({
    filter: (page) => !page.includes('/admin/'),
    changefreq: 'weekly',
    priority: 0.7,
    lastmod: new Date(),
  })],
  adapter: isCloudflarePages ? cloudflare({
    imageService: 'compile',
    platformProxy: true,
  }) : node({
    mode: 'standalone'
  }),
  image: {
    // Configuración optimizada para imágenes con máxima calidad
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        // Configuraciones de Sharp para máxima calidad
        limitInputPixels: 268402689, // ~16K x 16K máximo
        sequentialRead: false, // Mejora performance en imágenes grandes
        density: 300, // DPI alto para calidad retina
        
        // Configuraciones avanzadas de Sharp
        mozjpeg: true, // Usar mozjpeg encoder para mejor compresión
        progressive: true, // JPEG progresivo
        chromaSubsampling: '4:4:4', // Sin subsampling de croma para max calidad
        trellisQuantisation: true, // Mejor cuantización
        overshootDeringing: true, // Reducir artefactos
        optimiseScans: true, // Optimizar escaneos progresivos
      }
    },
    // Formatos soportados priorizando AVIF
    formats: ['avif', 'webp', 'jpg'],
    // Calidades por formato - balance calidad/rendimiento
    quality: {
      avif: 75,  // Buena calidad con mejor compresión
      webp: 80,  // Balance calidad/tamaño
      jpeg: 85   // Buena calidad para fallback
    },
    // Breakpoints responsive automáticos optimizados
    remotePatterns: [{
      protocol: "https"
    }],
    // Configuración experimental de responsive images
    experimental: {
      globalCSS: true
    }
  },
  devToolbar: {
    enabled: false
  },
  server: {
    port: 4321,
    host: true,
    hmr: {
      port: 4322,
      overlay: false
    },
    watch: {
      usePolling: false,
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/tests/**', '**/*.test.*', '**/*.spec.*']
    }
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
    assets: 'assets'
  },
  vite: {
    plugins: [
      tailwindcss(),
      {
        name: 'cloudflare-polyfill',
        generateBundle(_, bundle) {
          // Replace require calls with proper polyfills for Cloudflare Workers
          for (const [, chunk] of Object.entries(bundle)) {
            if (chunk.type === 'chunk' && chunk.code) {
              // Replace WebSocket require with browser WebSocket
              chunk.code = chunk.code.replace(
                /WebSocketImpl = require\('ws'\);/g,
                'WebSocketImpl = WebSocket;'
              );
            }
          }
        }
      }
    ],
    define: {
      global: 'globalThis',
      'process.env': 'process.env'
    },
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
        'node:fetch': 'fetch',
        'ws': 'WebSocket'
      }
    },
    ssr: {
      external: ['node:buffer', 'sharp', 'detect-libc', 'ws'],
      noExternal: ['@astrojs/cloudflare', '@supabase/supabase-js']
    },
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname
      }
    },
    build: {
      cssCodeSplit: false,
      minify: 'esbuild',
      assetsInlineLimit: 8192,
      rollupOptions: {
        external: [
          /.*\.test\.(js|ts|jsx|tsx)$/,
          /.*\.spec\.(js|ts|jsx|tsx)$/,
          /^.*\/tests\/.*$/,
          'ws'
        ],
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
            if (id.includes('tests') || id.includes('.test.') || id.includes('.spec.')) {
              return undefined; // Don't chunk test files
            }
          },
          assetFileNames: (assetInfo) => {
            if (!assetInfo.fileName) return `assets/[name]-[hash][extname]`;
            const info = assetInfo.fileName.split('.');
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (ext === 'css') {
              return `assets/css/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          }
        }
      },
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.warn'],
          passes: 3,
          unsafe: true,
          unsafe_arrows: true,
          unsafe_methods: true
        },
        mangle: {
          toplevel: true
        },
        format: {
          comments: false
        }
      }
    }
  }
});