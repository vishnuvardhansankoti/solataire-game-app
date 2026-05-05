export interface ScoringConfig {
  wasteToTableau?: number;
  wasteToFoundation?: number;
  tableauToFoundation?: number;
  foundationToTableau?: number;
  flipCard?: number;
  timePenaltyInterval?: number;
  timePenaltyAmount?: number;
  timePenaltyGracePeriod?: number;
}

export interface PileConfig {
  count: number;
  buildRule?: string;
  emptyColumnRule?: string;
  startsWith?: number;
  initialCards?: number | string;
  faceUp?: boolean;
  topCardFaceUp?: boolean;
}

export interface LayoutConfig {
  type: string;
  topRow: string[];
  bottomRows: string[];
}

export interface AssetsConfig {
  cardBack?: string;
  cardFaceTheme?: 'standard' | 'minimal' | 'large-print';
}

export interface GameConfig {
  gameId: string;
  displayName: string;
  version: string;
  decks: number;
  suits: string[];
  cardValues: number[];
  piles: {
    stock?: PileConfig;
    waste?: PileConfig;
    foundations?: PileConfig;
    tableau?: PileConfig;
    freeCells?: PileConfig;
  };
  drawMode?: {
    options: (1 | 3)[];
    default: 1 | 3;
  };
  winCondition: {
    type: 'all-to-foundations' | 'all-ordered-tableau';
  };
  scoring?: ScoringConfig;
  layout: LayoutConfig;
  assets?: AssetsConfig;
}
