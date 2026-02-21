import type { DensityLevel } from '../types';
import { useNeuro } from './use-neuro';

export interface CognitiveLoadResult {
  density: DensityLevel;
  /** `true` when density is `'detailed'` (more information shown). */
  isDenseLayout: boolean;
}

/**
 * Convenience hook for density / cognitive load decisions.
 * `isDenseLayout` is `true` when density is `'detailed'`.
 */
export function useCognitiveLoad(): CognitiveLoadResult {
  const { profile } = useNeuro();
  return {
    density: profile.density,
    isDenseLayout: profile.density === 'detailed',
  };
}
