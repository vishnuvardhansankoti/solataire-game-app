import type { GameConfig } from '../engine/GameConfig';
import klondike from './klondike/config.json';
import spider from './spider/config.json';
import freecell from './freecell/config.json';

export const GAME_REGISTRY: GameConfig[] = [
  klondike as GameConfig,
  spider as GameConfig,
  freecell as GameConfig,
];

export function getGameConfig(gameId: string): GameConfig {
  const cfg = GAME_REGISTRY.find((g) => g.gameId === gameId);
  if (!cfg) throw new Error(`Unknown gameId: ${gameId}`);
  return cfg;
}
