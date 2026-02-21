import { useCallback, useEffect, useRef, useState } from 'react';
import { useFlashSafety, useMotionSafety } from '@neuroui/core';

import { cn } from '../utils/cn';
import type { ToastItem } from './toast-context';

// ── Variant styles ──────────────────────────────────────────────────

const variantAccentClasses: Record<string, string> = {
  info: 'border-l-4',
  success: 'border-l-4',
  warning: 'border-l-4',
  error: 'border-l-4',
};

const variantBorderColors: Record<string, string> = {
  info: 'var(--neuro-color-info)',
  success: 'var(--neuro-color-success)',
  warning: 'var(--neuro-color-warning)',
  error: 'var(--neuro-color-error)',
};

// ── Variant icons ───────────────────────────────────────────────────

function InfoIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" style={{ color: 'var(--neuro-color-info)' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" style={{ color: 'var(--neuro-color-success)' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" style={{ color: 'var(--neuro-color-warning)' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" style={{ color: 'var(--neuro-color-error)' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
  );
}

const variantIcons: Record<string, () => React.JSX.Element> = {
  info: InfoIcon,
  success: SuccessIcon,
  warning: WarningIcon,
  error: ErrorIcon,
};

// ── Close icon ──────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}

// ── Component ───────────────────────────────────────────────────────

interface ToastProps {
  item: ToastItem;
  onDismiss: (id: string) => void;
  isMinimal: boolean;
  defaultDuration: number;
}

export function Toast({ item, onDismiss, isMinimal, defaultDuration }: ToastProps) {
  const { motionLevel } = useMotionSafety();
  const { isFlashSafe } = useFlashSafety();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(item.duration ?? defaultDuration);
  const startTimeRef = useRef(0);

  // flashSafety: true → no entrance/exit animation, static display only
  const hasMotion = !isFlashSafe && motionLevel !== 'none';

  // Animate in
  useEffect(() => {
    if (!hasMotion) {
      setVisible(true);
      return;
    }
    const rafId = requestAnimationFrame(() => { setVisible(true); });
    return () => { cancelAnimationFrame(rafId); };
  }, [hasMotion]);

  // Auto-dismiss timer
  const startTimer = useCallback(() => {
    if (remainingRef.current <= 0) return;
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss(item.id);
    }, remainingRef.current);
  }, [item.id, onDismiss]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      remainingRef.current -= Date.now() - startTimeRef.current;
    }
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [startTimer]);

  const Icon = variantIcons[item.variant] ?? InfoIcon;

  const transitionStyle = hasMotion
    ? {
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'translateX(0)'
          : motionLevel === 'full'
            ? 'translateX(100%)'
            : 'translateX(0)',
        transition:
          motionLevel === 'full'
            ? 'opacity 200ms ease-out, transform 200ms ease-out'
            : 'opacity 150ms ease-out',
        borderLeftColor: variantBorderColors[item.variant] ?? 'var(--neuro-color-info)',
      }
    : {
        borderLeftColor: variantBorderColors[item.variant] ?? 'var(--neuro-color-info)',
      };

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      className={cn(
        'pointer-events-auto w-80 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-lg',
        'forced-colors:border-[ButtonBorder]',
        variantAccentClasses[item.variant] ?? variantAccentClasses.info,
      )}
      style={transitionStyle}
      data-neuro-component="toast"
    >
      <div className="flex items-start gap-3">
        <Icon />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
            {item.title}
          </p>
          {item.description && !isMinimal && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
          )}
          {item.action && (
            <button
              type="button"
              onClick={item.action.onClick}
              className="mt-2 text-sm font-medium underline text-slate-900 hover:text-slate-700 dark:text-slate-50 dark:hover:text-slate-300"
            >
              {item.action.label}
            </button>
          )}
        </div>
        {item.closable && (
          <button
            type="button"
            onClick={() => { onDismiss(item.id); }}
            className="shrink-0 rounded-sm p-0.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300"
            aria-label="Dismiss"
          >
            <CloseIcon />
          </button>
        )}
      </div>
    </div>
  );
}
