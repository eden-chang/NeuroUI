import { useNeuro } from './use-neuro';

export interface FlashSafetyResult {
  /** Whether flash safety mode is enabled — all flashing/blinking should be suppressed. */
  isFlashSafe: boolean;
}

/**
 * Convenience hook for checking if flash safety is enabled.
 * When `isFlashSafe` is `true`, components must suppress all
 * flashing, blinking, and rapid visual transitions (WCAG 2.3.1).
 */
export function useFlashSafety(): FlashSafetyResult {
  const { profile } = useNeuro();
  return { isFlashSafe: profile.flashSafety };
}
