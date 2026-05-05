import type { Card } from '../types';

/**
 * Determines whether a sequence of cards may be placed on a given pile.
 */
export interface BuildRuleStrategy {
  /**
   * @param cards  The cards being moved (index 0 = bottommost card in sequence).
   * @param topCard The current top card of the destination pile, or null if empty.
   * @param startValue Optional minimum value requirement for an empty pile (e.g. King = 13).
   * @returns true if placement is allowed.
   */
  canPlace(cards: Card[], topCard: Card | null, startValue?: number): boolean;
}
