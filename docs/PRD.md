# Product Requirements Document (PRD)
## Svelte-Solitaire — Progressive Web App

**Version:** 1.0  
**Date:** May 4, 2026  
**Author:** Product & Engineering Team  
**Status:** Draft

---

## Table of Contents

1. [Executive Summary & Vision](#1-executive-summary--vision)
2. [User Personas & User Stories](#2-user-personas--user-stories)
3. [Functional Requirements (Game Mechanics)](#3-functional-requirements-game-mechanics)
4. [Generic Card Game Engine](#4-generic-card-game-engine)
5. [PWA & Technical Requirements](#5-pwa--technical-requirements)
6. [Deployment Strategy (GitHub Pages)](#6-deployment-strategy-github-pages)
7. [UI/UX Requirements](#7-uiux-requirements)
8. [Success Metrics & Roadmap](#8-success-metrics--roadmap)

---

## 1. Executive Summary & Vision

### 1.1 Product Overview

| Attribute | Value |
|---|---|
| **App Name** | Svelte-Solitaire |
| **Game Type** | Classic Klondike Solitaire (with extensible card game engine) |
| **Primary Platform** | Web — Mobile-first Progressive Web App (PWA) |
| **Framework** | Svelte / SvelteKit |
| **Hosting** | GitHub Pages (static site) |
| **Offline Support** | Yes — via Service Worker |

### 1.2 Vision Statement

Svelte-Solitaire delivers a fast, lightweight, ad-free, and fully offline-capable Klondike Solitaire experience in the browser. Built on a **generic card game engine** driven by JSON configuration, the platform is designed to grow into a suite of classic card games without re-architecting the core.

### 1.3 Core Value Proposition

- **Zero installs, instant play** — loads in under 2 seconds on a 3G connection.
- **Offline-first** — playable without any network connectivity after first load.
- **Ad-free & privacy-respecting** — no trackers, no ads, no account required.
- **Extensible** — the JSON-driven game engine allows new card games to be added via configuration rather than code changes.
- **Lightweight** — minimal JavaScript bundle leveraging Svelte's compile-time optimizations.

### 1.4 Target Users

Casual card game players who want a distraction-free, instantly accessible solitaire experience on any device — especially in low/no connectivity environments (commutes, flights, rural areas).

---

## 2. User Personas & User Stories

### 2.1 User Personas

#### Persona 1 — The Casual Commuter (Maya, 31)
- **Context:** Takes the subway daily; connectivity is patchy underground.
- **Device:** Android smartphone.
- **Goals:** Kill time during a 20-minute commute; no sign-up friction.
- **Pain Points:** Ads that drain battery, games that require internet, apps that require installation.
- **Needs:** Instantly loadable, offline-capable, remembers her game in progress.

#### Persona 2 — The Offline Traveler (James, 47)
- **Context:** Frequently on long-haul flights with no Wi-Fi.
- **Device:** iPad.
- **Goals:** Play full sessions for 1–2 hours; wants undo and scoring.
- **Pain Points:** Games that don't save progress, no undo, cluttered UIs.
- **Needs:** Persistent game state, undo history, clean UI on a large tablet screen.

#### Persona 3 — The Desktop Power User (Priya, 26)
- **Context:** Developer who plays solitaire during short breaks at work.
- **Device:** Laptop with a 1440p monitor.
- **Goals:** Quick game sessions; keyboard/mouse efficiency.
- **Pain Points:** Mobile-only UIs that feel cramped on desktop.
- **Needs:** Responsive layout that scales to large screens, drag-and-drop support, keyboard shortcuts.

---

### 2.2 User Stories

| ID | As a… | I want to… | So that… | Priority |
|---|---|---|---|---|
| US-01 | Player | start a new game with a single tap/click | I can play immediately without configuration. | P0 |
| US-02 | Player | undo my last move | I can correct a mistake without restarting the game. | P0 |
| US-03 | Player | have my game automatically saved | I can resume exactly where I left off after closing the browser. | P0 |
| US-04 | Player | play the game offline | I can enjoy solitaire without an internet connection. | P0 |
| US-05 | Player | install the app to my home screen | I can access it like a native app without visiting a URL. | P1 |
| US-06 | Player | see my current score and time elapsed | I can track my performance during a session. | P1 |
| US-07 | Player | drag and drop cards between piles | I can interact naturally with the cards. | P1 |
| US-08 | Player | tap a card to auto-move it to a valid foundation or tableau | I can play quickly on a touchscreen without precise dragging. | P1 |
| US-09 | Player | see a win animation when I complete the game | The victory feels rewarding and satisfying. | P2 |
| US-10 | Player | switch between different card game types (e.g., FreeCell) | I can enjoy variety within the same app. | P2 |
| US-11 | Accessibility User | navigate and play using a keyboard only | I can use the game without a pointer device. | P2 |
| US-12 | Developer | add a new card game via a JSON config file | I can extend the platform without modifying core engine code. | P2 |

---

## 3. Functional Requirements (Game Mechanics)

### 3.1 Game Logic — Klondike Rules

#### 3.1.1 Card Movement Rules

| Move Type | Rule |
|---|---|
| **Tableau → Tableau** | Cards must be placed in descending order (K → A) with alternating colors (red/black). Only Kings (or stacks headed by a King) may be placed on an empty tableau column. |
| **Tableau → Foundation** | Cards are placed in ascending order (A → K) by suit. Only an Ace may start a foundation pile. |
| **Waste → Tableau** | Top card of the waste pile may be moved to a valid tableau column. |
| **Waste → Foundation** | Top card of the waste pile may be moved to the correct foundation pile. |
| **Stock → Waste** | Clicking the stock flips one card (or three in draw-3 mode) to the waste pile. When stock is empty, clicking resets it from the waste pile. |
| **Foundation → Tableau** | Allowed (to support undo and strategy). |

#### 3.1.2 Win Condition

All 52 cards are placed face-up on the four foundation piles, each containing 13 cards of the same suit in ascending order (A–K).

---

### 3.2 GameState Management

The game state must fully capture and restore any point in a game session.

#### 3.2.1 State Shape (TypeScript Interface)

```typescript
interface GameState {
  gameId: string;           // Unique game type identifier (e.g., "klondike")
  sessionId: string;        // UUID for the current game session
  deck: Card[];             // Remaining stock pile
  waste: Card[];            // Waste pile (face-up drawn cards)
  foundations: Card[][];    // 4 foundation piles, indexed 0–3
  tableau: Card[][];        // N tableau columns (N defined by JSON config)
  score: number;            // Current score
  moves: number;            // Total move count
  elapsedSeconds: number;   // Time elapsed in current session
  history: MoveRecord[];    // Undo history stack
  drawMode: 1 | 3;          // Draw-1 or Draw-3 mode
}

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
  faceUp: boolean;
}

interface MoveRecord {
  from: PileReference;
  to: PileReference;
  cards: Card[];
  scoreChange: number;
}

interface PileReference {
  type: 'stock' | 'waste' | 'foundation' | 'tableau';
  index?: number;
}
```

---

### 3.3 Features

#### 3.3.1 Undo Functionality
- **Requirement:** Unlimited undo within a session (bound by history stack size).
- Every valid move pushes a `MoveRecord` to `history[]`.
- Undo pops the last record and reverses the move atomically.
- Score is decremented by the `scoreChange` of the undone move.
- The undo button is disabled when `history[]` is empty.

#### 3.3.2 Score Tracking

| Event | Score Change |
|---|---|
| Waste → Tableau | +5 |
| Waste → Foundation | +10 |
| Tableau → Foundation | +10 |
| Foundation → Tableau | −15 |
| Flip a tableau card face-up | +5 |
| Undo a move | Reverses the associated score change |
| Time penalty (draw-1 mode) | −2 every 10 seconds after 30 seconds |

#### 3.3.3 Win Animation
- Triggered when all four foundations reach 13 cards.
- Implementation: Use `svelte/tweens` and `svelte/transitions` to animate cards cascading off the foundations (classic "bouncing cards" effect).
- A "You Win!" overlay with final score, time, and move count is displayed.
- Buttons offered: **Play Again** | **Share Score** (Web Share API).

#### 3.3.4 New Game
- A **New Game** button is always accessible in the header.
- Tapping it prompts a confirmation dialog if a game is in progress (more than 5 moves made).
- On confirmation, the current `GameState` is cleared from localStorage and a fresh shuffled deck is generated.

#### 3.3.5 Draw Mode Selection
- Players can choose **Draw 1** or **Draw 3** from the settings panel before starting a new game.
- Default: Draw 1.

#### 3.3.6 Auto-Complete
- When all remaining cards are face-up and no stock remains, an **Auto-Complete** button appears.
- Activating it animates all remaining cards to their foundations automatically.

---

## 4. Generic Card Game Engine

This is a foundational architectural requirement enabling the app to host multiple card games beyond Klondike.

### 4.1 JSON Game Configuration Schema

Each game type is defined by a JSON configuration file stored at `src/games/{gameId}/config.json`.

```json
{
  "$schema": "https://svelte-solitaire.app/schemas/game-config.v1.json",
  "gameId": "klondike",
  "displayName": "Klondike Solitaire",
  "version": "1.0.0",
  "decks": 1,
  "suits": ["hearts", "diamonds", "clubs", "spades"],
  "cardValues": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  "piles": {
    "stock": { "count": 1, "initialCards": "remaining", "faceUp": false },
    "waste": { "count": 1, "initialCards": 0, "faceUp": true },
    "foundations": {
      "count": 4,
      "initialCards": 0,
      "buildRule": "ascending-same-suit",
      "startsWith": 1
    },
    "tableau": {
      "count": 7,
      "initialCards": "cascading",
      "topCardFaceUp": true,
      "buildRule": "descending-alternating-color"
    }
  },
  "drawMode": {
    "options": [1, 3],
    "default": 1
  },
  "winCondition": {
    "type": "all-to-foundations"
  },
  "scoring": {
    "wasteToTableau": 5,
    "wasteToFoundation": 10,
    "tableauToFoundation": 10,
    "foundationToTableau": -15,
    "flipCard": 5,
    "timePenaltyInterval": 10,
    "timePenaltyAmount": 2,
    "timePenaltyGracePeriod": 30
  },
  "layout": {
    "type": "klondike-standard",
    "topRow": ["stock", "waste", "gap", "foundation", "foundation", "foundation", "foundation"],
    "bottomRows": ["tableau"]
  },
  "assets": {
    "cardBack": "classic-blue",
    "cardFaceTheme": "standard"
  }
}
```

#### 4.1.1 Build Rule Reference

| Rule ID | Description |
|---|---|
| `ascending-same-suit` | Next card must be one rank higher and same suit (Foundation) |
| `descending-alternating-color` | Next card must be one rank lower and opposite color (Klondike Tableau) |
| `descending-same-suit` | Next card must be one rank lower and same suit (Spider) |
| `any` | Any card can be placed (e.g., empty FreeCell column) |
| `none` | No cards can be placed |

---

### 4.2 Rule Strategy Engine

**Requirement:** All move validation logic must be decoupled from component code and driven by the loaded JSON config.

#### 4.2.1 Architecture

```
src/
└── engine/
    ├── GameEngine.ts          # Orchestrator: loads config, delegates to strategies
    ├── MoveValidator.ts       # Evaluates move legality via BuildRuleStrategy
    ├── StateManager.ts        # Mutates GameState; handles undo stack
    ├── DeckFactory.ts         # Shuffles and distributes cards per config
    ├── WinDetector.ts         # Evaluates win conditions from config
    └── strategies/
        ├── BuildRuleStrategy.ts           # Interface
        ├── AscendingSameSuitStrategy.ts
        ├── DescendingAlternatingColorStrategy.ts
        ├── DescendingSameSuitStrategy.ts
        └── AnyStrategy.ts
```

#### 4.2.2 `MoveValidator` Interface

```typescript
interface MoveValidator {
  canMove(cards: Card[], fromPile: Pile, toPile: Pile, config: GameConfig): boolean;
  getValidMoves(state: GameState, config: GameConfig): Move[];
  getHints(state: GameState, config: GameConfig): Move[];
}
```

#### 4.2.3 `BuildRuleStrategy` Interface

```typescript
interface BuildRuleStrategy {
  ruleId: string;
  isValidPlacement(card: Card, topCard: Card | null, pile: Pile): boolean;
}
```

The `GameEngine` selects the correct strategy at runtime by matching `buildRule` strings in the JSON config to registered strategy instances via a strategy registry (factory pattern).

---

### 4.3 Dynamic Layout Component

**Requirement:** A single Svelte layout component must render any pile layout described in the JSON config's `layout` object — no hard-coded Klondike assumptions.

#### 4.3.1 Component Hierarchy

```
<GameBoard config={gameConfig} state={gameState}>
  <PileRow>
    {#each config.layout.topRow as pileKey}
      {#if pileKey === 'gap'}
        <Spacer />
      {:else}
        <Pile type={pileKey} cards={getPile(state, pileKey)} />
      {/if}
    {/each}
  </PileRow>
  <PileRow>
    {#each state.tableau as column, i}
      <TableauColumn cards={column} index={i} />
    {/each}
  </PileRow>
</GameBoard>
```

#### 4.3.2 Responsive Grid Rules

| Breakpoint | Layout Behavior |
|---|---|
| < 480px (mobile) | Cards scale to fill viewport width; tableau uses compact vertical offset |
| 480–768px (tablet portrait) | Standard card size; full tableau visible without horizontal scroll |
| 768–1280px (tablet landscape / laptop) | Cards larger; layout centered with max-width constraint |
| > 1280px (desktop) | Max card size; layout centered; side panels may show stats |

---

### 4.4 State Persistence (Multi-Game)

**Requirement:** `localStorage` must support saving and resuming multiple different game types simultaneously.

#### 4.4.1 Storage Schema

```
localStorage key: `svelte-solitaire:state:{gameId}`
localStorage key: `svelte-solitaire:settings`
localStorage key: `svelte-solitaire:highscores`
```

Each game state is stored under its own namespaced key using `gameId`.

#### 4.4.2 Serialization

- State is serialized to JSON on every valid move (debounced at 500ms to avoid thrashing).
- On app load, the engine checks for a stored state matching the selected `gameId` and offers the user the option to **Resume** or **New Game**.
- Corrupted or schema-version-mismatched states are silently discarded, and a new game is started.

#### 4.4.3 Future: IndexedDB via Dexie.js

For larger state payloads (multi-deck games), `localStorage` may be supplemented with IndexedDB using Dexie.js. The persistence layer must be abstracted behind a `StorageAdapter` interface so the backing store can be swapped without changing game logic.

```typescript
interface StorageAdapter {
  save(gameId: string, state: GameState): Promise<void>;
  load(gameId: string): Promise<GameState | null>;
  clear(gameId: string): Promise<void>;
  listSavedGames(): Promise<string[]>;
}
```

---

### 4.5 Asset Manager

**Requirement:** A central asset manager must map JSON-defined card suits and values to SVG or CSS card face renderings.

#### 4.5.1 Asset Resolution

```typescript
interface AssetManager {
  getCardFace(card: Card, theme: string): string;  // Returns SVG URL or CSS class
  getCardBack(theme: string): string;
  getSuitSymbol(suit: string): string;             // SVG string for the suit icon
  preloadTheme(theme: string): Promise<void>;
}
```

#### 4.5.2 Card Face Themes

| Theme ID | Description | Format |
|---|---|---|
| `standard` | Classic USPC-style card faces | Inline SVG |
| `minimal` | Flat design, colored suit symbols | CSS + SVG |
| `large-print` | High-contrast, oversized rank/suit | CSS |

#### 4.5.3 Requirements
- All card face SVGs must be bundled at build time (not fetched at runtime) to ensure offline playability.
- The asset manager caches resolved assets in a `Map<string, string>` to avoid redundant lookups.
- Custom suits defined in a game JSON config (e.g., for a themed deck) must be mapped to a file path convention: `src/assets/suits/{suitName}.svg`.

---

## 5. PWA & Technical Requirements

### 5.1 Technology Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit |
| Adapter | `@sveltejs/adapter-static` |
| Language | TypeScript |
| Styling | CSS Custom Properties + Scoped Svelte styles |
| Animations | `svelte/tweens`, `svelte/transition`, `svelte/motion` |
| Persistence | `localStorage` (primary), Dexie.js / IndexedDB (future) |
| PWA | Service Worker (Workbox via `vite-plugin-pwa`) |
| Testing | Vitest (unit), Playwright (E2E) |
| Bundler | Vite |

---

### 5.2 Static Generation

- **Adapter:** `@sveltejs/adapter-static` must be configured as the sole SvelteKit adapter.
- **Output Directory:** `build/` — this is the directory deployed to GitHub Pages.
- **Prerendering:** All routes must be prerendered to static HTML at build time.
- **Base Path:** The `base` path in `svelte.config.js` must be set to the GitHub Pages repository path (e.g., `/solataire-game-app`) to ensure all asset URLs resolve correctly in the subdirectory deployment.

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
    }),
    paths: {
      base: process.env.NODE_ENV === 'production' ? '/solataire-game-app' : '',
    },
  },
};
```

---

### 5.3 Offline Capability — Service Worker

**Tool:** `vite-plugin-pwa` (wraps Workbox).

#### 5.3.1 Caching Strategy

| Asset Type | Strategy | Details |
|---|---|---|
| App Shell (HTML, JS, CSS) | Cache-First | Cached on install; updated on new deployment |
| Card SVG Assets | Cache-First | Cached on install; versioned filenames |
| Game Config JSON | Cache-First | Cached on install |
| Google Fonts (if any) | Stale-While-Revalidate | Network fallback to cache |
| Runtime API calls | Network-First | N/A (app is fully static) |

#### 5.3.2 Service Worker Lifecycle
- **Install:** Pre-cache all app shell assets listed in the Workbox manifest.
- **Activate:** Delete outdated caches from previous versions.
- **Update Flow:** Display a non-blocking "Update available — reload to get the latest version" banner when a new service worker is waiting.

#### 5.3.3 Offline UX
- The app must be fully playable offline after first load with zero degradation.
- If the user is offline and the service worker is not yet installed (first visit), display a graceful offline notice.

---

### 5.4 Web App Manifest

**File:** `static/manifest.json`

```json
{
  "name": "Svelte-Solitaire",
  "short_name": "Solitaire",
  "description": "A fast, offline-capable Klondike Solitaire Progressive Web App.",
  "start_url": "/solataire-game-app/",
  "scope": "/solataire-game-app/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#1a6b3a",
  "theme_color": "#1a6b3a",
  "categories": ["games", "entertainment"],
  "icons": [
    { "src": "/solataire-game-app/icons/icon-72.png",   "sizes": "72x72",   "type": "image/png" },
    { "src": "/solataire-game-app/icons/icon-96.png",   "sizes": "96x96",   "type": "image/png" },
    { "src": "/solataire-game-app/icons/icon-128.png",  "sizes": "128x128", "type": "image/png" },
    { "src": "/solataire-game-app/icons/icon-144.png",  "sizes": "144x144", "type": "image/png" },
    { "src": "/solataire-game-app/icons/icon-152.png",  "sizes": "152x152", "type": "image/png" },
    { "src": "/solataire-game-app/icons/icon-192.png",  "sizes": "192x192", "type": "image/png", "purpose": "maskable any" },
    { "src": "/solataire-game-app/icons/icon-384.png",  "sizes": "384x384", "type": "image/png" },
    { "src": "/solataire-game-app/icons/icon-512.png",  "sizes": "512x512", "type": "image/png", "purpose": "maskable any" }
  ],
  "screenshots": [
    { "src": "/solataire-game-app/screenshots/mobile.png", "sizes": "390x844", "type": "image/png", "form_factor": "narrow" },
    { "src": "/solataire-game-app/screenshots/desktop.png", "sizes": "1280x800", "type": "image/png", "form_factor": "wide" }
  ]
}
```

---

### 5.5 Performance Requirements

| Metric | Target |
|---|---|
| Lighthouse Performance Score | ≥ 90 |
| Lighthouse PWA Score | 100 |
| First Contentful Paint (FCP) | < 1.5s on 3G |
| Time to Interactive (TTI) | < 3s on 3G |
| Total JS Bundle (gzipped) | < 100 KB |
| Total Initial Page Weight | < 500 KB |

---

## 6. Deployment Strategy (GitHub Pages)

### 6.1 Repository Structure

```
solataire-game-app/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD pipeline
├── src/
│   ├── routes/
│   ├── engine/
│   ├── components/
│   ├── games/
│   │   └── klondike/
│   │       └── config.json
│   ├── assets/
│   └── lib/
├── static/
│   ├── manifest.json
│   ├── .nojekyll               # Prevents Jekyll processing on GitHub Pages
│   └── icons/
├── svelte.config.js
├── vite.config.ts
└── package.json
```

### 6.2 `.nojekyll` File

- A `.nojekyll` file **must** exist in the `static/` directory (copied to build root at build time).
- This prevents GitHub Pages from running Jekyll, which would otherwise ignore directories starting with `_` (such as `_app/`, which SvelteKit outputs).

### 6.3 GitHub Actions CI/CD Pipeline

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Build
        run: npm run build
        env:
          NODE_ENV: production

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: build/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 6.4 Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production — triggers auto-deployment to GitHub Pages |
| `develop` | Integration branch for feature work |
| `feature/*` | Individual feature branches |
| `fix/*` | Bug fix branches |

### 6.5 Environment Configuration

| Variable | Dev Value | Production Value |
|---|---|---|
| `NODE_ENV` | `development` | `production` |
| `BASE_PATH` | `` (empty) | `/solataire-game-app` |

---

## 7. UI/UX Requirements

### 7.1 Design Principles

- **Mobile-first:** Design breakpoints start at 320px; desktop is an enhancement.
- **Touch-native:** Primary interaction is tap/swipe on mobile; drag-and-drop is enhanced for desktop.
- **Clarity over density:** Card values and suits must be legible on small screens without zooming.
- **Performance-first aesthetics:** Animations must use CSS transforms and Svelte tweens only — no layout-thrashing JavaScript animations.

---

### 7.2 Visual Design

#### 7.2.1 Color Palette

| Token | Value | Usage |
|---|---|---|
| `--color-felt` | `#1a6b3a` | Game table background |
| `--color-felt-dark` | `#145530` | Pile outline / empty pile placeholder |
| `--color-card-bg` | `#ffffff` | Card face background |
| `--color-card-border` | `#d0d0d0` | Card border |
| `--color-red-suit` | `#cc0000` | Hearts, Diamonds |
| `--color-black-suit` | `#111111` | Clubs, Spades |
| `--color-ui-bg` | `#0f4f2a` | Header / UI chrome background |
| `--color-ui-text` | `#f0f0f0` | Header text |
| `--color-accent` | `#f5c518` | Buttons, highlights |

#### 7.2.2 Typography

- **Card ranks/suits:** System monospace font or a bundled condensed font optimized for small sizes.
- **UI text:** System sans-serif stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`).

---

### 7.3 Interaction Model

#### 7.3.1 Drag-and-Drop (Desktop / Tablet)
- Implemented using the HTML5 Drag and Drop API with Svelte event wrappers.
- A card (or stack of cards) becomes draggable when `mousedown` / `touchstart` is detected.
- Valid drop targets highlight with a visible border/glow when a valid card is hovering.
- Invalid drops return the card to its origin with a spring-back animation (`svelte/spring`).

#### 7.3.2 Tap-to-Move (Mobile)
- **Single tap on a face-down card:** Flip it face-up (if it's the top card of a tableau column).
- **Single tap on a face-up card:** Select it (and any cards below it in the tableau). A selection highlight ring appears.
- **Single tap on a destination pile:** If the selected card(s) can legally be placed, execute the move with animation.
- **Single tap on stock:** Draw card(s) to waste pile.
- **Double-tap on a card:** Attempt auto-move to the best valid destination (foundation first, then tableau).

#### 7.3.3 Hint System
- A **Hint** button in the UI calls `MoveValidator.getHints()` and briefly highlights the card and its valid destination with a pulsing animation.
- Maximum 3 hints per game session (to preserve challenge). Hint count persists across undo.

---

### 7.4 Header / HUD Layout

```
[ ☰ Menu ]  [Score: 450]  [Moves: 34]  [⏱ 04:22]  [↩ Undo]  [💡 Hint]  [+ New]
```

- On mobile (< 480px), the HUD collapses to show only Score and a hamburger menu that reveals Undo, Hint, and New Game.

---

### 7.5 Accessibility (A11y)

| Requirement | Standard | Implementation |
|---|---|---|
| All interactive cards must have `role="button"` and `tabindex="0"` | WCAG 2.1 AA | Svelte component template |
| Cards must have descriptive `aria-label` (e.g., "Ace of Spades, face up") | WCAG 1.1.1 | Dynamic `aria-label` binding |
| Keyboard navigation: Tab to focus, Space/Enter to select/move | WCAG 2.1.1 | Keyboard event handlers |
| Color must not be the only means of conveying suit (shape symbol required) | WCAG 1.4.1 | Suit SVG symbols always visible |
| Minimum touch target size: 44×44px | WCAG 2.5.5 | CSS `min-width/min-height` |
| Motion animations must respect `prefers-reduced-motion` | WCAG 2.3.3 | CSS media query + Svelte transition guard |
| Contrast ratio ≥ 4.5:1 for text on cards | WCAG 1.4.3 | Verified via design tokens |

---

### 7.6 Settings Panel

Accessible via the hamburger menu. Settings are persisted to `localStorage` under `svelte-solitaire:settings`.

| Setting | Options | Default |
|---|---|---|
| Draw Mode | Draw 1 / Draw 3 | Draw 1 |
| Card Back Design | Classic Blue / Classic Red / Green | Classic Blue |
| Card Face Theme | Standard / Minimal / Large Print | Standard |
| Animation Speed | Off / Normal / Fast | Normal |
| Sound Effects | On / Off | Off |
| Auto-Complete Prompt | On / Off | On |

---

## 8. Success Metrics & Roadmap

### 8.1 Key Performance Indicators (KPIs)

#### 8.1.1 Technical KPIs

| KPI | Target | Measurement Method |
|---|---|---|
| Lighthouse Performance Score | ≥ 90 | Automated in CI via `lighthouse-ci` |
| Lighthouse PWA Score | 100 | Automated in CI |
| First Contentful Paint | < 1.5s (3G throttled) | Lighthouse / Web Vitals |
| Time to Interactive | < 3.0s (3G throttled) | Lighthouse |
| JS Bundle Size (gzipped) | < 100 KB | Vite bundle analyzer |
| Offline Test Pass Rate | 100% | Playwright offline E2E tests |

#### 8.1.2 User Engagement KPIs

| KPI | Target | Measurement Method |
|---|---|---|
| PWA Install Rate | ≥ 15% of returning visitors | `beforeinstallprompt` event counter (anonymous, local) |
| Session Length (median) | ≥ 8 minutes | `visibilitychange` timing (stored locally) |
| Game Completion Rate | ≥ 20% of started games | Win event counter (stored locally) |
| Return Visit Rate | ≥ 40% within 7 days | Service worker `activate` event counter |
| Undo Usage Rate | Tracked per session | Move history length at session end |

> **Privacy Note:** All analytics are computed and stored locally (localStorage). No data is transmitted to external servers.

---

### 8.2 Development Roadmap

#### Phase 1 — MVP (Weeks 1–4)

**Goal:** Playable Klondike Solitaire on mobile and desktop, deployed to GitHub Pages.

| # | Feature | Priority |
|---|---|---|
| 1.1 | SvelteKit project scaffold with `adapter-static` and GitHub Pages base path | P0 |
| 1.2 | Card data model and deck factory (shuffle, deal Klondike layout) | P0 |
| 1.3 | Klondike JSON config + GameEngine integration | P0 |
| 1.4 | GameBoard component: stock, waste, foundations, tableau render | P0 |
| 1.5 | Move validation (Rule Strategy Engine, Klondike rules) | P0 |
| 1.6 | Tap-to-select and tap-to-move interaction | P0 |
| 1.7 | Undo functionality with history stack | P0 |
| 1.8 | New Game and game reset | P0 |
| 1.9 | localStorage state persistence and resume | P0 |
| 1.10 | `manifest.json` and basic Service Worker (offline shell) | P0 |
| 1.11 | `.nojekyll` and GitHub Actions deploy pipeline | P0 |
| 1.12 | Win detection | P0 |

**MVP Exit Criteria:** A complete game of Klondike can be played, saved, resumed, and won on a mobile browser — fully offline.

---

#### Phase 2 — Feature Complete (Weeks 5–8)

**Goal:** Full-featured experience with polished interactions and multi-game engine.

| # | Feature | Priority |
|---|---|---|
| 2.1 | Drag-and-drop interaction (desktop/tablet) | P1 |
| 2.2 | Score tracking system with all scoring rules | P1 |
| 2.3 | Timer (elapsed time display, time-based scoring penalty) | P1 |
| 2.4 | Draw-3 mode | P1 |
| 2.5 | Auto-complete feature | P1 |
| 2.6 | Hint system (up to 3 per game) | P1 |
| 2.7 | Settings panel (draw mode, card back, theme, animation speed) | P1 |
| 2.8 | PWA install prompt UI | P1 |
| 2.9 | Full Workbox offline caching strategy | P1 |
| 2.10 | Service worker update banner | P1 |
| 2.11 | Accessibility audit and fixes (keyboard nav, ARIA labels) | P1 |
| 2.12 | Dynamic layout component (ready for multi-game support) | P1 |

---

#### Phase 3 — Polish & Expansion (Weeks 9–14)

**Goal:** Delightful user experience, second game type, performance hardening.

| # | Feature | Priority |
|---|---|---|
| 3.1 | Win animation (cascading cards with Svelte tweens) | P2 |
| 3.2 | Card face themes: Minimal, Large Print | P2 |
| 3.3 | Second game type via JSON config (e.g., FreeCell or Spider Solitaire) | P2 |
| 3.4 | High score / personal best tracking (localStorage) | P2 |
| 3.5 | Web Share API integration (share final score) | P2 |
| 3.6 | Sound effects (optional, respect user setting) | P2 |
| 3.7 | E2E test suite (Playwright) for all critical user flows | P2 |
| 3.8 | Lighthouse CI gate in GitHub Actions (fail build if score < 90) | P2 |
| 3.9 | IndexedDB / Dexie.js storage adapter (multi-game state at scale) | P2 |
| 3.10 | `prefers-color-scheme` dark mode support | P2 |

---

## Appendix A — Open Questions

| ID | Question | Owner | Status |
|---|---|---|---|
| OQ-01 | Should the app support user-created game configs (upload JSON)? | Product | Open |
| OQ-02 | Is a leaderboard / cloud sync desired in a future phase? | Product | Open |
| OQ-03 | What is the minimum supported browser version (Safari iOS 15+)? | Engineering | Open |
| OQ-04 | Should analytics ever be opt-in reported (e.g., to a privacy-preserving backend)? | Product | Open |
| OQ-05 | Localization / i18n requirement for Phase 1 or later? | Product | Open |

---

## Appendix B — Glossary

| Term | Definition |
|---|---|
| **Tableau** | The main playing area consisting of columns of cards |
| **Foundation** | The four target piles where cards are built up by suit from Ace to King |
| **Stock** | The face-down draw pile |
| **Waste Pile** | Cards drawn from the stock that haven't been played yet |
| **PWA** | Progressive Web App — a web app with native-app capabilities (offline, installable) |
| **Service Worker** | A browser background script enabling offline caching and push notifications |
| **Workbox** | Google's library for simplifying service worker and caching strategies |
| **gameId** | A unique string identifier for a game type, used as a namespacing key throughout the engine |
| **SvelteKit** | A full-stack Svelte framework with routing, SSR, and static generation |
| **adapter-static** | SvelteKit adapter that outputs a fully static site (HTML/CSS/JS) |

---

*Document End — Svelte-Solitaire PRD v1.0*
