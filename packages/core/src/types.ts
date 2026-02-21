import type { ReactNode } from 'react';

// ── Dimension union types ──────────────────────────────────────────

export type MotionLevel = 'none' | 'reduced' | 'full';
export type ContrastLevel = 'low' | 'normal' | 'high';
export type DensityLevel = 'minimal' | 'normal' | 'detailed';
export type NotificationLevel = 'silent' | 'visual' | 'audio' | 'all';
export type FontFamily = 'default' | 'dyslexia-friendly' | 'monospace';
export type SpacingLevel = 'compact' | 'normal' | 'relaxed';
export type FocusLevel = 'standard' | 'enhanced';
export type TimingLevel = 'patient' | 'normal' | 'quick';
export type ColorVision =
  | 'typical'
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'achromatopsia';
export type InputMethod =
  | 'pointer'
  | 'keyboard'
  | 'touch'
  | 'switch'
  | 'voice';

// ── Core profile ───────────────────────────────────────────────────

export interface SensoryProfile {
  motion: MotionLevel;
  contrast: ContrastLevel;
  density: DensityLevel;
  notifications: NotificationLevel;
  font: FontFamily;
  spacing: SpacingLevel;
  focus: FocusLevel;
  timing: TimingLevel;
  flashSafety: boolean;
  colorVision: ColorVision;
  inputMethod: InputMethod;
}

export type SensoryProfileOverrides = Partial<SensoryProfile>;

// ── Presets ─────────────────────────────────────────────────────────

export type PresetName = 'default' | 'calm' | 'focus' | 'safe' | 'colorSafe';

// ── Persistence ─────────────────────────────────────────────────────

export type PersistOption = 'localStorage';

// ── Context & Provider ──────────────────────────────────────────────

export interface NeuroContextValue {
  profile: SensoryProfile;
  setProfile: (overrides: SensoryProfileOverrides) => void;
  resetProfile: () => void;
}

export interface NeuroProviderProps {
  children: ReactNode;
  profile?: SensoryProfileOverrides;
  preset?: PresetName;
  persist?: PersistOption;
}
