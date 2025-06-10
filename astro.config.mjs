// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server', // 🔄 Cambiamos a 'server' por compatibilidad
  adapter: node({
    mode: 'standalone'
  }),
  devToolbar: {
    enabled: false
  },
  server: {
    port: 4321,
    host: true
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'always', // ✅ CAMBIO: Forzar inline de CSS crítico para eliminar cadenas
    assets: 'assets'
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
    optimizeDeps: {
      include: ['@lucide/astro'], // Pre-bundle Lucide para mejor rendimiento en dev
      force: true, // Forzar re-optimización en dev
    },
    server: {
      hmr: {
        overlay: false, // Desactivar overlay de errores para mejor rendimiento
      },
      watch: {
        ignored: ['**/node_modules/**', '**/.git/**'], // Ignorar archivos innecesarios
        usePolling: false, // Usar eventos del sistema en lugar de polling
      },
    },
    build: {
      cssCodeSplit: false, // ✅ Consolidar CSS en un solo archivo
      minify: 'terser',
      assetsInlineLimit: 8192, // ✅ CAMBIO: Inline assets hasta 8KB para eliminar requests adicionales
      rollupOptions: {
        output: {
          // Separar vendor chunks para mejor caché
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              // Separar Lucide en su propio chunk para mejor caché
              if (id.includes('@lucide/astro')) {
                return 'lucide';
              }
              return 'vendor';
            }
          },
          assetFileNames: (assetInfo) => {
            if (!assetInfo.name) return `assets/[name]-[hash][extname]`;
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (ext === 'css') {
              // ✅ CAMBIO: Nombres más específicos para CSS
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
  },
});