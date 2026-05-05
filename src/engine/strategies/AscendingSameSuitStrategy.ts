import type { BuildRuleStrategy } from './BuildRuleStrategy';
import type { Card } from '../types';

/** Foundation pile rule: ascending by 1, same suit. Ace (1) starts an empty pile. */
export class AscendingSameSuitStrategy implements BuildRuleStrategy {
  canPlace(cards: Card[], topCard: Card | null, startValue = 1): boolean {
    if (cards.length !== 1) return false; // foundations accept one card at a time
    const card = cards[0];
    if (!card.faceUp) return false;
    if (topCard === null) return card.value === startValue;
    return card.suit === topCard.suit && card.value === topCard.value + 1;
  }
}
