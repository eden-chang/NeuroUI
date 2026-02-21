import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type React from 'react';
import { NeuroProvider, type SensoryProfileOverrides } from '@neuroui/core';

import { Badge } from './badge';

// ── Test Helpers ────────────────────────────────────────────────────

function renderWithProfile(
  profile: SensoryProfileOverrides,
  ui: React.ReactElement,
) {
  return render(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <NeuroProvider profile={profile}>{children}</NeuroProvider>
    ),
  });
}

// ── Setup/Teardown ──────────────────────────────────────────────────

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

// ── Tests ───────────────────────────────────────────────────────────

describe('Badge', () => {
  it('renders with default props and correct data attribute', () => {
    renderWithProfile({}, <Badge>Label</Badge>);

    const badge = screen.getByText('Label');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-neuro-component', 'badge');
  });

  describe('variants', () => {
    it('renders default variant without border color override', () => {
      renderWithProfile({}, <Badge variant="default">Default</Badge>);

      const badge = screen.getByText('Default');
      expect(badge).toBeInTheDocument();
      expect(badge.style.borderColor).toBe('');
    });

    it('renders info variant with correct border color', () => {
      renderWithProfile({}, <Badge variant="info">Info</Badge>);

      const badge = screen.getByText('Info');
      expect(badge.style.borderColor).toBe('var(--neuro-color-info)');
    });

    it('renders success variant with correct border color', () => {
      renderWithProfile({}, <Badge variant="success">Success</Badge>);

      const badge = screen.getByText('Success');
      expect(badge.style.borderColor).toBe('var(--neuro-color-success)');
    });

    it('renders warning variant with correct border color', () => {
      renderWithProfile({}, <Badge variant="warning">Warning</Badge>);

      const badge = screen.getByText('Warning');
      expect(badge.style.borderColor).toBe('var(--neuro-color-warning)');
    });

    it('renders error variant with correct border color', () => {
      renderWithProfile({}, <Badge variant="error">Error</Badge>);

      const badge = screen.getByText('Error');
      expect(badge.style.borderColor).toBe('var(--neuro-color-error)');
    });
  });

  describe('default icons', () => {
    it('does not render default icon for default variant', () => {
      renderWithProfile({}, <Badge variant="default">Default</Badge>);

      const badge = screen.getByText('Default');
      const dots = badge.querySelectorAll('.rounded-full');
      expect(dots.length).toBe(0);
    });

    it('renders default icon for info variant', () => {
      renderWithProfile({}, <Badge variant="info">Info</Badge>);

      const badge = screen.getByText('Info');
      const dot = badge.querySelector('.rounded-full');
      expect(dot).toBeInTheDocument();
      expect(dot).toHaveStyle({ backgroundColor: 'var(--neuro-color-info)' });
      expect(dot).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders default icon for success variant', () => {
      renderWithProfile({}, <Badge variant="success">Success</Badge>);

      const badge = screen.getByText('Success');
      const dot = badge.querySelector('.rounded-full');
      expect(dot).toBeInTheDocument();
      expect(dot).toHaveStyle({ backgroundColor: 'var(--neuro-color-success)' });
    });

    it('renders default icon for warning variant', () => {
      renderWithProfile({}, <Badge variant="warning">Warning</Badge>);

      const badge = screen.getByText('Warning');
      const dot = badge.querySelector('.rounded-full');
      expect(dot).toBeInTheDocument();
      expect(dot).toHaveStyle({ backgroundColor: 'var(--neuro-color-warning)' });
    });

    it('renders default icon for error variant', () => {
      renderWithProfile({}, <Badge variant="error">Error</Badge>);

      const badge = screen.getByText('Error');
      const dot = badge.querySelector('.rounded-full');
      expect(dot).toBeInTheDocument();
      expect(dot).toHaveStyle({ backgroundColor: 'var(--neuro-color-error)' });
    });
  });

  describe('custom icon', () => {
    it('renders custom icon instead of default icon', () => {
      const customIcon = <span data-testid="custom-icon">★</span>;
      renderWithProfile({}, <Badge variant="info" icon={customIcon}>Info</Badge>);

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      const badge = screen.getByText('Info');
      const dots = badge.querySelectorAll('.rounded-full');
      expect(dots.length).toBe(0);
    });

    it('renders custom icon for default variant', () => {
      const customIcon = <span data-testid="custom-icon">✓</span>;
      renderWithProfile({}, <Badge icon={customIcon}>Custom</Badge>);

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    renderWithProfile({}, <Badge ref={ref}>Ref test</Badge>);

    expect(ref).toHaveBeenCalled();
    const firstCall = ref.mock.calls[0];
    expect(firstCall?.[0]).toBeInstanceOf(HTMLSpanElement);
  });

  it('applies custom className', () => {
    renderWithProfile({}, <Badge className="custom-class">Custom</Badge>);

    const badge = screen.getByText('Custom');
    expect(badge.className).toContain('custom-class');
  });

  it('spreads additional props to span element', () => {
    renderWithProfile(
      {},
      <Badge data-testid="custom-badge" aria-label="status">
        Props test
      </Badge>,
    );

    const badge = screen.getByTestId('custom-badge');
    expect(badge).toHaveAttribute('aria-label', 'status');
  });

  it('renders children correctly', () => {
    renderWithProfile(
      {},
      <Badge>
        <span data-testid="child">Badge text</span>
      </Badge>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
