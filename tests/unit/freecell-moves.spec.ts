import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../../src/engine/GameEngine';
import { MoveValidator } from '../../src/engine/MoveValidator';
import type { GameConfig } from '../../src/engine/GameConfig';
import type { Card, GameState } from '../../src/engine/types';
import freecellConfig from '../../src/games/freecell/config.json';

const config = freecellConfig as GameConfig;

// ── Card fixtures ──────────────────────────────────────────────────────────
const ACE_SPADES: Card    = { suit: 'spades',   value:  1, faceUp: true };
const ACE_HEARTS: Card    = { suit: 'hearts',   value:  1, faceUp: true };
const TWO_HEARTS: Card    = { suit: 'hearts',   value:  2, faceUp: true };
const TWO_CLUBS: Card     = { suit: 'clubs',    value:  2, faceUp: true };
const THREE_HEARTS: Card  = { suit: 'hearts',   value:  3, faceUp: true };
const THREE_SPADES: Card  = { suit: 'spades',   value:  3, faceUp: true };
const FOUR_HEARTS: Card   = { suit: 'hearts',   value:  4, faceUp: true };
const FIVE_SPADES: Card   = { suit: 'spades',   value:  5, faceUp: true };
const JACK_CLUBS: Card    = { suit: 'clubs',    value: 11, faceUp: true };
const QUEEN_HEARTS: Card  = { suit: 'hearts',   value: 12, faceUp: true };
const QUEEN_SPADES: Card  = { suit: 'spades',   value: 12, faceUp: true };
const KING_SPADES: Card   = { suit: 'spades',   value: 13, faceUp: true };
const KING_HEARTS: Card   = { suit: 'hearts',   value: 13, faceUp: true };
const FACE_DOWN: Card     = { suit: 'spades',   value:  7, faceUp: false };

/**
 * Build a minimal GameState for move validation tests.
 * Free cells are all null (empty) by default.
 */
function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    schemaVersion: 1,
    gameId: 'freecell',
    sessionId: 'test-session',
    deck: [],
    waste: [],
    foundations: [[], [], [], []],
    tableau: [[], [], [], [], [], [], [], []],
    freeCells: [null, null, null, null],
    score: 0,
    moves: 0,
    elapsedSeconds: 0,
    drawMode: 1,
    isComplete: false,
    history: [],
    ...overrides,
  };
}

// ── Free cell move validation ─────────────────────────────────────────────
describe('FreeCell: free cell moves', () => {
  let validator: MoveValidator;

  beforeEach(() => {
    validator = new MoveValidator(config);
  });

  it('any single face-up card can move to an empty free cell', () => {
    const state = makeState({ tableau: [[FIVE_SPADES], [], [], [], [], [], [], []] });
    expect(validator.canMove(state, { type: 'tableau', index: 0 }, { type: 'freeCell', index: 0 }, [FIVE_SPADES])).toBe(true);
  });

  it('face-down card cannot move to a free cell', () => {
    const state = makeState({ tableau: [[FACE_DOWN], [], [], [], [], [], [], []] });
    expect(validator.canMove(state, { type: 'tableau', index: 0 }, { type: 'freeCell', index: 0 }, [FACE_DOWN])).toBe(false);
  });

  it('cannot move two cards to a free cell', () => {
    const state = makeState({ tableau: [[KING_SPADES, QUEEN_HEARTS], [], [], [], [], [], [], []] });
    expect(validator.canMove(state, { type: 'tableau', index: 0 }, { type: 'freeCell', index: 0 }, [KING_SPADES, QUEEN_HEARTS])).toBe(false);
  });

  it('cannot move a card to an occupied free cell', () => {
    const state = makeState({
      tableau: [[FIVE_SPADES], [], [], [], [], [], [], []],
      freeCells: [ACE_HEARTS, null, null, null],
    });
    expect(validator.canMove(state, { type: 'tableau', index: 0 }, { type: 'freeCell', index: 0 }, [FIVE_SPADES])).toBe(false);
  });

  it('can move card to a different empty free cell slot', () => {
    const state = makeState({
      tableau: [[FIVE_SPADES], [], [], [], [], [], [], []],
      freeCells: [ACE_HEARTS, null, null, null],
    });
    expect(validator.canMove(state, { type: 'tableau', index: 0 }, { type: 'freeCell', index: 1 }, [FIVE_SPADES])).toBe(true);
  });

  it('card from free cell can move to tableau (valid alternating color descend)', () => {
    const state = makeState({
      tableau: [[KING_SPADES], [], [], [], [], [], [], []],
      freeCells: [QUEEN_HEARTS, null, null, null],
    });
    // Q♥ (red) on K♠ (black) — valid
    expect(validator.canMove(state, { type: 'freeCell', index: 0 }, { type: 'tableau', index: 0 }, [QUEEN_HEARTS])).toBe(true);
  });

  it('card from free cell blocked by wrong color on tableau', () => {
    const state = makeState({
      tableau: [[KING_HEARTS], [], [], [], [], [], [], []],
      freeCells: [QUEEN_HEARTS, null, null, null],
    });
    // Q♥ (red) on K♥ (red) — invalid alternating color
    expect(validator.canMove(state, { type: 'freeCell', index: 0 }, { type: 'tableau', index: 0 }, [QUEEN_HEARTS])).toBe(false);
  });

  it('card from free cell can move to foundation when eligible', () => {
    const state = makeState({
      freeCells: [ACE_SPADES, null, null, null],
      foundations: [[], [], [], []],
    });
    // Ace of spades to empty foundation
    expect(validator.canMove(state, { type: 'freeCell', index: 0 }, { type: 'foundation', index: 0 }, [ACE_SPADES])).toBe(true);
  });

  it('card from free cell blocked from foundation if wrong value', () => {
    const state = makeState({
      freeCells: [THREE_SPADES, null, null, null],
      foundations: [[], [], [], []],
    });
    // 3 on empty foundation — must start with Ace
    expect(validator.canMove(state, { type: 'freeCell', index: 0 }, { type: 'foundation', index: 0 }, [THREE_SPADES])).toBe(false);
  });
});

