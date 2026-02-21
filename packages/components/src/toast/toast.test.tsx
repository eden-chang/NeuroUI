import {
  render,
  screen,
  act,
  fireEvent,
  cleanup,
} from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NeuroProvider } from '@neuroui/core';
import type { SensoryProfileOverrides } from '@neuroui/core';
import type React from 'react';

import { ToastProvider } from './toast-context';
import { Toaster } from './toaster';
import { useToast } from './use-toast';

// ── Test Setup ──────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
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
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-neuro');
  document.documentElement.removeAttribute('style');
});

// ── Helper Functions ────────────────────────────────────────────────

function AllProviders({
  children,
  profile = {},
}: {
  children: React.ReactNode;
  profile?: SensoryProfileOverrides;
}) {
  return (
    <NeuroProvider profile={profile}>
      <ToastProvider>{children}</ToastProvider>
    </NeuroProvider>
  );
}

function renderWithProviders(
  profile: SensoryProfileOverrides,
  ui: React.ReactElement,
) {
  return render(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <AllProviders profile={profile}>{children}</AllProviders>
    ),
  });
}

function addToast(testId: string) {
  act(() => {
    fireEvent.click(screen.getByTestId(testId));
    vi.advanceTimersByTime(50);
  });
}

function TestComponent() {
  const { toast, dismiss } = useToast();
  return (
    <div>
      <button
        onClick={() => toast({ title: 'Test toast' })}
        data-testid="add-toast"
      >
        Add Toast
      </button>
      <button
        onClick={() => toast({ title: 'Info toast', variant: 'info' })}
        data-testid="add-info"
      >
        Add Info
      </button>
      <button
        onClick={() => toast({ title: 'Success toast', variant: 'success' })}
        data-testid="add-success"
      >
        Add Success
      </button>
      <button
        onClick={() => toast({ title: 'Warning toast', variant: 'warning' })}
        data-testid="add-warning"
      >
        Add Warning
      </button>
      <button
        onClick={() => toast({ title: 'Error toast', variant: 'error' })}
        data-testid="add-error"
      >
        Add Error
      </button>
      <button
        onClick={() =>
          toast({ title: 'Described toast', description: 'A description' })
        }
        data-testid="add-described"
      >
        Add Described
      </button>
      <button
        onClick={() => {
          const id = toast({ title: 'Dismissible toast' });
          setTimeout(() => { dismiss(id); }, 100);
        }}
        data-testid="add-dismissible"
      >
        Add Dismissible
      </button>
      <Toaster />
    </div>
  );
}

// ── Tests ───────────────────────────────────────────────────────────

