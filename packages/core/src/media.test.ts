import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useOsPreferences } from './media';

// ── matchMedia mock ─────────────────────────────────────────────────

interface MockMediaQueryList {
  matches: boolean;
  media: string;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  dispatchEvent: ReturnType<typeof vi.fn>;
  onchange: null;
  addListener: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
  _listeners: Map<string, Set<(event: MediaQueryListEvent) => void>>;
  _simulateChange: (matches: boolean) => void;
}

function createMockMql(query: string, matches: boolean): MockMediaQueryList {
  const listeners = new Map<
    string,
    Set<(event: MediaQueryListEvent) => void>
  >();

  const mql: MockMediaQueryList = {
    matches,
    media: query,
    addEventListener: vi.fn(
      (type: string, handler: (event: MediaQueryListEvent) => void) => {
        if (!listeners.has(type)) {
          listeners.set(type, new Set());
        }
        listeners.get(type)?.add(handler);
      },
    ),
    removeEventListener: vi.fn(
      (type: string, handler: (event: MediaQueryListEvent) => void) => {
        listeners.get(type)?.delete(handler);
      },
    ),
    dispatchEvent: vi.fn(),
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    _listeners: listeners,
    _simulateChange(newMatches: boolean) {
      mql.matches = newMatches;
      const changeListeners = listeners.get('change');
      if (changeListeners) {
        for (const handler of changeListeners) {
          handler({ matches: newMatches } as MediaQueryListEvent);
        }
      }
    },
  };

  return mql;
}

let mqls: Map<string, MockMediaQueryList>;

beforeEach(() => {
  mqls = new Map();
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => {
      const existing = mqls.get(query);
      if (existing) return existing;
      const mql = createMockMql(query, false);
      mqls.set(query, mql);
      return mql;
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ── Tests ───────────────────────────────────────────────────────────

describe('useOsPreferences', () => {
  it('returns empty overrides when no OS preferences are set', () => {
    const { result } = renderHook(() => useOsPreferences());
    expect(result.current).toEqual({});
  });

  it('detects prefers-reduced-motion: reduce', () => {
    mqls.set(
      '(prefers-reduced-motion: reduce)',
      createMockMql('(prefers-reduced-motion: reduce)', true),
    );

    const { result } = renderHook(() => useOsPreferences());
    expect(result.current.motion).toBe('reduced');
  });

  it('detects prefers-contrast: more', () => {
    mqls.set(
      '(prefers-contrast: more)',
      createMockMql('(prefers-contrast: more)', true),
    );

    const { result } = renderHook(() => useOsPreferences());
    expect(result.current.contrast).toBe('high');
  });

  it('detects prefers-contrast: less', () => {
    mqls.set(
      '(prefers-contrast: less)',
      createMockMql('(prefers-contrast: less)', true),
    );

    const { result } = renderHook(() => useOsPreferences());
    expect(result.current.contrast).toBe('low');
  });

  it('prefers-contrast: more wins over less when both true', () => {
    mqls.set(
      '(prefers-contrast: more)',
      createMockMql('(prefers-contrast: more)', true),
    );
    mqls.set(
      '(prefers-contrast: less)',
      createMockMql('(prefers-contrast: less)', true),
    );

    const { result } = renderHook(() => useOsPreferences());
    expect(result.current.contrast).toBe('high');
  });

  it('combines multiple OS preferences', () => {
    mqls.set(
      '(prefers-reduced-motion: reduce)',
      createMockMql('(prefers-reduced-motion: reduce)', true),
    );
    mqls.set(
      '(prefers-contrast: more)',
      createMockMql('(prefers-contrast: more)', true),
    );

    const { result } = renderHook(() => useOsPreferences());
    expect(result.current.motion).toBe('reduced');
    expect(result.current.contrast).toBe('high');
  });

  it('responds to media query changes', () => {
    const { result } = renderHook(() => useOsPreferences());
    expect(result.current.motion).toBeUndefined();

    const motionMql = mqls.get('(prefers-reduced-motion: reduce)');
    if (!motionMql) throw new Error('Expected motionMql to be defined');

    act(() => {
      motionMql._simulateChange(true);
    });

    expect(result.current.motion).toBe('reduced');
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useOsPreferences());

    const motionMql = mqls.get('(prefers-reduced-motion: reduce)');
    if (!motionMql) throw new Error('Expected motionMql to be defined');
    expect(motionMql.addEventListener).toHaveBeenCalled();

    unmount();

    expect(motionMql.removeEventListener).toHaveBeenCalled();
  });

  it('does not include undefined dimensions in overrides', () => {
    const { result } = renderHook(() => useOsPreferences());
    const keys = Object.keys(result.current);
    expect(keys).toHaveLength(0);
  });

  it('detects forced-colors: active as high contrast', () => {
    mqls.set(
      '(forced-colors: active)',
      createMockMql('(forced-colors: active)', true),
    );

    const { result } = renderHook(() => useOsPreferences());
    expect(result.current.contrast).toBe('high');
  });

  it('forced-colors: active overrides prefers-contrast: less', () => {
    mqls.set(
      '(prefers-contrast: less)',
      createMockMql('(prefers-contrast: less)', true),
    );
    mqls.set(
      '(forced-colors: active)',
      createMockMql('(forced-colors: active)', true),
    );

    const { result } = renderHook(() => useOsPreferences());
    expect(result.current.contrast).toBe('high');
  });

  it('detects pointer: coarse as touch inputMethod', () => {
    mqls.set(
      '(pointer: coarse)',
      createMockMql('(pointer: coarse)', true),
    );

    const { result } = renderHook(() => useOsPreferences());
    expect(result.current.inputMethod).toBe('touch');
  });

  it('does not set inputMethod when pointer is fine', () => {
    const { result } = renderHook(() => useOsPreferences());
    expect(result.current.inputMethod).toBeUndefined();
  });
});
