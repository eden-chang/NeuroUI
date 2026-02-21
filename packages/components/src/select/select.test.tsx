import type React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NeuroProvider } from '@neuroui/core';
import type { SensoryProfileOverrides } from '@neuroui/core';

import { Select } from './select';

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

describe('Select', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true },
  ];

  describe('basic rendering', () => {
    it('renders with label and options', () => {
      renderWithDefaultProfile(<Select label="Country" options={options} />);

      const select = screen.getByRole('combobox');
      const label = screen.getByText('Country');

      expect(label.tagName).toBe('LABEL');
      expect(select).toBeTruthy();
      expect(screen.getByRole('option', { name: 'Option 1' })).toBeTruthy();
      expect(screen.getByRole('option', { name: 'Option 2' })).toBeTruthy();
      expect(screen.getByRole('option', { name: 'Option 3' })).toBeTruthy();
    });

    it('associates label with select via htmlFor', () => {
      renderWithDefaultProfile(<Select label="Country" options={options} />);

      const select = screen.getByRole('combobox');
      const label = screen.getByText('Country');

      expect(label.getAttribute('for')).toBe(select.id);
    });

    it('has data-neuro-component="select"', () => {
      const { container } = renderWithDefaultProfile(
        <Select label="Country" options={options} />,
      );

      const wrapper = container.querySelector('[data-neuro-component="select"]');
      expect(wrapper).toBeTruthy();
    });

    it('renders placeholder option', () => {
      renderWithDefaultProfile(
        <Select label="Country" options={options} placeholder="Select a country" />,
      );

      expect(screen.getByRole('option', { name: 'Select a country' })).toBeTruthy();
    });

    it('renders chevron icon', () => {
      const { container } = renderWithDefaultProfile(
        <Select label="Country" options={options} />,
      );

      const svg = container.querySelector('svg[viewBox="0 0 20 20"]');
      expect(svg).toBeTruthy();
    });

    it('has CSS variable min-height for touch targets', () => {
      renderWithDefaultProfile(<Select label="Country" options={options} />);

      const select = screen.getByRole('combobox');
      expect(select.className).toContain('min-h-[var(--neuro-min-target-size,44px)]');
    });
  });

  describe('hint text', () => {
    it('shows hint text with aria-describedby', () => {
      renderWithDefaultProfile(
        <Select label="Country" options={options} hint="Choose your country" />,
      );

      const select = screen.getByRole('combobox');
      const hint = screen.getByText('Choose your country');

      expect(hint.id).toMatch(/^:.*:-hint$/);
      expect(select.getAttribute('aria-describedby')).toBe(hint.id);
    });
  });

  describe('error state', () => {
    it('shows error state with aria-invalid', () => {
      renderWithDefaultProfile(
        <Select label="Country" options={options} error="Country is required" />,
      );

      const select = screen.getByRole('combobox');
      expect(select.getAttribute('aria-invalid')).toBe('true');
    });

    it('error message has role="alert"', () => {
      renderWithDefaultProfile(
        <Select label="Country" options={options} error="Country is required" />,
      );

      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain('Country is required');
    });

    it('error connects via aria-describedby', () => {
      renderWithDefaultProfile(
        <Select label="Country" options={options} error="Country is required" />,
      );

      const select = screen.getByRole('combobox');
      const error = screen.getByText('Country is required');

      expect(select.getAttribute('aria-describedby')).toBe(error.id);
    });

    it('renders error icon', () => {
      renderWithDefaultProfile(
        <Select label="Country" options={options} error="Country is required" />,
      );

      const errorContainer = screen.getByText('Country is required').parentElement;
      const svg = errorContainer?.querySelector('svg');

      expect(svg).toBeTruthy();
    });
  });

  describe('focus mode integration', () => {
    it('enhanced focus mode applies ring-[3px] class', () => {
      renderWithProfile({ focus: 'enhanced' }, <Select label="Country" options={options} />);

      const select = screen.getByRole('combobox');
      expect(select.className).toContain('ring-[3px]');
    });

    it('default focus mode applies ring-2 class', () => {
      renderWithDefaultProfile(<Select label="Country" options={options} />);

      const select = screen.getByRole('combobox');
      expect(select.className).toContain('ring-2');
    });
  });

  describe('readability integration', () => {
    it('dyslexia-friendly font applies OpenDyslexic fontFamily', () => {
      renderWithProfile(
        { font: 'dyslexia-friendly' },
        <Select label="Country" options={options} />,
      );

      const select = screen.getByRole('combobox');
      expect(select.style.fontFamily).toContain('OpenDyslexic');
    });

    it('applies readability styles to label', () => {
      renderWithProfile(
        { font: 'dyslexia-friendly' },
        <Select label="Country" options={options} />,
      );

      const label = screen.getByText('Country');
      expect(label.style.fontFamily).toContain('OpenDyslexic');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLSelectElement | null };

      renderWithDefaultProfile(<Select label="Country" options={options} ref={ref} />);

      expect(ref.current).toBeTruthy();
      expect(ref.current?.tagName).toBe('SELECT');
    });
  });

  describe('disabled options', () => {
    it('renders disabled options', () => {
      renderWithDefaultProfile(<Select label="Country" options={options} />);

      const option3 = screen.getByRole('option', { name: 'Option 3' }) as HTMLOptionElement;
      expect(option3.disabled).toBe(true);
    });
  });
});
