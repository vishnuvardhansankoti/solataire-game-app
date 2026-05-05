import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildDeck, shuffleDeck } from '../../src/engine/DeckFactory';

// Polyfill crypto for jsdom
beforeEach(() => {
  if (!globalThis.crypto) {
    Object.defineProperty(globalThis, 'crypto', {
      value: { getRandomValues: (arr: Uint32Array) => { for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 0xFFFFFFFF); return arr; } },
    });
  }
});

describe('buildDeck', () => {
  it('builds 52 cards for 1 deck', () => {
    const deck = buildDeck(1);
    expect(deck).toHaveLength(52);
  });

  it('builds 104 cards for 2 decks', () => {
    expect(buildDeck(2)).toHaveLength(104);
  });

  it('all cards start face-down', () => {
    expect(buildDeck(1).every((c) => !c.faceUp)).toBe(true);
  });

  it('contains all 4 suits × 13 values', () => {
    const deck = buildDeck(1);
    const suits = new Set(deck.map((c) => c.suit));
    expect(suits.size).toBe(4);
    const values = deck.filter((c) => c.suit === 'hearts').map((c) => c.value);
    expect(values).toHaveLength(13);
    expect(Math.min(...values)).toBe(1);
    expect(Math.max(...values)).toBe(13);
  });
});

describe('shuffleDeck', () => {
  it('returns same length deck', () => {
    const deck = buildDeck();
    expect(shuffleDeck(deck)).toHaveLength(52);
  });

  it('does not mutate original deck', () => {
    const deck = buildDeck();
    const original = [...deck];
    shuffleDeck(deck);
    expect(deck).toEqual(original);
  });

  it('produces different ordering (probabilistic)', () => {
    const deck = buildDeck();
    const shuffled = shuffleDeck(deck);
    // Extremely unlikely to be identical after shuffle
    const sameOrder = shuffled.every((c, i) => c.suit === deck[i].suit && c.value === deck[i].value);
    expect(sameOrder).toBe(false);
  });
});
