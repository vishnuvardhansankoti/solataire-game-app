import type { GameState } from './types';
import type { GameConfig } from './GameConfig';

export class WinDetector {
  constructor(private config: GameConfig) {}

  isWon(state: GameState): boolean {
    switch (this.config.winCondition.type) {
      case 'all-to-foundations':
        return this.allCardsOnFoundations(state);
      case 'all-ordered-tableau':
        return this.allTableauOrdered(state);
      default:
        return false;
    }
  }

  private allCardsOnFoundations(state: GameState): boolean {
    const totalCards = 52 * (this.config.decks ?? 1);
    const foundationTotal = state.foundations.reduce((sum, f) => sum + f.length, 0);
    return foundationTotal === totalCards;
  }

  private allTableauOrdered(state: GameState): boolean {
    return state.deck.length === 0 &&
      state.waste.length === 0 &&
      state.tableau.every((col) => {
        if (col.length === 0) return true;
        for (let i = 1; i < col.length; i++) {
          if (col[i].value !== col[i - 1].value - 1) return false;
          if (col[i].suit !== col[0].suit) return false;
        }
        return true;
      });
  }
}
