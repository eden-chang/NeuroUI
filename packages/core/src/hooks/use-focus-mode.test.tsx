import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NeuroProvider } from '../provider';
import type { SensoryProfileOverrides } from '../types';
import { useFocusMode } from './use-focus-mode';

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
  document.documentElement.removeAttribute('style');
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-neuro');
  document.documentElement.removeAttribute('style');
});

// ── Helpers ─────────────────────────────────────────────────────────

function renderWithProfile(profile?: SensoryProfileOverrides) {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <NeuroProvider profile={profile}>{children}</NeuroProvider>
  );
  return renderHook(() => useFocusMode(), { wrapper });
}

// ── Tests ───────────────────────────────────────────────────────────

describe('useFocusMode', () => {
  it('isFocusMode is false by default (standard focus)', () => {
    const { result } = renderWithProfile();
    expect(result.current.isFocusMode).toBe(false);
  });

  it('isFocusMode is true when focus is "enhanced"', () => {
    const { result } = renderWithProfile({ focus: 'enhanced' });
    expect(result.current.isFocusMode).toBe(true);
  });

  it('toggleFocusMode toggles from standard to enhanced', () => {
    const { result } = renderWithProfile();
    expect(result.current.isFocusMode).toBe(false);

    act(() => {
      result.current.toggleFocusMode();
    });

    expect(result.current.isFocusMode).toBe(true);
  });

  it('toggleFocusMode toggles from enhanced to standard', () => {
    const { result } = renderWithProfile();

    // First toggle to enhanced via user override (not profile prop)
    act(() => {
      result.current.toggleFocusMode();
    });
    expect(result.current.isFocusMode).toBe(true);

    // Now toggle back to standard
    act(() => {
      result.current.toggleFocusMode();
    });
    expect(result.current.isFocusMode).toBe(false);
  });

  it('toggleFocusMode can be called multiple times', () => {
    const { result } = renderWithProfile();

    // standard → enhanced
    act(() => {
      result.current.toggleFocusMode();
    });
    expect(result.current.isFocusMode).toBe(true);

    // enhanced → standard
    act(() => {
      result.current.toggleFocusMode();
    });
    expect(result.current.isFocusMode).toBe(false);

    // standard → enhanced again
    act(() => {
      result.current.toggleFocusMode();
    });
    expect(result.current.isFocusMode).toBe(true);
  });

  it('reflects focus preset', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NeuroProvider preset="focus">{children}</NeuroProvider>
    );
    const { result } = renderHook(() => useFocusMode(), { wrapper });
    expect(result.current.isFocusMode).toBe(true);
  });

  it('toggleFocusMode returns a function', () => {
    const { result } = renderWithProfile();
    expect(typeof result.current.toggleFocusMode).toBe('function');
  });
});
