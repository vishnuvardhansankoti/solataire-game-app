import type { Card, GameState, PileReference } from './types';
import { getStrategy } from './strategies/registry';
import type { GameConfig } from './GameConfig';

export class MoveValidator {
  constructor(private config: GameConfig) {}

  canMove(state: GameState, from: PileReference, to: PileReference, cards: Card[]): boolean {
    if (cards.length === 0) return false;
    if (!cards[0].faceUp) return false;

    const topCard = this.getTopCard(state, to);

    switch (to.type) {
      case 'foundation': {
        const rule = this.config.piles.foundations?.buildRule ?? 'ascending-same-suit';
        const strategy = getStrategy(rule);
        return strategy.canPlace(cards, topCard, this.config.piles.foundations?.startsWith ?? 1);
      }
      case 'tableau': {
        const col = state.tableau[to.index ?? 0];
        const isEmpty = col.length === 0;
        const rule = isEmpty
          ? (this.config.piles.tableau?.emptyColumnRule ?? this.config.piles.tableau?.buildRule ?? 'descending-alternating-color')
          : (this.config.piles.tableau?.buildRule ?? 'descending-alternating-color');
        const strategy = getStrategy(rule);
        return strategy.canPlace(cards, topCard);
      }
      case 'waste': {
        return false; // cannot manually move to waste
      }
      default:
        return false;
    }
  }

  canDraw(state: GameState): boolean {
    return state.deck.length > 0 || state.waste.length > 0;
  }

  private getTopCard(state: GameState, pile: PileReference): Card | null {
    switch (pile.type) {
      case 'foundation': {
        const f = state.foundations[pile.index ?? 0];
        return f.length > 0 ? f[f.length - 1] : null;
      }
      case 'tableau': {
        const t = state.tableau[pile.index ?? 0];
        return t.length > 0 ? t[t.length - 1] : null;
      }
      default:
        return null;
    }
  }
}
