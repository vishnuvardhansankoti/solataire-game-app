import type { BuildRuleStrategy } from './BuildRuleStrategy';
import type { Card } from '../types';

/** Pile accepts no cards (e.g., a closed stock pile). */
export class NoneStrategy implements BuildRuleStrategy {
  canPlace(_cards: Card[], _topCard: Card | null, _startValue?: number): boolean {
    return false;
  }
}
