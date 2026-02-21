import { act, render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_PROFILE, STORAGE_KEY } from './defaults';
import { NeuroProvider } from './provider';
import type { NeuroContextValue } from './types';
import { useNeuro } from './hooks/use-neuro';

// ── matchMedia mock ─────────────────────────────────────────────────

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  );
  // Clean up document root
  const root = document.documentElement;
  root.removeAttribute('data-neuro');
  for (const key of Object.keys(DEFAULT_PROFILE)) {
    root.removeAttribute(`data-neuro-${key}`);
  }
  root.removeAttribute('style');
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  const root = document.documentElement;
  root.removeAttribute('data-neuro');
  root.removeAttribute('style');
});

// ── Helper to get context ───────────────────────────────────────────

function renderWithProvider(
  providerProps: Partial<Parameters<typeof NeuroProvider>[0]> = {},
): { result: { current: NeuroContextValue } } {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <NeuroProvider {...providerProps}>{children}</NeuroProvider>
  );
  return renderHook(() => useNeuro(), { wrapper });
}

// ── Tests ───────────────────────────────────────────────────────────

describe('NeuroProvider', () => {
  describe('default profile', () => {
    it('provides default profile when no props given', () => {
      const { result } = renderWithProvider();
      expect(result.current.profile).toEqual(DEFAULT_PROFILE);
    });

    it('provides setProfile and resetProfile functions', () => {
      const { result } = renderWithProvider();
      expect(typeof result.current.setProfile).toBe('function');
      expect(typeof result.current.resetProfile).toBe('function');
    });
  });

  describe('preset application', () => {
    it('applies calm preset overrides', () => {
      const { result } = renderWithProvider({ preset: 'calm' });
      expect(result.current.profile.motion).toBe('none');
      expect(result.current.profile.spacing).toBe('relaxed');
      expect(result.current.profile.timing).toBe('patient');
      expect(result.current.profile.density).toBe('minimal');
      expect(result.current.profile.notifications).toBe('visual');
      expect(result.current.profile.focus).toBe('enhanced');
    });

    it('applies focus preset overrides', () => {
      const { result } = renderWithProvider({ preset: 'focus' });
      expect(result.current.profile.focus).toBe('enhanced');
      expect(result.current.profile.density).toBe('minimal');
      expect(result.current.profile.motion).toBe('reduced');
    });

    it('applies safe preset overrides', () => {
      const { result } = renderWithProvider({ preset: 'safe' });
      expect(result.current.profile.flashSafety).toBe(true);
      expect(result.current.profile.motion).toBe('reduced');
      expect(result.current.profile.focus).toBe('enhanced');
    });

    it('default preset does not change profile', () => {
      const { result } = renderWithProvider({ preset: 'default' });
      expect(result.current.profile).toEqual(DEFAULT_PROFILE);
    });
  });

  describe('profileProp overrides', () => {
    it('profileProp overrides default values', () => {
      const { result } = renderWithProvider({
        profile: { motion: 'none', font: 'monospace' },
      });
      expect(result.current.profile.motion).toBe('none');
      expect(result.current.profile.font).toBe('monospace');
      expect(result.current.profile.contrast).toBe('normal'); // unchanged
    });

    it('profileProp overrides preset', () => {
      const { result } = renderWithProvider({
        preset: 'calm',
        profile: { motion: 'full' },
      });
      // calm sets motion:'reduced', but profile prop overrides to 'full'
      expect(result.current.profile.motion).toBe('full');
      // calm's other settings remain
      expect(result.current.profile.spacing).toBe('relaxed');
    });
  });

  describe('setProfile', () => {
    it('merges overrides into current user settings', () => {
      const { result } = renderWithProvider();

      act(() => {
        result.current.setProfile({ motion: 'reduced' });
      });
      expect(result.current.profile.motion).toBe('reduced');

      act(() => {
        result.current.setProfile({ font: 'monospace' });
      });
      expect(result.current.profile.motion).toBe('reduced'); // still set
      expect(result.current.profile.font).toBe('monospace');
    });
  });

  describe('resetProfile', () => {
    it('resets user overrides to empty', () => {
      const { result } = renderWithProvider();

      act(() => {
        result.current.setProfile({ motion: 'none', font: 'monospace' });
      });
      expect(result.current.profile.motion).toBe('none');

      act(() => {
        result.current.resetProfile();
      });
      expect(result.current.profile).toEqual(DEFAULT_PROFILE);
    });

    it('clears localStorage when resetting', () => {
      const { result } = renderWithProvider({ persist: 'localStorage' });

      act(() => {
        result.current.setProfile({ motion: 'none' });
      });
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

      act(() => {
        result.current.resetProfile();
      });
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('CSS injection', () => {
    it('sets data-neuro attribute on documentElement', () => {
      render(
        <NeuroProvider>
          <div>child</div>
        </NeuroProvider>,
      );
      expect(document.documentElement.hasAttribute('data-neuro')).toBe(true);
    });

    it('sets data-neuro-* attributes for each dimension', () => {
      render(
        <NeuroProvider>
          <div>child</div>
        </NeuroProvider>,
      );
      const root = document.documentElement;
      expect(root.getAttribute('data-neuro-motion')).toBe('full');
      expect(root.getAttribute('data-neuro-contrast')).toBe('normal');
      expect(root.getAttribute('data-neuro-density')).toBe('normal');
      expect(root.getAttribute('data-neuro-focus')).toBe('standard');
      expect(root.getAttribute('data-neuro-spacing')).toBe('normal');
      expect(root.getAttribute('data-neuro-font')).toBe('default');
      expect(root.getAttribute('data-neuro-timing')).toBe('normal');
      expect(root.getAttribute('data-neuro-notifications')).toBe('all');
      expect(root.getAttribute('data-neuro-flashSafety')).toBe('false');
      expect(root.getAttribute('data-neuro-colorVision')).toBe('typical');
      expect(root.getAttribute('data-neuro-inputMethod')).toBe('pointer');
    });

    it('sets CSS custom properties on documentElement', () => {
      render(
        <NeuroProvider>
          <div>child</div>
        </NeuroProvider>,
      );
      const style = document.documentElement.style;
      expect(style.getPropertyValue('--neuro-transition-duration')).toBe(
        '200ms',
      );
      expect(style.getPropertyValue('--neuro-animation')).toBe('all');
      expect(style.getPropertyValue('--neuro-focus-ring-color')).toBe(
        '#2563eb',
      );
    });

    it('updates CSS properties when profile changes', () => {
      const { result } = renderWithProvider();

      act(() => {
        result.current.setProfile({ motion: 'none' });
      });

      expect(
        document.documentElement.style.getPropertyValue(
          '--neuro-transition-duration',
        ),
      ).toBe('0ms');
      expect(
        document.documentElement.style.getPropertyValue('--neuro-animation'),
      ).toBe('none');
    });

    it('cleans up data attributes on unmount', () => {
      const { unmount } = render(
        <NeuroProvider>
          <div>child</div>
        </NeuroProvider>,
      );

      expect(document.documentElement.hasAttribute('data-neuro')).toBe(true);

      unmount();

      expect(document.documentElement.hasAttribute('data-neuro')).toBe(false);
      expect(document.documentElement.hasAttribute('data-neuro-motion')).toBe(
        false,
      );
    });

    it('cleans up CSS properties on unmount', () => {
      const { unmount } = render(
        <NeuroProvider>
          <div>child</div>
        </NeuroProvider>,
      );

      expect(
        document.documentElement.style.getPropertyValue(
          '--neuro-transition-duration',
        ),
      ).toBe('200ms');

      unmount();

      expect(
        document.documentElement.style.getPropertyValue(
          '--neuro-transition-duration',
        ),
      ).toBe('');
    });
  });

  describe('localStorage persistence', () => {
    it('saves user overrides to localStorage', () => {
      const { result } = renderWithProvider({ persist: 'localStorage' });

      act(() => {
        result.current.setProfile({ motion: 'reduced' });
      });

      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? '{}',
      ) as Record<string, unknown>;
      expect(stored.motion).toBe('reduced');
    });

    it('loads persisted profile on mount', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ font: 'monospace', focus: 'enhanced' }),
      );

      const { result } = renderWithProvider({ persist: 'localStorage' });
      expect(result.current.profile.font).toBe('monospace');
      expect(result.current.profile.focus).toBe('enhanced');
    });

    it('does not persist when persist prop is not set', () => {
      const { result } = renderWithProvider();

      act(() => {
        result.current.setProfile({ motion: 'none' });
      });

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('does not load persisted profile when persist prop is not set', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ font: 'monospace' }),
      );

      const { result } = renderWithProvider();
      expect(result.current.profile.font).toBe('default');
    });
  });

  describe('renders children', () => {
    it('renders child elements', () => {
      const { getByText } = render(
        <NeuroProvider>
          <span>Hello NeuroUI</span>
        </NeuroProvider>,
      );
      expect(getByText('Hello NeuroUI')).toBeTruthy();
    });
  });
});
