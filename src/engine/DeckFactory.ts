import type { Card, Suit } from './types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

function cryptoShuffleInPlace<T>(arr: T[]): void {
  // Fisher-Yates with crypto.getRandomValues for cryptographically random order
  const randomValues = new Uint32Array(arr.length);
  crypto.getRandomValues(randomValues);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomValues[i] % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}

export function buildDeck(decks = 1): Card[] {
  const cards: Card[] = [];
  for (let d = 0; d < decks; d++) {
    for (const suit of SUITS) {
      for (let value = 1; value <= 13; value++) {
        cards.push({ suit, value, faceUp: false });
      }
    }
  }
  return cards;
}

export function shuffleDeck(cards: Card[]): Card[] {
  const shuffled = [...cards];
  cryptoShuffleInPlace(shuffled);
  return shuffled;
}
