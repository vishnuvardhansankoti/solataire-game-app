# Acceptance Criteria — Master Reference
**Project:** Svelte-Solitaire PWA  
**Author:** Analyst Agent  
**Date:** 2026-05-04  
**Status:** [Final]

> **Orchestrator Note:** This document reaching [Final] status triggers the Analyst → Architect handoff.

---

## Summary Table

| ID | Feature | Priority | Phase | Gherkin Scenarios | Status |
|---|---|---|---|---|---|
| AC-01 | Start New Game | P0 | MVP | 3 | ✅ Defined |
| AC-02 | Undo Move | P0 | MVP | 4 | ✅ Defined |
| AC-03 | Auto-Save Game State | P0 | MVP | 4 | ✅ Defined |
| AC-04 | Draw Mode (1 and 3) | P1 | MVP | 4 | ✅ Defined |
| AC-05 | Offline Gameplay | P0 | MVP | 4 | ✅ Defined |
| AC-06 | PWA Install Prompt | P1 | MVP | 4 | ✅ Defined |
| AC-07 | Web App Manifest | P0 | MVP | 3 | ✅ Defined |
| AC-08 | Load Performance | P0 | MVP | 4 | ✅ Defined |
| AC-09 | Score & Timer | P1 | MVP | 4 | ✅ Defined |
| AC-10 | Win Animation | P2 | Phase 2 | 3 | ✅ Defined |
| AC-11 | Auto-Complete | P1 | Phase 2 | 2 | ✅ Defined |
| AC-12 | JSON-Driven Game Config | P2 | Phase 2 | 3 | ✅ Defined |
| AC-13 | Rule Strategy Engine | P2 | Phase 2 | 4 | ✅ Defined |
| AC-14 | Dynamic Layout | P1 | Phase 2 | 3 | ✅ Defined |
| AC-15 | Multi-Game Persistence | P2 | Phase 2 | 2 | ✅ Defined |
| AC-16 | Keyboard Navigation | P2 | Phase 2 | 6 | ✅ Defined |
| AC-17 | Drag and Drop | P1 | Phase 2 | 5 | ✅ Defined |
| AC-18 | Tap-to-Move | P1 | MVP | 5 | ✅ Defined |
| AC-19 | Visual Accessibility | P2 | Phase 2 | 5 | ✅ Defined |

---

## MVP Acceptance Gate (Phase 1 Exit)

The following criteria **must all pass** before the product is considered MVP-complete:

1. **AC-01:** A new game can be started with one tap on any device.
2. **AC-02:** Undo reverses any move including stock draws and face-up flips.
3. **AC-03:** Game state survives browser close and can be resumed.
4. **AC-05:** Game is fully playable with network disconnected after first load.
5. **AC-07:** `manifest.json` is valid and passes Chrome's PWA checklist.
6. **AC-08:** Lighthouse Performance ≥ 90, PWA = 100 on production build.
7. **AC-18:** Tap-to-move works on a real mobile device (iOS and Android).

---

## Out-of-Scope Confirmation

The following items are explicitly **out of scope** for all phases documented here:

- User authentication or cloud accounts.
- Real-time multiplayer.
- In-app purchases or advertisements.
- Push notifications.
- Localization / i18n (English-only).
- Server-side rendering or API backends.
- Custom user-uploaded game configs (future consideration).

---

## Definition of Done (per User Story)

A user story is considered **Done** when:

1. All Gherkin scenarios in its acceptance criteria pass.
2. The implementing code has accompanying unit tests with ≥ 90% coverage of the new logic.
3. The feature is accessible via keyboard (for interactive features).
4. The Lighthouse scores have not regressed below the defined targets.
5. No new `console.error` output is introduced.
6. The PR has been reviewed and `PR_SUMMARY.md` is present.
