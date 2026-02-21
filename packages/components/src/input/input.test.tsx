import type React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NeuroProvider } from '@neuroui/core';
import type { SensoryProfileOverrides } from '@neuroui/core';

import { Input } from './input';

// ── matchMedia mock ─────────────────────────────────────────────────

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

// ── Test helpers ────────────────────────────────────────────────────

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

// ── Tests ───────────────────────────────────────────────────────────

describe('Input', () => {
  describe('basic rendering', () => {
    it('renders label and associates it with input', () => {
      renderWithDefaultProfile(<Input label="Email" />);

      const input = screen.getByRole('textbox');
      const label = screen.getByText('Email');

      expect(label.tagName).toBe('LABEL');
      expect(label.getAttribute('for')).toBe(input.id);
    });

    it('renders with data-neuro-component="input"', () => {
      const { container } = renderWithDefaultProfile(<Input label="Email" />);

      const wrapper = container.querySelector('[data-neuro-component="input"]');
      expect(wrapper).toBeTruthy();
    });

    it('renders hint text with correct id', () => {
      renderWithDefaultProfile(
        <Input label="Email" hint="Enter your email address" />,
      );

      const hint = screen.getByText('Enter your email address');
      expect(hint.id).toMatch(/^:.*:-hint$/);
    });

    it('renders icon when provided', () => {
      const icon = (
        <svg data-testid="test-icon">
          <path />
        </svg>
      );

      renderWithDefaultProfile(<Input label="Search" icon={icon} />);

      expect(screen.getByTestId('test-icon')).toBeTruthy();
    });

    it('has CSS variable minimum height for touch targets', () => {
      renderWithDefaultProfile(<Input label="Email" />);

      const input = screen.getByRole('textbox');
      expect(input.className).toContain('min-h-[var(--neuro-min-target-size,44px)]');
    });

    it('has h-10 for shadcn/ui sizing', () => {
      renderWithDefaultProfile(<Input label="Email" />);

      const input = screen.getByRole('textbox');
      expect(input.className).toContain('h-10');
      expect(input.className).toContain('text-sm');
    });
  });

  describe('error state', () => {
    it('shows error message', () => {
      renderWithDefaultProfile(
        <Input label="Email" error="Email is required" />,
      );

      expect(screen.getByText('Email is required')).toBeTruthy();
    });

    it('renders error icon (svg)', () => {
      renderWithDefaultProfile(
        <Input label="Email" error="Email is required" />,
      );

      const errorContainer = screen.getByText('Email is required').parentElement;
      const svg = errorContainer?.querySelector('svg');

      expect(svg).toBeTruthy();
      expect(svg?.getAttribute('viewBox')).toBe('0 0 20 20');
    });

    it('error message has role="alert"', () => {
      renderWithDefaultProfile(
        <Input label="Email" error="Email is required" />,
      );

      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain('Email is required');
    });

    it('input has aria-invalid="true" when error is present', () => {
      renderWithDefaultProfile(
        <Input label="Email" error="Email is required" />,
      );

      const input = screen.getByRole('textbox');
      expect(input.getAttribute('aria-invalid')).toBe('true');
    });
  });

  describe('success state', () => {
    it('shows success message', () => {
      renderWithDefaultProfile(
        <Input label="Email" success="Email is valid" />,
      );

      expect(screen.getByText('Email is valid')).toBeTruthy();
    });

    it('renders success icon (svg)', () => {
      renderWithDefaultProfile(
        <Input label="Email" success="Email is valid" />,
      );

      const successContainer = screen.getByText('Email is valid')
        .parentElement;
      const svg = successContainer?.querySelector('svg');

      expect(svg).toBeTruthy();
      expect(svg?.getAttribute('viewBox')).toBe('0 0 20 20');
    });

    it('success message has role="status"', () => {
      renderWithDefaultProfile(
        <Input label="Email" success="Email is valid" />,
      );

      const status = screen.getByRole('status');
      expect(status.textContent).toContain('Email is valid');
    });
  });

  describe('error and success priority', () => {
    it('error takes priority over success when both provided', () => {
      renderWithDefaultProfile(
        <Input
          label="Email"
          error="Email is required"
          success="Email is valid"
        />,
      );

      expect(screen.getByText('Email is required')).toBeTruthy();
      expect(screen.queryByText('Email is valid')).toBeNull();
      expect(screen.getByRole('alert')).toBeTruthy();
      expect(screen.queryByRole('status')).toBeNull();
    });
  });

  describe('aria-describedby', () => {
    it('connects to hint id', () => {
      renderWithDefaultProfile(
        <Input label="Email" hint="Enter your email address" />,
      );

      const input = screen.getByRole('textbox');
      const hint = screen.getByText('Enter your email address');

      expect(input.getAttribute('aria-describedby')).toBe(hint.id);
    });

    it('connects to error id', () => {
      renderWithDefaultProfile(
        <Input label="Email" error="Email is required" />,
      );

      const input = screen.getByRole('textbox');
      const error = screen.getByText('Email is required');

      expect(input.getAttribute('aria-describedby')).toBe(error.id);
    });

    it('connects to success id', () => {
      renderWithDefaultProfile(
        <Input label="Email" success="Email is valid" />,
      );

      const input = screen.getByRole('textbox');
      const success = screen.getByText('Email is valid');

      expect(input.getAttribute('aria-describedby')).toBe(success.id);
    });

    it('connects to multiple ids (hint and error)', () => {
      renderWithDefaultProfile(
        <Input
          label="Email"
          hint="Enter your email address"
          error="Email is required"
        />,
      );

      const input = screen.getByRole('textbox');
      const hint = screen.getByText('Enter your email address');
      const error = screen.getByText('Email is required');

      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toContain(hint.id);
      expect(describedBy).toContain(error.id);
    });
  });

  describe('focus mode integration', () => {
    it('enhanced focus mode applies ring-[3px] class', () => {
      renderWithProfile({ focus: 'enhanced' }, <Input label="Email" />);

      const input = screen.getByRole('textbox');
      expect(input.className).toContain('ring-[3px]');
    });

    it('default focus mode applies ring-2 class', () => {
      renderWithDefaultProfile(<Input label="Email" />);

      const input = screen.getByRole('textbox');
      expect(input.className).toContain('ring-2');
    });
  });

  describe('readability integration', () => {
    it('dyslexia-friendly font applies OpenDyslexic fontFamily', () => {
      renderWithProfile(
        { font: 'dyslexia-friendly' },
        <Input label="Email" />,
      );

      const input = screen.getByRole('textbox');
      expect(input.style.fontFamily).toContain('OpenDyslexic');
    });

    it('dyslexia-friendly font applies lineHeight 1.8', () => {
      renderWithProfile({ font: 'dyslexia-friendly' }, <Input label="Email" />);

      const input = screen.getByRole('textbox');
      expect(input.style.lineHeight).toBe('1.8');
    });

    it('applies readability styles to label', () => {
      renderWithProfile(
        { font: 'dyslexia-friendly', spacing: 'relaxed' },
        <Input label="Email" />,
      );

      const label = screen.getByText('Email');
      expect(label.style.fontFamily).toContain('OpenDyslexic');
      expect(label.style.lineHeight).toBe('1.8');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLInputElement | null };

      renderWithDefaultProfile(<Input label="Email" ref={ref} />);

      expect(ref.current).toBeTruthy();
      expect(ref.current?.tagName).toBe('INPUT');
    });
  });

  describe('additional props', () => {
    it('passes through placeholder prop', () => {
      renderWithDefaultProfile(
        <Input label="Email" placeholder="you@example.com" />,
      );

      const input = screen.getByPlaceholderText('you@example.com');
      expect(input).toBeTruthy();
    });

    it('passes through type prop', () => {
      renderWithDefaultProfile(<Input label="Password" type="password" />);

      const input = screen.getByLabelText('Password');
      expect(input.getAttribute('type')).toBe('password');
    });

    it('passes through disabled prop', () => {
      renderWithDefaultProfile(<Input label="Email" disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveProperty('disabled', true);
    });

    it('passes through className prop', () => {
      renderWithDefaultProfile(
        <Input label="Email" className="custom-class" />,
      );

      const input = screen.getByRole('textbox');
      expect(input.className).toContain('custom-class');
    });

    it('passes through value prop', () => {
      renderWithDefaultProfile(<Input label="Email" value="test@example.com" onChange={() => {}} />);

      const input = screen.getByRole('textbox');
      expect((input as HTMLInputElement).value).toBe('test@example.com');
    });
  });
});
