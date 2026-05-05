import { describe, it, expect } from 'vitest';
import { getStrategy } from '../../src/engine/strategies/registry';
import type { Card } from '../../src/engine/types';

const ACE_HEARTS: Card = { suit: 'hearts', value: 1, faceUp: true };
const TWO_HEARTS: Card = { suit: 'hearts', value: 2, faceUp: true };
const KING_SPADES: Card = { suit: 'spades', value: 13, faceUp: true };
const QUEEN_HEARTS: Card = { suit: 'hearts', value: 12, faceUp: true };
const QUEEN_DIAMONDS: Card = { suit: 'diamonds', value: 12, faceUp: true };
const JACK_CLUBS: Card = { suit: 'clubs', value: 11, faceUp: true };
const ACE_FACE_DOWN: Card = { suit: 'hearts', value: 1, faceUp: false };

describe('ascending-same-suit (foundation)', () => {
  const s = getStrategy('ascending-same-suit');

  it('Ace on empty foundation', () => expect(s.canPlace([ACE_HEARTS], null, 1)).toBe(true));
  it('Two on Ace same suit', () => expect(s.canPlace([TWO_HEARTS], ACE_HEARTS)).toBe(true));
  it('Two on Ace wrong suit rejected', () => {
    const twoClubs: Card = { suit: 'clubs', value: 2, faceUp: true };
    expect(s.canPlace([twoClubs], ACE_HEARTS)).toBe(false);
  });
  it('face-down card rejected', () => expect(s.canPlace([ACE_FACE_DOWN], null, 1)).toBe(false));
  it('multiple cards rejected', () => expect(s.canPlace([ACE_HEARTS, TWO_HEARTS], null, 1)).toBe(false));
  it('non-Ace on empty rejected', () => expect(s.canPlace([TWO_HEARTS], null, 1)).toBe(false));
});

describe('descending-alternating-color (tableau)', () => {
  const s = getStrategy('descending-alternating-color');

  it('King on empty column', () => expect(s.canPlace([KING_SPADES], null)).toBe(true));
  it('non-King on empty rejected', () => expect(s.canPlace([QUEEN_HEARTS], null)).toBe(false));
  it('Red Q on black K', () => expect(s.canPlace([QUEEN_HEARTS], KING_SPADES)).toBe(true));
  it('Red Q on red Q rejected (same color)', () => expect(s.canPlace([QUEEN_DIAMONDS], QUEEN_HEARTS)).toBe(false));
  it('Black J on Red Q', () => expect(s.canPlace([JACK_CLUBS], QUEEN_HEARTS)).toBe(true));
  it('face-down card rejected', () => expect(s.canPlace([ACE_FACE_DOWN], KING_SPADES)).toBe(false));
});

describe('any strategy', () => {
  const s = getStrategy('any');
  it('any face-up card accepted', () => expect(s.canPlace([ACE_HEARTS], null)).toBe(true));
  it('face-down card rejected', () => expect(s.canPlace([ACE_FACE_DOWN], null)).toBe(false));
});

describe('none strategy', () => {
  const s = getStrategy('none');
  it('always rejects', () => expect(s.canPlace([ACE_HEARTS], null)).toBe(false));
});

describe('getStrategy error handling', () => {
  it('throws on unknown rule', () => {
    expect(() => getStrategy('does-not-exist')).toThrow(/Unknown build rule strategy/);
  });
});
