import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import node from '@astrojs/node';
import 'dotenv/config';

// Only use Cloudflare adapter when CF_PAGES=1 is set by Cloudflare Pages
const isCloudflarePages = process.env.CF_PAGES === '1';

export default defineConfig({
  output: 'server',
  adapter: isCloudflarePages ? cloudflare({
    imageService: 'compile',
    platformProxy: true,
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
        generateBundle(options, bundle) {
          // Replace require calls with proper polyfills for Cloudflare Workers
          for (const [fileName, chunk] of Object.entries(bundle)) {
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
      minify: false,
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