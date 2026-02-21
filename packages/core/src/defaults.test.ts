import { describe, expect, it } from 'vitest';

import {
  COLOR_PALETTES,
  DEFAULT_PROFILE,
  mergeProfile,
  PRESETS,
  presets,
  profileToCssProperties,
  STORAGE_KEY,
} from './defaults';
import type { SensoryProfile } from './types';

// ── DEFAULT_PROFILE ─────────────────────────────────────────────────

describe('DEFAULT_PROFILE', () => {
  it('has correct default values for all dimensions', () => {
    expect(DEFAULT_PROFILE).toEqual({
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
    });
  });

  it('has exactly 11 dimensions', () => {
    expect(Object.keys(DEFAULT_PROFILE)).toHaveLength(11);
  });
});

// ── PRESETS ──────────────────────────────────────────────────────────

describe('PRESETS', () => {
  it('has default, calm, focus, safe, and colorSafe presets', () => {
    expect(Object.keys(PRESETS)).toEqual([
      'default',
      'calm',
      'focus',
      'safe',
      'colorSafe',
    ]);
  });

  it('default preset is empty (no overrides)', () => {
    expect(PRESETS.default).toEqual({});
  });

  it('calm preset has none motion, relaxed spacing, patient timing, minimal density, visual notifications, enhanced focus', () => {
    expect(PRESETS.calm).toEqual({
      motion: 'none',
      spacing: 'relaxed',
      timing: 'patient',
      density: 'minimal',
      notifications: 'visual',
      focus: 'enhanced',
    });
  });

  it('colorSafe preset has deuteranopia colorVision, high contrast, enhanced focus', () => {
    expect(PRESETS.colorSafe).toEqual({
      colorVision: 'deuteranopia',
      contrast: 'high',
      focus: 'enhanced',
    });
  });

  it('focus preset has enhanced focus, minimal density, reduced motion', () => {
    expect(PRESETS.focus).toEqual({
      focus: 'enhanced',
      density: 'minimal',
      motion: 'reduced',
    });
  });

  it('safe preset has flashSafety on, reduced motion, enhanced focus', () => {
    expect(PRESETS.safe).toEqual({
      flashSafety: true,
      motion: 'reduced',
      focus: 'enhanced',
    });
  });

  it('presets alias points to same object as PRESETS', () => {
    expect(presets).toBe(PRESETS);
  });
});

// ── STORAGE_KEY ─────────────────────────────────────────────────────

describe('STORAGE_KEY', () => {
  it('equals "neuroui-sensory-profile"', () => {
    expect(STORAGE_KEY).toBe('neuroui-sensory-profile');
  });
});

// ── mergeProfile ────────────────────────────────────────────────────

describe('mergeProfile', () => {
  it('returns base when no overrides provided', () => {
    const result = mergeProfile(DEFAULT_PROFILE);
    expect(result).toEqual(DEFAULT_PROFILE);
  });

  it('does not mutate the base profile', () => {
    const baseCopy = { ...DEFAULT_PROFILE };
    mergeProfile(DEFAULT_PROFILE, { motion: 'none' });
    expect(DEFAULT_PROFILE).toEqual(baseCopy);
  });

  it('applies a single override', () => {
    const result = mergeProfile(DEFAULT_PROFILE, { motion: 'reduced' });
    expect(result.motion).toBe('reduced');
    expect(result.contrast).toBe('normal'); // unchanged
  });

  it('applies multiple overrides in sequence (later wins)', () => {
    const result = mergeProfile(
      DEFAULT_PROFILE,
      { motion: 'reduced' },
      { motion: 'none', font: 'monospace' },
    );
    expect(result.motion).toBe('none');
    expect(result.font).toBe('monospace');
  });

  it('ignores undefined values in overrides', () => {
    const result = mergeProfile(DEFAULT_PROFILE, {
      motion: 'reduced',
      contrast: undefined,
    });
    expect(result.motion).toBe('reduced');
    expect(result.contrast).toBe('normal');
  });

  it('skips undefined override objects', () => {
    const result = mergeProfile(DEFAULT_PROFILE, undefined, {
      focus: 'enhanced',
    });
    expect(result.focus).toBe('enhanced');
  });

  it('merges preset then user overrides', () => {
    const result = mergeProfile(
      DEFAULT_PROFILE,
      PRESETS.calm,
      { motion: 'none' },
    );
    expect(result.motion).toBe('none'); // user override wins
    expect(result.spacing).toBe('relaxed'); // from calm preset
    expect(result.timing).toBe('patient'); // from calm preset
  });
});

