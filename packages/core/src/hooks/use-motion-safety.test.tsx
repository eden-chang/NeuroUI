import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NeuroProvider } from '../provider';
import type { SensoryProfileOverrides } from '../types';
import { useMotionSafety } from './use-motion-safety';

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
  return renderHook(() => useMotionSafety(), { wrapper });
}

// ── Tests ───────────────────────────────────────────────────────────

describe('useMotionSafety', () => {
  it('returns motionLevel "full" by default', () => {
    const { result } = renderWithProfile();
    expect(result.current.motionLevel).toBe('full');
  });

  it('isMotionSafe is false when motion is "full"', () => {
    const { result } = renderWithProfile();
    expect(result.current.isMotionSafe).toBe(false);
  });

  it('isMotionSafe is true when motion is "reduced"', () => {
    const { result } = renderWithProfile({ motion: 'reduced' });
    expect(result.current.isMotionSafe).toBe(true);
    expect(result.current.motionLevel).toBe('reduced');
  });

  it('isMotionSafe is true when motion is "none"', () => {
    const { result } = renderWithProfile({ motion: 'none' });
    expect(result.current.isMotionSafe).toBe(true);
    expect(result.current.motionLevel).toBe('none');
  });

  it('reflects calm preset motion level', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NeuroProvider preset="calm">{children}</NeuroProvider>
    );
    const { result } = renderHook(() => useMotionSafety(), { wrapper });
    expect(result.current.motionLevel).toBe('none');
    expect(result.current.isMotionSafe).toBe(true);
  });

  it('reflects focus preset motion level', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NeuroProvider preset="focus">{children}</NeuroProvider>
    );
    const { result } = renderHook(() => useMotionSafety(), { wrapper });
    expect(result.current.motionLevel).toBe('reduced');
    expect(result.current.isMotionSafe).toBe(true);
  });
});
