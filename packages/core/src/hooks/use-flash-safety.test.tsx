import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NeuroProvider } from '../provider';
import type { SensoryProfileOverrides } from '../types';
import { useFlashSafety } from './use-flash-safety';

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
  return renderHook(() => useFlashSafety(), { wrapper });
}

// ── Tests ───────────────────────────────────────────────────────────

describe('useFlashSafety', () => {
  it('returns isFlashSafe=false by default', () => {
    const { result } = renderWithProfile();
    expect(result.current.isFlashSafe).toBe(false);
  });

  it('returns isFlashSafe=true when flashSafety is enabled', () => {
    const { result } = renderWithProfile({ flashSafety: true });
    expect(result.current.isFlashSafe).toBe(true);
  });

  it('returns isFlashSafe=true with safe preset', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NeuroProvider preset="safe">{children}</NeuroProvider>
    );
    const { result } = renderHook(() => useFlashSafety(), { wrapper });
    expect(result.current.isFlashSafe).toBe(true);
  });
});
