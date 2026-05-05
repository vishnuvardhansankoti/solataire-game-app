# Problem Statement — Game Selector UI
**Feature Area:** Multi-Game Navigation  
**Author:** Analyst Agent  
**Date:** 2026-05-04  
**Status:** [Final]

---

## Problem

The solitaire PWA supports Klondike, Spider, and FreeCell but the active game is hardcoded in `src/routes/+page.svelte`. There is no way for a user to switch between games at runtime without a code change, making the multi-game engine invisible and preventing adoption.

---

## Goal

Provide a UI control that lets a user select and switch between any available solitaire game at any point during their session, with state-saving and confirmation guards.

---

## In Scope

- Persistent game-selector control accessible from the main game screen (header dropdown or modal)
- Three games: Klondike, Spider, FreeCell
- Current game state auto-saved before switching
- Confirmation dialog when switching mid-game (prevents accidental progress loss)
- Returning to a game restores last saved state (per-gameId localStorage already isolated)
- Selector driven by existing `GameConfig` JSON files — no hardcoded game lists
- Responsive: mobile (375px+), tablet, desktop
- Accessible: keyboard-navigable, ARIA-labelled

---

## Out of Scope

- Editing game config JSON through the UI (separate future feature)
- Adding new game types at runtime
- Multiplayer or lobbies
- Analytics / play-count tracking

---

## Constraints

- Must not break existing per-gameId localStorage save state
- No full SvelteKit router re-architecture required (in-page store switch is acceptable)
- Selector must use `GameConfig.displayName` — no hardcoded strings
- Zero regressions against existing unit tests

---

## Success Metrics

- User can reach any game within 2 taps/clicks from any screen
- Switching never causes data loss without explicit confirmation
- Selector usable on 375px viewport
- Lighthouse accessibility score does not regress
