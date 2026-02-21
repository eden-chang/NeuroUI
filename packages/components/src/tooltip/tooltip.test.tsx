import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type React from 'react';
import { NeuroProvider, type SensoryProfileOverrides } from '@neuroui/core';

import { Tooltip } from './tooltip';

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
  vi.useFakeTimers();
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-neuro');
  document.documentElement.removeAttribute('style');
  vi.useRealTimers();
});

// ── Tests ───────────────────────────────────────────────────────────

describe('Tooltip', () => {
  it('renders children and has correct data attribute', () => {
    renderWithProfile(
      {},
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button', { name: 'Hover me' });
    expect(button).toBeInTheDocument();

    const wrapper = button.parentElement?.parentElement;
    expect(wrapper).toHaveAttribute('data-neuro-component', 'tooltip');
  });

  it('does not show tooltip initially', () => {
    renderWithProfile(
      {},
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
  });

  it('shows tooltip on mouse enter after delay', () => {
    renderWithProfile(
      {},
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button', { name: 'Hover me' });
    fireEvent.mouseEnter(button.parentElement?.parentElement!);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
  });

  it('hides tooltip on mouse leave', () => {
    renderWithProfile(
      {},
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );

    const wrapper = screen.getByRole('button', { name: 'Hover me' }).parentElement
      ?.parentElement!;

    fireEvent.mouseEnter(wrapper);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.mouseLeave(wrapper);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus after delay', () => {
    renderWithProfile(
      {},
      <Tooltip content="Tooltip text">
        <button>Focus me</button>
      </Tooltip>,
    );

    const wrapper = screen.getByRole('button', { name: 'Focus me' }).parentElement
      ?.parentElement!;

    fireEvent.focus(wrapper);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('hides tooltip on blur', () => {
    renderWithProfile(
      {},
      <Tooltip content="Tooltip text">
        <button>Focus me</button>
      </Tooltip>,
    );

    const wrapper = screen.getByRole('button', { name: 'Focus me' }).parentElement
      ?.parentElement!;

    fireEvent.focus(wrapper);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.blur(wrapper);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('has aria-describedby when tooltip is visible', () => {
    renderWithProfile(
      {},
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );

    const wrapper = screen.getByRole('button', { name: 'Hover me' }).parentElement
      ?.parentElement!;
    const childWrapper = screen.getByRole('button', { name: 'Hover me' })
      .parentElement!;

    expect(childWrapper).not.toHaveAttribute('aria-describedby');

    fireEvent.mouseEnter(wrapper);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    const tooltip = screen.getByRole('tooltip');
    const tooltipId = tooltip.id;

    expect(childWrapper).toHaveAttribute('aria-describedby', tooltipId);
  });

  describe('timing preferences', () => {
    it('uses 200ms delay for default timing', () => {
      renderWithProfile(
        {},
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>,
      );

      const wrapper = screen.getByRole('button', { name: 'Hover me' })
        .parentElement?.parentElement!;

      fireEvent.mouseEnter(wrapper);

      act(() => {
        vi.advanceTimersByTime(199);
      });

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1);
      });

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('uses 500ms delay for patient timing', () => {
      renderWithProfile(
        { timing: 'patient' },
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>,
      );

      const wrapper = screen.getByRole('button', { name: 'Hover me' })
        .parentElement?.parentElement!;

      fireEvent.mouseEnter(wrapper);

      act(() => {
        vi.advanceTimersByTime(499);
      });

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1);
      });

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('uses 100ms delay for quick timing', () => {
      renderWithProfile(
        { timing: 'quick' },
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>,
      );

      const wrapper = screen.getByRole('button', { name: 'Hover me' })
        .parentElement?.parentElement!;

      fireEvent.mouseEnter(wrapper);

      act(() => {
        vi.advanceTimersByTime(99);
      });

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1);
      });

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  describe('cognitive load', () => {
    it('disables tooltip when density is minimal', () => {
      renderWithProfile(
        { density: 'minimal' },
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>,
      );

      const button = screen.getByRole('button', { name: 'Hover me' });

      fireEvent.mouseEnter(button);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('shows tooltip when density is standard', () => {
      renderWithProfile(
        { density: 'normal' },
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>,
      );

      const wrapper = screen.getByRole('button', { name: 'Hover me' })
        .parentElement?.parentElement!;

      fireEvent.mouseEnter(wrapper);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('does not crash when density switches from minimal to normal', () => {
      const { rerender } = render(
        <NeuroProvider profile={{ density: 'minimal' }}>
          <Tooltip content="Tooltip text">
            <button>Hover me</button>
          </Tooltip>
        </NeuroProvider>,
      );

      expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      // Switch density to normal — should not crash (hooks must be consistent)
      rerender(
        <NeuroProvider profile={{ density: 'normal' }}>
          <Tooltip content="Tooltip text">
            <button>Hover me</button>
          </Tooltip>
        </NeuroProvider>,
      );

      const wrapper = screen.getByRole('button', { name: 'Hover me' })
        .parentElement?.parentElement!;

      fireEvent.mouseEnter(wrapper);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  describe('position', () => {
    it('applies top position classes', () => {
      renderWithProfile(
        {},
        <Tooltip content="Tooltip text" position="top">
          <button>Hover me</button>
        </Tooltip>,
      );

      const wrapper = screen.getByRole('button', { name: 'Hover me' })
        .parentElement?.parentElement!;

      fireEvent.mouseEnter(wrapper);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip.className).toContain('bottom-full');
      expect(tooltip.className).toContain('mb-2');
    });

    it('applies bottom position classes', () => {
      renderWithProfile(
        {},
        <Tooltip content="Tooltip text" position="bottom">
          <button>Hover me</button>
        </Tooltip>,
      );

      const wrapper = screen.getByRole('button', { name: 'Hover me' })
        .parentElement?.parentElement!;

      fireEvent.mouseEnter(wrapper);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip.className).toContain('top-full');
      expect(tooltip.className).toContain('mt-2');
    });

    it('applies left position classes', () => {
      renderWithProfile(
        {},
        <Tooltip content="Tooltip text" position="left">
          <button>Hover me</button>
        </Tooltip>,
      );

      const wrapper = screen.getByRole('button', { name: 'Hover me' })
        .parentElement?.parentElement!;

      fireEvent.mouseEnter(wrapper);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip.className).toContain('right-full');
      expect(tooltip.className).toContain('mr-2');
    });

    it('applies right position classes', () => {
      renderWithProfile(
        {},
        <Tooltip content="Tooltip text" position="right">
          <button>Hover me</button>
        </Tooltip>,
      );

      const wrapper = screen.getByRole('button', { name: 'Hover me' })
        .parentElement?.parentElement!;

      fireEvent.mouseEnter(wrapper);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip.className).toContain('left-full');
      expect(tooltip.className).toContain('ml-2');
    });
  });

  it('applies custom className to tooltip', () => {
    renderWithProfile(
      {},
      <Tooltip content="Tooltip text" className="custom-tooltip">
        <button>Hover me</button>
      </Tooltip>,
    );

    const wrapper = screen.getByRole('button', { name: 'Hover me' }).parentElement
      ?.parentElement!;

    fireEvent.mouseEnter(wrapper);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.className).toContain('custom-tooltip');
  });

  it('cancels show timeout when hiding before delay completes', () => {
    renderWithProfile(
      {},
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );

    const wrapper = screen.getByRole('button', { name: 'Hover me' }).parentElement
      ?.parentElement!;

    fireEvent.mouseEnter(wrapper);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    fireEvent.mouseLeave(wrapper);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
