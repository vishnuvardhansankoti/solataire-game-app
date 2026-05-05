import type { Card, GameState, MoveRecord, PileReference } from './types';
import type { GameConfig, ScoringConfig } from './GameConfig';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

function getScoreDelta(from: PileReference, to: PileReference, scoring: ScoringConfig): number {
  if (to.type === 'foundation') {
    if (from.type === 'waste') return scoring.wasteToFoundation ?? 10;
    if (from.type === 'tableau') return scoring.tableauToFoundation ?? 10;
  }
  if (to.type === 'tableau') {
    if (from.type === 'waste') return scoring.wasteToTableau ?? 5;
    if (from.type === 'foundation') return scoring.foundationToTableau ?? -15;
  }
  return 0;
}

export class StateManager {
  constructor(private config: GameConfig) {}

  applyMove(state: GameState, from: PileReference, to: PileReference, cards: Card[]): GameState {
    const next = deepClone(state);
    const scoreChange = getScoreDelta(from, to, this.config.scoring ?? {});
    const record: MoveRecord = {
      from,
      to,
      cards: deepClone(cards),
      scoreChange,
    };

    // Remove cards from source pile
    this.removeFromPile(next, from, cards.length);

    // Flip newly revealed top card in tableau
    if (from.type === 'tableau') {
      const col = next.tableau[from.index ?? 0];
      if (col.length > 0 && !col[col.length - 1].faceUp) {
        col[col.length - 1].faceUp = true;
        record.flippedCardIndex = from.index;
        next.score += this.config.scoring?.flipCard ?? 5;
      }
    }

    // Place cards on destination pile
    this.addToPile(next, to, cards);

    next.score = Math.max(0, next.score + scoreChange);
    next.moves += 1;
    next.history.push(record);

    return next;
  }

  undoMove(state: GameState): GameState {
    if (state.history.length === 0) return state;
    const next = deepClone(state);
    const record = next.history.pop() as MoveRecord;

    // Remove cards from destination (where they landed)
    this.removeFromPile(next, record.to, record.cards.length);

    // Un-flip card that was flipped during the move
    if (record.flippedCardIndex !== undefined) {
      const col = next.tableau[record.flippedCardIndex];
      if (col.length > 0) {
        col[col.length - 1].faceUp = false;
        next.score = Math.max(0, next.score - (this.config.scoring?.flipCard ?? 5));
      }
    }

    // Restore cards to source (as they were before the move)
    this.addToPile(next, record.from, record.cards);

    next.score = Math.max(0, next.score - record.scoreChange);
    next.moves += 1; // undo counts as a move

    return next;
  }

  applyDraw(state: GameState): GameState {
    const next = deepClone(state);
    const drawCount = next.drawMode;

    if (next.deck.length === 0) {
      // Recycle waste back to deck face-down
      const recycled = next.waste.reverse().map((c) => ({ ...c, faceUp: false }));
      next.deck = recycled;
      next.waste = [];
    } else {
      const drawn = next.deck.splice(-drawCount).reverse();
      drawn.forEach((c) => (c.faceUp = true));
      next.waste.push(...drawn);
    }

    return next;
  }

  private removeFromPile(state: GameState, pile: PileReference, count: number): void {
    switch (pile.type) {
      case 'waste':
        state.waste.splice(state.waste.length - count, count);
        break;
      case 'foundation':
        state.foundations[pile.index ?? 0].splice(-count, count);
        break;
      case 'tableau':
        state.tableau[pile.index ?? 0].splice(-count, count);
        break;
      case 'stock':
        state.deck.splice(-count, count);
        break;
    }
  }

  private addToPile(state: GameState, pile: PileReference, cards: Card[]): void {
    switch (pile.type) {
      case 'waste':
        state.waste.push(...cards);
        break;
      case 'foundation':
        state.foundations[pile.index ?? 0].push(...cards);
        break;
      case 'tableau':
        state.tableau[pile.index ?? 0].push(...cards);
        break;
      case 'stock':
        state.deck.push(...cards);
        break;
    }
  }
}
