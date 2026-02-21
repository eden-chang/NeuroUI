import type React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NeuroProvider } from '@neuroui/core';
import type { SensoryProfileOverrides } from '@neuroui/core';

import { Checkbox } from './checkbox';

// matchMedia mock
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

// Test helpers
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

function renderWithDefaultProfile(ui: React.ReactElement) {
  return renderWithProfile({}, ui);
}

describe('Checkbox', () => {
  describe('basic rendering', () => {
    it('renders with label', () => {
      renderWithDefaultProfile(<Checkbox label="Accept terms" />);

      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Accept terms');

      expect(checkbox).toBeTruthy();
      expect(label).toBeTruthy();
    });

    it('associates label with checkbox', () => {
      renderWithDefaultProfile(<Checkbox label="Accept terms" />);

      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Accept terms').closest('label');

      expect(label?.getAttribute('for')).toBe(checkbox.id);
    });

    it('has data-neuro-component="checkbox"', () => {
      const { container } = renderWithDefaultProfile(<Checkbox label="Accept terms" />);

      const wrapper = container.querySelector('[data-neuro-component="checkbox"]');
      expect(wrapper).toBeTruthy();
    });

    it('has min-height for touch targets', () => {
      const { container } = renderWithDefaultProfile(<Checkbox label="Accept terms" />);

      const label = container.querySelector('label');
      expect(label?.className).toContain('min-h-[var(--neuro-min-target-size,44px)]');
    });

    it('renders as checkbox type', () => {
      renderWithDefaultProfile(<Checkbox label="Accept terms" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox.getAttribute('type')).toBe('checkbox');
    });
  });

  describe('error state', () => {
    it('shows error state with aria-invalid', () => {
      renderWithDefaultProfile(
        <Checkbox label="Accept terms" error="You must accept the terms" />,
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox.getAttribute('aria-invalid')).toBe('true');
    });

    it('error message has role="alert"', () => {
      renderWithDefaultProfile(
        <Checkbox label="Accept terms" error="You must accept the terms" />,
      );

      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain('You must accept the terms');
    });

    it('error connects via aria-describedby', () => {
      renderWithDefaultProfile(
        <Checkbox label="Accept terms" error="You must accept the terms" />,
      );

      const checkbox = screen.getByRole('checkbox');
      const error = screen.getByText('You must accept the terms');

      expect(checkbox.getAttribute('aria-describedby')).toBe(error.id);
    });

    it('renders error icon', () => {
      renderWithDefaultProfile(
        <Checkbox label="Accept terms" error="You must accept the terms" />,
      );

      const errorContainer = screen.getByText('You must accept the terms').parentElement;
      const svg = errorContainer?.querySelector('svg');

      expect(svg).toBeTruthy();
    });
  });

  describe('indeterminate state', () => {
    it('sets indeterminate property on input', () => {
      renderWithDefaultProfile(<Checkbox label="Select all" indeterminate />);

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(true);
    });
  });

  describe('focus mode integration', () => {
    it('enhanced focus mode applies ring-[3px] class', () => {
      const { container } = renderWithProfile(
        { focus: 'enhanced' },
        <Checkbox label="Accept terms" />,
      );

      const visualBox = container.querySelector('.peer-focus-visible\\:ring-\\[3px\\]');
      expect(visualBox).toBeTruthy();
    });

    it('default focus mode applies ring-2 class', () => {
      const { container } = renderWithDefaultProfile(<Checkbox label="Accept terms" />);

      const visualBox = container.querySelector('.peer-focus-visible\\:ring-2');
      expect(visualBox).toBeTruthy();
    });
  });

  describe('readability integration', () => {
    it('dyslexia-friendly font applies OpenDyslexic fontFamily', () => {
      renderWithProfile(
        { font: 'dyslexia-friendly' },
        <Checkbox label="Accept terms" />,
      );

      const label = screen.getByText('Accept terms');
      expect(label.style.fontFamily).toContain('OpenDyslexic');
    });

    it('applies readability styles to label text', () => {
      renderWithProfile(
        { font: 'dyslexia-friendly' },
        <Checkbox label="Accept terms" />,
      );

      const label = screen.getByText('Accept terms');
      expect(label.style.lineHeight).toBe('1.8');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLInputElement | null };

      renderWithDefaultProfile(<Checkbox label="Accept terms" ref={ref} />);

      expect(ref.current).toBeTruthy();
      expect(ref.current?.tagName).toBe('INPUT');
      expect(ref.current?.type).toBe('checkbox');
    });

    it('ref forwarding works with indeterminate', () => {
      const ref = { current: null as HTMLInputElement | null };

      renderWithDefaultProfile(<Checkbox label="Select all" indeterminate ref={ref} />);

      expect(ref.current).toBeTruthy();
      expect(ref.current?.indeterminate).toBe(true);
    });
  });

  describe('additional props', () => {
    it('passes through disabled prop', () => {
      renderWithDefaultProfile(<Checkbox label="Accept terms" disabled />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveProperty('disabled', true);
    });

    it('passes through checked prop', () => {
      renderWithDefaultProfile(<Checkbox label="Accept terms" checked onChange={() => {}} />);

      const checkbox = screen.getByRole('checkbox');
      expect((checkbox as HTMLInputElement).checked).toBe(true);
    });
  });
});
