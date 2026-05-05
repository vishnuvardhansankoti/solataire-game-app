import { describe, it, expect } from 'vitest';
import { getStrategy } from '../../src/engine/strategies/registry';
import { GameEngine } from '../../src/engine/GameEngine';
import type { GameConfig } from '../../src/engine/GameConfig';
import type { Card } from '../../src/engine/types';
import spiderConfig from '../../src/games/spider/config.json';

const config = spiderConfig as GameConfig;

// ── Card fixtures ──────────────────────────────────────────────────────────
const KING_SPADES: Card   = { suit: 'spades',   value: 13, faceUp: true };
const QUEEN_SPADES: Card  = { suit: 'spades',   value: 12, faceUp: true };
const QUEEN_HEARTS: Card  = { suit: 'hearts',   value: 12, faceUp: true };
const JACK_CLUBS: Card    = { suit: 'clubs',    value: 11, faceUp: true };
const JACK_SPADES: Card   = { suit: 'spades',   value: 11, faceUp: true };
const ACE_SPADES: Card    = { suit: 'spades',   value:  1, faceUp: true };
const FACE_DOWN: Card     = { suit: 'spades',   value:  7, faceUp: false };

// ── descending-any-suit strategy ──────────────────────────────────────────
describe('descending-any-suit strategy (Spider tableau)', () => {
  const s = getStrategy('descending-any-suit');

  it('King on empty column', () =>
    expect(s.canPlace([KING_SPADES], null)).toBe(true));

  it('non-King on empty column rejected', () =>
    expect(s.canPlace([QUEEN_SPADES], null)).toBe(false));

  it('same-suit descend: Q♠ on K♠', () =>
    expect(s.canPlace([QUEEN_SPADES], KING_SPADES)).toBe(true));

  it('different-suit descend: Q♥ on K♠ allowed', () =>
    expect(s.canPlace([QUEEN_HEARTS], KING_SPADES)).toBe(true));

  it('J♣ on Q♥ allowed (any suit)', () =>
    expect(s.canPlace([JACK_CLUBS], QUEEN_HEARTS)).toBe(true));

  it('same rank rejected: Q♠ on Q♠', () =>
    expect(s.canPlace([QUEEN_SPADES], QUEEN_SPADES)).toBe(false));

  it('skip rank rejected: J♠ on K♠', () =>
    expect(s.canPlace([JACK_SPADES], KING_SPADES)).toBe(false));

  it('face-down card rejected', () =>
    expect(s.canPlace([FACE_DOWN], KING_SPADES)).toBe(false));

  it('Ace on Two (any suit)', () => {
    const TWO_HEARTS: Card = { suit: 'hearts', value: 2, faceUp: true };
    expect(s.canPlace([ACE_SPADES], TWO_HEARTS)).toBe(true);
  });
});

// ── Spider config structure ───────────────────────────────────────────────
describe('Spider config structure', () => {
  it('gameId is spider', () =>
    expect(config.gameId).toBe('spider'));

  it('uses 2 decks', () =>
    expect(config.decks).toBe(2));

  it('has 10 tableau columns', () =>
    expect(config.piles.tableau?.count).toBe(10));

  it('has 8 foundation piles', () =>
    expect(config.piles.foundations?.count).toBe(8));

  it('tableau buildRule is descending-any-suit', () =>
    expect(config.piles.tableau?.buildRule).toBe('descending-any-suit'));

  it('winCondition is all-to-foundations', () =>
    expect(config.winCondition.type).toBe('all-to-foundations'));

  it('dealPattern has 10 entries', () =>
    expect(config.piles.tableau?.dealPattern).toHaveLength(10));

  it('dealPattern first 4 columns have 6 cards', () =>
    expect(config.piles.tableau?.dealPattern?.slice(0, 4).every(n => n === 6)).toBe(true));

  it('dealPattern last 6 columns have 5 cards', () =>
    expect(config.piles.tableau?.dealPattern?.slice(4).every(n => n === 5)).toBe(true));

  it('dealPattern totals 54 initial tableau cards', () => {
    const total = config.piles.tableau?.dealPattern?.reduce((a, b) => a + b, 0);
    expect(total).toBe(54); // 4*6 + 6*5
  });
});

// ── GameEngine deal ───────────────────────────────────────────────────────
describe('Spider GameEngine deal', () => {
  const engine = new GameEngine(config);
  const state = engine.newGame({ drawMode: 1 });

  it('tableau has 10 columns', () =>
    expect(state.tableau).toHaveLength(10));

  it('first 4 columns have 6 cards each', () =>
    expect(state.tableau.slice(0, 4).every(col => col.length === 6)).toBe(true));

  it('last 6 columns have 5 cards each', () =>
    expect(state.tableau.slice(4).every(col => col.length === 5)).toBe(true));

  it('only the top card of each column is face-up', () => {
    for (const col of state.tableau) {
      for (let i = 0; i < col.length - 1; i++) {
        expect(col[i].faceUp).toBe(false);
      }
      expect(col[col.length - 1].faceUp).toBe(true);
    }
  });

  it('stock contains remaining 50 cards (104 - 54)', () =>
    expect(state.deck).toHaveLength(50));

  it('total card count is 104 (2 decks)', () => {
    const total = state.tableau.reduce((s, c) => s + c.length, 0) + state.deck.length;
    expect(total).toBe(104);
  });

  it('game starts incomplete', () =>
    expect(state.isComplete).toBe(false));
});
