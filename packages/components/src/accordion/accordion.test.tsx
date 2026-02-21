import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type React from 'react';
import { NeuroProvider, type SensoryProfileOverrides } from '@neuroui/core';

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion';

// Test Helpers
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

// Setup/Teardown
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

// Tests
describe('Accordion', () => {
  it('renders accordion items', () => {
    renderWithProfile(
      {},
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger value="item1">Item 1</AccordionTrigger>
          <AccordionContent value="item1">Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item2">
          <AccordionTrigger value="item2">Item 2</AccordionTrigger>
          <AccordionContent value="item2">Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(screen.getByRole('button', { name: 'Item 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Item 2' })).toBeInTheDocument();
  });

  it('shows/hides content on trigger click', async () => {
    const user = userEvent.setup();

    renderWithProfile(
      {},
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger value="item1">Item 1</AccordionTrigger>
          <AccordionContent value="item1">Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();

    const trigger = screen.getByRole('button', { name: 'Item 1' });
    await user.click(trigger);

    expect(screen.getByText('Content 1')).toBeInTheDocument();

    await user.click(trigger);

    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
  });

  it('single mode: only one item open at a time', async () => {
    const user = userEvent.setup();

    renderWithProfile(
      {},
      <Accordion type="single">
        <AccordionItem value="item1">
          <AccordionTrigger value="item1">Item 1</AccordionTrigger>
          <AccordionContent value="item1">Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item2">
          <AccordionTrigger value="item2">Item 2</AccordionTrigger>
          <AccordionContent value="item2">Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger1 = screen.getByRole('button', { name: 'Item 1' });
    const trigger2 = screen.getByRole('button', { name: 'Item 2' });

    await user.click(trigger1);
    expect(screen.getByText('Content 1')).toBeInTheDocument();

    await user.click(trigger2);
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('multiple mode: multiple items can be open', async () => {
    const user = userEvent.setup();

    renderWithProfile(
      {},
      <Accordion type="multiple">
        <AccordionItem value="item1">
          <AccordionTrigger value="item1">Item 1</AccordionTrigger>
          <AccordionContent value="item1">Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item2">
          <AccordionTrigger value="item2">Item 2</AccordionTrigger>
          <AccordionContent value="item2">Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger1 = screen.getByRole('button', { name: 'Item 1' });
    const trigger2 = screen.getByRole('button', { name: 'Item 2' });

    await user.click(trigger1);
    expect(screen.getByText('Content 1')).toBeInTheDocument();

    await user.click(trigger2);
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('has data-neuro-component="accordion"', () => {
    renderWithProfile(
      {},
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger value="item1">Item 1</AccordionTrigger>
          <AccordionContent value="item1">Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const accordion = document.querySelector('[data-neuro-component="accordion"]');
    expect(accordion).toBeInTheDocument();
  });

  it('trigger has aria-expanded', async () => {
    const user = userEvent.setup();

    renderWithProfile(
      {},
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger value="item1">Item 1</AccordionTrigger>
          <AccordionContent value="item1">Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByRole('button', { name: 'Item 1' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('has defaultValue support', () => {
    renderWithProfile(
      {},
      <Accordion defaultValue={['item1', 'item2']}>
        <AccordionItem value="item1">
          <AccordionTrigger value="item1">Item 1</AccordionTrigger>
          <AccordionContent value="item1">Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item2">
          <AccordionTrigger value="item2">Item 2</AccordionTrigger>
          <AccordionContent value="item2">Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('has min-height for touch targets', () => {
    renderWithProfile(
      {},
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger value="item1">Item 1</AccordionTrigger>
          <AccordionContent value="item1">Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByRole('button', { name: 'Item 1' });
    expect(trigger.className).toContain('min-h-[var(--neuro-min-target-size,44px)]');
  });

  it('applies enhanced focus ring when focus is enhanced', () => {
    renderWithProfile(
      { focus: 'enhanced' },
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger value="item1">Item 1</AccordionTrigger>
          <AccordionContent value="item1">Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByRole('button', { name: 'Item 1' });
    expect(trigger.className).toContain('ring-[3px]');
    expect(trigger.className).toContain('ring-offset-[3px]');
  });

  it('forces single mode when density is minimal', async () => {
    const user = userEvent.setup();

    renderWithProfile(
      { density: 'minimal' },
      <Accordion type="multiple">
        <AccordionItem value="item1">
          <AccordionTrigger value="item1">Item 1</AccordionTrigger>
          <AccordionContent value="item1">Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item2">
          <AccordionTrigger value="item2">Item 2</AccordionTrigger>
          <AccordionContent value="item2">Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger1 = screen.getByRole('button', { name: 'Item 1' });
    const trigger2 = screen.getByRole('button', { name: 'Item 2' });

    await user.click(trigger1);
    expect(screen.getByText('Content 1')).toBeInTheDocument();

    await user.click(trigger2);
    // Should behave as single mode even though type="multiple"
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('applies no transition when flashSafety is true', async () => {
    const user = userEvent.setup();

    renderWithProfile(
      { flashSafety: true },
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger value="item1">Item 1</AccordionTrigger>
          <AccordionContent value="item1">Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByRole('button', { name: 'Item 1' });
    await user.click(trigger);

    const svg = trigger.querySelector('svg');
    expect(svg?.className).not.toContain('transition-transform');
  });

  it('content has role="region"', async () => {
    const user = userEvent.setup();

    renderWithProfile(
      {},
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger value="item1">Item 1</AccordionTrigger>
          <AccordionContent value="item1">Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByRole('button', { name: 'Item 1' });
    await user.click(trigger);

    const region = screen.getByRole('region');
    expect(region).toBeInTheDocument();
    expect(region).toHaveTextContent('Content 1');
  });
});
