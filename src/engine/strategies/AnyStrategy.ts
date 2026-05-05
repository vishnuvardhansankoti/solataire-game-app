import type { BuildRuleStrategy } from './BuildRuleStrategy';
import type { Card } from '../types';

/** FreeCell-style: any single face-up card may be placed on an empty pile. */
export class AnyStrategy implements BuildRuleStrategy {
  canPlace(cards: Card[], _topCard: Card | null, _startValue?: number): boolean {
    return cards.length > 0 && cards[0].faceUp;
  }
}
