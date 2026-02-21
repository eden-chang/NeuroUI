import { FONT_FAMILY_MAP } from '../defaults';
import { useNeuro } from './use-neuro';

export interface ReadabilityResult {
  fontFamily: string;
  lineHeight: string;
  letterSpacing: string;
  wordSpacing: string;
  maxLineLength: string;
  fontVariantLigatures: string;
}

/**
 * Convenience hook for typography / readability values.
 * Returns resolved CSS-ready values based on the current profile.
 * Values follow British Dyslexia Association (BDA) guidelines when
 * `font: 'dyslexia-friendly'` is active.
 */
export function useReadability(): ReadabilityResult {
  const { profile } = useNeuro();

  const isDyslexiaFriendly = profile.font === 'dyslexia-friendly';

  return {
    fontFamily: FONT_FAMILY_MAP[profile.font] ?? 'system-ui, sans-serif',
    lineHeight: isDyslexiaFriendly ? '1.8' : '1.5',
    letterSpacing: isDyslexiaFriendly ? '0.12em' : 'normal',
    wordSpacing: isDyslexiaFriendly ? '0.16em' : 'normal',
    maxLineLength: isDyslexiaFriendly ? '70ch' : 'none',
    fontVariantLigatures: isDyslexiaFriendly ? 'none' : 'normal',
  };
}
