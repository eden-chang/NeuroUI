import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NeuroProvider } from '../provider';
import type { SensoryProfileOverrides } from '../types';
import { useInputMethod } from './use-input-method';

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
  return renderHook(() => useInputMethod(), { wrapper });
}

// ── Tests ───────────────────────────────────────────────────────────

describe('useInputMethod', () => {
  it('returns pointer inputMethod by default', () => {
    const { result } = renderWithProfile();
    expect(result.current.inputMethod).toBe('pointer');
  });

  it('returns needsLargerTargets=false for pointer', () => {
    const { result } = renderWithProfile();
    expect(result.current.needsLargerTargets).toBe(false);
  });

  it('returns needsVisibleLabels=false for pointer', () => {
    const { result } = renderWithProfile();
    expect(result.current.needsVisibleLabels).toBe(false);
  });

  it('returns needsLargerTargets=true for touch', () => {
    const { result } = renderWithProfile({ inputMethod: 'touch' });
    expect(result.current.inputMethod).toBe('touch');
    expect(result.current.needsLargerTargets).toBe(true);
  });

  it('returns needsLargerTargets=true for switch', () => {
    const { result } = renderWithProfile({ inputMethod: 'switch' });
    expect(result.current.inputMethod).toBe('switch');
    expect(result.current.needsLargerTargets).toBe(true);
  });

  it('returns needsLargerTargets=false for keyboard', () => {
    const { result } = renderWithProfile({ inputMethod: 'keyboard' });
    expect(result.current.needsLargerTargets).toBe(false);
  });

  it('returns needsVisibleLabels=true for voice', () => {
    const { result } = renderWithProfile({ inputMethod: 'voice' });
    expect(result.current.inputMethod).toBe('voice');
    expect(result.current.needsVisibleLabels).toBe(true);
  });

  it('returns needsVisibleLabels=true for switch', () => {
    const { result } = renderWithProfile({ inputMethod: 'switch' });
    expect(result.current.needsVisibleLabels).toBe(true);
  });

  it('returns needsVisibleLabels=false for keyboard', () => {
    const { result } = renderWithProfile({ inputMethod: 'keyboard' });
    expect(result.current.needsVisibleLabels).toBe(false);
  });

  it('returns needsVisibleLabels=false for touch', () => {
    const { result } = renderWithProfile({ inputMethod: 'touch' });
    expect(result.current.needsVisibleLabels).toBe(false);
  });
});
