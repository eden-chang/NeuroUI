import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type React from 'react';
import { NeuroProvider, type SensoryProfileOverrides } from '@neuroui/core';

import { Navigation } from './navigation';

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

describe('Navigation', () => {
  it('renders with label and correct data attribute', () => {
    renderWithProfile(
      {},
      <Navigation label="Main navigation">
        <Navigation.Item href="/">Home</Navigation.Item>
      </Navigation>,
    );

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute('data-neuro-component', 'navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('renders menubar role on list', () => {
    renderWithProfile(
      {},
      <Navigation label="Main navigation">
        <Navigation.Item href="/">Home</Navigation.Item>
      </Navigation>,
    );

    const menubar = screen.getByRole('menubar');
    expect(menubar).toBeInTheDocument();
  });

  it('renders navigation items as links with menuitem role', () => {
    renderWithProfile(
      {},
      <Navigation label="Main navigation">
        <Navigation.Item href="/">Home</Navigation.Item>
        <Navigation.Item href="/about">About</Navigation.Item>
      </Navigation>,
    );

    const home = screen.getByRole('menuitem', { name: 'Home' });
    const about = screen.getByRole('menuitem', { name: 'About' });

    expect(home).toBeInTheDocument();
    expect(home.tagName).toBe('A');
    expect(home).toHaveAttribute('href', '/');

    expect(about).toBeInTheDocument();
    expect(about.tagName).toBe('A');
    expect(about).toHaveAttribute('href', '/about');
  });

  it('sets aria-current="page" on active item', () => {
    renderWithProfile(
      {},
      <Navigation label="Main navigation">
        <Navigation.Item href="/" active>
          Home
        </Navigation.Item>
        <Navigation.Item href="/about">About</Navigation.Item>
      </Navigation>,
    );

    const home = screen.getByRole('menuitem', { name: 'Home' });
    const about = screen.getByRole('menuitem', { name: 'About' });

    expect(home).toHaveAttribute('aria-current', 'page');
    expect(about).not.toHaveAttribute('aria-current');
  });

  it('renders icon in navigation item', () => {
    const icon = <span data-testid="home-icon">🏠</span>;

    renderWithProfile(
      {},
      <Navigation label="Main navigation">
        <Navigation.Item href="/" icon={icon}>
          Home
        </Navigation.Item>
      </Navigation>,
    );

    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });

  describe('keyboard navigation - horizontal', () => {
    it('moves focus to next item on ArrowRight', () => {
      renderWithProfile(
        {},
        <Navigation label="Main navigation" orientation="horizontal">
          <Navigation.Item href="/">Home</Navigation.Item>
          <Navigation.Item href="/about">About</Navigation.Item>
          <Navigation.Item href="/contact">Contact</Navigation.Item>
        </Navigation>,
      );

      const home = screen.getByRole('menuitem', { name: 'Home' });
      const about = screen.getByRole('menuitem', { name: 'About' });
      const menubar = screen.getByRole('menubar');

      home.focus();
      expect(document.activeElement).toBe(home);

      fireEvent.keyDown(menubar, { key: 'ArrowRight' });

      expect(document.activeElement).toBe(about);
    });

    it('moves focus to previous item on ArrowLeft', () => {
      renderWithProfile(
        {},
        <Navigation label="Main navigation" orientation="horizontal">
          <Navigation.Item href="/">Home</Navigation.Item>
          <Navigation.Item href="/about">About</Navigation.Item>
          <Navigation.Item href="/contact">Contact</Navigation.Item>
        </Navigation>,
      );

      const home = screen.getByRole('menuitem', { name: 'Home' });
      const about = screen.getByRole('menuitem', { name: 'About' });
      const menubar = screen.getByRole('menubar');

      about.focus();
      expect(document.activeElement).toBe(about);

      fireEvent.keyDown(menubar, { key: 'ArrowLeft' });

      expect(document.activeElement).toBe(home);
    });

    it('wraps to first item when ArrowRight on last item', () => {
      renderWithProfile(
        {},
        <Navigation label="Main navigation" orientation="horizontal">
          <Navigation.Item href="/">Home</Navigation.Item>
          <Navigation.Item href="/about">About</Navigation.Item>
        </Navigation>,
      );

      const home = screen.getByRole('menuitem', { name: 'Home' });
      const about = screen.getByRole('menuitem', { name: 'About' });
      const menubar = screen.getByRole('menubar');

      about.focus();

      fireEvent.keyDown(menubar, { key: 'ArrowRight' });

      expect(document.activeElement).toBe(home);
    });

    it('wraps to last item when ArrowLeft on first item', () => {
      renderWithProfile(
        {},
        <Navigation label="Main navigation" orientation="horizontal">
          <Navigation.Item href="/">Home</Navigation.Item>
          <Navigation.Item href="/about">About</Navigation.Item>
        </Navigation>,
      );

      const home = screen.getByRole('menuitem', { name: 'Home' });
      const about = screen.getByRole('menuitem', { name: 'About' });
      const menubar = screen.getByRole('menubar');

      home.focus();

      fireEvent.keyDown(menubar, { key: 'ArrowLeft' });

      expect(document.activeElement).toBe(about);
    });
  });

  describe('keyboard navigation - vertical', () => {
    it('moves focus to next item on ArrowDown', () => {
      renderWithProfile(
        {},
        <Navigation label="Main navigation" orientation="vertical">
          <Navigation.Item href="/">Home</Navigation.Item>
          <Navigation.Item href="/about">About</Navigation.Item>
        </Navigation>,
      );

      const home = screen.getByRole('menuitem', { name: 'Home' });
      const about = screen.getByRole('menuitem', { name: 'About' });
      const menubar = screen.getByRole('menubar');

      home.focus();

      fireEvent.keyDown(menubar, { key: 'ArrowDown' });

      expect(document.activeElement).toBe(about);
    });

    it('moves focus to previous item on ArrowUp', () => {
      renderWithProfile(
        {},
        <Navigation label="Main navigation" orientation="vertical">
          <Navigation.Item href="/">Home</Navigation.Item>
          <Navigation.Item href="/about">About</Navigation.Item>
        </Navigation>,
      );

      const home = screen.getByRole('menuitem', { name: 'Home' });
      const about = screen.getByRole('menuitem', { name: 'About' });
      const menubar = screen.getByRole('menubar');

      about.focus();

      fireEvent.keyDown(menubar, { key: 'ArrowUp' });

      expect(document.activeElement).toBe(home);
    });
  });

  describe('Space key activation', () => {
    it('activates item on Space key press', () => {
      const handleClick = vi.fn();

      renderWithProfile(
        {},
        <Navigation label="Main navigation" orientation="horizontal">
          <Navigation.Item href="/" onClick={handleClick}>
            Home
          </Navigation.Item>
          <Navigation.Item href="/about">About</Navigation.Item>
        </Navigation>,
      );

      const home = screen.getByRole('menuitem', { name: 'Home' });
      const menubar = screen.getByRole('menubar');

      home.focus();

      fireEvent.keyDown(menubar, { key: ' ' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('activates item on Enter key press', () => {
      const handleClick = vi.fn();

      renderWithProfile(
        {},
        <Navigation label="Main navigation" orientation="horizontal">
          <Navigation.Item href="/" onClick={handleClick}>
            Home
          </Navigation.Item>
          <Navigation.Item href="/about">About</Navigation.Item>
        </Navigation>,
      );

      const home = screen.getByRole('menuitem', { name: 'Home' });
      const menubar = screen.getByRole('menubar');

      home.focus();

      fireEvent.keyDown(menubar, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('spacing preferences', () => {
    it('applies relaxed spacing for horizontal navigation', () => {
      renderWithProfile(
        { spacing: 'relaxed' },
        <Navigation label="Main navigation" orientation="horizontal">
          <Navigation.Item href="/">Home</Navigation.Item>
        </Navigation>,
      );

      const menubar = screen.getByRole('menubar');
      expect(menubar.className).toContain('gap-6');
    });

    it('applies compact spacing for horizontal navigation', () => {
      renderWithProfile(
        { spacing: 'compact' },
        <Navigation label="Main navigation" orientation="horizontal">
          <Navigation.Item href="/">Home</Navigation.Item>
        </Navigation>,
      );

      const menubar = screen.getByRole('menubar');
      expect(menubar.className).toContain('gap-1');
    });

    it('applies standard spacing for horizontal navigation', () => {
      renderWithProfile(
        { spacing: 'normal' },
        <Navigation label="Main navigation" orientation="horizontal">
          <Navigation.Item href="/">Home</Navigation.Item>
        </Navigation>,
      );

      const menubar = screen.getByRole('menubar');
      expect(menubar.className).toContain('gap-2');
    });
  });

  describe('focus preferences', () => {
    it('applies enhanced focus ring when focus is enhanced', () => {
      renderWithProfile(
        { focus: 'enhanced' },
        <Navigation label="Main navigation">
          <Navigation.Item href="/">Home</Navigation.Item>
        </Navigation>,
      );

      const item = screen.getByRole('menuitem', { name: 'Home' });
      expect(item.className).toContain('ring-[3px]');
      expect(item.className).toContain('ring-offset-[3px]');
    });

    it('applies standard focus ring when focus is standard', () => {
      renderWithProfile(
        { focus: 'standard' },
        <Navigation label="Main navigation">
          <Navigation.Item href="/">Home</Navigation.Item>
        </Navigation>,
      );

      const item = screen.getByRole('menuitem', { name: 'Home' });
      expect(item.className).toContain('ring-2');
      expect(item.className).toContain('ring-offset-2');
    });
  });

  it('forwards ref to navigation element', () => {
    const ref = vi.fn();
    renderWithProfile(
      {},
      <Navigation ref={ref} label="Main navigation">
        <Navigation.Item href="/">Home</Navigation.Item>
      </Navigation>,
    );

    expect(ref).toHaveBeenCalled();
    const firstCall = ref.mock.calls[0];
    expect(firstCall?.[0]).toBeInstanceOf(HTMLElement);
    expect(firstCall?.[0].tagName).toBe('NAV');
  });

  it('forwards ref to navigation item', () => {
    const ref = vi.fn();
    renderWithProfile(
      {},
      <Navigation label="Main navigation">
        <Navigation.Item ref={ref} href="/">
          Home
        </Navigation.Item>
      </Navigation>,
    );

    expect(ref).toHaveBeenCalled();
    const firstCall = ref.mock.calls[0];
    expect(firstCall?.[0]).toBeInstanceOf(HTMLAnchorElement);
  });

  it('applies custom className to navigation', () => {
    renderWithProfile(
      {},
      <Navigation label="Main navigation" className="custom-nav">
        <Navigation.Item href="/">Home</Navigation.Item>
      </Navigation>,
    );

    const nav = screen.getByRole('navigation');
    expect(nav.className).toContain('custom-nav');
  });

  it('applies custom className to navigation item', () => {
    renderWithProfile(
      {},
      <Navigation label="Main navigation">
        <Navigation.Item href="/" className="custom-item">
          Home
        </Navigation.Item>
      </Navigation>,
    );

    const item = screen.getByRole('menuitem', { name: 'Home' });
    expect(item.className).toContain('custom-item');
  });
});
