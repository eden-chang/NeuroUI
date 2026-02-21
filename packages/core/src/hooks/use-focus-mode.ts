import { useCallback } from 'react';

import { useNeuro } from './use-neuro';

export interface FocusModeResult {
  /** `true` when focus is `'enhanced'`. */
  isFocusMode: boolean;
  /** Toggles between `'enhanced'` and `'standard'` focus. */
  toggleFocusMode: () => void;
}

/**
 * Convenience hook for focus mode toggle.
 */
export function useFocusMode(): FocusModeResult {
  const { profile, setProfile } = useNeuro();

  const isFocusMode = profile.focus === 'enhanced';

  const toggleFocusMode = useCallback(() => {
    setProfile({ focus: isFocusMode ? 'standard' : 'enhanced' });
  }, [isFocusMode, setProfile]);

  return { isFocusMode, toggleFocusMode };
}
