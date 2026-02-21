import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NeuroProvider } from '../provider';
import type { SensoryProfileOverrides } from '../types';
import { useReadability } from './use-readability';

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
  return renderHook(() => useReadability(), { wrapper });
}

// ── Tests ───────────────────────────────────────────────────────────

describe('useReadability', () => {
  describe('fontFamily', () => {
    it('returns system-ui font by default', () => {
      const { result } = renderWithProfile();
      expect(result.current.fontFamily).toBe('system-ui, sans-serif');
    });

    it('returns OpenDyslexic for dyslexia-friendly font', () => {
      const { result } = renderWithProfile({ font: 'dyslexia-friendly' });
      expect(result.current.fontFamily).toBe(
        'OpenDyslexic, Comic Sans MS, sans-serif',
      );
    });

    it('returns monospace font for monospace setting', () => {
      const { result } = renderWithProfile({ font: 'monospace' });
      expect(result.current.fontFamily).toBe('ui-monospace, monospace');
    });
  });

  describe('lineHeight', () => {
    it('returns 1.5 by default', () => {
      const { result } = renderWithProfile();
      expect(result.current.lineHeight).toBe('1.5');
    });

    it('returns 1.8 for dyslexia-friendly font (BDA guideline)', () => {
      const { result } = renderWithProfile({ font: 'dyslexia-friendly' });
      expect(result.current.lineHeight).toBe('1.8');
    });
  });

  describe('letterSpacing', () => {
    it('returns normal by default', () => {
      const { result } = renderWithProfile();
      expect(result.current.letterSpacing).toBe('normal');
    });

    it('returns 0.12em for dyslexia-friendly font (BDA guideline)', () => {
      const { result } = renderWithProfile({ font: 'dyslexia-friendly' });
      expect(result.current.letterSpacing).toBe('0.12em');
    });

    it('returns normal for monospace font', () => {
      const { result } = renderWithProfile({ font: 'monospace' });
      expect(result.current.letterSpacing).toBe('normal');
    });
  });

  describe('wordSpacing', () => {
    it('returns normal by default', () => {
      const { result } = renderWithProfile();
      expect(result.current.wordSpacing).toBe('normal');
    });

    it('returns 0.16em for dyslexia-friendly font (BDA guideline)', () => {
      const { result } = renderWithProfile({ font: 'dyslexia-friendly' });
      expect(result.current.wordSpacing).toBe('0.16em');
    });
  });

  describe('maxLineLength', () => {
    it('returns none by default', () => {
      const { result } = renderWithProfile();
      expect(result.current.maxLineLength).toBe('none');
    });

    it('returns 70ch for dyslexia-friendly font (BDA guideline)', () => {
      const { result } = renderWithProfile({ font: 'dyslexia-friendly' });
      expect(result.current.maxLineLength).toBe('70ch');
    });
  });

  describe('fontVariantLigatures', () => {
    it('returns normal by default', () => {
      const { result } = renderWithProfile();
      expect(result.current.fontVariantLigatures).toBe('normal');
    });

    it('returns none for dyslexia-friendly font', () => {
      const { result } = renderWithProfile({ font: 'dyslexia-friendly' });
      expect(result.current.fontVariantLigatures).toBe('none');
    });
  });

  describe('combined settings', () => {
    it('returns correct values for dyslexia-friendly', () => {
      const { result } = renderWithProfile({
        font: 'dyslexia-friendly',
      });
      expect(result.current.fontFamily).toBe(
        'OpenDyslexic, Comic Sans MS, sans-serif',
      );
      expect(result.current.lineHeight).toBe('1.8');
      expect(result.current.letterSpacing).toBe('0.12em');
      expect(result.current.wordSpacing).toBe('0.16em');
      expect(result.current.maxLineLength).toBe('70ch');
      expect(result.current.fontVariantLigatures).toBe('none');
    });
  });
});
