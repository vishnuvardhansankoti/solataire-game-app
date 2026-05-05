# User Stories — Game Selector UI
**Feature Area:** Multi-Game Navigation  
**Author:** Analyst Agent  
**Date:** 2026-05-04  
**Status:** [Final]

---

## US-GS-01 — View Available Games

**Title:** View Available Games  
**User Story:** As a player, I want to see a list of available solitaire games, so that I can choose which variant I want to play.

**Acceptance Criteria:**

```gherkin
Feature: View Available Games

  Scenario: Player opens the game selector
    Given the application is loaded and a game is on screen
    When the player taps or clicks the game-selector control
    Then a list of available games is displayed: "Klondike", "Spider", "FreeCell"
    And the currently active game is visually highlighted
    And the list is keyboard navigable with arrow keys
```

**Priority:** P0  
**Phase:** Sprint 3

---

## US-GS-02 — Switch Game Without Active Progress

**Title:** Switch Game (No Active Progress)  
**User Story:** As a player, I want to switch to a different solitaire game when I have not started a game yet (or have won), so that I can start fresh in my chosen variant immediately.

**Acceptance Criteria:**

```gherkin
Feature: Switch Game (no active progress)

  Scenario: Player selects a different game when no game is in progress
    Given no game is in progress (new session or previous game won/reset)
    When the player selects "Spider" from the game selector
    Then the Spider Solitaire board is dealt immediately
    And the timer, score, and move counter reset to 0
    And no confirmation dialog is shown
```

**Priority:** P0  
**Phase:** Sprint 3

---

## US-GS-03 — Switch Game Mid-Game With Confirmation

**Title:** Switch Game Mid-Game With Confirmation  
**User Story:** As a player, I want to be warned before switching away from an in-progress game, so that I do not accidentally lose my current progress.

**Acceptance Criteria:**

```gherkin
Feature: Switch Game Mid-Game

  Scenario: Player switches game while a game is in progress — confirms
    Given a Klondike game is in progress with at least one move made
    When the player selects "FreeCell" from the game selector
    Then a confirmation dialog appears: "Switch to FreeCell? Your Klondike progress will be saved."
    And when the player confirms, the FreeCell board is dealt
    And the Klondike state is preserved in localStorage

  Scenario: Player switches game while a game is in progress — cancels
    Given a Klondike game is in progress
    When the player selects "Spider" and then cancels the confirmation dialog
    Then the Klondike game continues unchanged
    And no state is lost
```

**Priority:** P0  
**Phase:** Sprint 3

---

## US-GS-04 — Resume a Previously Played Game

**Title:** Resume Previously Played Game  
**User Story:** As a returning player, I want switching back to a game I previously played to restore exactly where I left off, so that I can continue without losing progress.

**Acceptance Criteria:**

```gherkin
Feature: Resume Previous Game

  Scenario: Player resumes a game they played before
    Given the player previously played Spider Solitaire and made 12 moves
    And then switched to FreeCell
    When the player selects "Spider" from the game selector
    Then the Spider board is restored to the exact state from 12 moves in
    And the score, move count, and elapsed time are restored
    And no new deal is triggered

  Scenario: Player opens a game they have never played
    Given the player has never played FreeCell
    When the player selects "FreeCell" from the game selector
    Then a fresh FreeCell game is dealt automatically
```

**Priority:** P0  
**Phase:** Sprint 3

---

## US-GS-05 — Selector Accessible on Mobile

**Title:** Mobile-Friendly Game Selector  
**User Story:** As a mobile player, I want the game selector to be reachable and usable on a small screen, so that I can switch games without needing a desktop.

**Acceptance Criteria:**

```gherkin
Feature: Mobile Game Selector

  Scenario: Player uses the selector on a 375px viewport
    Given the viewport width is 375px
    When the player opens the game selector
    Then all game options are fully visible without horizontal scrolling
    And each game option has a minimum tap target of 44x44px
    And the active game is labelled for screen readers with aria-current="true"
```

**Priority:** P1  
**Phase:** Sprint 3

---

## US-GS-06 — Selector Driven by Config, Not Hardcoded

**Title:** Config-Driven Game List  
**User Story:** As a developer, I want the game selector to automatically include any new game added under `src/games/`, so that adding a game config is the only step needed to surface it in the UI.

**Acceptance Criteria:**

```gherkin
Feature: Config-Driven Game List

  Scenario: Developer adds a new game config
    Given a new file src/games/pyramid/config.json exists with displayName "Pyramid"
    When the application is built and loaded
    Then "Pyramid" appears in the game selector without any UI code changes
```

**Priority:** P1  
**Phase:** Sprint 3
