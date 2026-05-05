# User Stories — Core Gameplay
**Feature Area:** Klondike Solitaire Game Mechanics  
**Author:** Analyst Agent  
**Date:** 2026-05-04  
**Status:** Final

---

## US-01 — Start a New Game

**Title:** Start New Game  
**User Story:** As a player, I want to start a new game with a single tap or click, so that I can play immediately without configuration.

**Acceptance Criteria:**

```gherkin
Feature: Start New Game

  Scenario: Player starts a new game from the home screen
    Given the application has loaded
    When the player taps or clicks the "New Game" button
    Then a shuffled 52-card deck is dealt in the standard Klondike layout
    And the tableau has 7 columns (1 to 7 cards, top card face-up)
    And the stock pile contains the remaining 24 cards face-down
    And all foundations are empty
    And the score is reset to 0
    And the move counter is reset to 0
    And the timer starts from 00:00

  Scenario: Player starts a new game while a game is in progress (>5 moves)
    Given a game is in progress with more than 5 moves made
    When the player taps the "New Game" button
    Then a confirmation dialog appears asking "Start a new game? Current progress will be lost."
    And if the player confirms, a new game is dealt
    And if the player cancels, the current game continues unchanged

  Scenario: Player starts a new game while a game is in progress (≤5 moves)
    Given a game is in progress with 5 or fewer moves made
    When the player taps the "New Game" button
    Then a new game is dealt immediately without a confirmation dialog
```

**Priority:** P0  
**Phase:** MVP

---

## US-02 — Undo Last Move

**Title:** Undo Move  
**User Story:** As a player, I want to undo my last move, so that I can correct a mistake without restarting the game.

**Acceptance Criteria:**

```gherkin
Feature: Undo Move

  Scenario: Player undoes a valid move
    Given a game is in progress
    And the player has made at least one move
    When the player taps the "Undo" button
    Then the last card move is reversed atomically
    And the cards return to their exact previous positions
    And the score is adjusted by reversing the score change of that move
    And the move counter decrements by 1

  Scenario: Player attempts to undo with no history
    Given a game is in progress
    And no moves have been made yet
    When the player taps the "Undo" button
    Then the Undo button is visually disabled and does not respond

  Scenario: Player undoes a stock draw
    Given the player has drawn one or more cards from the stock to the waste pile
    When the player taps "Undo"
    Then the drawn card(s) return to the top of the stock pile
    And the waste pile reverts to its state before the draw

  Scenario: Player undoes a face-up flip
    Given a face-down tableau card was just flipped face-up
    When the player taps "Undo"
    Then the card returns to face-down state
    And the score is decremented by 5 points (reversing the flip bonus)
```

**Priority:** P0  
**Phase:** MVP

---

## US-03 — Auto-Save Game Progress

**Title:** Auto-Save Game State  
**User Story:** As a player, I want my game to be automatically saved, so that I can resume exactly where I left off after closing the browser.

**Acceptance Criteria:**

```gherkin
Feature: Auto-Save Game State

  Scenario: Game state is saved after each move
    Given a game is in progress
    When the player makes a valid card move
    Then the complete game state is serialized to localStorage
    And the key used is "svelte-solitaire:state:klondike"
    And the saved state includes: deck, waste, foundations, tableau, score, moves, elapsedSeconds, history

  Scenario: Player resumes a saved game on app reload
    Given a saved game state exists in localStorage for "klondike"
    When the player opens the app
    Then a "Resume Game" option is presented alongside "New Game"
    And if the player selects "Resume Game", the exact saved state is restored
    And the timer continues from the saved elapsedSeconds

  Scenario: Saved state is corrupted or incompatible
    Given a corrupted or version-mismatched state exists in localStorage
    When the player opens the app
    Then the corrupted state is silently discarded
    And a fresh new game is started

  Scenario: State is saved within 500ms of the move (debounce)
    Given a game is in progress
    When the player makes several rapid moves in quick succession
    Then localStorage is written at most once per 500ms interval
    And the final state written reflects all moves made
```

