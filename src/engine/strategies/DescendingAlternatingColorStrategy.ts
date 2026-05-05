import type { BuildRuleStrategy } from './BuildRuleStrategy';
import type { Card } from '../types';

const RED_SUITS = new Set(['hearts', 'diamonds']);

function isRed(card: Card): boolean {
  return RED_SUITS.has(card.suit);
}

/**
 * Tableau build rule: descending by 1, alternating color.
 * Kings (value=13) may be placed on empty columns.
 */
export class DescendingAlternatingColorStrategy implements BuildRuleStrategy {
  canPlace(cards: Card[], topCard: Card | null, _startValue?: number): boolean {
    const bottom = cards[0];
    if (!bottom.faceUp) return false;
    if (topCard === null) return bottom.value === 13; // King on empty column
    return isRed(bottom) !== isRed(topCard) && bottom.value === topCard.value - 1;
  }
}
