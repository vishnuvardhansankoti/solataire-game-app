# User Stories — Accessibility & Interaction
**Feature Area:** A11y, Keyboard Navigation, Drag-and-Drop, Tap-to-Move  
**Author:** Analyst Agent  
**Date:** 2026-05-04  
**Status:** Final

---

## US-11 — Keyboard-Only Navigation

**Title:** Keyboard Accessibility  
**User Story:** As an accessibility user, I want to navigate and play the game using only a keyboard, so that I can use the game without a pointer device.

**Acceptance Criteria:**

```gherkin
Feature: Keyboard Navigation

  Scenario: Player can tab through all interactive elements
    Given the game is loaded
    When the player presses Tab repeatedly
    Then focus cycles through: stock pile, waste pile, foundation piles (×4), tableau columns (×7), HUD buttons
    And each focused element has a visible focus ring

  Scenario: Player selects a card using keyboard
    Given a face-up card in the tableau has keyboard focus
    When the player presses Space or Enter
    Then the card is selected and the selection highlight ring appears

  Scenario: Player moves a selected card using keyboard
    Given a card is selected
    When the player presses Tab to focus a valid destination pile and presses Enter
    Then the card is moved to the destination pile
    And the move is recorded in the undo history

  Scenario: Player presses Escape to deselect
    Given a card is selected
    When the player presses Escape
    Then the selection is cleared and no card moves

  Scenario: Player uses keyboard shortcut for Undo
    Given a game is in progress
    When the player presses Ctrl+Z (or Cmd+Z on Mac)
    Then the last move is undone

  Scenario: Player uses keyboard shortcut for New Game
    Given a game is in progress
    When the player presses Ctrl+N (or Cmd+N on Mac)
    Then the New Game confirmation dialog appears (if > 5 moves)
```

**Priority:** P2  
**Phase:** Phase 2

---

## US-07 — Drag and Drop

**Title:** Drag-and-Drop Card Interaction  
**User Story:** As a player on desktop or tablet, I want to drag and drop cards between piles, so that I can interact naturally with the cards.

**Acceptance Criteria:**

```gherkin
Feature: Drag and Drop

  Scenario: Player drags a single face-up card to a valid tableau column
    Given a face-up card is in the tableau
    When the player begins dragging the card
    Then the card lifts visually (slight scale up, shadow appears)
    And valid drop targets highlight with a green border glow

  Scenario: Player drops card on a valid destination
    Given a card is being dragged over a valid tableau column
    When the player releases the drag
    Then the card animates smoothly into its new position
    And the move is recorded

  Scenario: Player drops card on an invalid destination
    Given a card is being dragged over an invalid pile
    When the player releases the drag
    Then the card animates back to its original position (spring-back)
    And no move is recorded

  Scenario: Player drags a stack of multiple tableau cards
    Given a player clicks a mid-stack face-up card that heads a valid sub-sequence
    When the drag begins
    Then the entire sub-stack from that card to the bottom of the column is dragged together
    And valid destinations for the sub-stack are highlighted

  Scenario: Drag interaction does not fire on face-down cards
    Given a face-down card exists in the tableau
    When the player attempts to drag it
    Then no drag action is initiated
```

**Priority:** P1  
**Phase:** Phase 2

---

## US-08 — Tap-to-Move (Mobile)

**Title:** Tap-to-Select and Tap-to-Move  
**User Story:** As a player on mobile, I want to tap a card to select it and then tap a destination to move it, so that I can play without precise dragging.

**Acceptance Criteria:**

```gherkin
Feature: Tap-to-Move

  Scenario: Tapping a face-down top card flips it
    Given a face-down card is at the top of a tableau column
    When the player taps it
    Then the card flips face-up with an animation
    And the score increases by 5

  Scenario: Tapping a face-up card selects it
    Given a face-up card is in the tableau
    When the player taps it
    Then the card (and any valid sub-stack below it) is selected
    And a selection highlight ring appears around the selected card(s)

  Scenario: Tapping a valid destination after selection moves the card
    Given a card is selected
    When the player taps a valid destination pile
    Then the selected card(s) animate to the destination
    And the selection is cleared

  Scenario: Tapping an invalid destination after selection deselects
    Given a card is selected
    When the player taps an invalid destination
    Then the selection is cleared without moving any card

  Scenario: Double-tapping a card triggers auto-move
    Given a face-up card can be legally moved to a foundation or tableau
    When the player double-taps the card
    Then the card is automatically moved to the best valid destination (foundation preferred)
```

**Priority:** P1  
**Phase:** MVP

---

## US-A11Y — Visual Accessibility

**Title:** Visual and Contrast Accessibility  
**User Story:** As a player with visual impairments, I want cards to have high contrast and clear suit symbols, so that I can distinguish cards without relying on color alone.

**Acceptance Criteria:**

```gherkin
Feature: Visual Accessibility

  Scenario: Suit symbols are always visible (not color-only)
    Given any card is rendered
    Then the card displays both the rank text and a suit symbol (♠ ♥ ♦ ♣)
    And suit identity can be determined without relying on color

  Scenario: Card text meets contrast ratio requirements
    Given any face-up card is rendered
    Then the rank and suit text color against the card background has a contrast ratio >= 4.5:1
    (Red suits: #CC0000 on white = 5.1:1 — passes)
    (Black suits: #111111 on white = 18.1:1 — passes)

  Scenario: Touch targets meet minimum size requirements
    Given any interactive card or button is rendered
    Then its tappable area is at least 44×44 CSS pixels

  Scenario: Animations respect prefers-reduced-motion
    Given the user's OS accessibility setting "Reduce Motion" is enabled
    When any animation would play (win animation, card flip, drag)
    Then animations are disabled or replaced with instant transitions

  Scenario: Cards have accessible ARIA labels
    Given a face-up card is rendered
    Then it has an aria-label attribute in the format "Ace of Spades, face up"
    And a face-down card has aria-label "Face-down card"
```

**Priority:** P2  
**Phase:** Phase 2