**Priority:** P0  
**Phase:** MVP

---

## US-06 — Score and Timer Display

**Title:** Score and Time Tracking  
**User Story:** As a player, I want to see my current score and time elapsed, so that I can track my performance during a session.

**Acceptance Criteria:**

```gherkin
Feature: Score and Timer Display

  Scenario: Score updates on a scoring move
    Given a game is in progress
    When the player moves a card from the waste pile to the tableau
    Then the displayed score increases by 5

  Scenario: Score updates on a foundation move
    Given a game is in progress
    When the player moves a card to a foundation pile
    Then the displayed score increases by 10

  Scenario: Time penalty is applied in draw-1 mode
    Given the player is playing in Draw-1 mode
    And more than 30 seconds have elapsed
    When 10 more seconds pass
    Then the displayed score decreases by 2

  Scenario: Timer increments during active play
    Given a game is in progress
    When 1 second passes
    Then the displayed timer increments by 1 second
    And the timer is paused when the browser tab is not visible (Page Visibility API)
```

**Priority:** P1  
**Phase:** MVP

---

## US-09 — Win Animation

**Title:** Win State and Animation  
**User Story:** As a player, I want to see a win animation when I complete the game, so that the victory feels rewarding and satisfying.

**Acceptance Criteria:**

```gherkin
Feature: Win Animation and Overlay

  Scenario: Win is detected when all foundations are complete
    Given all four foundation piles each contain 13 cards (A through K)
    When the last card is placed on a foundation
    Then the win condition is detected immediately
    And a win animation begins (cards cascade from foundations with svelte/tweens)
    And a "You Win!" overlay appears showing: final score, total moves, elapsed time

  Scenario: Player chooses to play again from win overlay
    Given the win overlay is displayed
    When the player taps "Play Again"
    Then the overlay closes
    And a new game is dealt immediately

  Scenario: Animation is skipped if prefers-reduced-motion is set
    Given the user's OS has "Reduce Motion" enabled
    When the win condition is reached
    Then the win overlay appears immediately without animation
```

**Priority:** P2  
**Phase:** Phase 2

---

## US-04 — Draw Mode Selection

**Title:** Draw Mode Configuration  
**User Story:** As a player, I want to choose between Draw 1 and Draw 3 modes, so that I can adjust the game difficulty.

**Acceptance Criteria:**

```gherkin
Feature: Draw Mode Selection

  Scenario: Default draw mode is Draw 1
    Given the player opens the app for the first time
    Then the draw mode is set to Draw 1

  Scenario: Player changes draw mode to Draw 3
    Given the settings panel is open
    When the player selects "Draw 3"
    And starts a new game
    Then clicking the stock pile deals 3 cards face-up to the waste pile at once

  Scenario: Cycling through exhausted stock in Draw 3 mode
    Given the stock pile is empty
    When the player clicks the stock placeholder
    Then all waste pile cards are returned to the stock face-down
    And the waste pile is cleared

  Scenario: Draw mode setting persists across sessions
    Given the player has selected "Draw 3"
    When the player closes and reopens the app
    Then the draw mode remains set to "Draw 3"
```

**Priority:** P1  
**Phase:** MVP

---

## US-AC — Auto-Complete

**Title:** Auto-Complete Feature  
**User Story:** As a player, I want the game to offer auto-complete when all cards are face-up, so that I can skip the mechanical end-game card movement.

**Acceptance Criteria:**

```gherkin
Feature: Auto-Complete

  Scenario: Auto-Complete button appears when eligible
    Given all tableau cards are face-up
    And the stock pile is empty
    When the game state is evaluated
    Then an "Auto-Complete" button appears in the HUD

  Scenario: Auto-Complete animates remaining cards to foundations
    Given the Auto-Complete button is visible
    When the player taps "Auto-Complete"
    Then all remaining cards are moved to their correct foundation piles one by one
    And each card move is animated
    And the win condition is triggered when all cards are placed
```

**Priority:** P1  
**Phase:** Phase 2
