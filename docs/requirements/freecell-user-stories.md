# User Stories — FreeCell Solitaire
**Feature Area:** FreeCell Game Mechanics  
**Author:** Analyst Agent  
**Date:** 2026-05-05  
**Status:** Final

---

## US-FC-01 — Start a New FreeCell Game

**Title:** Start New FreeCell Game  
**User Story:** As a player, I want to start a new FreeCell game with a single tap or click, so that I can play immediately with all 52 cards dealt into the tableau.

**Acceptance Criteria:**

```gherkin
Feature: Start New FreeCell Game

  Scenario: Player starts a new FreeCell game from the game selector
    Given the application has loaded and the game selector is displayed
    When the player selects "FreeCell" and taps "New Game"
    Then a shuffled 52-card deck is dealt entirely into the tableau (no stock pile)
    And the tableau has 8 columns (first 4 columns have 7 cards, next 4 columns have 6 cards)
    And all 8 cards are face-up
    And all 4 foundations are empty
    And all 4 free cells are empty
    And the score is reset to 0
    And the move counter is reset to 0
    And the timer starts from 00:00

  Scenario: Player starts a new FreeCell game while a game is in progress
    Given a FreeCell game is in progress
    When the player taps the "New Game" button
    Then a confirmation dialog appears asking "Start a new game? Current progress will be lost."
    And if the player confirms, a new 52-card FreeCell game is dealt
    And if the player cancels, the current game continues unchanged
```

**Priority:** P0  
**Phase:** Sprint 2

---

## US-FC-02 — Move Cards in Tableau

**Title:** Move Cards Between Tableau Columns  
**User Story:** As a player, I want to move cards between tableau columns following the FreeCell rules, so that I can organize cards and build foundation sequences.

**Acceptance Criteria:**

```gherkin
Feature: Move Cards in Tableau

  Scenario: Player moves a single card to a valid tableau column
    Given a FreeCell game is in progress
    When the player moves a card of rank R and color C to a tableau column where the top card is rank R+1 and opposite color (not C)
    Then the card is placed on top of the target column
    And the move counter increments by 1
    And the game state is auto-saved

  Scenario: Player attempts an invalid tableau move (same color)
    Given a FreeCell game is in progress
    When the player tries to place a card on a tableau column where the top card is the same color
    Then the move is rejected
    And a visual or audio feedback indicates the invalid move
    And the move counter does not change

  Scenario: Player moves a card to an empty tableau column
    Given a FreeCell game is in progress
    And a tableau column is empty (all cards moved to foundations or free cells)
    When the player moves a card to that empty column
    Then the card is placed in the empty column
    And the move is valid regardless of card rank (any card can start an empty column)

  Scenario: Player moves a card face-down (invalid)
    Given a FreeCell game is in progress
    And a tableau column contains face-down cards
    When the player attempts to move a face-down card
    Then the move is rejected
    And only face-up cards can be moved from the tableau
```

**Priority:** P0  
**Phase:** Sprint 2

---

## US-FC-03 — Use Free Cells for Temporary Storage

**Title:** Move Cards to Free Cells  
**User Story:** As a player, I want to temporarily store cards in free cells, so that I can access blocked cards in the tableau.

**Acceptance Criteria:**

```gherkin
Feature: Use Free Cells

  Scenario: Player moves a card to an empty free cell
    Given a FreeCell game is in progress
    And at least one free cell is empty
    When the player moves any face-up card to an empty free cell
    Then the card is placed in the free cell
    And the tableau column is updated to show the next card (if any)
    And the move counter increments by 1

  Scenario: Player attempts to place a card in a full free cell
    Given all 4 free cells contain cards
    When the player tries to move a card to a free cell
    Then the move is rejected
    And a visual feedback indicates no empty free cells are available

  Scenario: Player moves a card from a free cell to the tableau
    Given a card is in a free cell
    When the player moves it to a valid tableau column (respecting color/rank rules)
    Then the card is removed from the free cell
    And the free cell becomes empty
    And the move counter increments by 1

  Scenario: Player moves a card from a free cell to a foundation
    Given a card is in a free cell
    And a foundation is ready to accept it (matching suit and rank)
    When the player moves the card to the foundation
    Then the card is removed from the free cell
    And the free cell becomes empty
    And the score increases by 10 points
    And the move counter increments by 1
```

**Priority:** P0  
**Phase:** Sprint 2

---

## US-FC-04 — Move Cards to Foundations

**Title:** Move Cards to Foundations  
**User Story:** As a player, I want to move cards to the foundation piles, so that I can eventually win the game by placing all cards in order.

**Acceptance Criteria:**

