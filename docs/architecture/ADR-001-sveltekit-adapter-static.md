# ADR-001 — Use @sveltejs/adapter-static for GitHub Pages Deployment

**Date:** 2026-05-04  
**Status:** Approved  
**Deciders:** Architect Agent, Orchestrator  
**Input:** `docs/requirements/problem-statement.md`, `docs/PRD.md §5`

---

## Context

The application must be hosted on **GitHub Pages**, which is a static file hosting service. It does not support server-side execution (Node.js, Edge Functions, etc.). SvelteKit supports multiple adapters; the correct adapter must be chosen to produce a purely static output.

Additionally, the app is deployed to a GitHub Pages **subdirectory path** (e.g., `https://user.github.io/solataire-game-app/`) rather than the root domain, requiring proper base path configuration.

---

## Decision

Use `@sveltejs/adapter-static` as the sole SvelteKit adapter.

Configure `svelte.config.js` to set `paths.base` conditionally based on `NODE_ENV`:
- **Development:** base = `""` (empty, routes from root)
- **Production:** base = `"/solataire-game-app"` (repository name)

Place a `.nojekyll` file in the `static/` directory to prevent GitHub Pages from running Jekyll (which would hide `_app/` directories produced by SvelteKit).

---

## Consequences

| Aspect | Impact |
|---|---|
| **Positive** | Zero server costs; instant CDN delivery via GitHub CDN; no infra to maintain |
| **Positive** | Full prerendering at build time improves FCP and SEO |
| **Positive** | Service worker can cache the entire app shell predictably |
| **Negative** | No dynamic SSR; all routes must be statically pre-renderable |
| **Negative** | `+server.ts` API routes are not available; all logic must be client-side |
| **Mitigation** | All game logic runs in the browser engine; no API required |

---

## Configuration Reference

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      precompress: false,
    }),
    paths: {
      base: process.env.NODE_ENV === 'production' ? '/solataire-game-app' : '',
    },
    prerender: {
      handleHttpError: 'warn',
    },
  },
};
```

```
static/
└── .nojekyll    ← empty file; prevents Jekyll on GitHub Pages
```

---

## Security Considerations

- No server-side code means no server-side injection attack surface.
- Static files served by GitHub CDN — HTTPS enforced by default.
- Content Security Policy (CSP) header cannot be set server-side; must be added via `<meta http-equiv="Content-Security-Policy">` in `app.html`. Recommended CSP:
  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none';
  ```
  Note: `'unsafe-inline'` for styles is required by Svelte's scoped style injection; acceptable for this risk profile.

---

## Alternatives Considered

| Option | Reason Rejected |
|---|---|
| `@sveltejs/adapter-node` | Requires a Node.js server; not compatible with GitHub Pages |
| `@sveltejs/adapter-vercel` | Requires Vercel account; out-of-scope per PRD |
| `@sveltejs/adapter-cloudflare` | Requires Cloudflare Workers; out-of-scope per PRD |
