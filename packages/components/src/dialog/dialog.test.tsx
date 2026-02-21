import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NeuroProvider } from '@neuroui/core';
import type { SensoryProfileOverrides } from '@neuroui/core';
import type React from 'react';

import { Dialog } from './dialog';

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

describe('Dialog', () => {
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
    cleanup();
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute('data-neuro');
    document.documentElement.removeAttribute('style');
    document.body.style.overflow = '';
  });

  it('does not render when open=false', () => {
    const onOpenChange = vi.fn();

    render(
      <NeuroProvider>
        <Dialog open={false} onOpenChange={onOpenChange} title="Test Dialog">
          <p>Content</p>
        </Dialog>
      </NeuroProvider>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open=true (portal into body)', () => {
    const onOpenChange = vi.fn();

    render(
      <NeuroProvider>
        <Dialog open={true} onOpenChange={onOpenChange} title="Test Dialog">
          <p>Content</p>
        </Dialog>
      </NeuroProvider>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders title in the dialog', () => {
    const onOpenChange = vi.fn();

    render(
      <NeuroProvider>
        <Dialog open={true} onOpenChange={onOpenChange} title="My Dialog">
          <p>Content</p>
        </Dialog>
      </NeuroProvider>,
    );

    expect(screen.getByText('My Dialog')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    const onOpenChange = vi.fn();

    render(
      <NeuroProvider>
        <Dialog
          open={true}
          onOpenChange={onOpenChange}
          title="Test Dialog"
          description="This is a description"
        >
          <p>Content</p>
        </Dialog>
      </NeuroProvider>,
    );

    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });

  it('renders children content', () => {
    const onOpenChange = vi.fn();

    render(
      <NeuroProvider>
        <Dialog open={true} onOpenChange={onOpenChange} title="Test Dialog">
          <p>Dialog content here</p>
        </Dialog>
      </NeuroProvider>,
    );

    expect(screen.getByText('Dialog content here')).toBeInTheDocument();
  });

  it('calls onOpenChange(false) when Escape is pressed', () => {
    const onOpenChange = vi.fn();

    render(
      <NeuroProvider>
        <Dialog open={true} onOpenChange={onOpenChange} title="Test Dialog">
          <p>Content</p>
        </Dialog>
      </NeuroProvider>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(false) when backdrop is clicked', () => {
    const onOpenChange = vi.fn();

    render(
      <NeuroProvider>
        <Dialog open={true} onOpenChange={onOpenChange} title="Test Dialog">
          <p>Content</p>
        </Dialog>
      </NeuroProvider>,
    );

    // Find the backdrop div (has aria-hidden="true" and bg-black class)
    const backdrop = document.querySelector('[aria-hidden="true"].bg-black\\/50');
    expect(backdrop).toBeInTheDocument();

    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does NOT call onOpenChange on Escape when closable=false', () => {
    const onOpenChange = vi.fn();

    render(
      <NeuroProvider>
        <Dialog
          open={true}
          onOpenChange={onOpenChange}
          title="Test Dialog"
          closable={false}
        >
          <p>Content</p>
        </Dialog>
      </NeuroProvider>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('renders close button when closable=true (aria-label="Close")', () => {
    const onOpenChange = vi.fn();

    render(
      <NeuroProvider>
        <Dialog
          open={true}
          onOpenChange={onOpenChange}
          title="Test Dialog"
          closable={true}
        >
          <p>Content</p>
        </Dialog>
      </NeuroProvider>,
    );

    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });

  it('does NOT render close button when closable=false', () => {
    const onOpenChange = vi.fn();

    render(
      <NeuroProvider>
        <Dialog
          open={true}
          onOpenChange={onOpenChange}
          title="Test Dialog"
          closable={false}
        >
          <p>Content</p>
        </Dialog>
      </NeuroProvider>,
    );

    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument();
  });

  it('close button calls onOpenChange(false) when clicked', () => {
    const onOpenChange = vi.fn();

    render(
      <NeuroProvider>
        <Dialog open={true} onOpenChange={onOpenChange} title="Test Dialog">
          <p>Content</p>
        </Dialog>
      </NeuroProvider>,
    );

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('sets document.body.style.overflow to hidden when open', () => {
    const onOpenChange = vi.fn();

    render(
      <NeuroProvider>
        <Dialog open={true} onOpenChange={onOpenChange} title="Test Dialog">
          <p>Content</p>
        </Dialog>
      </NeuroProvider>,
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores overflow when closed/unmounted', () => {
    const onOpenChange = vi.fn();

    // Set initial overflow
    document.body.style.overflow = 'auto';

    const { rerender } = render(
      <NeuroProvider>
        <Dialog open={true} onOpenChange={onOpenChange} title="Test Dialog">
          <p>Content</p>
        </Dialog>
      </NeuroProvider>,
    );

    expect(document.body.style.overflow).toBe('hidden');

    // Close the dialog
    rerender(
      <NeuroProvider>
        <Dialog open={false} onOpenChange={onOpenChange} title="Test Dialog">
          <p>Content</p>
        </Dialog>
      </NeuroProvider>,
    );

    expect(document.body.style.overflow).toBe('auto');
  });

  it('renders with role="dialog" and aria-modal="true"', () => {
    const onOpenChange = vi.fn();

    render(
      <NeuroProvider>
        <Dialog open={true} onOpenChange={onOpenChange} title="Test Dialog">
          <p>Content</p>
        </Dialog>
      </NeuroProvider>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('has aria-labelledby pointing to title element', () => {
    const onOpenChange = vi.fn();

    render(
      <NeuroProvider>
        <Dialog open={true} onOpenChange={onOpenChange} title="Test Dialog">
          <p>Content</p>
        </Dialog>
      </NeuroProvider>,
    );

    const dialog = screen.getByRole('dialog');
    const labelledby = dialog.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();

    const titleElement = labelledby
      ? document.getElementById(labelledby)
      : null;
    expect(titleElement).toBeInTheDocument();
    expect(titleElement?.textContent).toBe('Test Dialog');
  });

  it('motion: none → no inline transition style (immediate display)', () => {
    const onOpenChange = vi.fn();

    renderWithProfile(
      { motion: 'none' },
      <Dialog open={true} onOpenChange={onOpenChange} title="Test Dialog">
        <p>Content</p>
      </Dialog>,
    );

    // The container div with data-neuro-component="dialog" should not have inline transition style
    const container = document.querySelector('[data-neuro-component="dialog"]');
    expect(container).toBeInTheDocument();

    // Check that it doesn't have the transition style
    const style = container?.getAttribute('style');
    expect(style).toBeFalsy();
  });

  it('focus: enhanced → backdrop has bg-black/80 class', () => {
    const onOpenChange = vi.fn();

    renderWithProfile(
      { focus: 'enhanced' },
      <Dialog open={true} onOpenChange={onOpenChange} title="Test Dialog">
        <p>Content</p>
      </Dialog>,
    );

    const backdrop = document.querySelector('[aria-hidden="true"]');
    expect(backdrop).toHaveClass('bg-black/80');
  });

  it('default focus → backdrop has bg-black/50 class', () => {
    const onOpenChange = vi.fn();

    renderWithProfile(
      { focus: 'standard' },
      <Dialog open={true} onOpenChange={onOpenChange} title="Test Dialog">
        <p>Content</p>
      </Dialog>,
    );

    const backdrop = document.querySelector('[aria-hidden="true"]');
    expect(backdrop).toHaveClass('bg-black/50');
  });

  it('density: minimal → panel has p-8 class', () => {
    const onOpenChange = vi.fn();

    renderWithProfile(
      { density: 'minimal' },
      <Dialog open={true} onOpenChange={onOpenChange} title="Test Dialog">
        <p>Content</p>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('p-8');
  });

  it('density: normal → panel has p-6 class', () => {
    const onOpenChange = vi.fn();

    renderWithProfile(
      { density: 'normal' },
      <Dialog open={true} onOpenChange={onOpenChange} title="Test Dialog">
        <p>Content</p>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('p-6');
  });

  it('spacing: compact → panel has p-4 class', () => {
    const onOpenChange = vi.fn();

    renderWithProfile(
      { spacing: 'compact' },
      <Dialog open={true} onOpenChange={onOpenChange} title="Test Dialog">
        <p>Content</p>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('p-4');
  });

  it('spacing: relaxed → panel has p-8 class', () => {
    const onOpenChange = vi.fn();

    renderWithProfile(
      { spacing: 'relaxed' },
      <Dialog open={true} onOpenChange={onOpenChange} title="Test Dialog">
        <p>Content</p>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('p-8');
  });

  it('spacing: normal → panel has p-6 class', () => {
    const onOpenChange = vi.fn();

    renderWithProfile(
      { spacing: 'normal' },
      <Dialog open={true} onOpenChange={onOpenChange} title="Test Dialog">
        <p>Content</p>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('p-6');
  });

  it('density: minimal forces relaxed spacing (p-8) even with compact spacing', () => {
    const onOpenChange = vi.fn();

    renderWithProfile(
      { density: 'minimal', spacing: 'compact' },
      <Dialog open={true} onOpenChange={onOpenChange} title="Test Dialog">
        <p>Content</p>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('p-8');
  });

  it('spacing: compact → Dialog.Actions has gap-1 and mt-2', () => {
    const onOpenChange = vi.fn();

    renderWithProfile(
      { spacing: 'compact' },
      <Dialog open={true} onOpenChange={onOpenChange} title="Test Dialog">
        <p>Content</p>
        <Dialog.Actions data-testid="actions">
          <button>Cancel</button>
        </Dialog.Actions>
      </Dialog>,
    );

    const actions = screen.getByTestId('actions');
    expect(actions).toHaveClass('gap-1', 'mt-2', 'pt-2');
  });

  it('spacing: relaxed → Dialog.Actions has gap-4 and mt-6', () => {
    const onOpenChange = vi.fn();

    renderWithProfile(
      { spacing: 'relaxed' },
      <Dialog open={true} onOpenChange={onOpenChange} title="Test Dialog">
        <p>Content</p>
        <Dialog.Actions data-testid="actions">
          <button>Cancel</button>
        </Dialog.Actions>
      </Dialog>,
    );

    const actions = screen.getByTestId('actions');
    expect(actions).toHaveClass('gap-4', 'mt-6', 'pt-6');
  });

  it('renders Dialog.Actions sub-component', () => {
    const onOpenChange = vi.fn();

    render(
      <NeuroProvider>
        <Dialog open={true} onOpenChange={onOpenChange} title="Test Dialog">
          <p>Content</p>
          <Dialog.Actions>
            <button>Cancel</button>
            <button>Confirm</button>
          </Dialog.Actions>
        </Dialog>
      </NeuroProvider>,
    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('size: sm → applies max-w-sm class', () => {
    const onOpenChange = vi.fn();

    render(
      <NeuroProvider>
        <Dialog
          open={true}
          onOpenChange={onOpenChange}
          title="Test Dialog"
          size="sm"
        >
          <p>Content</p>
        </Dialog>
      </NeuroProvider>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('max-w-sm');
  });

  it('size: md → applies max-w-lg class', () => {
    const onOpenChange = vi.fn();

    render(
      <NeuroProvider>
        <Dialog
          open={true}
          onOpenChange={onOpenChange}
          title="Test Dialog"
          size="md"
        >
          <p>Content</p>
        </Dialog>
      </NeuroProvider>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('max-w-lg');
  });

  it('size: lg → applies max-w-2xl class', () => {
    const onOpenChange = vi.fn();

    render(
      <NeuroProvider>
        <Dialog
          open={true}
          onOpenChange={onOpenChange}
          title="Test Dialog"
          size="lg"
        >
          <p>Content</p>
        </Dialog>
      </NeuroProvider>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('max-w-2xl');
  });
});
