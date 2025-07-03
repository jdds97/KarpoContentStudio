import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// Cargar variables de entorno explícitamente
import 'dotenv/config';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
  image: {
    service: {
      entrypoint: 'astro/assets/services/squoosh'
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
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**']
    }
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
    assets: 'assets'
  },
  vite: {
    plugins: [tailwindcss()],
    define: {
      global: 'globalThis',
      'process.env': 'process.env',
    },
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
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
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return 'vendor';
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