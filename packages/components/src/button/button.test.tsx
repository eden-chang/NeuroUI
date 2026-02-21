import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type React from 'react';
import { NeuroProvider, type SensoryProfileOverrides } from '@neuroui/core';

import { Button } from './button';

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

describe('Button', () => {
  it('renders with default props and correct data attribute', () => {
    renderWithProfile({}, <Button>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-neuro-component', 'button');
    expect(button).toHaveAttribute('type', 'button');
  });

  describe('variants', () => {
    it('renders primary variant with correct classes', () => {
      renderWithProfile({}, <Button variant="primary">Primary</Button>);

      const button = screen.getByRole('button', { name: 'Primary' });
      expect(button.className).toContain('bg-slate-900');
      expect(button.className).toContain('text-slate-50');
    });

    it('renders secondary variant with correct classes', () => {
      renderWithProfile({}, <Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole('button', { name: 'Secondary' });
      expect(button.className).toContain('bg-slate-100');
      expect(button.className).toContain('text-slate-900');
    });

    it('renders outline variant with correct classes', () => {
      renderWithProfile({}, <Button variant="outline">Outline</Button>);

      const button = screen.getByRole('button', { name: 'Outline' });
      expect(button.className).toContain('bg-transparent');
      expect(button.className).toContain('border-slate-200');
    });

    it('renders ghost variant with correct classes', () => {
      renderWithProfile({}, <Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole('button', { name: 'Ghost' });
      expect(button.className).toContain('bg-transparent');
      expect(button.className).toContain('text-slate-900');
    });

    it('renders danger variant with correct classes and CSS variable background', () => {
      renderWithProfile({}, <Button variant="danger">Danger</Button>);

      const button = screen.getByRole('button', { name: 'Danger' });
      expect(button.className).toContain('text-white');
      expect(button.style.backgroundColor).toBe('var(--neuro-color-error)');
    });
  });

  describe('sizes', () => {
    it('renders small size with correct classes', () => {
      renderWithProfile({}, <Button size="sm">Small</Button>);

      const button = screen.getByRole('button', { name: 'Small' });
      expect(button.className).toContain('h-9');
      expect(button.className).toContain('px-3');
      expect(button.className).toContain('text-sm');
    });

    it('renders medium size with correct classes', () => {
      renderWithProfile({}, <Button size="md">Medium</Button>);

      const button = screen.getByRole('button', { name: 'Medium' });
      expect(button.className).toContain('h-10');
      expect(button.className).toContain('px-4');
      expect(button.className).toContain('text-sm');
    });

    it('renders large size with correct classes', () => {
      renderWithProfile({}, <Button size="lg">Large</Button>);

      const button = screen.getByRole('button', { name: 'Large' });
      expect(button.className).toContain('h-11');
      expect(button.className).toContain('px-8');
      expect(button.className).toContain('text-sm');
    });
  });

  it('has CSS variable minimum touch target', () => {
    renderWithProfile({}, <Button>Touch target</Button>);

    const button = screen.getByRole('button', { name: 'Touch target' });
    expect(button.className).toContain('min-h-[var(--neuro-min-target-size)]');
    expect(button.className).toContain('min-w-[var(--neuro-min-target-size)]');
  });

  describe('motion preferences', () => {
    it('applies transition-none when motion is none', () => {
      renderWithProfile({ motion: 'none' }, <Button>No motion</Button>);

      const button = screen.getByRole('button', { name: 'No motion' });
      expect(button.className).toContain('transition-none');
      expect(button.className).not.toContain('transition-colors');
    });

    it('applies transition-colors when motion is reduced', () => {
      renderWithProfile({ motion: 'reduced' }, <Button>Reduced</Button>);

      const button = screen.getByRole('button', { name: 'Reduced' });
      expect(button.className).toContain('transition-colors');
      expect(button.className).toContain('duration-150');
    });

    it('applies transition-colors with duration-200 when motion is full', () => {
      renderWithProfile({ motion: 'full' }, <Button>Full motion</Button>);

      const button = screen.getByRole('button', { name: 'Full motion' });
      expect(button.className).toContain('transition-colors');
      expect(button.className).toContain('duration-200');
      expect(button.className).not.toContain('hover:scale-[1.02]');
    });
  });

  describe('focus preferences', () => {
    it('applies enhanced focus ring when focus is enhanced', () => {
      renderWithProfile({ focus: 'enhanced' }, <Button>Enhanced</Button>);

      const button = screen.getByRole('button', { name: 'Enhanced' });
      expect(button.className).toContain('ring-[3px]');
      expect(button.className).toContain('ring-offset-[3px]');
    });

    it('applies default focus ring when focus is standard', () => {
      renderWithProfile({ focus: 'standard' }, <Button>Default</Button>);

      const button = screen.getByRole('button', { name: 'Default' });
      expect(button.className).toContain('ring-2');
      expect(button.className).toContain('ring-offset-2');
      expect(button.className).not.toContain('ring-[3px]');
    });
  });

  describe('loading state', () => {
    it('is disabled when loading', () => {
      renderWithProfile({}, <Button loading>Loading</Button>);

      const button = screen.getByRole('button', { name: 'Loading' });
      expect(button).toBeDisabled();
    });

    it('shows spinner with animate-spin class', () => {
      renderWithProfile({}, <Button loading>Loading</Button>);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner?.tagName).toBe('svg');
    });

    it('has aria-label="Loading" when loading', () => {
      renderWithProfile({}, <Button loading>Submit</Button>);

      const button = screen.getByRole('button', { name: 'Loading' });
      expect(button).toHaveAttribute('aria-label', 'Loading');
    });

    it('has aria-busy when loading', () => {
      renderWithProfile({}, <Button loading>Submit</Button>);

      const button = screen.getByRole('button', { name: 'Loading' });
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('replaces icon with spinner when loading', () => {
      const icon = <span data-testid="icon">Icon</span>;
      renderWithProfile({}, <Button loading icon={icon}>With icon</Button>);

      expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('has disabled attribute when disabled', () => {
      renderWithProfile({}, <Button disabled>Disabled</Button>);

      const button = screen.getByRole('button', { name: 'Disabled' });
      expect(button).toBeDisabled();
    });

    it('applies opacity and pointer-events styles when disabled', () => {
      renderWithProfile({}, <Button disabled>Disabled</Button>);

      const button = screen.getByRole('button', { name: 'Disabled' });
      expect(button.className).toContain('opacity-50');
      expect(button.className).toContain('pointer-events-none');
    });
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    renderWithProfile({}, <Button ref={ref}>Ref test</Button>);

    expect(ref).toHaveBeenCalled();
    const firstCall = ref.mock.calls[0];
    expect(firstCall?.[0]).toBeInstanceOf(HTMLButtonElement);
  });

  it('renders icon when provided', () => {
    const icon = <span data-testid="test-icon">Icon</span>;
    renderWithProfile({}, <Button icon={icon}>With icon</Button>);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    renderWithProfile(
      {},
      <Button>
        <span data-testid="child-1">Child 1</span>
        <span data-testid="child-2">Child 2</span>
      </Button>,
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  describe('danger variant icon', () => {
    it('renders built-in warning icon SVG when no custom icon', () => {
      renderWithProfile({}, <Button variant="danger">Delete</Button>);

      const button = screen.getByRole('button', { name: 'Delete' });
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('uses custom icon when icon prop is provided', () => {
      const icon = <span data-testid="custom-icon">X</span>;
      renderWithProfile(
        {},
        <Button variant="danger" icon={icon}>
          Delete
        </Button>,
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('flash safety', () => {
    it('shows static dots instead of spinner when flashSafety is true and loading', () => {
      renderWithProfile(
        { flashSafety: true },
        <Button loading>Saving</Button>,
      );

      // No animated spinner
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
      // Static dots are rendered
      const dots = document.querySelectorAll('.rounded-full');
      expect(dots.length).toBe(3);
    });

    it('shows animated spinner when flashSafety is false and loading', () => {
      renderWithProfile(
        { flashSafety: false },
        <Button loading>Saving</Button>,
      );

      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('applies transition-none when flashSafety is true', () => {
      renderWithProfile(
        { flashSafety: true },
        <Button>Flash safe</Button>,
      );

      const button = screen.getByRole('button', { name: 'Flash safe' });
      expect(button.className).toContain('transition-none');
    });
  });

  it('applies custom className', () => {
    renderWithProfile({}, <Button className="custom-class">Custom</Button>);

    const button = screen.getByRole('button', { name: 'Custom' });
    expect(button.className).toContain('custom-class');
  });

  it('spreads additional props to button element', () => {
    renderWithProfile(
      {},
      <Button data-testid="custom-button" aria-describedby="description">
        Props test
      </Button>,
    );

    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-describedby', 'description');
  });
});
