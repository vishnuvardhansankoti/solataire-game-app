# ADR-002 — Generic Card Game Engine with JSON Config and Strategy Pattern

**Date:** 2026-05-04  
**Status:** Approved  
**Deciders:** Architect Agent, Orchestrator  
**Input:** `docs/requirements/user-stories-game-engine.md`, `docs/PRD.md §4`

---

## Context

The PRD requires a "generic card game engine capable of loading multiple game types via JSON configuration." The initial game is Klondike Solitaire, but the architecture must support adding FreeCell, Spider, or other variants purely by adding a new JSON config file — without modifying the engine's TypeScript source code.

This requires:
1. A declarative **JSON configuration schema** describing a game's rules and layout.
2. A **Strategy pattern** for pluggable move-validation rules.
3. A **runtime registry** mapping rule ID strings (from JSON) to strategy instances.
4. A **dynamic layout renderer** that reads the config's layout object.

---

## Decision

Implement the engine as a pure TypeScript module at `src/engine/` using the **Strategy Pattern** for rule validation and a **factory/registry** for strategy resolution.

### Module Boundaries

```
src/engine/
├── GameEngine.ts          # Orchestrator: load config → initialize state → expose actions
├── DeckFactory.ts         # Create and shuffle deck(s); deal initial state per config
├── MoveValidator.ts       # Validate moves using strategy registry + config
├── StateManager.ts        # Immutable state transitions; undo stack management
├── WinDetector.ts         # Poll win condition defined in config
├── AssetManager.ts        # Resolve card face/back SVG paths from config theme
└── strategies/
    ├── BuildRuleStrategy.ts              # Interface (contract)
    ├── AscendingSameSuitStrategy.ts      # Foundations (Klondike, FreeCell)
    ├── DescendingAlternatingColorStrategy.ts  # Tableau (Klondike)
    ├── DescendingSameSuitStrategy.ts     # Tableau (Spider)
    └── AnyStrategy.ts                    # Empty column accepts anything
```

### Strategy Registry

```typescript
// src/engine/strategies/registry.ts
const strategyRegistry: Record<string, BuildRuleStrategy> = {
  'ascending-same-suit':           new AscendingSameSuitStrategy(),
  'descending-alternating-color':  new DescendingAlternatingColorStrategy(),
  'descending-same-suit':          new DescendingSameSuitStrategy(),
  'any':                           new AnyStrategy(),
  'none':                          new NoneStrategy(),
};

export function getStrategy(ruleId: string): BuildRuleStrategy {
  const strategy = strategyRegistry[ruleId];
  if (!strategy) throw new Error(`Unknown buildRule: "${ruleId}". Valid options: ${Object.keys(strategyRegistry).join(', ')}`);
  return strategy;
}
```

### Key Design Principles

- **No hard-coded game logic** outside of config files. `MoveValidator` never contains an `if (gameId === 'klondike')` branch.
- **Immutable state transitions.** `StateManager` always produces a new `GameState` object; the previous state is pushed to the undo stack.
- **Pure functions.** `DeckFactory`, `WinDetector`, and strategy `isValidPlacement` are pure functions (no side effects); easy to unit test.
- **Svelte store integration.** `GameState` is wrapped in a Svelte `writable` store so components reactively re-render on state changes.

---

## Consequences

| Aspect | Impact |
|---|---|
| **Positive** | New game types added via JSON only — zero engine code changes |
| **Positive** | Strategies are individually unit-testable in isolation |
| **Positive** | Immutable state makes undo trivially correct |
| **Positive** | Pure functions have no hidden dependencies |
| **Negative** | Slightly more boilerplate than a hard-coded Klondike engine |
| **Mitigation** | Boilerplate justified by extensibility requirement in PRD §4 |

---

## Security Considerations

- JSON config files are **bundled at build time** — never fetched from user-supplied URLs. This eliminates JSON injection risk.
- `getStrategy()` throws on unknown rule IDs — no dynamic `eval` or prototype pollution.
- `DeckFactory` uses `crypto.getRandomValues()` for shuffle entropy (Fisher-Yates with cryptographically random index) to prevent predictable shuffle attacks.

---

## Alternatives Considered

| Option | Reason Rejected |
|---|---|
| Hard-coded Klondike engine | Violates the extensibility requirement in PRD §4 |
| Plugin system with dynamic imports | Over-engineered for current scope; lazy-loading configs not needed for bundled games |
| External game rule library (e.g., npm package) | Introduces uncontrolled dependency; bundle size risk; no suitable library found |
