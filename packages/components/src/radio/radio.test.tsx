import type React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NeuroProvider } from '@neuroui/core';
import type { SensoryProfileOverrides } from '@neuroui/core';

import { Radio, RadioGroup } from './radio';

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

describe('RadioGroup', () => {
  describe('basic rendering', () => {
    it('renders with label as legend', () => {
      renderWithDefaultProfile(
        <RadioGroup name="size" label="Choose size">
          <Radio label="Small" value="small" />
          <Radio label="Medium" value="medium" />
        </RadioGroup>,
      );

      const legend = screen.getByText('Choose size');
      expect(legend.tagName).toBe('LEGEND');
    });

    it('has data-neuro-component="radio-group"', () => {
      const { container } = renderWithDefaultProfile(
        <RadioGroup name="size" label="Choose size">
          <Radio label="Small" value="small" />
        </RadioGroup>,
      );

      const wrapper = container.querySelector('[data-neuro-component="radio-group"]');
      expect(wrapper).toBeTruthy();
    });

    it('renders with role="radiogroup"', () => {
      renderWithDefaultProfile(
        <RadioGroup name="size" label="Choose size">
          <Radio label="Small" value="small" />
        </RadioGroup>,
      );

      expect(screen.getByRole('radiogroup')).toBeTruthy();
    });
  });

  describe('error state', () => {
    it('error state shows on RadioGroup', () => {
      renderWithDefaultProfile(
        <RadioGroup name="size" label="Choose size" error="Size is required">
          <Radio label="Small" value="small" />
        </RadioGroup>,
      );

      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain('Size is required');
    });

    it('aria-describedby links error', () => {
      renderWithDefaultProfile(
        <RadioGroup name="size" label="Choose size" error="Size is required">
          <Radio label="Small" value="small" />
        </RadioGroup>,
      );

      const fieldset = screen.getByRole('radiogroup').parentElement;
      const error = screen.getByText('Size is required');

      expect(fieldset?.getAttribute('aria-describedby')).toBe(error.id);
    });
  });
});

describe('Radio', () => {
  describe('basic rendering', () => {
    it('renders with label', () => {
      renderWithDefaultProfile(
        <RadioGroup name="size" label="Choose size">
          <Radio label="Small" value="small" />
          <Radio label="Medium" value="medium" />
        </RadioGroup>,
      );

      expect(screen.getByLabelText('Small')).toBeTruthy();
      expect(screen.getByLabelText('Medium')).toBeTruthy();
    });

    it('has data-neuro-component="radio"', () => {
      const { container } = renderWithDefaultProfile(
        <RadioGroup name="size" label="Choose size">
          <Radio label="Small" value="small" />
        </RadioGroup>,
      );

      const wrapper = container.querySelector('[data-neuro-component="radio"]');
      expect(wrapper).toBeTruthy();
    });

    it('has min-height for touch targets', () => {
      const { container } = renderWithDefaultProfile(
        <RadioGroup name="size" label="Choose size">
          <Radio label="Small" value="small" />
        </RadioGroup>,
      );

      const label = container.querySelector('[data-neuro-component="radio"]');
      expect(label?.className).toContain('min-h-[var(--neuro-min-target-size,44px)]');
    });

    it('renders as radio type', () => {
      renderWithDefaultProfile(
        <RadioGroup name="size" label="Choose size">
          <Radio label="Small" value="small" />
        </RadioGroup>,
      );

      const radio = screen.getByLabelText('Small');
      expect(radio.getAttribute('type')).toBe('radio');
    });
  });

  describe('checked state', () => {
    it('checked state is controlled by RadioGroup value', () => {
      renderWithDefaultProfile(
        <RadioGroup name="size" label="Choose size" value="medium">
          <Radio label="Small" value="small" />
          <Radio label="Medium" value="medium" />
        </RadioGroup>,
      );

      const smallRadio = screen.getByLabelText('Small') as HTMLInputElement;
      const mediumRadio = screen.getByLabelText('Medium') as HTMLInputElement;

      expect(smallRadio.checked).toBe(false);
      expect(mediumRadio.checked).toBe(true);
    });

    it('all radios share the same name', () => {
      renderWithDefaultProfile(
        <RadioGroup name="size" label="Choose size">
          <Radio label="Small" value="small" />
          <Radio label="Medium" value="medium" />
          <Radio label="Large" value="large" />
        </RadioGroup>,
      );

      const smallRadio = screen.getByLabelText('Small');
      const mediumRadio = screen.getByLabelText('Medium');
      const largeRadio = screen.getByLabelText('Large');

      expect(smallRadio.getAttribute('name')).toBe('size');
      expect(mediumRadio.getAttribute('name')).toBe('size');
      expect(largeRadio.getAttribute('name')).toBe('size');
    });
  });

  describe('focus mode integration', () => {
    it('enhanced focus mode applies ring-[3px] class', () => {
      const { container } = renderWithProfile(
        { focus: 'enhanced' },
        <RadioGroup name="size" label="Choose size">
          <Radio label="Small" value="small" />
        </RadioGroup>,
      );

      const visualBox = container.querySelector('.peer-focus-visible\\:ring-\\[3px\\]');
      expect(visualBox).toBeTruthy();
    });

    it('default focus mode applies ring-2 class', () => {
      const { container } = renderWithDefaultProfile(
        <RadioGroup name="size" label="Choose size">
          <Radio label="Small" value="small" />
        </RadioGroup>,
      );

      const visualBox = container.querySelector('.peer-focus-visible\\:ring-2');
      expect(visualBox).toBeTruthy();
    });
  });

  describe('readability integration', () => {
    it('dyslexia-friendly font applies OpenDyslexic fontFamily', () => {
      renderWithProfile(
        { font: 'dyslexia-friendly' },
        <RadioGroup name="size" label="Choose size">
          <Radio label="Small" value="small" />
        </RadioGroup>,
      );

      const label = screen.getByText('Small');
      expect(label.style.fontFamily).toContain('OpenDyslexic');
    });

    it('applies readability styles to label text', () => {
      renderWithProfile(
        { font: 'dyslexia-friendly' },
        <RadioGroup name="size" label="Choose size">
          <Radio label="Small" value="small" />
        </RadioGroup>,
      );

      const label = screen.getByText('Small');
      expect(label.style.lineHeight).toBe('1.8');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLInputElement | null };

      renderWithDefaultProfile(
        <RadioGroup name="size" label="Choose size">
          <Radio label="Small" value="small" ref={ref} />
        </RadioGroup>,
      );

      expect(ref.current).toBeTruthy();
      expect(ref.current?.tagName).toBe('INPUT');
      expect(ref.current?.type).toBe('radio');
    });
  });

  describe('spacing integration', () => {
    it('applies spacing based on profile for vertical orientation', () => {
      const { container } = renderWithProfile(
        { spacing: 'relaxed' },
        <RadioGroup name="size" label="Choose size" orientation="vertical">
          <Radio label="Small" value="small" />
          <Radio label="Medium" value="medium" />
        </RadioGroup>,
      );

      const radiogroup = container.querySelector('[role="radiogroup"]');
      expect(radiogroup?.className).toContain('gap-4');
    });

    it('applies spacing based on profile for horizontal orientation', () => {
      const { container } = renderWithProfile(
        { spacing: 'relaxed' },
        <RadioGroup name="size" label="Choose size" orientation="horizontal">
          <Radio label="Small" value="small" />
          <Radio label="Medium" value="medium" />
        </RadioGroup>,
      );

      const radiogroup = container.querySelector('[role="radiogroup"]');
      expect(radiogroup?.className).toContain('gap-6');
    });
  });
});
