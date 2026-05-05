import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GAME_REGISTRY, getGameConfig } from '../../src/games/registry';

describe('GAME_REGISTRY', () => {
  it('contains exactly 3 games', () => {
    expect(GAME_REGISTRY).toHaveLength(3);
  });

  it('includes klondike', () => {
    expect(GAME_REGISTRY.find((g) => g.gameId === 'klondike')).toBeDefined();
  });

  it('includes spider', () => {
    expect(GAME_REGISTRY.find((g) => g.gameId === 'spider')).toBeDefined();
  });

  it('includes freecell', () => {
    expect(GAME_REGISTRY.find((g) => g.gameId === 'freecell')).toBeDefined();
  });

  it('every entry has a displayName string', () => {
    for (const game of GAME_REGISTRY) {
      expect(typeof game.displayName).toBe('string');
      expect(game.displayName.length).toBeGreaterThan(0);
    }
  });

  it('every entry has a gameId string', () => {
    for (const game of GAME_REGISTRY) {
      expect(typeof game.gameId).toBe('string');
    }
  });

  it('all gameIds are unique', () => {
    const ids = GAME_REGISTRY.map((g) => g.gameId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('getGameConfig', () => {
  it('returns klondike config by id', () => {
    const cfg = getGameConfig('klondike');
    expect(cfg.gameId).toBe('klondike');
  });

  it('returns spider config by id', () => {
    const cfg = getGameConfig('spider');
    expect(cfg.gameId).toBe('spider');
  });

  it('returns freecell config by id', () => {
    const cfg = getGameConfig('freecell');
    expect(cfg.gameId).toBe('freecell');
  });

  it('throws for unknown gameId', () => {
    expect(() => getGameConfig('pyramid')).toThrow('Unknown gameId: pyramid');
  });

  it('returned config has a decks property', () => {
    const cfg = getGameConfig('klondike');
    expect(typeof cfg.decks).toBe('number');
  });
});
