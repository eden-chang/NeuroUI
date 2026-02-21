import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type React from 'react';
import { NeuroProvider, type SensoryProfileOverrides } from '@neuroui/core';

import { Alert } from './alert';

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
describe('Alert', () => {
  it('renders with title', () => {
    renderWithProfile({}, <Alert title="Alert title" />);

    expect(screen.getByText('Alert title')).toBeInTheDocument();
  });

  it('renders with children', () => {
    renderWithProfile(
      {},
      <Alert title="Alert title">
        <p>Alert content</p>
      </Alert>,
    );

    expect(screen.getByText('Alert title')).toBeInTheDocument();
    expect(screen.getByText('Alert content')).toBeInTheDocument();
  });

  it('shows correct icon for info variant', () => {
    renderWithProfile({}, <Alert variant="info" title="Info" />);

    const alert = screen.getByRole('alert');
    const svg = alert.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows correct icon for success variant', () => {
    renderWithProfile({}, <Alert variant="success" title="Success" />);

    const alert = screen.getByRole('alert');
    const svg = alert.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('shows correct icon for warning variant', () => {
    renderWithProfile({}, <Alert variant="warning" title="Warning" />);

    const alert = screen.getByRole('alert');
    const svg = alert.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('shows correct icon for error variant', () => {
    renderWithProfile({}, <Alert variant="error" title="Error" />);

    const alert = screen.getByRole('alert');
    const svg = alert.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has data-neuro-component="alert"', () => {
    renderWithProfile({}, <Alert title="Alert" />);

    const alert = document.querySelector('[data-neuro-component="alert"]');
    expect(alert).toBeInTheDocument();
  });

  it('has role="alert"', () => {
    renderWithProfile({}, <Alert title="Alert" />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });

  it('closable: dismiss button works', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithProfile({}, <Alert title="Alert" closable onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: 'Dismiss' });
    expect(closeButton).toBeInTheDocument();

    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('density:minimal hides children', () => {
    renderWithProfile(
      { density: 'minimal' },
      <Alert title="Alert title">
        <p>Alert content</p>
      </Alert>,
    );

    expect(screen.getByText('Alert title')).toBeInTheDocument();
    expect(screen.queryByText('Alert content')).not.toBeInTheDocument();
  });

  it('has border-left accent via CSS variable for info', () => {
    renderWithProfile({}, <Alert variant="info" title="Info" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveStyle({ borderLeftColor: 'var(--neuro-color-info)' });
  });

  it('has border-left accent via CSS variable for success', () => {
    renderWithProfile({}, <Alert variant="success" title="Success" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveStyle({ borderLeftColor: 'var(--neuro-color-success)' });
  });

  it('has border-left accent via CSS variable for warning', () => {
    renderWithProfile({}, <Alert variant="warning" title="Warning" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveStyle({ borderLeftColor: 'var(--neuro-color-warning)' });
  });

  it('has border-left accent via CSS variable for error', () => {
    renderWithProfile({}, <Alert variant="error" title="Error" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveStyle({ borderLeftColor: 'var(--neuro-color-error)' });
  });

  it('uses custom icon when provided', () => {
    const customIcon = <span data-testid="custom-icon">★</span>;

    renderWithProfile({}, <Alert title="Custom" icon={customIcon} />);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    renderWithProfile({}, <Alert ref={ref} title="Ref test" />);

    expect(ref).toHaveBeenCalled();
    const firstCall = ref.mock.calls[0];
    expect(firstCall?.[0]).toBeInstanceOf(HTMLDivElement);
  });

  it('applies custom className', () => {
    renderWithProfile({}, <Alert title="Custom" className="custom-class" />);

    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('custom-class');
  });

  it('spreads additional props to div element', () => {
    renderWithProfile(
      {},
      <Alert title="Props test" data-testid="custom-alert" aria-describedby="description" />,
    );

    const alert = screen.getByTestId('custom-alert');
    expect(alert).toHaveAttribute('aria-describedby', 'description');
  });

  it('does not show close button when closable is false', () => {
    renderWithProfile({}, <Alert title="Alert" closable={false} />);

    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  it('icon color matches variant CSS variable', () => {
    renderWithProfile({}, <Alert variant="success" title="Success" />);

    const alert = screen.getByRole('alert');
    const iconSpan = alert.querySelector('span[style*="color"]');
    expect(iconSpan).toHaveStyle({ color: 'var(--neuro-color-success)' });
  });
});