```gherkin
Feature: Move Cards to Foundations

  Scenario: Player moves a card from tableau to a foundation
    Given a FreeCell game is in progress
    And the tableau contains an Ace of a suit (or the top card matches the foundation requirement)
    When the player moves the card to the matching suit foundation
    Then the card is placed on the foundation
    And the tableau column is updated to reveal the next card (if any)
    And the score increases by 10 points
    And the move counter increments by 1

  Scenario: Player moves a card from a free cell to a foundation
    Given a card is stored in a free cell
    When the player moves it to a foundation (matching suit and in ascending sequence)
    Then the card is placed on the foundation
    And the free cell becomes empty
    And the score increases by 10 points

  Scenario: Player moves a card to an empty foundation
    Given a foundation is empty
    When the player moves a card to that foundation
    Then only an Ace can be placed on an empty foundation
    And if a non-Ace is attempted, the move is rejected

  Scenario: Player moves a card to a foundation in sequence
    Given a foundation has cards up to rank N
    When the player moves a card of rank N+1 of the same suit to that foundation
    Then the card is accepted and placed
    And the score increases by 10 points
```

**Priority:** P0  
**Phase:** Sprint 2

---

## US-FC-05 — Win Detection and Completion

**Title:** Win the Game  
**User Story:** As a player, I want the game to detect when I've won, so that I receive a completion signal and final score.

**Acceptance Criteria:**

```gherkin
Feature: Win Detection and Completion

  Scenario: Player completes all 4 foundations
    Given a FreeCell game is in progress
    And the player has moved all 52 cards to the foundation piles (13 of each suit)
    When the last card is placed on a foundation
    Then a win overlay appears showing "You Win!"
    And the final score is displayed
    And the final time is displayed
    And a "New Game" button is shown to restart

  Scenario: Win state is persisted
    Given a player has won
    When the player closes and reopens the app
    Then the win state is retained (if using "Resume Game")
    And the win overlay can be dismissed and re-shown
```

**Priority:** P0  
**Phase:** Sprint 2

---

## US-FC-06 — Undo Last Move in FreeCell

**Title:** Undo Move in FreeCell  
**User Story:** As a player, I want to undo my last move in FreeCell, so that I can correct a mistake without restarting.

**Acceptance Criteria:**

```gherkin
Feature: Undo Move in FreeCell

  Scenario: Player undoes a tableau-to-tableau move
    Given a FreeCell game is in progress with at least one move
    When the player taps "Undo"
    Then the card is returned to its original tableau column
    And the move counter decrements by 1
    And any score adjustments from that move are reversed

  Scenario: Player undoes a move to or from a free cell
    Given a card was moved to/from a free cell
    When the player taps "Undo"
    Then the card returns to its source location
    And the free cell state is corrected
    And the move counter decrements by 1

  Scenario: Player undoes a foundation move
    Given a card was moved to a foundation
    When the player taps "Undo"
    Then the card is returned to its source (tableau or free cell)
    And the score is decremented by 10 points
    And the foundation top rank is decremented
    And the move counter decrements by 1

  Scenario: Player attempts to undo with no history
    Given a FreeCell game is in progress but no moves have been made
    When the player taps "Undo"
    Then the Undo button is visually disabled and does not respond
```

**Priority:** P1  
**Phase:** Sprint 2

---

## US-FC-07 — Auto-Save FreeCell Game State

**Title:** Auto-Save FreeCell Game State  
**User Story:** As a player, I want my FreeCell game to be automatically saved, so that I can resume exactly where I left off.

**Acceptance Criteria:**

```gherkin
Feature: Auto-Save FreeCell Game State

  Scenario: FreeCell game state is saved after each move
    Given a FreeCell game is in progress
    When the player makes a valid card move
    Then the complete game state is serialized to localStorage
    And the key used is "svelte-solitaire:state:freecell"
    And the saved state includes: foundations, tableau, free cells, score, moves, elapsedSeconds, history

  Scenario: Player resumes a saved FreeCell game on app reload
    Given a saved FreeCell game state exists in localStorage
    When the player opens the app and selects "Resume Game"
    Then the exact saved FreeCell state is restored
    And the timer continues from the saved elapsedSeconds
    And all free cells, tableau columns, and foundations are correctly restored
```

**Priority:** P0  
**Phase:** Sprint 2

---

## Summary Table

| ID | Feature | Priority | Acceptance Scenarios |
|---|---|---|---|
| US-FC-01 | Start New FreeCell Game | P0 | 2 |
| US-FC-02 | Move Cards in Tableau | P0 | 4 |
| US-FC-03 | Use Free Cells | P0 | 4 |
| US-FC-04 | Move Cards to Foundations | P0 | 4 |
| US-FC-05 | Win Detection | P0 | 2 |
| US-FC-06 | Undo Move | P1 | 4 |
| US-FC-07 | Auto-Save Game State | P0 | 2 |
