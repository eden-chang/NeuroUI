// ── Types ───────────────────────────────────────────────────────────

export type {
  ColorVision,
  ContrastLevel,
  DensityLevel,
  FocusLevel,
  FontFamily,
  InputMethod,
  MotionLevel,
  NeuroContextValue,
  NeuroProviderProps,
  NotificationLevel,
  PersistOption,
  PresetName,
  SensoryProfile,
  SensoryProfileOverrides,
  SpacingLevel,
  TimingLevel,
} from './types';

// ── Values ──────────────────────────────────────────────────────────

export {
  COLOR_PALETTES,
  type ColorPalette,
  DEFAULT_PROFILE,
  FONT_FAMILY_MAP,
  mergeProfile,
  PRESETS,
  presets,
  profileToCssProperties,
  STORAGE_KEY,
} from './defaults';

export { useOsPreferences } from './media';

export { NeuroContext, NeuroProvider } from './provider';

// ── Hooks ───────────────────────────────────────────────────────────

export { useNeuro } from './hooks/use-neuro';
export {
  useMotionSafety,
  type MotionSafetyResult,
} from './hooks/use-motion-safety';
export {
  useCognitiveLoad,
  type CognitiveLoadResult,
} from './hooks/use-cognitive-load';
export {
  useReadability,
  type ReadabilityResult,
} from './hooks/use-readability';
export {
  useFocusMode,
  type FocusModeResult,
} from './hooks/use-focus-mode';
export {
  useFlashSafety,
  type FlashSafetyResult,
} from './hooks/use-flash-safety';
export {
  useColorVision,
  type ColorVisionResult,
} from './hooks/use-color-vision';
export {
  useInputMethod,
  type InputMethodResult,
} from './hooks/use-input-method';

// ── Utilities ──────────────────────────────────────────────────────

export { cn } from './utils/cn';
