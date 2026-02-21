import type { MotionLevel } from '../types';
import { useNeuro } from './use-neuro';

export interface MotionSafetyResult {
  motionLevel: MotionLevel;
  /** `true` when motion is `'none'` or `'reduced'` (safe to skip animations). */
  isMotionSafe: boolean;
}

/**
 * Convenience hook for motion-related decisions.
 * `isMotionSafe` is `true` when motion is not `'full'`.
 */
export function useMotionSafety(): MotionSafetyResult {
  const { profile } = useNeuro();
  return {
    motionLevel: profile.motion,
    isMotionSafe: profile.motion !== 'full',
  };
}