// ── Tableau move validation ───────────────────────────────────────────────
describe('FreeCell: tableau moves', () => {
  let validator: MoveValidator;

  beforeEach(() => {
    validator = new MoveValidator(config);
  });

  it('descending alternating color: red on black valid', () => {
    const state = makeState({ tableau: [[KING_SPADES], [], [], [], [], [], [], []] });
    // Q♥ (red) on K♠ (black)
    expect(validator.canMove(state, { type: 'tableau', index: 1 }, { type: 'tableau', index: 0 }, [QUEEN_HEARTS])).toBe(true);
  });

  it('descending alternating color: black on red valid', () => {
    const state = makeState({ tableau: [[QUEEN_HEARTS], [], [], [], [], [], [], []] });
    // J♣ (black) on Q♥ (red)
    expect(validator.canMove(state, { type: 'tableau', index: 1 }, { type: 'tableau', index: 0 }, [JACK_CLUBS])).toBe(true);
  });

  it('same color blocked: red on red invalid', () => {
    const state = makeState({ tableau: [[KING_HEARTS], [], [], [], [], [], [], []] });
    // Q♥ (red) on K♥ (red) — same color, invalid
    expect(validator.canMove(state, { type: 'tableau', index: 1 }, { type: 'tableau', index: 0 }, [QUEEN_HEARTS])).toBe(false);
  });

  it('non-sequential rank blocked', () => {
    const state = makeState({ tableau: [[KING_SPADES], [], [], [], [], [], [], []] });
    // J♣ skips Queen — invalid
    expect(validator.canMove(state, { type: 'tableau', index: 1 }, { type: 'tableau', index: 0 }, [JACK_CLUBS])).toBe(false);
  });

  it('any card can move to empty tableau column', () => {
    const state = makeState({ tableau: [[], [], [], [], [], [], [], []] });
    expect(validator.canMove(state, { type: 'tableau', index: 1 }, { type: 'tableau', index: 0 }, [FIVE_SPADES])).toBe(true);
  });

  it('face-down card cannot be moved', () => {
    const state = makeState({ tableau: [[KING_SPADES, FACE_DOWN], [], [], [], [], [], [], []] });
    expect(validator.canMove(state, { type: 'tableau', index: 0 }, { type: 'tableau', index: 1 }, [FACE_DOWN])).toBe(false);
  });

  it('single card move from tableau to tableau valid', () => {
    const state = makeState({ tableau: [[KING_SPADES], [QUEEN_HEARTS], [], [], [], [], [], []] });
    // Q♥ on K♠ — valid
    expect(validator.canMove(state, { type: 'tableau', index: 1 }, { type: 'tableau', index: 0 }, [QUEEN_HEARTS])).toBe(true);
  });
});

