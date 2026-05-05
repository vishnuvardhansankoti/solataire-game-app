import { describe, it, expect, beforeEach } from 'vitest';
import { WinDetector } from '../../src/engine/WinDetector';
import type { GameState } from '../../src/engine/types';
import type { GameConfig } from '../../src/engine/GameConfig';

const config: GameConfig = {
  gameId: 'klondike',
  displayName: 'Klondike',
  version: '1.0.0',
  decks: 1,
  suits: ['hearts', 'diamonds', 'clubs', 'spades'],
  cardValues: [1,2,3,4,5,6,7,8,9,10,11,12,13],
  piles: { foundations: { count: 4, buildRule: 'ascending-same-suit', startsWith: 1 } },
  winCondition: { type: 'all-to-foundations' },
  layout: { type: 'klondike-standard', topRow: [], bottomRows: [] },
};

function makeState(foundationSizes: number[]): GameState {
  return {
    schemaVersion: 1, gameId: 'klondike', sessionId: 'test',
    deck: [], waste: [],
    foundations: foundationSizes.map((n) =>
      Array.from({ length: n }, (_, i) => ({ suit: 'hearts', value: i + 1, faceUp: true }))
    ),
    tableau: [[], [], [], [], [], [], []],
    score: 0, moves: 0, elapsedSeconds: 0,
    drawMode: 1, isComplete: false, history: [],
  };
}

describe('WinDetector (all-to-foundations)', () => {
  const detector = new WinDetector(config);

  it('not won when foundations are empty', () => {
    expect(detector.isWon(makeState([0, 0, 0, 0]))).toBe(false);
  });

  it('not won when partially filled', () => {
    expect(detector.isWon(makeState([13, 13, 12, 13]))).toBe(false);
  });

  it('won when all 52 cards on foundations', () => {
    expect(detector.isWon(makeState([13, 13, 13, 13]))).toBe(true);
  });
});
