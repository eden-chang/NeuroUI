import { forwardRef, useId, createContext, useContext, type InputHTMLAttributes, type ReactNode } from 'react';
import { useFocusMode, useReadability, useNeuro } from '@neuroui/core';
import { cn } from '../utils/cn';

// RadioGroup context
interface RadioGroupContextValue {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

// RadioGroup
export interface RadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  label: string;
  error?: string;
  orientation?: 'vertical' | 'horizontal';
  children: ReactNode;
}

function ErrorIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" style={{ color: 'var(--neuro-color-error)' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
  );
}

export function RadioGroup({ name, value, onChange, label, error, orientation = 'vertical', children }: RadioGroupProps) {
  const id = useId();
  const { profile } = useNeuro();
  const errorId = error ? `${id}-error` : undefined;

  const gapClass = orientation === 'horizontal'
    ? (profile.spacing === 'relaxed' ? 'gap-6' : profile.spacing === 'compact' ? 'gap-2' : 'gap-4')
    : (profile.spacing === 'relaxed' ? 'gap-4' : profile.spacing === 'compact' ? 'gap-1' : 'gap-2');

  return (
    <RadioGroupContext.Provider value={{ name, value, onChange }}>
      <fieldset data-neuro-component="radio-group" aria-describedby={errorId}>
        <legend className="text-sm font-medium text-slate-950 dark:text-slate-50 mb-2">{label}</legend>
        <div className={cn('flex', orientation === 'horizontal' ? 'flex-row' : 'flex-col', gapClass)} role="radiogroup">
          {children}
        </div>
        {error && (
          <p id={errorId} role="alert" className="flex items-center gap-1.5 text-sm mt-1.5" style={{ color: 'var(--neuro-color-error)' }}>
            <ErrorIcon />{error}
          </p>
        )}
      </fieldset>
    </RadioGroupContext.Provider>
  );
}

// Radio
export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  label: string;
  value: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  function Radio({ label, value, className, ...rest }, ref) {
    const id = useId();
    const group = useContext(RadioGroupContext);
    const { isFocusMode } = useFocusMode();
    const { fontFamily, lineHeight, letterSpacing, wordSpacing, fontVariantLigatures } = useReadability();

    const inputId = `${id}-radio`;
    const readabilityStyle = { fontFamily, lineHeight, letterSpacing, wordSpacing, fontVariantLigatures };

    const focusClass = isFocusMode
      ? 'peer-focus-visible:ring-[3px] peer-focus-visible:ring-offset-[3px] peer-focus-visible:ring-slate-950 dark:peer-focus-visible:ring-slate-300'
      : 'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-slate-950 dark:peer-focus-visible:ring-slate-300';

    const isChecked = group ? group.value === value : rest.checked;
    const hasOnChange = group?.onChange || rest.onChange;

    return (
      <label htmlFor={inputId} className={cn('flex items-center gap-3 cursor-pointer min-h-[var(--neuro-min-target-size,44px)]', className)} data-neuro-component="radio">
        <span className="relative inline-flex items-center justify-center">
          <input
            ref={ref}
            type="radio"
            id={inputId}
            name={group?.name}
            value={value}
            checked={isChecked}
            onChange={group?.onChange ? () => group.onChange!(value) : undefined}
            readOnly={!hasOnChange}
            className="peer sr-only"
            {...rest}
          />
          <span
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 dark:border-slate-600 shadow-xs',
              'bg-white dark:bg-slate-950',
              isChecked ? 'border-slate-900 dark:border-slate-50' : '',
              focusClass,
              'forced-colors:border-[ButtonBorder]',
            )}
          >
            <span className={cn(
              'h-2.5 w-2.5 rounded-full bg-slate-900 dark:bg-slate-50 transition-opacity',
              isChecked ? 'opacity-100' : 'opacity-0',
            )} />
          </span>
        </span>
        <span className="text-sm text-slate-950 dark:text-slate-50" style={readabilityStyle}>{label}</span>
      </label>
    );
  },
);
