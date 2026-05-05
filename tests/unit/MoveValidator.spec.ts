import { describe, it, expect } from 'vitest';
import { MoveValidator } from '../../src/engine/MoveValidator';
import type { GameState, Card } from '../../src/engine/types';
import type { GameConfig } from '../../src/engine/GameConfig';

const config: GameConfig = {
  gameId: 'klondike', displayName: 'Klondike', version: '1.0.0',
  decks: 1, suits: ['hearts','diamonds','clubs','spades'],
  cardValues: [1,2,3,4,5,6,7,8,9,10,11,12,13],
  piles: {
    foundations: { count: 4, buildRule: 'ascending-same-suit', startsWith: 1 },
    tableau: { count: 7, buildRule: 'descending-alternating-color', emptyColumnRule: 'any' },
  },
  winCondition: { type: 'all-to-foundations' },
  layout: { type: 'test', topRow: [], bottomRows: [] },
};

const validator = new MoveValidator(config);

const ACE_H: Card = { suit: 'hearts', value: 1, faceUp: true };
const TWO_CLUBS: Card = { suit: 'clubs', value: 2, faceUp: true };
const KING_S: Card = { suit: 'spades', value: 13, faceUp: true };
const QUEEN_H: Card = { suit: 'hearts', value: 12, faceUp: true };

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    schemaVersion: 1, gameId: 'klondike', sessionId: 'test',
    deck: [], waste: [],
    foundations: [[], [], [], []],
    tableau: [[], [], [], [], [], [], []],
    score: 0, moves: 0, elapsedSeconds: 0,
    drawMode: 1, isComplete: false, history: [],
    ...overrides,
  };
}

describe('MoveValidator', () => {
  it('allows Ace to empty foundation', () => {
    const state = makeState({ waste: [ACE_H] });
    expect(validator.canMove(state, { type: 'waste' }, { type: 'foundation', index: 0 }, [ACE_H])).toBe(true);
  });

  it('rejects non-Ace to empty foundation', () => {
    const state = makeState({ waste: [TWO_CLUBS] });
    expect(validator.canMove(state, { type: 'waste' }, { type: 'foundation', index: 0 }, [TWO_CLUBS])).toBe(false);
  });

  it('allows King on empty tableau', () => {
    const state = makeState();
    expect(validator.canMove(state, { type: 'waste' }, { type: 'tableau', index: 0 }, [KING_S])).toBe(true);
  });

  it('allows Red Queen on Black King', () => {
    const state = makeState({ tableau: [[KING_S], [], [], [], [], [], []] });
    expect(validator.canMove(state, { type: 'waste' }, { type: 'tableau', index: 0 }, [QUEEN_H])).toBe(true);
  });

  it('rejects move to waste', () => {
    const state = makeState();
    expect(validator.canMove(state, { type: 'foundation', index: 0 }, { type: 'waste' }, [ACE_H])).toBe(false);
  });

  it('rejects empty cards array', () => {
    const state = makeState();
    expect(validator.canMove(state, { type: 'waste' }, { type: 'foundation', index: 0 }, [])).toBe(false);
  });
});
