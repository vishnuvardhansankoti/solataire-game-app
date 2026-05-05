# ADR-003 — PWA Service Worker via vite-plugin-pwa (Workbox)

**Date:** 2026-05-04  
**Status:** Approved  
**Deciders:** Architect Agent, Orchestrator  
**Input:** `docs/requirements/user-stories-pwa-offline.md`, `docs/PRD.md §5.3`

---

## Context

The app must be a fully installable Progressive Web App with complete offline support. This requires:

1. A **Service Worker** that pre-caches all app shell assets on install.
2. A **Web App Manifest** linked in `app.html`.
3. An **update notification flow** when a new version is deployed.
4. Integration with the **Vite build pipeline** (SvelteKit uses Vite under the hood).

Writing a service worker from scratch introduces maintenance burden and caching edge-case bugs. A well-tested library is preferred.

---

## Decision

Use **`vite-plugin-pwa`** as the Vite plugin that wraps **Workbox** to:
- Auto-generate the service worker during `npm run build`.
- Inject the Workbox asset manifest from Vite's build output (hashed filenames → cache busting).
- Configure caching strategies declaratively in `vite.config.ts`.

### Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    sveltekit(),
    VitePWA({
      registerType: 'prompt',        // Show update banner; do not auto-reload
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
        start_url: '/solataire-game-app/',
        scope: '/solataire-game-app/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable any' },
        ],
      },
    }),
  ],
});
```

### Update Flow (registerType: 'prompt')

```
New SW waiting detected
        ↓
App dispatches 'swUpdate' custom event
        ↓
UpdateBanner.svelte renders non-blocking banner
        ↓
User clicks "Refresh"
        ↓
skipWaiting() called → new SW activates → page reloads
```

---

## Caching Strategy Matrix

| Asset Type | Workbox Strategy | Cache Name | TTL |
|---|---|---|---|
| App Shell (HTML/JS/CSS) | `CacheFirst` (precache) | `workbox-precache` | Until new build |
| Card SVG assets | `CacheFirst` | `card-assets` | 365 days |
| Game config JSON | `CacheFirst` (precache) | `workbox-precache` | Until new build |
| Icons / images | `CacheFirst` | `card-assets` | 365 days |

---

## Consequences

| Aspect | Impact |
|---|---|
| **Positive** | Workbox is battle-tested; handles cache versioning automatically |
| **Positive** | Auto-generates SW from Vite manifest — no manual asset listing |
| **Positive** | `registerType: 'prompt'` gives user control over updates |
| **Negative** | Adds ~`vite-plugin-pwa` to dev dependencies; minimal bundle impact (SW generated separately) |
| **Positive** | SW file is excluded from the main JS bundle |

---

## Security Considerations

- `navigateFallback` is set to `404.html` (not the app root) to prevent serving stale cached HTML for unknown routes.
- `cleanupOutdatedCaches: true` prevents indefinite storage growth.
- The service worker scope is restricted to `/solataire-game-app/` — cannot intercept other origins.
- No `importScripts()` from external CDNs in the generated SW.

---

## Alternatives Considered

| Option | Reason Rejected |
|---|---|
| Handwritten service worker | High maintenance; common edge-case bugs (cache staleness, update loops) |
| `@ducanh2912/next-pwa` | Next.js-specific; incompatible with SvelteKit |
| No service worker (no offline) | Violates AC-05 (offline gameplay) — non-negotiable |
