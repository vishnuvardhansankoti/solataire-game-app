# System Architecture
**Project:** Svelte-Solitaire PWA  
**Author:** Architect Agent  
**Date:** 2026-05-04  
**Version:** 1.0

---

## 1. High-Level Architecture

```mermaid
graph TD
    subgraph Browser
        subgraph SvelteKit_App["SvelteKit App (Client-Side Only)"]
            UI["UI Layer\n(Svelte Components)"]
            Store["Svelte Stores\n(gameState$, settings$)"]
            Engine["Game Engine\n(src/engine/)"]
            Storage["Storage Adapter\n(LocalStorageAdapter)"]
        end
        SW["Service Worker\n(Workbox - Generated)"]
        Cache["Cache Storage\n(App Shell + Assets)"]
        LS["localStorage\n(Game State + Settings)"]
    end

    subgraph Build_Pipeline["Build Pipeline (GitHub Actions)"]
        Vite["Vite + SvelteKit\nBuild"]
        StaticFiles["Static Files\n(build/)"]
    end

    subgraph Hosting["GitHub Pages CDN"]
        CDN["Static Files\n(HTML, JS, CSS, SVG)"]
    end

    User -->|"HTTPS request"| CDN
    CDN -->|"Serve files"| SW
    SW -->|"Cache hit"| Cache
    SW -->|"Serve to app"| UI
    UI <-->|"Reactive bindings"| Store
    Store <-->|"Read/write state"| Engine
    Engine <-->|"Load config JSON"| ConfigJSON["Game Config JSONs\n(bundled in build)"]
    Store <-->|"Persist/restore"| Storage
    Storage <-->|"Read/write"| LS
    Vite -->|"Output"| StaticFiles
    StaticFiles -->|"Deploy"| CDN
```

---

## 2. Component Tree

```mermaid
graph TD
    App["App.svelte (Root)"]
    App --> UpdateBanner["UpdateBanner.svelte\n(SW update notification)"]
    App --> InstallPrompt["InstallPrompt.svelte\n(PWA install banner)"]
    App --> Router["SvelteKit Router"]
    Router --> GamePage["+page.svelte (Game Route)"]
    GamePage --> Header["Header.svelte\n(Score, Timer, Buttons)"]
    GamePage --> GameBoard["GameBoard.svelte\n(Layout from config)"]
    GameBoard --> TopRow["PileRow.svelte (Top)"]
    GameBoard --> BottomRow["PileRow.svelte (Bottom - Tableau)"]
    TopRow --> StockPile["StockPile.svelte"]
    TopRow --> WastePile["WastePile.svelte"]
    TopRow --> Spacer["Spacer.svelte"]
    TopRow --> FoundationPile["FoundationPile.svelte ×4"]
    BottomRow --> TableauColumn["TableauColumn.svelte ×7"]
    TableauColumn --> Card["Card.svelte"]
    GamePage --> WinOverlay["WinOverlay.svelte"]
    GamePage --> SettingsPanel["SettingsPanel.svelte"]
    GamePage --> ConfirmDialog["ConfirmDialog.svelte"]
```

---

## 3. Game Engine Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Card as Card.svelte
    participant Store as gameState$ (Svelte store)
    participant Validator as MoveValidator
    participant StateMgr as StateManager
    participant Storage as LocalStorageAdapter

    User->>Card: tap / drag-drop
    Card->>Store: dispatch move attempt {from, to, cards}
    Store->>Validator: canMove(cards, fromPile, toPile, config)
    alt Move is valid
        Validator-->>Store: true
        Store->>StateMgr: applyMove(state, move)
        StateMgr-->>Store: newState (immutable)
        Store->>Storage: save("klondike", newState) [debounced 500ms]
        Store-->>Card: reactive update triggers re-render
    else Move is invalid
        Validator-->>Store: false
        Store-->>Card: spring-back animation (no state change)
    end
```

---

## 4. Service Worker Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Installing: Browser fetches SW script
    Installing --> Waiting: All assets pre-cached
    Waiting --> Active: No old SW / user triggers skipWaiting
    Active --> [*]: Browser closes tab

    Active --> Installing: New build deployed
    Installing --> Waiting: New SW ready
    Waiting --> ShowBanner: Existing SW still active
    ShowBanner --> Active: User clicks "Refresh"
```

