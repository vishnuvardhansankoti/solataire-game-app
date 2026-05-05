export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export interface Card {
  suit: Suit;
  value: number; // 1=Ace, 11=Jack, 12=Queen, 13=King
  faceUp: boolean;
}

export type PileType = 'stock' | 'waste' | 'foundation' | 'tableau' | 'freeCell';

export interface PileReference {
  type: PileType;
  index?: number;
}

export interface MoveRecord {
  from: PileReference;
  to: PileReference;
  cards: Card[];
  scoreChange: number;
  flippedCardIndex?: number;
}

export interface GameState {
  schemaVersion: number;
  gameId: string;
  sessionId: string;
  deck: Card[];
  waste: Card[];
  foundations: Card[][];
  tableau: Card[][];
  /** Free cell slots (FreeCell variant). Each slot holds 0 or 1 card. */
  freeCells: Array<Card | null>;
  score: number;
  moves: number;
  elapsedSeconds: number;
  drawMode: 1 | 3;
  isComplete: boolean;
  history: MoveRecord[];
}

export interface Settings {
  drawMode: 1 | 3;
  cardBack: string;
  cardFaceTheme: 'standard' | 'minimal' | 'large-print';
  autoFlip: boolean;
  animationsEnabled: boolean;
}
