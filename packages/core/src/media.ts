import { useEffect, useState } from 'react';

import type { SensoryProfileOverrides } from './types';

// ── Internal helper ─────────────────────────────────────────────────

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (event: MediaQueryListEvent): void => {
      setMatches(event.matches);
    };

    mql.addEventListener('change', handler);
    return () => {
      mql.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

// ── Public hook ─────────────────────────────────────────────────────

/**
 * Detects OS-level accessibility preferences and returns matching
 * sensory profile overrides. Only detected preferences are included;
 * undetected dimensions are left as `undefined`.
 */
export function useOsPreferences(): SensoryProfileOverrides {
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );
  const prefersContrastMore = useMediaQuery('(prefers-contrast: more)');
  const prefersContrastLess = useMediaQuery('(prefers-contrast: less)');
  const forcedColors = useMediaQuery('(forced-colors: active)');
  const pointerCoarse = useMediaQuery('(pointer: coarse)');

  const overrides: SensoryProfileOverrides = {};

  if (prefersReducedMotion) {
    overrides.motion = 'reduced';
  }

  if (prefersContrastMore) {
    overrides.contrast = 'high';
  } else if (prefersContrastLess) {
    overrides.contrast = 'low';
  }

  // forced-colors: active takes precedence over prefers-contrast
  if (forcedColors) {
    overrides.contrast = 'high';
  }

  if (pointerCoarse) {
    overrides.inputMethod = 'touch';
  }

  return overrides;
}