---

## 5. Project Directory Structure

```
solataire-game-app/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── .copilot/                        ← Agent definitions
├── docs/
│   ├── PRD.md
│   ├── requirements/
│   ├── architecture/                ← ADRs + this file
│   ├── schema/
│   └── project-management/
├── src/
│   ├── app.html                     ← SvelteKit HTML template
│   ├── app.css                      ← Global CSS variables / reset
│   ├── routes/
│   │   ├── +layout.svelte           ← Root layout (SW registration)
│   │   └── +page.svelte             ← Main game page
│   ├── lib/
│   │   └── index.ts                 ← Re-exports for $lib alias
│   ├── engine/
│   │   ├── GameEngine.ts
│   │   ├── DeckFactory.ts
│   │   ├── MoveValidator.ts
│   │   ├── StateManager.ts
│   │   ├── WinDetector.ts
│   │   ├── AssetManager.ts
│   │   └── strategies/
│   │       ├── BuildRuleStrategy.ts
│   │       ├── registry.ts
│   │       ├── AscendingSameSuitStrategy.ts
│   │       ├── DescendingAlternatingColorStrategy.ts
│   │       ├── DescendingSameSuitStrategy.ts
│   │       ├── AnyStrategy.ts
│   │       └── NoneStrategy.ts
│   ├── storage/
│   │   ├── StorageAdapter.ts        ← Interface
│   │   └── LocalStorageAdapter.ts
│   ├── stores/
│   │   ├── gameState.ts             ← writable<GameState>
│   │   └── settings.ts              ← writable<Settings>
│   ├── components/
│   │   ├── GameBoard.svelte
│   │   ├── PileRow.svelte
│   │   ├── TableauColumn.svelte
│   │   ├── Card.svelte
│   │   ├── StockPile.svelte
│   │   ├── WastePile.svelte
│   │   ├── FoundationPile.svelte
│   │   ├── Header.svelte
│   │   ├── WinOverlay.svelte
│   │   ├── SettingsPanel.svelte
│   │   ├── ConfirmDialog.svelte
│   │   ├── InstallPrompt.svelte
│   │   └── UpdateBanner.svelte
│   ├── games/
│   │   └── klondike/
│   │       └── config.json
│   └── assets/
│       ├── suits/
│       │   ├── hearts.svg
│       │   ├── diamonds.svg
│       │   ├── clubs.svg
│       │   └── spades.svg
│       └── card-backs/
│           ├── classic-blue.svg
│           └── classic-red.svg
├── static/
│   ├── .nojekyll
│   ├── manifest.json
│   ├── icons/
│   └── screenshots/
├── tests/
│   ├── plans/
│   ├── unit/
│   └── e2e/
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
├── package.json
└── workflow-token.json
```

---

## 6. State Data Model

```mermaid
erDiagram
    GameState {
        string gameId
        string sessionId
        number schemaVersion
        number score
        number moves
        number elapsedSeconds
        string drawMode
    }
    Card {
        string suit
        number value
        boolean faceUp
    }
    MoveRecord {
        number scoreChange
    }
    PileReference {
        string type
        number index
    }
    GameState ||--o{ Card : "deck[]"
    GameState ||--o{ Card : "waste[]"
    GameState ||--o{ Card : "foundations[][]"
    GameState ||--o{ Card : "tableau[][]"
    GameState ||--o{ MoveRecord : "history[]"
    MoveRecord ||--|| PileReference : "from"
    MoveRecord ||--|| PileReference : "to"
    MoveRecord ||--o{ Card : "cards[]"
```

---

## 7. Security Architecture

| Surface | Threat | Control |
|---|---|---|
| localStorage deserialization | Stale/malformed JSON causing crash | `try/catch` + schema version check; discard on mismatch |
| JSON config loading | Malicious bundled config | Configs are static build-time assets; no runtime URL fetch |
| SVG asset loading | SVG XSS (injected scripts in SVG) | All SVGs are bundled at build time; CSP blocks inline scripts |
| Service Worker scope | Intercepting unintended origins | SW scope locked to `/solataire-game-app/` |
| Dependency supply chain | Malicious npm package | `npm ci` with lockfile; `npm audit` in CI pipeline |
| User input (card moves) | N/A (no text input surfaces) | No SQL/XSS injection risk from card game interactions |
