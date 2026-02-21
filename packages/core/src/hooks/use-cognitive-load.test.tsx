import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NeuroProvider } from '../provider';
import type { SensoryProfileOverrides } from '../types';
import { useCognitiveLoad } from './use-cognitive-load';

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
  return renderHook(() => useCognitiveLoad(), { wrapper });
}

// ── Tests ───────────────────────────────────────────────────────────

describe('useCognitiveLoad', () => {
  it('returns density "normal" by default', () => {
    const { result } = renderWithProfile();
    expect(result.current.density).toBe('normal');
  });

  it('isDenseLayout is false when density is "normal"', () => {
    const { result } = renderWithProfile();
    expect(result.current.isDenseLayout).toBe(false);
  });

  it('isDenseLayout is true when density is "detailed"', () => {
    const { result } = renderWithProfile({ density: 'detailed' });
    expect(result.current.isDenseLayout).toBe(true);
    expect(result.current.density).toBe('detailed');
  });

  it('isDenseLayout is false when density is "minimal"', () => {
    const { result } = renderWithProfile({ density: 'minimal' });
    expect(result.current.isDenseLayout).toBe(false);
    expect(result.current.density).toBe('minimal');
  });

  it('reflects focus preset density level', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NeuroProvider preset="focus">{children}</NeuroProvider>
    );
    const { result } = renderHook(() => useCognitiveLoad(), { wrapper });
    expect(result.current.density).toBe('minimal');
    expect(result.current.isDenseLayout).toBe(false);
  });
});
