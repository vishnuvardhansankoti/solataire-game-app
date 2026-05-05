import type { BuildRuleStrategy } from './BuildRuleStrategy';
import type { Card } from '../types';

/**
 * Spider Solitaire tableau build rule: descending by 1, any suit.
 * Any card (or sequence) may be placed on a card one rank higher,
 * regardless of suit or color. Only same-suit sequences can be
 * moved as a group — but that constraint is enforced by the UI,
 * not here (this strategy governs destination validity only).
 */
export class DescendingAnySuitStrategy implements BuildRuleStrategy {
  canPlace(cards: Card[], topCard: Card | null, _startValue?: number): boolean {
    const bottom = cards[0];
    if (!bottom.faceUp) return false;
    // Empty column: only a King may start a new column
    if (topCard === null) return bottom.value === 13;
    return bottom.value === topCard.value - 1;
  }
}
