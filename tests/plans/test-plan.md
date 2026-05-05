# Test Plan — Solitaire Game App MVP

**Version:** 1.0  
**Phase:** QA (Phase 4)  
**References:** HANDOFF-003, docs/requirements/acceptance-criteria.md

---

## 1. Scope

This plan covers:
- Unit tests (engine logic)
- Integration tests (engine composition)
- E2E tests (browser gameplay, PWA)
- Accessibility checks

Out of scope: load testing, security pen-testing.

---

## 2. Test Stack

| Layer | Tool | Runner |
|---|---|---|
| Unit | Vitest | `npm run test:unit` |
| Integration | Vitest | `npm run test:unit` |
| E2E | Playwright | `npm run test:e2e` |
| Coverage | v8 | `npm run test:unit -- --coverage` |

---

## 3. Unit Test Coverage Targets

| Module | Target |
|---|---|
| DeckFactory | 100% |
| Strategies | 100% |
| MoveValidator | ≥ 90% |
| StateManager | ≥ 90% |
| WinDetector | 100% |
| LocalStorageAdapter | ≥ 90% |

---

## 4. Integration Test Scenarios

| ID | Scenario | Expected |
|---|---|---|
| INT-001 | New Klondike game state | 7 tableau columns, 24 stock cards, 0 waste, 0 foundations |
| INT-002 | Foundation Ace→King (hearts) | isWon() = false after 12, true after 13 |
| INT-003 | 5 moves then 5 undos | state equals pre-move state |
| INT-004 | Draw 1 mode recycle | waste reverses back to stock with faceUp:false |
| INT-005 | Draw 3 mode | 3 cards drawn per click |

---

## 5. E2E Scenarios

| ID | Scenario | Expected |
|---|---|---|
| E2E-001 | Page load renders game board | 7 tableau columns, 4 foundations, stock, waste visible |
| E2E-002 | Click stock draws to waste | waste shows top card |
| E2E-003 | Ctrl+N starts new game | board resets |
| E2E-004 | Ctrl+Z undoes last move | board reverts |
| E2E-005 | Win overlay on win | dialog appears with score |
| E2E-006 | Settings panel opens/closes | draw mode persists after close |
| E2E-007 | PWA offline | app shell loads offline |

---

## 6. Accessibility Checklist

- [ ] All interactive elements have `aria-label`
- [ ] Focus ring visible on keyboard navigation
- [ ] Win overlay traps focus
- [ ] Score updates announced via `aria-live`
- [ ] Lighthouse a11y ≥ 90

---

## 7. Exit Criteria

- All unit + integration tests pass
- E2E smoke (E2E-001 to E2E-006) pass
- No P0 or P1 bugs open
- Coverage report ≥ 90% on engine files
