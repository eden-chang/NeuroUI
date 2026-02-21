import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import {
  useCognitiveLoad,
  useFlashSafety,
  useFocusMode,
  useMotionSafety,
  useNeuro,
} from '@neuroui/core';
import type { SpacingLevel } from '@neuroui/core';

import { cn } from '../utils/cn';

// ── Types ───────────────────────────────────────────────────────────

export type DialogSize = 'sm' | 'md' | 'lg';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  closable?: boolean;
  size?: DialogSize;
  children: ReactNode;
}

// ── Size classes ────────────────────────────────────────────────────

const sizeClasses: Record<DialogSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

// ── Focus trap hook ─────────────────────────────────────────────────

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useFocusTrap(open: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement;

    // Delay to ensure portal is mounted
    const rafId = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;
      const focusable = container.querySelectorAll(FOCUSABLE_SELECTOR);
      const first = focusable[0];
      if (first instanceof HTMLElement) {
        first.focus();
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
      const prev = previousFocusRef.current;
      if (prev instanceof HTMLElement && document.contains(prev)) {
        prev.focus();
      }
    };
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'Tab') return;

      const container = containerRef.current;
      if (!container) return;

      const focusable = container.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [],
  );

  return { containerRef, handleKeyDown };
}

// ── Spacing helpers ─────────────────────────────────────────────────

const spacingPaddingMap: Record<SpacingLevel, string> = {
  compact: 'p-4',
  normal: 'p-6',
  relaxed: 'p-8',
};

const spacingGapMap: Record<SpacingLevel, string> = {
  compact: 'gap-1',
  normal: 'gap-2',
  relaxed: 'gap-4',
};

const spacingMarginTopMap: Record<SpacingLevel, string> = {
  compact: 'mt-2 pt-2',
  normal: 'mt-4 pt-4',
  relaxed: 'mt-6 pt-6',
};

// ── Sub-component ───────────────────────────────────────────────────

const DialogActions = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function DialogActions({ className, ...rest }, ref) {
  const { profile } = useNeuro();
  const gap = spacingGapMap[profile.spacing] ?? 'gap-2';
  const spacing = spacingMarginTopMap[profile.spacing] ?? 'mt-4 pt-4';
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-end',
        gap,
        spacing,
        'border-t border-slate-200 dark:border-slate-800',
        className,
      )}
      {...rest}
    />
  );
});

// ── Close icon ──────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg
      className="h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}

// ── Component ───────────────────────────────────────────────────────

function DialogRoot({
  open,
  onOpenChange,
  title,
  description,
  closable = true,
  size = 'md',
  children,
}: DialogProps) {
  const { motionLevel } = useMotionSafety();
  const { isFocusMode } = useFocusMode();
  const { isFlashSafe } = useFlashSafety();
  const { density } = useCognitiveLoad();
  const { profile } = useNeuro();
  const { containerRef, handleKeyDown } = useFocusTrap(open);

  const [visible, setVisible] = useState(false);

  // flashSafety: true → no animation at all
  const hasMotion = !isFlashSafe && motionLevel !== 'none';

  // Animate in
  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    if (!hasMotion) {
      setVisible(true);
      return;
    }
    const rafId = requestAnimationFrame(() => {
      setVisible(true);
    });
    return () => { cancelAnimationFrame(rafId); };
  }, [open, hasMotion]);

  // Scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open || !closable) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => { document.removeEventListener('keydown', handleEscape); };
  }, [open, closable, onOpenChange]);

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  const backdropClass = isFocusMode ? 'bg-black/80' : 'bg-black/50';
  // Spacing profile drives padding; density='minimal' forces relaxed padding
  const effectiveSpacing = density === 'minimal' ? 'relaxed' : profile.spacing;
  const paddingClass = spacingPaddingMap[effectiveSpacing] ?? 'p-6';
  const transitionDuration =
    motionLevel === 'reduced' ? '150ms' : '200ms';

  const portal = (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={
        hasMotion
          ? {
              opacity: visible ? 1 : 0,
              transition: `opacity ${transitionDuration} ease-in-out`,
            }
          : undefined
      }
      data-neuro-component="dialog"
    >
      {/* Backdrop */}
      <div
        className={cn('fixed inset-0', backdropClass)}
        onClick={closable ? () => { onOpenChange(false); } : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${title}-dialog-title`}
        aria-describedby={description ? `${title}-dialog-desc` : undefined}
        className={cn(
          'relative z-10 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg',
          sizeClasses[size],
          paddingClass,
          'forced-colors:border-[ButtonBorder]',
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <h2
              id={`${title}-dialog-title`}
              className="text-lg font-semibold text-slate-950 dark:text-slate-50"
            >
              {title}
            </h2>
            {description && (
              <p
                id={`${title}-dialog-desc`}
                className="text-sm text-slate-500 dark:text-slate-400"
              >
                {description}
              </p>
            )}
          </div>
          {closable && (
            <button
              type="button"
              onClick={() => { onOpenChange(false); }}
              className="rounded-sm p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );

  return createPortal(portal, document.body);
}

// ── Compound export ─────────────────────────────────────────────────

export const Dialog = Object.assign(DialogRoot, {
  Actions: DialogActions,
});