// ── profileToCssProperties ──────────────────────────────────────────

describe('profileToCssProperties', () => {
  it('returns all expected CSS custom properties', () => {
    const props = profileToCssProperties(DEFAULT_PROFILE);
    const expectedKeys = [
      '--neuro-transition-duration',
      '--neuro-animation',
      '--neuro-spacing-base',
      '--neuro-spacing-tight',
      '--neuro-spacing-loose',
      '--neuro-font-family',
      '--neuro-line-height',
      '--neuro-letter-spacing',
      '--neuro-focus-ring-width',
      '--neuro-focus-ring-color',
      '--neuro-focus-ring-offset',
      '--neuro-toast-duration',
    ];
    for (const key of expectedKeys) {
      expect(props).toHaveProperty(key);
    }
  });

  describe('motion dimension', () => {
    it('motion:none → duration 0ms, animation none', () => {
      const profile: SensoryProfile = { ...DEFAULT_PROFILE, motion: 'none' };
      const props = profileToCssProperties(profile);
      expect(props['--neuro-transition-duration']).toBe('0ms');
      expect(props['--neuro-animation']).toBe('none');
    });

    it('motion:reduced → duration 100ms, animation all', () => {
      const profile: SensoryProfile = {
        ...DEFAULT_PROFILE,
        motion: 'reduced',
      };
      const props = profileToCssProperties(profile);
      expect(props['--neuro-transition-duration']).toBe('100ms');
      expect(props['--neuro-animation']).toBe('all');
    });

    it('motion:full → duration 200ms, animation all', () => {
      const props = profileToCssProperties(DEFAULT_PROFILE);
      expect(props['--neuro-transition-duration']).toBe('200ms');
      expect(props['--neuro-animation']).toBe('all');
    });
  });

  describe('spacing dimension', () => {
    it('spacing:compact → smaller spacing values', () => {
      const profile: SensoryProfile = {
        ...DEFAULT_PROFILE,
        spacing: 'compact',
      };
      const props = profileToCssProperties(profile);
      expect(props['--neuro-spacing-base']).toBe('0.75rem');
      expect(props['--neuro-spacing-tight']).toBe('0.25rem');
      expect(props['--neuro-spacing-loose']).toBe('1rem');
    });

    it('spacing:normal → default spacing values', () => {
      const props = profileToCssProperties(DEFAULT_PROFILE);
      expect(props['--neuro-spacing-base']).toBe('1rem');
      expect(props['--neuro-spacing-tight']).toBe('0.5rem');
      expect(props['--neuro-spacing-loose']).toBe('1.5rem');
    });

    it('spacing:relaxed → larger spacing values', () => {
      const profile: SensoryProfile = {
        ...DEFAULT_PROFILE,
        spacing: 'relaxed',
      };
      const props = profileToCssProperties(profile);
      expect(props['--neuro-spacing-base']).toBe('1.25rem');
      expect(props['--neuro-spacing-tight']).toBe('0.75rem');
      expect(props['--neuro-spacing-loose']).toBe('2rem');
    });
  });

  describe('typography dimension', () => {
    it('font:default → system-ui font', () => {
      const props = profileToCssProperties(DEFAULT_PROFILE);
      expect(props['--neuro-font-family']).toBe('system-ui, sans-serif');
      expect(props['--neuro-letter-spacing']).toBe('normal');
    });

    it('font:dyslexia-friendly → OpenDyslexic + BDA typography settings', () => {
      const profile: SensoryProfile = {
        ...DEFAULT_PROFILE,
        font: 'dyslexia-friendly',
      };
      const props = profileToCssProperties(profile);
      expect(props['--neuro-font-family']).toBe(
        'OpenDyslexic, Comic Sans MS, sans-serif',
      );
      expect(props['--neuro-letter-spacing']).toBe('0.12em');
      expect(props['--neuro-word-spacing']).toBe('0.16em');
      expect(props['--neuro-max-line-length']).toBe('70ch');
      expect(props['--neuro-font-variant-ligatures']).toBe('none');
      expect(props['--neuro-line-height']).toBe('1.8');
    });

    it('font:monospace → monospace font', () => {
      const profile: SensoryProfile = {
        ...DEFAULT_PROFILE,
        font: 'monospace',
      };
      const props = profileToCssProperties(profile);
      expect(props['--neuro-font-family']).toBe('ui-monospace, monospace');
    });

    it('font:default → line-height 1.5', () => {
      const props = profileToCssProperties(DEFAULT_PROFILE);
      expect(props['--neuro-line-height']).toBe('1.5');
    });

    it('font:default → normal word-spacing and ligatures', () => {
      const props = profileToCssProperties(DEFAULT_PROFILE);
      expect(props['--neuro-word-spacing']).toBe('normal');
      expect(props['--neuro-max-line-length']).toBe('none');
      expect(props['--neuro-font-variant-ligatures']).toBe('normal');
    });
  });

  describe('focus dimension', () => {
    it('focus:standard → 2px ring width and offset', () => {
      const props = profileToCssProperties(DEFAULT_PROFILE);
      expect(props['--neuro-focus-ring-width']).toBe('2px');
      expect(props['--neuro-focus-ring-offset']).toBe('2px');
      expect(props['--neuro-focus-ring-color']).toBe('#2563eb');
    });

    it('focus:enhanced → 3px ring width and offset', () => {
      const profile: SensoryProfile = {
        ...DEFAULT_PROFILE,
        focus: 'enhanced',
      };
      const props = profileToCssProperties(profile);
      expect(props['--neuro-focus-ring-width']).toBe('3px');
      expect(props['--neuro-focus-ring-offset']).toBe('3px');
    });
  });

  describe('timing dimension', () => {
    it('timing:patient → toast duration 10000', () => {
      const profile: SensoryProfile = {
        ...DEFAULT_PROFILE,
        timing: 'patient',
      };
      const props = profileToCssProperties(profile);
      expect(props['--neuro-toast-duration']).toBe('10000');
    });

    it('timing:normal → toast duration 5000', () => {
      const props = profileToCssProperties(DEFAULT_PROFILE);
      expect(props['--neuro-toast-duration']).toBe('5000');
    });

    it('timing:quick → toast duration 3000', () => {
      const profile: SensoryProfile = {
        ...DEFAULT_PROFILE,
        timing: 'quick',
      };
      const props = profileToCssProperties(profile);
      expect(props['--neuro-toast-duration']).toBe('3000');
    });
  });

  describe('flash safety dimension', () => {
    it('flashSafety:false → flash allowed = 1', () => {
      const props = profileToCssProperties(DEFAULT_PROFILE);
      expect(props['--neuro-flash-allowed']).toBe('1');
    });

    it('flashSafety:true → flash allowed = 0', () => {
      const profile: SensoryProfile = {
        ...DEFAULT_PROFILE,
        flashSafety: true,
      };
      const props = profileToCssProperties(profile);
      expect(props['--neuro-flash-allowed']).toBe('0');
    });
  });

  describe('color vision dimension', () => {
    it('colorVision:typical → default semantic colors', () => {
      const props = profileToCssProperties(DEFAULT_PROFILE);
      expect(props['--neuro-color-success']).toBe('#16a34a');
      expect(props['--neuro-color-warning']).toBe('#ca8a04');
      expect(props['--neuro-color-error']).toBe('#dc2626');
      expect(props['--neuro-color-info']).toBe('#2563eb');
    });

    it('colorVision:deuteranopia → CVD-safe colors', () => {
      const profile: SensoryProfile = {
        ...DEFAULT_PROFILE,
        colorVision: 'deuteranopia',
      };
      const props = profileToCssProperties(profile);
      expect(props['--neuro-color-success']).toBe('#2563eb');
      expect(props['--neuro-color-error']).toBe('#ea580c');
    });

    it('colorVision:achromatopsia → grayscale colors', () => {
      const profile: SensoryProfile = {
        ...DEFAULT_PROFILE,
        colorVision: 'achromatopsia',
      };
      const props = profileToCssProperties(profile);
      expect(props['--neuro-color-success']).toBe('#525252');
      expect(props['--neuro-color-error']).toBe('#171717');
    });
  });

  describe('input method dimension', () => {
    it('inputMethod:pointer → 44px target size', () => {
      const props = profileToCssProperties(DEFAULT_PROFILE);
      expect(props['--neuro-min-target-size']).toBe('44px');
    });

    it('inputMethod:touch → 48px target size', () => {
      const profile: SensoryProfile = {
        ...DEFAULT_PROFILE,
        inputMethod: 'touch',
      };
      const props = profileToCssProperties(profile);
      expect(props['--neuro-min-target-size']).toBe('48px');
    });

    it('inputMethod:switch → 48px target size', () => {
      const profile: SensoryProfile = {
        ...DEFAULT_PROFILE,
        inputMethod: 'switch',
      };
      const props = profileToCssProperties(profile);
      expect(props['--neuro-min-target-size']).toBe('48px');
    });

    it('inputMethod:voice → 44px target (not 48px)', () => {
      const profile: SensoryProfile = {
        ...DEFAULT_PROFILE,
        inputMethod: 'voice',
      };
      const props = profileToCssProperties(profile);
      expect(props['--neuro-min-target-size']).toBe('44px');
    });

    it('inputMethod:keyboard → 44px target', () => {
      const profile: SensoryProfile = {
        ...DEFAULT_PROFILE,
        inputMethod: 'keyboard',
      };
      const props = profileToCssProperties(profile);
      expect(props['--neuro-min-target-size']).toBe('44px');
    });
  });

  describe('high contrast dimension', () => {
    it('contrast:high → WCAG AAA tokens and forced-colors fallbacks', () => {
      const profile: SensoryProfile = {
        ...DEFAULT_PROFILE,
        contrast: 'high',
      };
      const props = profileToCssProperties(profile);
      expect(props['--neuro-contrast-ratio-min']).toBe('7');
      expect(props['--neuro-border-width']).toBe('2px');
      expect(props['--neuro-text-color']).toBe('CanvasText');
      expect(props['--neuro-bg-color']).toBe('Canvas');
      expect(props['--neuro-border-color']).toBe('ButtonBorder');
    });

    it('contrast:normal → no AAA tokens', () => {
      const props = profileToCssProperties(DEFAULT_PROFILE);
      expect(props['--neuro-contrast-ratio-min']).toBeUndefined();
      expect(props['--neuro-border-width']).toBeUndefined();
    });
  });
});

