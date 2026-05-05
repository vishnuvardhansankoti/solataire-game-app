# User Stories — Generic Card Game Engine
**Feature Area:** JSON-Configurable Game Engine, Multi-Game Support  
**Author:** Analyst Agent  
**Date:** 2026-05-04  
**Status:** Final

---

## US-12 — Add Game via JSON Config

**Title:** JSON-Driven Game Configuration  
**User Story:** As a developer, I want to add a new card game via a JSON config file, so that I can extend the platform without modifying core engine code.

**Acceptance Criteria:**

```gherkin
Feature: JSON-Driven Game Configuration

  Scenario: Engine loads a valid game config
    Given a valid game config JSON exists at "src/games/{gameId}/config.json"
    When the GameEngine is initialized with that gameId
    Then the engine reads the config file
    And sets the number of decks, suits, card values, and pile definitions from the config
    And selects the correct BuildRuleStrategy instances for each pile type
    And the game is ready to deal

  Scenario: Invalid game config produces a clear error
    Given a game config JSON contains an unrecognized buildRule value
    When the GameEngine attempts to initialize
    Then initialization fails with a descriptive error message
    And the error message includes the unrecognized rule ID and the valid options
    And no game state is created

  Scenario: Klondike config produces correct initial deal
    Given the Klondike game config is loaded
    When the engine deals the initial state
    Then 7 tableau columns are created with 1 through 7 cards respectively
    And the top card of each tableau column is face-up
    And all other cards are face-down
    And 24 cards remain in the stock pile
    And all 4 foundations are empty
```

**Priority:** P2  
**Phase:** Phase 2

---

## US-ENG — Rule Strategy Engine

**Title:** Decoupled Move Validation  
**User Story:** As a developer, I want all move validation to be driven by the loaded JSON config, so that the same engine can enforce different rules for different games without hard-coded logic.

**Acceptance Criteria:**

```gherkin
Feature: Decoupled Rule Strategy Engine

  Scenario: MoveValidator uses the correct strategy for Klondike tableau
    Given the Klondike config is loaded with buildRule "descending-alternating-color"
    When the player attempts to place a Red 7 on a Black 8
    Then the MoveValidator approves the move

  Scenario: MoveValidator rejects an invalid Klondike tableau move
    Given the Klondike config is loaded
    When the player attempts to place a Red 7 on a Red 8
    Then the MoveValidator rejects the move
    And the card returns to its original position

  Scenario: MoveValidator uses correct strategy for foundations
    Given the Klondike config is loaded with foundation buildRule "ascending-same-suit"
    When the player attempts to place a 2 of Hearts on a Foundation pile containing the Ace of Hearts
    Then the MoveValidator approves the move

  Scenario: A new buildRule can be registered without changing MoveValidator
    Given a new BuildRuleStrategy "descending-same-suit" is registered in the strategy registry
    And a game config references this rule
    When the GameEngine loads the config
    Then the new strategy is resolved from the registry automatically
    And MoveValidator works correctly with it
```

**Priority:** P2  
**Phase:** Phase 2

---

## US-LAY — Dynamic Layout Component

**Title:** Config-Driven Game Board Layout  
**User Story:** As a developer, I want the game board to render its layout from the JSON config's layout object, so that different game types can have different pile arrangements without changing the Svelte components.

**Acceptance Criteria:**

```gherkin
Feature: Dynamic Layout Rendering

  Scenario: Klondike layout renders correctly from config
    Given the Klondike config specifies a topRow of ["stock","waste","gap","foundation","foundation","foundation","foundation"]
    When the GameBoard component renders
    Then the top row displays 1 stock pile, 1 waste pile, a spacer, and 4 foundation piles in that order
    And the bottom area renders 7 tableau columns

  Scenario: Layout adapts to mobile breakpoint
    Given the viewport width is 375px
    When the GameBoard renders
    Then all 7 tableau columns are visible without horizontal scrolling
    And card dimensions scale proportionally to fit the viewport

  Scenario: Layout adapts to desktop breakpoint
    Given the viewport width is 1440px
    When the GameBoard renders
    Then the layout is centered with a max-width constraint
    And cards are rendered at a larger size than on mobile
```

**Priority:** P1  
**Phase:** Phase 2

---

## US-ST — Multi-Game State Persistence

**Title:** Multi-Game localStorage Persistence  
**User Story:** As a player, I want each game type to save its state independently, so that I can switch between game types without losing my progress in any of them.

**Acceptance Criteria:**

```gherkin
Feature: Multi-Game State Persistence

  Scenario: Klondike state is namespaced separately from other games
    Given a Klondike game is in progress and saved
    And a FreeCell game is also in progress and saved
    When localStorage is inspected
    Then the Klondike state is stored at key "svelte-solitaire:state:klondike"
    And the FreeCell state is stored at key "svelte-solitaire:state:freecell"
    And neither key overwrites the other

  Scenario: Resuming a game restores the correct game type's state
    Given saved states exist for both "klondike" and "freecell"
    When the player selects "Klondike" from the game menu
    Then only the Klondike state is loaded
    And the FreeCell state remains untouched in localStorage
```

**Priority:** P2  
**Phase:** Phase 2