// ── Foundation move validation ────────────────────────────────────────────
describe('FreeCell: foundation moves', () => {
  let validator: MoveValidator;

  beforeEach(() => {
    validator = new MoveValidator(config);
  });

  it('Ace can start an empty foundation', () => {
    const state = makeState({ tableau: [[ACE_SPADES], [], [], [], [], [], [], []] });
    expect(validator.canMove(state, { type: 'tableau', index: 0 }, { type: 'foundation', index: 0 }, [ACE_SPADES])).toBe(true);
  });

  it('non-Ace blocked from empty foundation', () => {
    const state = makeState({ tableau: [[TWO_CLUBS], [], [], [], [], [], [], []] });
    expect(validator.canMove(state, { type: 'tableau', index: 0 }, { type: 'foundation', index: 0 }, [TWO_CLUBS])).toBe(false);
  });

  it('Two of same suit can stack on Ace', () => {
    const state = makeState({
      tableau: [[TWO_CLUBS], [], [], [], [], [], [], []],
      foundations: [[ACE_SPADES], [], [], []],
    });
    // Note: foundation index 0 already has A♠; TWO_CLUBS won't match suit, should fail
    expect(validator.canMove(state, { type: 'tableau', index: 0 }, { type: 'foundation', index: 0 }, [TWO_CLUBS])).toBe(false);
  });

  it('Two of matching suit stacks on Ace of same suit', () => {
    const ACE_CLUBS: Card = { suit: 'clubs', value: 1, faceUp: true };
    const state = makeState({
      tableau: [[TWO_CLUBS], [], [], [], [], [], [], []],
      foundations: [[ACE_CLUBS], [], [], []],
    });
    expect(validator.canMove(state, { type: 'tableau', index: 0 }, { type: 'foundation', index: 0 }, [TWO_CLUBS])).toBe(true);
  });

  it('Three stacks on Two (same suit)', () => {
    const ACE_CLUBS: Card  = { suit: 'clubs', value: 1, faceUp: true };
    const state = makeState({
      tableau: [[THREE_SPADES], [], [], [], [], [], [], []],
      foundations: [[ACE_CLUBS, TWO_CLUBS], [], [], []],
    });
    // THREE_SPADES on foundation[0] which has clubs — wrong suit
    expect(validator.canMove(state, { type: 'tableau', index: 0 }, { type: 'foundation', index: 0 }, [THREE_SPADES])).toBe(false);
  });

  it('Three of clubs stacks on Two of clubs', () => {
    const ACE_CLUBS: Card   = { suit: 'clubs', value:  1, faceUp: true };
    const THREE_CLUBS: Card = { suit: 'clubs', value:  3, faceUp: true };
    const state = makeState({
      tableau: [[THREE_CLUBS], [], [], [], [], [], [], []],
      foundations: [[ACE_CLUBS, TWO_CLUBS], [], [], []],
    });
    expect(validator.canMove(state, { type: 'tableau', index: 0 }, { type: 'foundation', index: 0 }, [THREE_CLUBS])).toBe(true);
  });
});

