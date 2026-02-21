import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NeuroProvider } from '../provider';
import type { SensoryProfileOverrides } from '../types';
import { useColorVision } from './use-color-vision';

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
  return renderHook(() => useColorVision(), { wrapper });
}

// ── Tests ───────────────────────────────────────────────────────────

describe('useColorVision', () => {
  it('returns typical colorVision by default', () => {
    const { result } = renderWithProfile();
    expect(result.current.colorVision).toBe('typical');
  });

  it('returns needsColorRedundancy=false for typical vision', () => {
    const { result } = renderWithProfile();
    expect(result.current.needsColorRedundancy).toBe(false);
  });

  it('returns needsColorRedundancy=true for protanopia', () => {
    const { result } = renderWithProfile({ colorVision: 'protanopia' });
    expect(result.current.colorVision).toBe('protanopia');
    expect(result.current.needsColorRedundancy).toBe(true);
  });

  it('returns needsColorRedundancy=true for deuteranopia', () => {
    const { result } = renderWithProfile({ colorVision: 'deuteranopia' });
    expect(result.current.colorVision).toBe('deuteranopia');
    expect(result.current.needsColorRedundancy).toBe(true);
  });

  it('returns needsColorRedundancy=true for tritanopia', () => {
    const { result } = renderWithProfile({ colorVision: 'tritanopia' });
    expect(result.current.colorVision).toBe('tritanopia');
    expect(result.current.needsColorRedundancy).toBe(true);
  });

  it('returns needsColorRedundancy=true for achromatopsia', () => {
    const { result } = renderWithProfile({ colorVision: 'achromatopsia' });
    expect(result.current.colorVision).toBe('achromatopsia');
    expect(result.current.needsColorRedundancy).toBe(true);
  });

  it('works with colorSafe preset', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NeuroProvider preset="colorSafe">{children}</NeuroProvider>
    );
    const { result } = renderHook(() => useColorVision(), { wrapper });
    expect(result.current.colorVision).toBe('deuteranopia');
    expect(result.current.needsColorRedundancy).toBe(true);
  });
});
