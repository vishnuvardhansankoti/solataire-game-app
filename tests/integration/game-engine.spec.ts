import { describe, it, expect } from 'vitest';
import { GameEngine } from '../../src/engine/GameEngine';
import klondikeConfig from '../../src/games/klondike/config.json';
import type { GameConfig } from '../../src/engine/GameConfig';

const config = klondikeConfig as GameConfig;

describe('GameEngine — integration', () => {
  it('INT-001: new game has correct structure', () => {
    const engine = new GameEngine(config);
    const state = engine.newGame({ drawMode: 1 });
    expect(state.deck.length + state.waste.length).toBe(24);
    expect(state.tableau).toHaveLength(7);
    for (let i = 0; i < 7; i++) {
      expect(state.tableau[i]).toHaveLength(i + 1);
      // Only top card is face-up
      const top = state.tableau[i][i];
      expect(top.faceUp).toBe(true);
      for (let j = 0; j < i; j++) {
        expect(state.tableau[i][j].faceUp).toBe(false);
      }
    }
    expect(state.foundations).toHaveLength(4);
    expect(state.foundations.every((f) => f.length === 0)).toBe(true);
    expect(state.isComplete).toBe(false);
  });

  it('INT-002: win detected after all 52 cards on foundations', () => {
    const engine = new GameEngine(config);
    let state = engine.newGame({ drawMode: 1 });
    // Manually set all foundations to 13 cards each
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
    state = {
      ...state,
      deck: [],
      waste: [],
      tableau: [[], [], [], [], [], [], []],
      foundations: suits.map((suit) =>
        Array.from({ length: 13 }, (_, i) => ({ suit, value: i + 1, faceUp: true }))
      ),
    };
    expect(engine.isWon(state)).toBe(true);
  });

  it('INT-003: 5 moves then 5 undos restores state', () => {
    const engine = new GameEngine(config);
    const initial = engine.newGame({ drawMode: 1 });
    // Do 5 draws (simplest repeatable action)
    let current = initial;
    const snapshots = [current];
    for (let i = 0; i < 5; i++) {
      current = engine.draw(current);
      snapshots.push(current);
    }
    // Undo 5 times
    for (let i = 5; i > 0; i--) {
      current = engine.undo(current);
    }
    expect(current.deck.length).toBe(initial.deck.length);
    expect(current.waste.length).toBe(initial.waste.length);
    expect(current.moves).toBe(0);
  });

  it('INT-004: draw-1 recycle restores waste to stock', () => {
    const engine = new GameEngine(config);
    const state = engine.newGame({ drawMode: 1 });
    // Drain entire stock
    let current = state;
    while (current.deck.length > 0) {
      current = engine.draw(current);
    }
    expect(current.deck.length).toBe(0);
    // Next draw should recycle
    const recycled = engine.draw(current);
    expect(recycled.waste.length).toBe(0);
    // All recycled cards are face-down in deck
    expect(recycled.deck.every((c) => !c.faceUp)).toBe(true);
  });

  it('INT-005: draw-3 mode draws up to 3 cards', () => {
    const engine = new GameEngine(config);
    const state = engine.newGame({ drawMode: 3 });
    const initialDeckSize = state.deck.length;
    const drawn = engine.draw(state);
    const cardsDrawn = initialDeckSize - drawn.deck.length;
    expect(cardsDrawn).toBeLessThanOrEqual(3);
    expect(cardsDrawn).toBeGreaterThan(0);
    expect(drawn.waste.at(-1)?.faceUp).toBe(true);
  });
});
