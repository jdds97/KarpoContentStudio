import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import node from '@astrojs/node';
import 'dotenv/config';

// Cloudflare Pages automatically sets CF_PAGES=1
const isCloudflarePages = process.env.CF_PAGES === '1';

export default defineConfig({
  output: 'server',
  adapter: isCloudflarePages ? cloudflare({
    imageService: 'compile'
  }) : node({
    mode: 'standalone'
  }),
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
      'process.env': 'process.env'
    },
    ssr: {
      external: ['node:buffer', 'sharp', 'detect-libc'],
      noExternal: ['@astrojs/cloudflare']
    },
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname
      }
    },
    build: {
      cssCodeSplit: false,
      minify: 'terser',
      assetsInlineLimit: 8192,
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