import type React from 'react';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  DEFAULT_PROFILE,
  mergeProfile,
  PRESETS,
  profileToCssProperties,
  STORAGE_KEY,
} from './defaults';
import { useOsPreferences } from './media';
import type {
  NeuroContextValue,
  NeuroProviderProps,
  SensoryProfile,
  SensoryProfileOverrides,
} from './types';

// ── Context ─────────────────────────────────────────────────────────

export const NeuroContext = createContext<NeuroContextValue | null>(null);

// ── localStorage helpers (SSR-safe) ─────────────────────────────────

function loadPersistedProfile(): SensoryProfileOverrides | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SensoryProfileOverrides;
  } catch {
    return null;
  }
}

function savePersistedProfile(overrides: SensoryProfileOverrides): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

function clearPersistedProfile(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

// ── CSS dimension keys for data attributes ──────────────────────────

const PROFILE_KEYS: readonly (keyof SensoryProfile)[] = [
  'motion',
  'contrast',
  'density',
  'notifications',
  'font',
  'spacing',
  'focus',
  'timing',
  'flashSafety',
  'colorVision',
  'inputMethod',
] as const;

// ── Provider ────────────────────────────────────────────────────────

export function NeuroProvider({
  children,
  profile: profileProp,
  preset,
  persist,
}: NeuroProviderProps): React.JSX.Element {
  // OS-level preferences
  const osPreferences = useOsPreferences();

  // User overrides (from setProfile calls / localStorage)
  const [userOverrides, setUserOverrides] = useState<SensoryProfileOverrides>(
    () => {
      if (persist === 'localStorage') {
        return loadPersistedProfile() ?? {};
      }
      return {};
    },
  );

  // Preset overrides
  const presetOverrides = useMemo<SensoryProfileOverrides>(() => {
    if (!preset) return {};
    return PRESETS[preset];
  }, [preset]);

  // Final merged profile (priority: DEFAULT < OS < preset < user < prop)
  const profile = useMemo<SensoryProfile>(
    () =>
      mergeProfile(
        DEFAULT_PROFILE,
        osPreferences,
        presetOverrides,
        userOverrides,
        profileProp,
      ),
    [osPreferences, presetOverrides, userOverrides, profileProp],
  );

  // Persist user overrides to localStorage
  const persistRef = useRef(persist);
  persistRef.current = persist;

  useEffect(() => {
    if (persistRef.current === 'localStorage') {
      if (Object.keys(userOverrides).length > 0) {
        savePersistedProfile(userOverrides);
      } else {
        clearPersistedProfile();
      }
    }
  }, [userOverrides]);

  // Inject CSS custom properties and data attributes
  useEffect(() => {
    const root = document.documentElement;

    // Set data-neuro marker
    root.setAttribute('data-neuro', '');

    // Set per-dimension data attributes
    for (const key of PROFILE_KEYS) {
      root.setAttribute(`data-neuro-${key}`, String(profile[key]));
    }

    // Set CSS custom properties
    const cssProps = profileToCssProperties(profile);
    const cssPropKeys = Object.keys(cssProps);
    for (const [prop, value] of Object.entries(cssProps)) {
      root.style.setProperty(prop, value);
    }

    // Cleanup — uses cssPropKeys captured at setup time, not cleanup time
    return () => {
      root.removeAttribute('data-neuro');
      for (const key of PROFILE_KEYS) {
        root.removeAttribute(`data-neuro-${key}`);
      }
      for (const prop of cssPropKeys) {
        root.style.removeProperty(prop);
      }
    };
  }, [profile]);

  // Context actions
  const setProfile = useCallback(
    (overrides: SensoryProfileOverrides): void => {
      setUserOverrides((prev) => ({ ...prev, ...overrides }));
    },
    [],
  );

  const resetProfile = useCallback((): void => {
    setUserOverrides({});
    clearPersistedProfile();
  }, []);

  const contextValue = useMemo<NeuroContextValue>(
    () => ({ profile, setProfile, resetProfile }),
    [profile, setProfile, resetProfile],
  );

  return (
    <NeuroContext.Provider value={contextValue}>
      {children}
    </NeuroContext.Provider>
  );
}
