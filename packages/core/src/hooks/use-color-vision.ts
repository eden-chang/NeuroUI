import type { ColorVision } from '../types';
import { useNeuro } from './use-neuro';

export interface ColorVisionResult {
  /** The current color vision type from the sensory profile. */
  colorVision: ColorVision;
  /** Whether the user needs non-color redundancy cues (icons, patterns, text). */
  needsColorRedundancy: boolean;
}

/**
 * Convenience hook for adapting components to color vision deficiencies.
 * When `needsColorRedundancy` is `true`, components must not rely on
 * color alone to convey meaning (WCAG 1.4.1).
 */
export function useColorVision(): ColorVisionResult {
  const { profile } = useNeuro();
  return {
    colorVision: profile.colorVision,
    needsColorRedundancy: profile.colorVision !== 'typical',
  };
}
