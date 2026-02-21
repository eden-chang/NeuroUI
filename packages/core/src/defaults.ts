import type {
  ColorVision,
  PresetName,
  SensoryProfile,
  SensoryProfileOverrides,
} from './types';

// ── Default profile ────────────────────────────────────────────────

export const DEFAULT_PROFILE: SensoryProfile = {
  motion: 'full',
  contrast: 'normal',
  density: 'normal',
  notifications: 'all',
  font: 'default',
  spacing: 'normal',
  focus: 'standard',
  timing: 'normal',
  flashSafety: false,
  colorVision: 'typical',
  inputMethod: 'pointer',
};

// ── Color palettes (CVD-safe semantic colors) ────────────────────

export interface ColorPalette {
  success: string;
  warning: string;
  error: string;
  info: string;
}

export const COLOR_PALETTES: Record<ColorVision, ColorPalette> = {
  typical: {
    success: '#16a34a',
    warning: '#ca8a04',
    error: '#dc2626',
    info: '#2563eb',
  },
  protanopia: {
    success: '#2563eb',
    warning: '#ca8a04',
    error: '#ea580c',
    info: '#0891b2',
  },
  deuteranopia: {
    success: '#2563eb',
    warning: '#ca8a04',
    error: '#ea580c',
    info: '#0891b2',
  },
  tritanopia: {
    success: '#16a34a',
    warning: '#db2777',
    error: '#dc2626',
    info: '#0d9488',
  },
  achromatopsia: {
    success: '#525252',
    warning: '#737373',
    error: '#171717',
    info: '#404040',
  },
};

// ── Presets ─────────────────────────────────────────────────────────

export const PRESETS: Record<PresetName, SensoryProfileOverrides> = {
  default: {},
  calm: {
    motion: 'none',
    spacing: 'relaxed',
    timing: 'patient',
    density: 'minimal',
    notifications: 'visual',
    focus: 'enhanced',
  },
  focus: { focus: 'enhanced', density: 'minimal', motion: 'reduced' },
  safe: { flashSafety: true, motion: 'reduced', focus: 'enhanced' },
  colorSafe: {
    colorVision: 'deuteranopia',
    contrast: 'high',
    focus: 'enhanced',
  },
};

/** Alias for plan API compatibility: `import { presets } from '@neuroui/core'` */
export const presets = PRESETS;

// ── Storage ─────────────────────────────────────────────────────────

export const STORAGE_KEY = 'neuroui-sensory-profile';

// ── Font family mapping (shared with useReadability) ─────────────

export const FONT_FAMILY_MAP: Record<string, string> = {
  default: 'system-ui, sans-serif',
  'dyslexia-friendly': 'OpenDyslexic, Comic Sans MS, sans-serif',
  monospace: 'ui-monospace, monospace',
};

// ── Utilities ───────────────────────────────────────────────────────

/**
 * Merge a base profile with one or more partial overrides.
 * `undefined` values in overrides are ignored.
 */
export function mergeProfile(
  base: SensoryProfile,
  ...overrides: (SensoryProfileOverrides | undefined)[]
): SensoryProfile {
  let result = { ...base };
  for (const override of overrides) {
    if (override) {
      const defined: SensoryProfileOverrides = {};
      for (const key of Object.keys(override) as (keyof SensoryProfile)[]) {
        const value = override[key];
        if (value !== undefined) {
          (defined as Record<string, string | boolean>)[key] = value;
        }
      }
      result = { ...result, ...defined };
    }
  }
  return result;
}

/**
 * Convert a SensoryProfile to CSS custom properties for injection
 * into the document root.
 */
export function profileToCssProperties(
  profile: SensoryProfile,
): Record<string, string> {
  const props: Record<string, string> = {};

  // ── Motion ──
  const transitionMap: Record<string, string> = {
    none: '0ms',
    reduced: '100ms',
    full: '200ms',
  };
  props['--neuro-transition-duration'] =
    transitionMap[profile.motion] ?? '200ms';
  props['--neuro-animation'] = profile.motion === 'none' ? 'none' : 'all';

  // ── Spacing ──
  const spacingBaseMap: Record<string, string> = {
    compact: '0.75rem',
    normal: '1rem',
    relaxed: '1.25rem',
  };
  const spacingTightMap: Record<string, string> = {
    compact: '0.25rem',
    normal: '0.5rem',
    relaxed: '0.75rem',
  };
  const spacingLooseMap: Record<string, string> = {
    compact: '1rem',
    normal: '1.5rem',
    relaxed: '2rem',
  };
  props['--neuro-spacing-base'] =
    spacingBaseMap[profile.spacing] ?? '1rem';
  props['--neuro-spacing-tight'] =
    spacingTightMap[profile.spacing] ?? '0.5rem';
  props['--neuro-spacing-loose'] =
    spacingLooseMap[profile.spacing] ?? '1.5rem';

  // ── Typography (BDA = British Dyslexia Association guidelines) ──
  props['--neuro-font-family'] =
    FONT_FAMILY_MAP[profile.font] ?? 'system-ui, sans-serif';
  props['--neuro-font-size-base'] = '1rem';
  props['--neuro-line-height'] =
    profile.font === 'dyslexia-friendly' ? '1.8' : '1.5';
  props['--neuro-letter-spacing'] =
    profile.font === 'dyslexia-friendly' ? '0.12em' : 'normal';
  props['--neuro-word-spacing'] =
    profile.font === 'dyslexia-friendly' ? '0.16em' : 'normal';
  props['--neuro-max-line-length'] =
    profile.font === 'dyslexia-friendly' ? '70ch' : 'none';
  props['--neuro-font-variant-ligatures'] =
    profile.font === 'dyslexia-friendly' ? 'none' : 'normal';

  // ── Focus ──
  props['--neuro-focus-ring-width'] =
    profile.focus === 'enhanced' ? '3px' : '2px';
  props['--neuro-focus-ring-color'] = '#2563eb';
  props['--neuro-focus-ring-offset'] =
    profile.focus === 'enhanced' ? '3px' : '2px';

  // ── Timing ──
  const timingMap: Record<string, string> = {
    patient: '10000',
    normal: '5000',
    quick: '3000',
  };
  props['--neuro-toast-duration'] = timingMap[profile.timing] ?? '5000';

  // ── Flash safety (WCAG 2.3.1) ──
  props['--neuro-flash-allowed'] = profile.flashSafety ? '0' : '1';

  // ── Color vision (CVD-safe semantic colors) ──
  const palette = COLOR_PALETTES[profile.colorVision] ?? COLOR_PALETTES.typical;
  props['--neuro-color-success'] = palette.success;
  props['--neuro-color-warning'] = palette.warning;
  props['--neuro-color-error'] = palette.error;
  props['--neuro-color-info'] = palette.info;

  // ── Input method (minimum target sizes) ──
  const targetSizeMap: Record<string, string> = {
    pointer: '44px',
    keyboard: '44px',
    touch: '48px',
    switch: '48px',
    voice: '44px',
  };
  props['--neuro-min-target-size'] =
    targetSizeMap[profile.inputMethod] ?? '44px';

  // ── Contrast: high → WCAG AAA tokens + forced-colors fallbacks ──
  if (profile.contrast === 'high') {
    props['--neuro-contrast-ratio-min'] = '7';
    props['--neuro-border-width'] = '2px';
    props['--neuro-text-color'] = 'CanvasText';
    props['--neuro-bg-color'] = 'Canvas';
    props['--neuro-border-color'] = 'ButtonBorder';
  }

  return props;
}
