import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { useFocusMode, useFlashSafety, useMotionSafety } from '@neuroui/core';

import { cn } from '../utils/cn';

// ── Types ───────────────────────────────────────────────────────────

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

// ── Variant classes ─────────────────────────────────────────────────

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 border border-transparent',
  secondary:
    'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700 border border-transparent',
  outline:
    'bg-transparent text-slate-900 hover:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700',
  ghost:
    'bg-transparent text-slate-900 hover:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-800 border border-transparent shadow-none',
  danger:
    'text-white border border-transparent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 py-2 text-sm',
  lg: 'h-11 px-8 text-sm',
};

// ── Warning icon (for danger variant — never color alone) ──────────

function WarningIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ── Spinner (animated) ──────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ── Static loading indicator (for flash safety) ─────────────────────

function StaticDots() {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-40" />
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
    </span>
  );
}

// ── Component ───────────────────────────────────────────────────────

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      disabled,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) {
    const { motionLevel } = useMotionSafety();
    const { isFocusMode } = useFocusMode();
    const { isFlashSafe } = useFlashSafety();

    const motionClass =
      isFlashSafe || motionLevel === 'none'
        ? 'transition-none'
        : motionLevel === 'reduced'
          ? 'transition-colors duration-150'
          : 'transition-colors duration-200';

    const focusClass = isFocusMode
      ? 'focus-visible:ring-[3px] focus-visible:ring-offset-[3px] focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300'
      : 'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300';

    const isDisabled = disabled || loading;

    const dangerStyle = variant === 'danger'
      ? { backgroundColor: 'var(--neuro-color-error)', ...style }
      : style;

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        aria-label={loading ? 'Loading' : undefined}
        aria-busy={loading || undefined}
        data-neuro-component="button"
        className={cn(
          // Base
          'inline-flex items-center justify-center gap-2 rounded-md font-medium shadow-xs',
          'min-h-[var(--neuro-min-target-size)] min-w-[var(--neuro-min-target-size)]',
          'focus-visible:outline-none',
          // Variant + Size
          variantClasses[variant],
          sizeClasses[size],
          // Motion
          motionClass,
          // Focus
          focusClass,
          // Disabled
          isDisabled && 'opacity-50 pointer-events-none',
          // Forced colors
          'forced-colors:border-[ButtonBorder]',
          // User
          className,
        )}
        style={dangerStyle}
        {...rest}
      >
        {loading
          ? (isFlashSafe ? <StaticDots /> : <Spinner />)
          : (variant === 'danger' && !icon ? <WarningIcon /> : icon)}
        {children}
      </button>
    );
  },
);
