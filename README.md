# Solitaire Game App

A fully offline-capable Klondike Solitaire PWA built with SvelteKit, TypeScript, and Vite. Deployable to GitHub Pages via GitHub Actions.

## Features

- **Klondike Solitaire** — classic single-deck gameplay with Draw 1 and Draw 3 modes
- **Generic card game engine** — JSON-driven config makes it extensible to future game types
- **Progressive Web App** — installable, works offline after first load (Workbox cache-first strategy)
- **Undo support** — full move history with score reversal
- **Auto-save** — game state persists across page refreshes via localStorage
- **Keyboard shortcuts** — `Ctrl+N` new game, `Ctrl+Z` undo
- **Drag-and-drop + tap-to-select** — mouse and touch compatible
- **Accessible** — ARIA labels, live regions, keyboard navigation, focus management

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit 2 + TypeScript |
| Build | Vite 5 |
| PWA | vite-plugin-pwa (Workbox) |
| Adapter | @sveltejs/adapter-static |
| Unit tests | Vitest + jsdom |
| E2E tests | Playwright |
| CI/CD | GitHub Actions → GitHub Pages |

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm ci
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`.

### Build

```bash
npm run build
```

Output in `build/`.

### Preview production build

```bash
npm run preview
```

## Testing

```bash
# Unit tests (Vitest)
npm run test:unit

# Unit tests in watch mode
npm run test:unit:watch

# E2E tests (Playwright — requires build running)
npx playwright install  # first time only
npm run test:e2e
```

Coverage threshold: **≥ 90%** on engine files (enforced in CI).

## Project Structure

```
src/
  engine/           # Pure TS game engine (no DOM dependency)
    strategies/     # Build rule strategy implementations
  storage/          # LocalStorage adapter
  stores/           # Svelte writable stores
  games/klondike/   # Game config JSON
  components/       # Svelte UI components
  routes/           # SvelteKit pages
tests/
  unit/             # Vitest unit tests
  integration/      # Vitest integration tests
  e2e/              # Playwright E2E tests
  plans/            # Test plan
docs/
  PRD.md
  architecture/     # ADRs + system architecture
  schema/           # JSON Schemas for game config and state
  requirements/     # User stories and acceptance criteria
  project-management/
static/
  .nojekyll         # Prevents Jekyll on GitHub Pages
.github/workflows/
  deploy.yml        # CI/CD pipeline
```

## CI/CD

On every push to `main`:

1. `npm ci`
2. `npm run test:unit`
3. `npm run build`
4. Deploy to GitHub Pages

## Adding a New Game

1. Create `src/games/{gameId}/config.json` following `docs/schema/game-config.schema.json`
2. Register any new build rules in `src/engine/strategies/registry.ts`
3. Add a route or game selector entry pointing to the new config

## License

MIT
