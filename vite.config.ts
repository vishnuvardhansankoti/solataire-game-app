import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    sveltekit(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,json,webp,png,ico}'],
        navigateFallback: '/solataire-game-app/404.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /\.(?:svg|png|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'card-assets',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      manifest: {
        name: 'Svelte-Solitaire',
        short_name: 'Solitaire',
        description: 'A fast, offline-capable Klondike Solitaire PWA.',
        theme_color: '#1a6b3a',
        background_color: '#1a6b3a',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/solataire-game-app/',
        scope: '/solataire-game-app/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable any' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      thresholds: { branches: 90, functions: 90, lines: 90, statements: 90 },
    },
  },
});
