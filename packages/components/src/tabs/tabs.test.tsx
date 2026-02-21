import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type React from 'react';
import { NeuroProvider, type SensoryProfileOverrides } from '@neuroui/core';

import { Tabs, TabList, Tab, TabPanel } from './tabs';

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
describe('Tabs', () => {
  it('renders tabs with tab list and panels', () => {
    renderWithProfile(
      {},
      <Tabs defaultValue="tab1">
        <TabList>
          <Tab value="tab1">Tab 1</Tab>
          <Tab value="tab2">Tab 2</Tab>
        </TabList>
        <TabPanel value="tab1">Panel 1</TabPanel>
        <TabPanel value="tab2">Panel 2</TabPanel>
      </Tabs>,
    );

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
  });

  it('shows correct panel for default value', () => {
    renderWithProfile(
      {},
      <Tabs defaultValue="tab1">
        <TabList>
          <Tab value="tab1">Tab 1</Tab>
          <Tab value="tab2">Tab 2</Tab>
        </TabList>
        <TabPanel value="tab1">Panel 1 Content</TabPanel>
        <TabPanel value="tab2">Panel 2 Content</TabPanel>
      </Tabs>,
    );

    expect(screen.getByText('Panel 1 Content')).toBeInTheDocument();
    expect(screen.queryByText('Panel 2 Content')).not.toBeInTheDocument();
  });

  it('switches tabs on click', async () => {
    const user = userEvent.setup();

    renderWithProfile(
      {},
      <Tabs defaultValue="tab1">
        <TabList>
          <Tab value="tab1">Tab 1</Tab>
          <Tab value="tab2">Tab 2</Tab>
        </TabList>
        <TabPanel value="tab1">Panel 1 Content</TabPanel>
        <TabPanel value="tab2">Panel 2 Content</TabPanel>
      </Tabs>,
    );

    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    await user.click(tab2);

    expect(screen.queryByText('Panel 1 Content')).not.toBeInTheDocument();
    expect(screen.getByText('Panel 2 Content')).toBeInTheDocument();
  });

  it('has data-neuro-component="tabs"', () => {
    renderWithProfile(
      {},
      <Tabs defaultValue="tab1">
        <TabList>
          <Tab value="tab1">Tab 1</Tab>
        </TabList>
        <TabPanel value="tab1">Panel 1</TabPanel>
      </Tabs>,
    );

    const tabs = document.querySelector('[data-neuro-component="tabs"]');
    expect(tabs).toBeInTheDocument();
  });

  it('active tab has aria-selected="true"', () => {
    renderWithProfile(
      {},
      <Tabs defaultValue="tab1">
        <TabList>
          <Tab value="tab1">Tab 1</Tab>
          <Tab value="tab2">Tab 2</Tab>
        </TabList>
        <TabPanel value="tab1">Panel 1</TabPanel>
        <TabPanel value="tab2">Panel 2</TabPanel>
      </Tabs>,
    );

    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab1).toHaveAttribute('aria-selected', 'true');
  });

  it('inactive tabs have aria-selected="false"', () => {
    renderWithProfile(
      {},
      <Tabs defaultValue="tab1">
        <TabList>
          <Tab value="tab1">Tab 1</Tab>
          <Tab value="tab2">Tab 2</Tab>
        </TabList>
        <TabPanel value="tab1">Panel 1</TabPanel>
        <TabPanel value="tab2">Panel 2</TabPanel>
      </Tabs>,
    );

    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    expect(tab2).toHaveAttribute('aria-selected', 'false');
  });

  it('arrow key navigation works (right/left)', async () => {
    const user = userEvent.setup();

    renderWithProfile(
      {},
      <Tabs defaultValue="tab1">
        <TabList>
          <Tab value="tab1">Tab 1</Tab>
          <Tab value="tab2">Tab 2</Tab>
          <Tab value="tab3">Tab 3</Tab>
        </TabList>
        <TabPanel value="tab1">Panel 1</TabPanel>
        <TabPanel value="tab2">Panel 2</TabPanel>
        <TabPanel value="tab3">Panel 3</TabPanel>
      </Tabs>,
    );

    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    tab1.focus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('Panel 2')).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByText('Panel 1')).toBeInTheDocument();
  });

  it('has role="tablist", role="tab", role="tabpanel"', () => {
    renderWithProfile(
      {},
      <Tabs defaultValue="tab1">
        <TabList>
          <Tab value="tab1">Tab 1</Tab>
        </TabList>
        <TabPanel value="tab1">Panel 1</TabPanel>
      </Tabs>,
    );

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('tab panels have aria-labelledby', () => {
    renderWithProfile(
      {},
      <Tabs defaultValue="tab1">
        <TabList>
          <Tab value="tab1">Tab 1</Tab>
        </TabList>
        <TabPanel value="tab1">Panel 1</TabPanel>
      </Tabs>,
    );

    const tab = screen.getByRole('tab', { name: 'Tab 1' });
    const panel = screen.getByRole('tabpanel');

    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
  });

  it('has min-height for touch targets', () => {
    renderWithProfile(
      {},
      <Tabs defaultValue="tab1">
        <TabList>
          <Tab value="tab1">Tab 1</Tab>
        </TabList>
        <TabPanel value="tab1">Panel 1</TabPanel>
      </Tabs>,
    );

    const tab = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab.className).toContain('min-h-[var(--neuro-min-target-size,44px)]');
  });

  it('applies enhanced focus ring when focus is enhanced', () => {
    renderWithProfile(
      { focus: 'enhanced' },
      <Tabs defaultValue="tab1">
        <TabList>
          <Tab value="tab1">Tab 1</Tab>
        </TabList>
        <TabPanel value="tab1">Panel 1</TabPanel>
      </Tabs>,
    );

    const tab = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab.className).toContain('ring-[3px]');
    expect(tab.className).toContain('ring-offset-[3px]');
  });

  it('supports controlled mode with value prop', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    const { rerender } = renderWithProfile(
      {},
      <Tabs defaultValue="tab1" value="tab1" onValueChange={onValueChange}>
        <TabList>
          <Tab value="tab1">Tab 1</Tab>
          <Tab value="tab2">Tab 2</Tab>
        </TabList>
        <TabPanel value="tab1">Panel 1</TabPanel>
        <TabPanel value="tab2">Panel 2</TabPanel>
      </Tabs>,
    );

    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    await user.click(tab2);

    expect(onValueChange).toHaveBeenCalledWith('tab2');

    // Panel should not change until value prop is updated
    expect(screen.getByText('Panel 1')).toBeInTheDocument();
  });

  it('disabled tab cannot be clicked', async () => {
    const user = userEvent.setup();

    renderWithProfile(
      {},
      <Tabs defaultValue="tab1">
        <TabList>
          <Tab value="tab1">Tab 1</Tab>
          <Tab value="tab2" disabled>Tab 2</Tab>
        </TabList>
        <TabPanel value="tab1">Panel 1</TabPanel>
        <TabPanel value="tab2">Panel 2</TabPanel>
      </Tabs>,
    );

    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    expect(tab2).toBeDisabled();

    await user.click(tab2);
    expect(screen.getByText('Panel 1')).toBeInTheDocument();
  });

  it('applies no transition when flashSafety is true', () => {
    renderWithProfile(
      { flashSafety: true },
      <Tabs defaultValue="tab1">
        <TabList>
          <Tab value="tab1">Tab 1</Tab>
        </TabList>
        <TabPanel value="tab1">Panel 1</TabPanel>
      </Tabs>,
    );

    const tab = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab.className).not.toContain('transition-colors');
  });
});
