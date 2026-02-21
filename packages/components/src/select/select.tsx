import { forwardRef, useId, type SelectHTMLAttributes, type ReactNode } from 'react';
import { useFocusMode, useReadability } from '@neuroui/core';
import { cn } from '../utils/cn';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string;
  hint?: string;
  error?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  icon?: ReactNode;
}

// ErrorIcon (same SVG as Input component)
function ErrorIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" style={{ color: 'var(--neuro-color-error)' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
  );
}

// ChevronIcon for dropdown indicator
function ChevronIcon() {
  return (
    <svg className="h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, hint, error, options, placeholder, icon, className, ...rest }, ref) {
    const id = useId();
    const { isFocusMode } = useFocusMode();
    const { fontFamily, lineHeight, letterSpacing, wordSpacing, fontVariantLigatures } = useReadability();

    const selectId = `${id}-select`;
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

    const readabilityStyle = { fontFamily, lineHeight, letterSpacing, wordSpacing, fontVariantLigatures };

    const focusClass = isFocusMode
      ? 'focus-visible:ring-[3px] focus-visible:ring-offset-[3px] focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300'
      : 'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300';

    const borderStyle = error ? { borderColor: 'var(--neuro-color-error)' } : {};

    return (
      <div className="flex flex-col gap-1.5" data-neuro-component="select">
        <label htmlFor={selectId} className="text-sm font-medium text-slate-950 dark:text-slate-50" style={readabilityStyle}>
          {label}
        </label>
        {hint && <p id={hintId} className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">{icon}</span>
          )}
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              'w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm appearance-none shadow-xs transition-[color,border-color,box-shadow]',
              'min-h-[var(--neuro-min-target-size,44px)]',
              'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50',
              'focus-visible:outline-none',
              focusClass,
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'pr-10',
              icon ? 'pl-10' : undefined,
              'forced-colors:border-[ButtonBorder]',
              className,
            )}
            style={{ ...readabilityStyle, ...borderStyle }}
            {...rest}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2"><ChevronIcon /></span>
        </div>
        {error && (
          <p id={errorId} role="alert" className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--neuro-color-error)' }}>
            <ErrorIcon />{error}
          </p>
        )}
      </div>
    );
  },
);
