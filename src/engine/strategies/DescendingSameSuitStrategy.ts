import type { BuildRuleStrategy } from './BuildRuleStrategy';
import type { Card } from '../types';

/** Spider-style build rule: descending by 1, same suit. */
export class DescendingSameSuitStrategy implements BuildRuleStrategy {
  canPlace(cards: Card[], topCard: Card | null, _startValue?: number): boolean {
    const bottom = cards[0];
    if (!bottom.faceUp) return false;
    if (topCard === null) return bottom.value === 13;
    return bottom.suit === topCard.suit && bottom.value === topCard.value - 1;
  }
}
