import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../../src/engine/GameEngine';
import type { GameConfig } from '../../src/engine/GameConfig';
import type { GameState } from '../../src/engine/types';
import freecellConfig from '../../src/games/freecell/config.json';

const config = freecellConfig as GameConfig;

// ── FreeCell config structure ─────────────────────────────────────────────
describe('FreeCell config structure', () => {
  it('gameId is freecell', () =>
    expect(config.gameId).toBe('freecell'));

  it('uses 1 deck', () =>
    expect(config.decks).toBe(1));

  it('has 4 suits', () =>
    expect(config.suits).toHaveLength(4));

  it('has 13 card values', () =>
    expect(config.cardValues).toHaveLength(13));

  it('has 8 tableau columns', () =>
    expect(config.piles.tableau?.count).toBe(8));

  it('has 4 foundation piles', () =>
    expect(config.piles.foundations?.count).toBe(4));

  it('has 4 free cell slots', () =>
    expect(config.piles.freeCells?.count).toBe(4));

  it('tableau buildRule is descending-alternating-color', () =>
    expect(config.piles.tableau?.buildRule).toBe('descending-alternating-color'));

  it('tableau emptyColumnRule is any', () =>
    expect(config.piles.tableau?.emptyColumnRule).toBe('any'));

  it('foundation buildRule is ascending-same-suit', () =>
    expect(config.piles.foundations?.buildRule).toBe('ascending-same-suit'));

  it('foundation startsWith is 1 (Ace)', () =>
    expect(config.piles.foundations?.startsWith).toBe(1));

  it('winCondition is all-to-foundations', () =>
    expect(config.winCondition.type).toBe('all-to-foundations'));

  it('has no stock pile', () =>
    expect(config.piles.stock).toBeUndefined());

  it('has no waste pile', () =>
    expect(config.piles.waste).toBeUndefined());
});

// ── FreeCell deal pattern ─────────────────────────────────────────────────
describe('FreeCell deal pattern', () => {
  it('dealPattern has 8 entries', () =>
    expect(config.piles.tableau?.dealPattern).toHaveLength(8));

  it('first 4 columns have 7 cards', () =>
    expect(config.piles.tableau?.dealPattern?.slice(0, 4).every(n => n === 7)).toBe(true));

  it('last 4 columns have 6 cards', () =>
    expect(config.piles.tableau?.dealPattern?.slice(4).every(n => n === 6)).toBe(true));

  it('dealPattern totals 52 cards', () => {
    const total = config.piles.tableau?.dealPattern?.reduce((a, b) => a + b, 0);
    expect(total).toBe(52); // 4*7 + 4*6
  });
});

// ── GameEngine deal ───────────────────────────────────────────────────────
describe('FreeCell GameEngine deal', () => {
  let engine: GameEngine;
  let state: GameState;

  beforeEach(() => {
    engine = new GameEngine(config);
    state = engine.newGame({ drawMode: 1 });
  });

  it('tableau has 8 columns', () =>
    expect(state.tableau).toHaveLength(8));

  it('first 4 columns have 7 cards each', () =>
    expect(state.tableau.slice(0, 4).every(col => col.length === 7)).toBe(true));

  it('last 4 columns have 6 cards each', () =>
    expect(state.tableau.slice(4).every(col => col.length === 6)).toBe(true));

  it('total tableau cards is 52', () => {
    const total = state.tableau.reduce((sum, col) => sum + col.length, 0);
    expect(total).toBe(52);
  });

  it('deck (stock) is empty after deal', () =>
    expect(state.deck).toHaveLength(0));

  it('waste is empty after deal', () =>
    expect(state.waste).toHaveLength(0));

  it('4 foundation piles exist and are empty', () => {
    expect(state.foundations).toHaveLength(4);
    expect(state.foundations.every(f => f.length === 0)).toBe(true);
  });

  it('4 free cell slots exist and are empty (null)', () => {
    expect(state.freeCells).toHaveLength(4);
    expect(state.freeCells.every(c => c === null)).toBe(true);
  });

  it('all tableau cards are face-up', () =>
    expect(state.tableau.every(col => col.every(card => card.faceUp))).toBe(true));

  it('no duplicate cards in deal', () => {
    const allCards = state.tableau.flat();
    const keys = allCards.map(c => `${c.suit}-${c.value}`);
    const unique = new Set(keys);
    expect(unique.size).toBe(52);
  });

  it('all 4 suits are present', () => {
    const allCards = state.tableau.flat();
    const suits = new Set(allCards.map(c => c.suit));
    expect(suits.has('spades')).toBe(true);
    expect(suits.has('hearts')).toBe(true);
    expect(suits.has('diamonds')).toBe(true);
    expect(suits.has('clubs')).toBe(true);
  });

  it('all values 1–13 are present for each suit', () => {
    const allCards = state.tableau.flat();
    for (const suit of ['spades', 'hearts', 'diamonds', 'clubs']) {
      for (let v = 1; v <= 13; v++) {
        expect(allCards.some(c => c.suit === suit && c.value === v)).toBe(true);
      }
    }
  });

  it('gameId in state is freecell', () =>
    expect(state.gameId).toBe('freecell'));

  it('initial score is 0', () =>
    expect(state.score).toBe(0));

  it('initial moves is 0', () =>
    expect(state.moves).toBe(0));

  it('isComplete is false at start', () =>
    expect(state.isComplete).toBe(false));
});
