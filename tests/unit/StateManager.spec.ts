import { describe, it, expect } from 'vitest';
import { StateManager } from '../../src/engine/StateManager';
import type { GameState, Card } from '../../src/engine/types';
import type { GameConfig } from '../../src/engine/GameConfig';

const config: GameConfig = {
  gameId: 'klondike', displayName: 'Klondike', version: '1.0.0',
  decks: 1, suits: ['hearts', 'diamonds', 'clubs', 'spades'],
  cardValues: [1,2,3,4,5,6,7,8,9,10,11,12,13],
  piles: {
    foundations: { count: 4, buildRule: 'ascending-same-suit', startsWith: 1 },
    tableau: { count: 7, buildRule: 'descending-alternating-color' },
  },
  winCondition: { type: 'all-to-foundations' },
  scoring: { wasteToFoundation: 10, tableauToFoundation: 10, foundationToTableau: -15, flipCard: 5 },
  layout: { type: 'test', topRow: [], bottomRows: [] },
};

const mgr = new StateManager(config);

const ACE_H: Card = { suit: 'hearts', value: 1, faceUp: true };
const TWO_H: Card = { suit: 'hearts', value: 2, faceUp: true };
const FACE_DOWN: Card = { suit: 'clubs', value: 5, faceUp: false };

function baseState(): GameState {
  return {
    schemaVersion: 1, gameId: 'klondike', sessionId: 'test',
    deck: [], waste: [ACE_H],
    foundations: [[], [], [], []],
    tableau: [[FACE_DOWN, TWO_H], [], [], [], [], [], []],
    freeCells: [],
    score: 0, moves: 0, elapsedSeconds: 0,
    drawMode: 1, isComplete: false, history: [],
  };
}

describe('StateManager.applyMove', () => {
  it('moves card from waste to foundation', () => {
    const state = baseState();
    const next = mgr.applyMove(state, { type: 'waste' }, { type: 'foundation', index: 0 }, [ACE_H]);
    expect(next.waste).toHaveLength(0);
    expect(next.foundations[0]).toHaveLength(1);
    expect(next.score).toBe(10);
    expect(next.moves).toBe(1);
  });

  it('flips card when tableau column top was face-down', () => {
    const state = baseState();
    const next = mgr.applyMove(state, { type: 'tableau', index: 0 }, { type: 'foundation', index: 0 }, [TWO_H]);
    // TWO_H was top of tableau[0]; FACE_DOWN should be flipped
    expect(next.tableau[0][0].faceUp).toBe(true);
    expect(next.score).toBe(15); // tableauToFoundation:10 + flipCard:5
  });

  it('records history entry', () => {
    const state = baseState();
    const next = mgr.applyMove(state, { type: 'waste' }, { type: 'foundation', index: 0 }, [ACE_H]);
    expect(next.history).toHaveLength(1);
    expect(next.history[0].scoreChange).toBe(10);
  });
});

describe('StateManager.undoMove', () => {
  it('undoes a waste→foundation move', () => {
    const state = baseState();
    const after = mgr.applyMove(state, { type: 'waste' }, { type: 'foundation', index: 0 }, [ACE_H]);
    const undone = mgr.undoMove(after);
    expect(undone.waste).toHaveLength(1);
    expect(undone.foundations[0]).toHaveLength(0);
    expect(undone.score).toBe(0);
    expect(undone.history).toHaveLength(0);
  });

  it('returns same state when history is empty', () => {
    const state = baseState();
    const result = mgr.undoMove(state);
    expect(result.history).toHaveLength(0);
  });
});

describe('StateManager.applyDraw', () => {
  it('draws cards from stock to waste', () => {
    const state = { ...baseState(), deck: [{ suit: 'spades', value: 5, faceUp: false } as Card], waste: [] };
    const next = mgr.applyDraw(state);
    expect(next.waste).toHaveLength(1);
    expect(next.waste[0].faceUp).toBe(true);
    expect(next.deck).toHaveLength(0);
  });

  it('recycles waste to deck when stock is empty', () => {
    const state = { ...baseState(), deck: [], waste: [ACE_H] };
    const next = mgr.applyDraw(state);
    expect(next.deck).toHaveLength(1);
    expect(next.waste).toHaveLength(0);
    expect(next.deck[0].faceUp).toBe(false);
  });
});
