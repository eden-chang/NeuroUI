import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { useFocusMode, useReadability } from '@neuroui/core';

import { cn } from '../utils/cn';

// ── Types ───────────────────────────────────────────────────────────

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  /** Label text — required for accessibility. */
  label: string;
  /** Hint text displayed below the label. */
  hint?: string;
  /** Error message — triggers error state with icon. */
  error?: string;
  /** Success message — triggers success state with icon. */
  success?: string;
  /** Optional icon rendered inside the input. */
  icon?: ReactNode;
}

// ── Icons ───────────────────────────────────────────────────────────

function ErrorIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      style={{ color: 'var(--neuro-color-error)' }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      style={{ color: 'var(--neuro-color-success)' }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ── Component ───────────────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { label, hint, error, success, icon, className, ...rest },
    ref,
  ) {
    const id = useId();
    const { isFocusMode } = useFocusMode();
    const { fontFamily, lineHeight, letterSpacing, wordSpacing, fontVariantLigatures } = useReadability();

    const inputId = `${id}-input`;
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const successId = success ? `${id}-success` : undefined;

    const describedBy = [hintId, errorId, successId]
      .filter(Boolean)
      .join(' ') || undefined;

    const readabilityStyle = {
      fontFamily,
      lineHeight,
      letterSpacing,
      wordSpacing,
      fontVariantLigatures,
    };

    const focusClass = isFocusMode
      ? 'focus-visible:ring-[3px] focus-visible:ring-offset-[3px] focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300'
      : 'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300';

    const borderClass = 'border-slate-200 dark:border-slate-700';

    const inputStyle = {
      ...readabilityStyle,
      ...(error ? { borderColor: 'var(--neuro-color-error)' } : {}),
      ...(success && !error ? { borderColor: 'var(--neuro-color-success)' } : {}),
    };

    return (
      <div
        className="flex flex-col gap-1.5"
        data-neuro-component="input"
      >
        {/* Label */}
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-950 dark:text-slate-50"
          style={readabilityStyle}
        >
          {label}
        </label>

        {/* Hint */}
        {hint && (
          <p id={hintId} className="text-sm text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              'w-full h-10 rounded-md border px-3 py-2 text-sm shadow-xs transition-[color,border-color,box-shadow]',
              'min-h-[var(--neuro-min-target-size,44px)]',
              'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50',
              'placeholder:text-slate-400 dark:placeholder:text-slate-500',
              'focus-visible:outline-none',
              borderClass,
              focusClass,
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'forced-colors:border-[ButtonBorder]',
              icon ? 'pl-10' : undefined,
              className,
            )}
            style={inputStyle}
            {...rest}
          />
        </div>

        {/* Error */}
        {error && (
          <p
            id={errorId}
            role="alert"
            className="flex items-center gap-1.5 text-sm"
            style={{ color: 'var(--neuro-color-error)' }}
          >
            <ErrorIcon />
            {error}
          </p>
        )}

        {/* Success */}
        {success && !error && (
          <p
            id={successId}
            role="status"
            className="flex items-center gap-1.5 text-sm"
            style={{ color: 'var(--neuro-color-success)' }}
          >
            <SuccessIcon />
            {success}
          </p>
        )}
      </div>
    );
  },
);
