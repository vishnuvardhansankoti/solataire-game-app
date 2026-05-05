import type { Card, GameState, PileReference, Settings } from './types';
import type { GameConfig } from './GameConfig';
import { buildDeck, shuffleDeck } from './DeckFactory';
import { MoveValidator } from './MoveValidator';
import { StateManager } from './StateManager';
import { WinDetector } from './WinDetector';

const SCHEMA_VERSION = 1;

function generateSessionId(): string {
  // UUID v4 using crypto.getRandomValues
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return [...bytes].map((b, i) =>
    [4, 6, 8, 10].includes(i) ? `-${b.toString(16).padStart(2, '0')}` : b.toString(16).padStart(2, '0')
  ).join('');
}

export class GameEngine {
  private validator: MoveValidator;
  private stateMgr: StateManager;
  private winDetector: WinDetector;

  constructor(private config: GameConfig) {
    this.validator = new MoveValidator(config);
    this.stateMgr = new StateManager(config);
    this.winDetector = new WinDetector(config);
  }

  newGame(settings: Pick<Settings, 'drawMode'>): GameState {
    const deck = shuffleDeck(buildDeck(this.config.decks ?? 1));
    const tableauCount = this.config.piles.tableau?.count ?? 7;
    const foundationCount = this.config.piles.foundations?.count ?? 4;
    const dealPattern = this.config.piles.tableau?.dealPattern;

    const tableau: Card[][] = [];
    let deckIndex = 0;

    for (let col = 0; col < tableauCount; col++) {
      const column: Card[] = [];
      // Use explicit dealPattern if provided, otherwise fall back to col+1 (Klondike)
      const cardCount = dealPattern ? dealPattern[col] : col + 1;
      for (let i = 0; i < cardCount; i++) {
        const card = { ...deck[deckIndex++], faceUp: i === cardCount - 1 };
        column.push(card);
      }
      tableau.push(column);
    }

    const foundations: Card[][] = Array.from({ length: foundationCount }, () => []);
    const stock = deck.slice(deckIndex).map((c) => ({ ...c, faceUp: false }));

    return {
      schemaVersion: SCHEMA_VERSION,
      gameId: this.config.gameId,
      sessionId: generateSessionId(),
      deck: stock,
      waste: [],
      foundations,
      tableau,
      score: 0,
      moves: 0,
      elapsedSeconds: 0,
      drawMode: settings.drawMode,
      isComplete: false,
      history: [],
    };
  }

  applyMove(state: GameState, from: PileReference, to: PileReference, cards: Card[]): GameState | null {
    if (!this.validator.canMove(state, from, to, cards)) return null;
    const next = this.stateMgr.applyMove(state, from, to, cards);
    return { ...next, isComplete: this.winDetector.isWon(next) };
  }

  draw(state: GameState): GameState {
    return this.stateMgr.applyDraw(state);
  }

  undo(state: GameState): GameState {
    return this.stateMgr.undoMove(state);
  }

  canMove(state: GameState, from: PileReference, to: PileReference, cards: Card[]): boolean {
    return this.validator.canMove(state, from, to, cards);
  }

  isWon(state: GameState): boolean {
    return this.winDetector.isWon(state);
  }
}
