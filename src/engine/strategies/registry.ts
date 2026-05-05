import type { BuildRuleStrategy } from './BuildRuleStrategy';
import { AscendingSameSuitStrategy } from './AscendingSameSuitStrategy';
import { DescendingAlternatingColorStrategy } from './DescendingAlternatingColorStrategy';
import { DescendingSameSuitStrategy } from './DescendingSameSuitStrategy';
import { AnyStrategy } from './AnyStrategy';
import { NoneStrategy } from './NoneStrategy';

export type BuildRuleId =
  | 'ascending-same-suit'
  | 'descending-alternating-color'
  | 'descending-same-suit'
  | 'any'
  | 'none';

const registry: Record<BuildRuleId, BuildRuleStrategy> = {
  'ascending-same-suit': new AscendingSameSuitStrategy(),
  'descending-alternating-color': new DescendingAlternatingColorStrategy(),
  'descending-same-suit': new DescendingSameSuitStrategy(),
  'any': new AnyStrategy(),
  'none': new NoneStrategy(),
};

export function getStrategy(ruleId: string): BuildRuleStrategy {
  if (!(ruleId in registry)) {
    throw new Error(`Unknown build rule strategy: "${ruleId}". Registered rules: ${Object.keys(registry).join(', ')}`);
  }
  return registry[ruleId as BuildRuleId];
}