// ── Engine applyMove integration ──────────────────────────────────────────
describe('FreeCell: engine applyMove integration', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine(config);
  });

  it('applyMove returns null for invalid move', () => {
    const state = makeState({ tableau: [[KING_SPADES], [QUEEN_SPADES], [], [], [], [], [], []] });
    // Q♠ on K♠ — same color (both black), invalid
    const result = engine.applyMove(state, { type: 'tableau', index: 1 }, { type: 'tableau', index: 0 }, [QUEEN_SPADES]);
    expect(result).toBeNull();
  });

  it('moving card to free cell removes it from tableau', () => {
    const state = makeState({ tableau: [[FIVE_SPADES], [], [], [], [], [], [], []] });
    const next = engine.applyMove(state, { type: 'tableau', index: 0 }, { type: 'freeCell', index: 0 }, [FIVE_SPADES]);
    expect(next).not.toBeNull();
    expect(next!.tableau[0]).toHaveLength(0);
    expect(next!.freeCells[0]).toEqual(FIVE_SPADES);
  });

  it('moving card from free cell to tableau removes it from free cell', () => {
    const state = makeState({
      tableau: [[KING_SPADES], [], [], [], [], [], [], []],
      freeCells: [QUEEN_HEARTS, null, null, null],
    });
    const next = engine.applyMove(state, { type: 'freeCell', index: 0 }, { type: 'tableau', index: 0 }, [QUEEN_HEARTS]);
    expect(next).not.toBeNull();
    expect(next!.freeCells[0]).toBeNull();
    expect(next!.tableau[0]).toContainEqual(QUEEN_HEARTS);
  });

  it('moving Ace to foundation sets up foundation pile', () => {
    const state = makeState({ tableau: [[ACE_SPADES], [], [], [], [], [], [], []] });
    const next = engine.applyMove(state, { type: 'tableau', index: 0 }, { type: 'foundation', index: 0 }, [ACE_SPADES]);
    expect(next).not.toBeNull();
    expect(next!.foundations[0]).toContainEqual(ACE_SPADES);
    expect(next!.tableau[0]).toHaveLength(0);
  });

  it('moves counter increments after valid move', () => {
    const state = makeState({ tableau: [[FIVE_SPADES], [], [], [], [], [], [], []] });
    const next = engine.applyMove(state, { type: 'tableau', index: 0 }, { type: 'freeCell', index: 0 }, [FIVE_SPADES]);
    expect(next!.moves).toBe(1);
  });

  it('undo restores card from free cell to tableau', () => {
    const state = makeState({ tableau: [[FIVE_SPADES], [], [], [], [], [], [], []] });
    const afterMove = engine.applyMove(state, { type: 'tableau', index: 0 }, { type: 'freeCell', index: 0 }, [FIVE_SPADES])!;
    const afterUndo = engine.undo(afterMove);
    expect(afterUndo.freeCells[0]).toBeNull();
    expect(afterUndo.tableau[0]).toContainEqual({ ...FIVE_SPADES });
  });

  it('undo restores card from tableau to free cell', () => {
    const state = makeState({
      tableau: [[KING_SPADES], [], [], [], [], [], [], []],
      freeCells: [QUEEN_HEARTS, null, null, null],
    });
    const afterMove = engine.applyMove(state, { type: 'freeCell', index: 0 }, { type: 'tableau', index: 0 }, [QUEEN_HEARTS])!;
    const afterUndo = engine.undo(afterMove);
    expect(afterUndo.freeCells[0]).toEqual(QUEEN_HEARTS);
    expect(afterUndo.tableau[0]).not.toContainEqual(QUEEN_HEARTS);
  });

  it('game is not won with cards remaining in tableau', () => {
    const state = makeState({ tableau: [[FIVE_SPADES], [], [], [], [], [], [], []] });
    expect(engine.isWon(state)).toBe(false);
  });

  it('game is won when all 52 cards are on foundations', () => {
    // Build a fully complete foundations state
    const suits = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
    const foundations = suits.map(suit =>
      Array.from({ length: 13 }, (_, i) => ({ suit, value: i + 1, faceUp: true } as Card))
    );
    const wonState = makeState({ foundations });
    expect(engine.isWon(wonState)).toBe(true);
  });

  it('canMove returns false for empty card array', () => {
    const state = makeState();
    expect(engine.canMove(state, { type: 'tableau', index: 0 }, { type: 'freeCell', index: 0 }, [])).toBe(false);
  });
});

// ── FreeCell full game deal and free cell interaction ─────────────────────
describe('FreeCell: engine deal + free cell lifecycle', () => {
  let engine: GameEngine;
  let state: GameState;

  beforeEach(() => {
    engine = new GameEngine(config);
    state = engine.newGame({ drawMode: 1 });
  });

  it('all free cells are initially empty', () =>
    expect(state.freeCells.every(c => c === null)).toBe(true));

  it('can move top card of any tableau column to an empty free cell', () => {
    const topCard = state.tableau[0][state.tableau[0].length - 1];
    expect(engine.canMove(state, { type: 'tableau', index: 0 }, { type: 'freeCell', index: 0 }, [topCard])).toBe(true);
  });

  it('cannot move to waste', () => {
    const topCard = state.tableau[0][state.tableau[0].length - 1];
    expect(engine.canMove(state, { type: 'tableau', index: 0 }, { type: 'waste', index: 0 }, [topCard])).toBe(false);
  });

  it('state after deal has correct schemaVersion', () =>
    expect(state.schemaVersion).toBe(1));

  it('state has a unique sessionId', () =>
    expect(state.sessionId).toBeTruthy());

  it('two deals produce different card orders (shuffle is working)', () => {
    const state2 = engine.newGame({ drawMode: 1 });
    // Extremely unlikely to be identical after shuffle
    const order1 = state.tableau.flat().map(c => `${c.suit}${c.value}`).join(',');
    const order2 = state2.tableau.flat().map(c => `${c.suit}${c.value}`).join(',');
    expect(order1).not.toBe(order2);
  });
});
