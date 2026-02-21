import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useNeuro } from './use-neuro';

// ── matchMedia mock (required for useOsPreferences inside NeuroProvider) ──

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
});

// ── Tests ───────────────────────────────────────────────────────────

describe('useNeuro', () => {
  it('throws when used outside NeuroProvider', () => {
    // Suppress console.error for expected error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useNeuro());
    }).toThrow('useNeuro must be used within a <NeuroProvider>');

    spy.mockRestore();
  });

  it('error message mentions NeuroProvider in the guidance', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    let errorMessage = '';
    try {
      renderHook(() => useNeuro());
    } catch (error) {
      if (error instanceof Error) {
        errorMessage = error.message;
      }
    }

    expect(errorMessage).toContain('Wrap your app with <NeuroProvider>');
    spy.mockRestore();
  });
});
