import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { useFocusMode, useReadability } from '@neuroui/core';
import { cn } from '../utils/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  label: string;
  error?: string;
  indeterminate?: boolean;
}

function CheckIcon() {
  return (
    <svg className="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
  );
}

function IndeterminateIcon() {
  return (
    <svg className="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" style={{ color: 'var(--neuro-color-error)' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
  );
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, error, indeterminate = false, className, ...rest }, ref) {
    const id = useId();
    const { isFocusMode } = useFocusMode();
    const { fontFamily, lineHeight, letterSpacing, wordSpacing, fontVariantLigatures } = useReadability();

    const inputId = `${id}-checkbox`;
    const errorId = error ? `${id}-error` : undefined;
    const readabilityStyle = { fontFamily, lineHeight, letterSpacing, wordSpacing, fontVariantLigatures };

    const focusClass = isFocusMode
      ? 'peer-focus-visible:ring-[3px] peer-focus-visible:ring-offset-[3px] peer-focus-visible:ring-slate-950 dark:peer-focus-visible:ring-slate-300'
      : 'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-slate-950 dark:peer-focus-visible:ring-slate-300';

    return (
      <div className="flex flex-col gap-1.5" data-neuro-component="checkbox">
        <label htmlFor={inputId} className={cn('flex items-center gap-3 cursor-pointer min-h-[var(--neuro-min-target-size,44px)]', className)}>
          <span className="relative inline-flex items-center justify-center">
            <input
              ref={(el) => {
                if (el) el.indeterminate = indeterminate;
                if (typeof ref === 'function') ref(el);
                else if (ref) ref.current = el;
              }}
              type="checkbox"
              id={inputId}
              aria-invalid={error ? true : undefined}
              aria-describedby={errorId}
              className="peer sr-only"
              {...rest}
            />
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded border border-slate-300 dark:border-slate-600 shadow-xs',
                'bg-white dark:bg-slate-950',
                'peer-checked:bg-slate-900 peer-checked:border-slate-900 dark:peer-checked:bg-slate-50 dark:peer-checked:border-slate-50',
                'peer-indeterminate:bg-slate-900 peer-indeterminate:border-slate-900 dark:peer-indeterminate:bg-slate-50 dark:peer-indeterminate:border-slate-50',
                focusClass,
                'forced-colors:border-[ButtonBorder] forced-colors:peer-checked:bg-[Highlight]',
              )}
              style={error ? { borderColor: 'var(--neuro-color-error)' } : undefined}
            >
              {indeterminate ? <IndeterminateIcon /> : <CheckIcon />}
            </span>
          </span>
          <span className="text-sm text-slate-950 dark:text-slate-50" style={readabilityStyle}>{label}</span>
        </label>
        {error && (
          <p id={errorId} role="alert" className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--neuro-color-error)' }}>
            <ErrorIcon />{error}
          </p>
        )}
      </div>
    );
  },
);