// ── COLOR_PALETTES ──────────────────────────────────────────────────

describe('COLOR_PALETTES', () => {
  it('has palettes for all 5 color vision types', () => {
    expect(Object.keys(COLOR_PALETTES)).toEqual([
      'typical',
      'protanopia',
      'deuteranopia',
      'tritanopia',
      'achromatopsia',
    ]);
  });

  it('each palette has success, warning, error, info', () => {
    for (const [, palette] of Object.entries(COLOR_PALETTES)) {
      expect(palette).toHaveProperty('success');
      expect(palette).toHaveProperty('warning');
      expect(palette).toHaveProperty('error');
      expect(palette).toHaveProperty('info');
    }
  });

  it('typical palette produces correct 4 CSS variables', () => {
    const profile: SensoryProfile = {
      ...DEFAULT_PROFILE,
      colorVision: 'typical',
    };
    const props = profileToCssProperties(profile);
    expect(props['--neuro-color-success']).toBe('#16a34a');
    expect(props['--neuro-color-warning']).toBe('#ca8a04');
    expect(props['--neuro-color-error']).toBe('#dc2626');
    expect(props['--neuro-color-info']).toBe('#2563eb');
  });

  it('protanopia palette produces correct 4 CSS variables', () => {
    const profile: SensoryProfile = {
      ...DEFAULT_PROFILE,
      colorVision: 'protanopia',
    };
    const props = profileToCssProperties(profile);
    expect(props['--neuro-color-success']).toBe('#2563eb');
    expect(props['--neuro-color-warning']).toBe('#ca8a04');
    expect(props['--neuro-color-error']).toBe('#ea580c');
    expect(props['--neuro-color-info']).toBe('#0891b2');
  });

  it('deuteranopia palette produces correct 4 CSS variables', () => {
    const profile: SensoryProfile = {
      ...DEFAULT_PROFILE,
      colorVision: 'deuteranopia',
    };
    const props = profileToCssProperties(profile);
    expect(props['--neuro-color-success']).toBe('#2563eb');
    expect(props['--neuro-color-warning']).toBe('#ca8a04');
    expect(props['--neuro-color-error']).toBe('#ea580c');
    expect(props['--neuro-color-info']).toBe('#0891b2');
  });

  it('tritanopia palette produces correct 4 CSS variables', () => {
    const profile: SensoryProfile = {
      ...DEFAULT_PROFILE,
      colorVision: 'tritanopia',
    };
    const props = profileToCssProperties(profile);
    expect(props['--neuro-color-success']).toBe('#16a34a');
    expect(props['--neuro-color-warning']).toBe('#db2777');
    expect(props['--neuro-color-error']).toBe('#dc2626');
    expect(props['--neuro-color-info']).toBe('#0d9488');
  });

  it('achromatopsia palette produces correct 4 CSS variables', () => {
    const profile: SensoryProfile = {
      ...DEFAULT_PROFILE,
      colorVision: 'achromatopsia',
    };
    const props = profileToCssProperties(profile);
    expect(props['--neuro-color-success']).toBe('#525252');
    expect(props['--neuro-color-warning']).toBe('#737373');
    expect(props['--neuro-color-error']).toBe('#171717');
    expect(props['--neuro-color-info']).toBe('#404040');
  });

  it('protanopia palette uses blue-based success colors (not green)', () => {
    const protanopiaPalette = COLOR_PALETTES.protanopia;
    expect(protanopiaPalette.success).toBe('#2563eb');
    expect(protanopiaPalette.success).not.toContain('a3');
  });

  it('tritanopia palette differs from typical', () => {
    const typicalPalette = COLOR_PALETTES.typical;
    const tritanopiaPalette = COLOR_PALETTES.tritanopia;
    expect(tritanopiaPalette.warning).not.toBe(typicalPalette.warning);
    expect(tritanopiaPalette.info).not.toBe(typicalPalette.info);
  });

  it('contrast:high + colorVision:deuteranopia produces both AAA tokens AND CVD-safe colors', () => {
    const profile: SensoryProfile = {
      ...DEFAULT_PROFILE,
      contrast: 'high',
      colorVision: 'deuteranopia',
    };
    const props = profileToCssProperties(profile);
    expect(props['--neuro-contrast-ratio-min']).toBe('7');
    expect(props['--neuro-border-width']).toBe('2px');
    expect(props['--neuro-text-color']).toBe('CanvasText');
    expect(props['--neuro-bg-color']).toBe('Canvas');
    expect(props['--neuro-border-color']).toBe('ButtonBorder');
    expect(props['--neuro-color-success']).toBe('#2563eb');
    expect(props['--neuro-color-error']).toBe('#ea580c');
  });

  it('each palette has 4 unique colors (no duplicates within a palette)', () => {
    for (const [name, palette] of Object.entries(COLOR_PALETTES)) {
      const colors = Object.values(palette);
      const unique = new Set(colors);
      expect(unique.size).toBe(4);
    }
  });
});