describe('Toast System', () => {
  describe('useToast', () => {
    it('throws when used outside ToastProvider', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useToast());
      }).toThrow('useToast must be used within a <ToastProvider>');

      consoleError.mockRestore();
    });

    it('returns toast context when used inside ToastProvider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AllProviders>{children}</AllProviders>
      );
      const { result } = renderHook(() => useToast(), { wrapper });
      expect(result.current).toHaveProperty('toast');
      expect(result.current).toHaveProperty('dismiss');
      expect(result.current).toHaveProperty('toasts');
    });
  });

  describe('toast()', () => {
    it('adds a toast that renders on screen', () => {
      renderWithProviders({}, <TestComponent />);
      addToast('add-toast');

      expect(screen.getByText('Test toast')).toBeInTheDocument();
    });

    it('dismiss() removes a toast', () => {
      renderWithProviders({}, <TestComponent />);
      addToast('add-dismissible');

      expect(screen.getByText('Dismissible toast')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(
        screen.queryByText('Dismissible toast'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Toast Variants', () => {
    it('toast with variant="info" renders with left border accent via CSS variable', () => {
      renderWithProviders({}, <TestComponent />);
      addToast('add-info');

      const toast = screen
        .getByText('Info toast')
        .closest('[data-neuro-component="toast"]') as HTMLElement | null;
      expect(toast).toHaveClass('border-l-4');
      expect(toast?.style.borderLeftColor).toBe('var(--neuro-color-info)');
    });

    it('toast with variant="success" renders with left border accent via CSS variable', () => {
      renderWithProviders({}, <TestComponent />);
      addToast('add-success');

      const toast = screen
        .getByText('Success toast')
        .closest('[data-neuro-component="toast"]') as HTMLElement | null;
      expect(toast).toHaveClass('border-l-4');
      expect(toast?.style.borderLeftColor).toBe('var(--neuro-color-success)');
    });

    it('toast with variant="warning" renders with left border accent via CSS variable', () => {
      renderWithProviders({}, <TestComponent />);
      addToast('add-warning');

      const toast = screen
        .getByText('Warning toast')
        .closest('[data-neuro-component="toast"]') as HTMLElement | null;
      expect(toast).toHaveClass('border-l-4');
      expect(toast?.style.borderLeftColor).toBe('var(--neuro-color-warning)');
    });

    it('toast with variant="error" renders with left border accent via CSS variable', () => {
      renderWithProviders({}, <TestComponent />);
      addToast('add-error');

      const toast = screen
        .getByText('Error toast')
        .closest('[data-neuro-component="toast"]') as HTMLElement | null;
      expect(toast).toHaveClass('border-l-4');
      expect(toast?.style.borderLeftColor).toBe('var(--neuro-color-error)');
    });

    it('info variant shows icon (SVG)', () => {
      renderWithProviders({}, <TestComponent />);
      addToast('add-info');

      const toast = screen
        .getByText('Info toast')
        .closest('[data-neuro-component="toast"]');
      expect(toast?.querySelector('svg')).toBeInTheDocument();
    });

    it('success variant shows icon (SVG)', () => {
      renderWithProviders({}, <TestComponent />);
      addToast('add-success');

      const toast = screen
        .getByText('Success toast')
        .closest('[data-neuro-component="toast"]');
      expect(toast?.querySelector('svg')).toBeInTheDocument();
    });

    it('warning variant shows icon (SVG)', () => {
      renderWithProviders({}, <TestComponent />);
      addToast('add-warning');

      const toast = screen
        .getByText('Warning toast')
        .closest('[data-neuro-component="toast"]');
      expect(toast?.querySelector('svg')).toBeInTheDocument();
    });

    it('error variant shows icon (SVG)', () => {
      renderWithProviders({}, <TestComponent />);
      addToast('add-error');

      const toast = screen
        .getByText('Error toast')
        .closest('[data-neuro-component="toast"]');
      expect(toast?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Toast Description', () => {
    it('toast with description shows description text', () => {
      renderWithProviders({}, <TestComponent />);
      addToast('add-described');

      expect(screen.getByText('Described toast')).toBeInTheDocument();
      expect(screen.getByText('A description')).toBeInTheDocument();
    });

    it('density="minimal" hides description', () => {
      renderWithProviders({ density: 'minimal' }, <TestComponent />);
      addToast('add-described');

      expect(screen.getByText('Described toast')).toBeInTheDocument();
      expect(
        screen.queryByText('A description'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Density Settings', () => {
    it('density="minimal" shows only 1 toast at a time', () => {
      renderWithProviders({ density: 'minimal' }, <TestComponent />);

      addToast('add-info');
      addToast('add-success');
      addToast('add-warning');

      expect(screen.queryByText('Info toast')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Success toast'),
      ).not.toBeInTheDocument();
      expect(screen.getByText('Warning toast')).toBeInTheDocument();
    });

    it('density="normal" shows up to 3 toasts', () => {
      renderWithProviders({ density: 'normal' }, <TestComponent />);

      addToast('add-info');
      addToast('add-success');
      addToast('add-warning');
      addToast('add-error');

      expect(screen.queryByText('Info toast')).not.toBeInTheDocument();
      expect(screen.getByText('Success toast')).toBeInTheDocument();
      expect(screen.getByText('Warning toast')).toBeInTheDocument();
      expect(screen.getByText('Error toast')).toBeInTheDocument();
    });
  });

  describe('Silent Mode', () => {
    it('notifications="silent" suppresses toasts', () => {
      renderWithProviders(
        { notifications: 'silent' },
        <TestComponent />,
      );

      addToast('add-toast');

      expect(screen.queryByText('Test toast')).not.toBeInTheDocument();
    });
  });

  describe('Auto-dismiss', () => {
    it('toast disappears after default timer', () => {
      renderWithProviders({}, <TestComponent />);
      addToast('add-toast');

      expect(screen.getByText('Test toast')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.queryByText('Test toast')).not.toBeInTheDocument();
    });

    it('toast with custom duration disappears after specified time', () => {
      function CustomDurationComponent() {
        const { toast } = useToast();
        return (
          <div>
            <button
              onClick={() =>
                toast({ title: 'Custom duration toast', duration: 2000 })
              }
              data-testid="add-custom"
            >
              Add Custom
            </button>
            <Toaster />
          </div>
        );
      }

      renderWithProviders({}, <CustomDurationComponent />);
      addToast('add-custom');

      expect(
        screen.getByText('Custom duration toast'),
      ).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(
        screen.queryByText('Custom duration toast'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Closable Toast', () => {
    it('shows dismiss button with aria-label', () => {
      renderWithProviders({}, <TestComponent />);
      addToast('add-toast');

      expect(screen.getByLabelText('Dismiss')).toBeInTheDocument();
    });

    it('clicking dismiss button removes toast', () => {
      renderWithProviders({}, <TestComponent />);
      addToast('add-toast');

      expect(screen.getByText('Test toast')).toBeInTheDocument();

      act(() => {
        fireEvent.click(screen.getByLabelText('Dismiss'));
      });

      expect(screen.queryByText('Test toast')).not.toBeInTheDocument();
    });

    it('closable=false does not show dismiss button', () => {
      function NonClosableComponent() {
        const { toast } = useToast();
        return (
          <div>
            <button
              onClick={() =>
                toast({ title: 'Non-closable toast', closable: false })
              }
              data-testid="add-non-closable"
            >
              Add Non-closable
            </button>
            <Toaster />
          </div>
        );
      }

      renderWithProviders({}, <NonClosableComponent />);
      addToast('add-non-closable');

      expect(
        screen.getByText('Non-closable toast'),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText('Dismiss')).not.toBeInTheDocument();
    });
  });

  describe('Toast Action', () => {
    it('renders action button with label', () => {
      function ActionComponent() {
        const { toast } = useToast();
        return (
          <div>
            <button
              onClick={() =>
                toast({
                  title: 'Action toast',
                  action: { label: 'Undo', onClick: () => {} },
                })
              }
              data-testid="add-action"
            >
              Add Action
            </button>
            <Toaster />
          </div>
        );
      }

      renderWithProviders({}, <ActionComponent />);
      addToast('add-action');

      expect(screen.getByText('Action toast')).toBeInTheDocument();
      expect(screen.getByText('Undo')).toBeInTheDocument();
    });

    it('action onClick fires when clicked', () => {
      const onClickMock = vi.fn();

      function ActionComponent() {
        const { toast } = useToast();
        return (
          <div>
            <button
              onClick={() =>
                toast({
                  title: 'Action toast',
                  action: { label: 'Undo', onClick: onClickMock },
                })
              }
              data-testid="add-action"
            >
              Add Action
            </button>
            <Toaster />
          </div>
        );
      }

      renderWithProviders({}, <ActionComponent />);
      addToast('add-action');

      act(() => {
        fireEvent.click(screen.getByText('Undo'));
      });

      expect(onClickMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Timing Profile', () => {
    it('timing="patient" doubles default duration (10s instead of 5s)', () => {
      renderWithProviders({ timing: 'patient' }, <TestComponent />);
      addToast('add-toast');

      expect(screen.getByText('Test toast')).toBeInTheDocument();

      // At 5s (normal duration), toast should still be visible
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.getByText('Test toast')).toBeInTheDocument();

      // At 10s (patient duration), toast should be dismissed
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.queryByText('Test toast')).not.toBeInTheDocument();
    });

    it('timing="quick" shortens default duration (3s instead of 5s)', () => {
      renderWithProviders({ timing: 'quick' }, <TestComponent />);
      addToast('add-toast');

      expect(screen.getByText('Test toast')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(screen.queryByText('Test toast')).not.toBeInTheDocument();
    });

    it('timing="normal" uses 5s default duration', () => {
      renderWithProviders({ timing: 'normal' }, <TestComponent />);
      addToast('add-toast');

      expect(screen.getByText('Test toast')).toBeInTheDocument();

      // At 4.9s, still visible
      act(() => {
        vi.advanceTimersByTime(4900);
      });
      expect(screen.getByText('Test toast')).toBeInTheDocument();

      // At 5s, dismissed
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(screen.queryByText('Test toast')).not.toBeInTheDocument();
    });

    it('custom duration overrides timing profile default', () => {
      function CustomDurationComponent() {
        const { toast } = useToast();
        return (
          <div>
            <button
              onClick={() =>
                toast({ title: 'Custom in patient', duration: 2000 })
              }
              data-testid="add-custom"
            >
              Add Custom
            </button>
            <Toaster />
          </div>
        );
      }

      renderWithProviders({ timing: 'patient' }, <CustomDurationComponent />);
      addToast('add-custom');

      expect(screen.getByText('Custom in patient')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(
        screen.queryByText('Custom in patient'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Motion Settings', () => {
    it('motion="none" does not apply inline transition style (only border color)', () => {
      renderWithProviders({ motion: 'none' }, <TestComponent />);
      addToast('add-toast');

      const toast = screen
        .getByText('Test toast')
        .closest('[data-neuro-component="toast"]');
      const style = toast?.getAttribute('style') ?? '';
      expect(style).not.toContain('transition');
      expect(style).not.toContain('opacity');
      expect(style).not.toContain('transform');
    });

    it('motion="reduced" applies opacity transition', () => {
      renderWithProviders({ motion: 'reduced' }, <TestComponent />);
      addToast('add-toast');

      const toast = screen
        .getByText('Test toast')
        .closest('[data-neuro-component="toast"]');
      const style = toast?.getAttribute('style') ?? '';
      expect(style).toContain('opacity');
    });

    it('motion="full" applies transform transition', () => {
      renderWithProviders({ motion: 'full' }, <TestComponent />);
      addToast('add-toast');

      const toast = screen
        .getByText('Test toast')
        .closest('[data-neuro-component="toast"]');
      const style = toast?.getAttribute('style') ?? '';
      expect(style).toContain('transition');
    });
  });

  describe('Toaster', () => {
    it('throws when used outside ToastProvider', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(
          <NeuroProvider profile={{}}>
            <Toaster />
          </NeuroProvider>,
        );
      }).toThrow('Toaster must be used within a <ToastProvider>');

      consoleError.mockRestore();
    });
  });
});
