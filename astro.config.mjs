// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false
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
    build: {
      cssCodeSplit: false, // ✅ Consolidar CSS en un solo archivo
      minify: 'terser',
      assetsInlineLimit: 8192, // ✅ CAMBIO: Inline assets hasta 8KB para eliminar requests adicionales
      rollupOptions: {
        output: {
          // Separar vendor chunks para mejor caché
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
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