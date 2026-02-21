import type React from 'react';
import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NeuroProvider } from '@neuroui/core';
import type { SensoryProfileOverrides } from '@neuroui/core';

import { Card } from './card';

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

function renderWithProvider(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <NeuroProvider>{children}</NeuroProvider>
    ),
  });
}

describe('Card', () => {
  it('renders with default variant and data-neuro-component="card"', () => {
    const { container } = renderWithProvider(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;

    expect(card).toBeInTheDocument();
    expect(card.getAttribute('data-neuro-component')).toBe('card');
    expect(card).toHaveTextContent('Content');
  });

  it('renders default variant with correct classes', () => {
    const { container } = renderWithProvider(
      <Card variant="default">Content</Card>,
    );
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('border-slate-200');
    expect(card).toHaveClass('shadow-sm');
  });

  it('renders outlined variant with correct classes', () => {
    const { container } = renderWithProvider(
      <Card variant="outlined">Content</Card>,
    );
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('border-slate-200');
  });

  it('renders elevated variant with correct classes', () => {
    const { container } = renderWithProvider(
      <Card variant="elevated">Content</Card>,
    );
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('border-slate-100');
    expect(card).toHaveClass('shadow');
  });

  it('interactive mode has role="button" and tabIndex={0}', () => {
    renderWithProvider(<Card interactive>Content</Card>);
    const card = screen.getByRole('button');

    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('non-interactive mode has no role="button" and no tabIndex', () => {
    const { container } = renderWithProvider(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;

    expect(card).not.toHaveAttribute('role');
    expect(card).not.toHaveAttribute('tabIndex');
  });

  it('interactive mode Enter key triggers click handler', () => {
    const handleClick = vi.fn();
    renderWithProvider(
      <Card interactive onClick={handleClick}>
        Content
      </Card>,
    );
    const card = screen.getByRole('button');

    fireEvent.keyDown(card, { key: 'Enter' });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('interactive mode Space key triggers click handler', () => {
    const handleClick = vi.fn();
    renderWithProvider(
      <Card interactive onClick={handleClick}>
        Content
      </Card>,
    );
    const card = screen.getByRole('button');

    fireEvent.keyDown(card, { key: ' ' });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('motion: "none" has transition-none class', () => {
    const { container } = renderWithProfile(
      { motion: 'none' },
      <Card>Content</Card>,
    );
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass('transition-none');
  });

  it('motion: "reduced" has transition-colors class', () => {
    const { container } = renderWithProfile(
      { motion: 'reduced' },
      <Card>Content</Card>,
    );
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass('transition-colors');
    expect(card).toHaveClass('duration-150');
  });

  it('motion: "full" has transition-all and duration-200 classes', () => {
    const { container } = renderWithProfile(
      { motion: 'full' },
      <Card>Content</Card>,
    );
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass('transition-all');
    expect(card).toHaveClass('duration-200');
  });

  it('density: "minimal" has p-8 class', () => {
    const { container } = renderWithProfile(
      { density: 'minimal' },
      <Card>Content</Card>,
    );
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass('p-8');
  });

  it('density: "normal" (default) has p-6 class', () => {
    const { container } = renderWithProfile(
      { density: 'normal' },
      <Card>Content</Card>,
    );
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass('p-6');
  });

  it('spacing: "compact" applies p-4 to card', () => {
    const { container } = renderWithProfile(
      { spacing: 'compact' },
      <Card>Content</Card>,
    );
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass('p-4');
  });

  it('spacing: "relaxed" applies p-8 to card', () => {
    const { container } = renderWithProfile(
      { spacing: 'relaxed' },
      <Card>Content</Card>,
    );
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass('p-8');
  });

  it('spacing: "compact" applies p-4 to sub-components', () => {
    renderWithProfile(
      { spacing: 'compact' },
      <Card>
        <Card.Header>Header</Card.Header>
        <Card.Body>Body</Card.Body>
        <Card.Footer>Footer</Card.Footer>
      </Card>,
    );

    expect(screen.getByText('Header')).toHaveClass('p-4');
    expect(screen.getByText('Body')).toHaveClass('p-4', 'pt-0');
    expect(screen.getByText('Footer')).toHaveClass('p-4', 'pt-0', 'gap-1');
  });

  it('spacing: "relaxed" applies p-8 to sub-components', () => {
    renderWithProfile(
      { spacing: 'relaxed' },
      <Card>
        <Card.Header>Header</Card.Header>
        <Card.Body>Body</Card.Body>
        <Card.Footer>Footer</Card.Footer>
      </Card>,
    );

    expect(screen.getByText('Header')).toHaveClass('p-8');
    expect(screen.getByText('Body')).toHaveClass('p-8', 'pt-0');
    expect(screen.getByText('Footer')).toHaveClass('p-8', 'pt-0', 'gap-4');
  });

  it('density: "minimal" forces relaxed spacing on card', () => {
    const { container } = renderWithProfile(
      { density: 'minimal', spacing: 'compact' },
      <Card>Content</Card>,
    );
    const card = container.firstChild as HTMLElement;

    // density=minimal overrides compact spacing to relaxed (p-8)
    expect(card).toHaveClass('p-8');
  });

  it('interactive + focus: "enhanced" has ring-[3px] class', () => {
    const { container } = renderWithProfile(
      { focus: 'enhanced' },
      <Card interactive>Content</Card>,
    );
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass('focus-visible:ring-[3px]');
    expect(card).toHaveClass('focus-visible:ring-offset-[3px]');
    expect(card).toHaveClass('focus-visible:ring-slate-950');
  });

  it('renders Card.Header sub-component', () => {
    renderWithProvider(
      <Card>
        <Card.Header>Header Content</Card.Header>
      </Card>,
    );

    const header = screen.getByText('Header Content');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('p-6');
  });

  it('renders Card.Body sub-component', () => {
    renderWithProvider(
      <Card>
        <Card.Body>Body Content</Card.Body>
      </Card>,
    );

    const body = screen.getByText('Body Content');
    expect(body).toBeInTheDocument();
    expect(body).toHaveClass('p-6');
    expect(body).toHaveClass('pt-0');
  });

  it('renders Card.Footer sub-component', () => {
    renderWithProvider(
      <Card>
        <Card.Footer>Footer Content</Card.Footer>
      </Card>,
    );

    const footer = screen.getByText('Footer Content');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('p-6');
    expect(footer).toHaveClass('pt-0');
    expect(footer).toHaveClass('flex');
    expect(footer).toHaveClass('justify-end');
    expect(footer).toHaveClass('gap-2');
  });

  it('forwards ref to root div', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithProvider(<Card ref={ref}>Content</Card>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveTextContent('Content');
  });

  it('merges custom className', () => {
    const { container } = renderWithProvider(
      <Card className="custom-class">Content</Card>,
    );
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass('custom-class');
    expect(card).toHaveClass('rounded-xl');
  });

  it('renders children correctly', () => {
    renderWithProvider(
      <Card>
        <div>Child 1</div>
        <div>Child 2</div>
      </Card>,
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });
});
