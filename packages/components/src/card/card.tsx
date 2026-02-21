import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';
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

export type CardVariant = 'default' | 'outlined' | 'elevated';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
}

// ── Variant classes ─────────────────────────────────────────────────

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm',
  outlined: 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800',
  elevated: 'bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow',
};

// ── Spacing helpers ─────────────────────────────────────────────────

const spacingPaddingMap: Record<SpacingLevel, string> = {
  compact: 'p-4',
  normal: 'p-6',
  relaxed: 'p-8',
};

const spacingPaddingNoTopMap: Record<SpacingLevel, string> = {
  compact: 'p-4 pt-0',
  normal: 'p-6 pt-0',
  relaxed: 'p-8 pt-0',
};

const spacingGapMap: Record<SpacingLevel, string> = {
  compact: 'gap-1',
  normal: 'gap-2',
  relaxed: 'gap-4',
};

// ── Sub-components ──────────────────────────────────────────────────

const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function CardHeader({ className, ...rest }, ref) {
  const { profile } = useNeuro();
  const padding = spacingPaddingMap[profile.spacing] ?? 'p-6';
  return (
    <div
      ref={ref}
      className={cn(padding, className)}
      {...rest}
    />
  );
});

const CardBody = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function CardBody({ className, ...rest }, ref) {
  const { profile } = useNeuro();
  const padding = spacingPaddingNoTopMap[profile.spacing] ?? 'p-6 pt-0';
  return <div ref={ref} className={cn(padding, className)} {...rest} />;
});

const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function CardFooter({ className, ...rest }, ref) {
  const { profile } = useNeuro();
  const padding = spacingPaddingNoTopMap[profile.spacing] ?? 'p-6 pt-0';
  const gap = spacingGapMap[profile.spacing] ?? 'gap-2';
  return (
    <div
      ref={ref}
      className={cn(padding, 'flex items-center justify-end', gap, className)}
      {...rest}
    />
  );
});

// ── Main component ──────────────────────────────────────────────────

const CardRoot = forwardRef<HTMLDivElement, CardProps>(
  function Card(
    {
      variant = 'default',
      interactive = false,
      className,
      onClick,
      onKeyDown,
      children,
      ...rest
    },
    ref,
  ) {
    const { motionLevel } = useMotionSafety();
    const { isFocusMode } = useFocusMode();
    const { isFlashSafe } = useFlashSafety();
    const { density } = useCognitiveLoad();
    const { profile } = useNeuro();

    const motionClass =
      isFlashSafe || motionLevel === 'none'
        ? 'transition-none'
        : motionLevel === 'reduced'
          ? 'transition-colors duration-150'
          : 'transition-all duration-200';

    const focusClass =
      interactive && isFocusMode
        ? 'focus-visible:ring-[3px] focus-visible:ring-offset-[3px] focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300'
        : interactive
          ? 'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300'
          : '';

    // Spacing profile drives padding; density='minimal' forces relaxed padding
    const effectiveSpacing = density === 'minimal' ? 'relaxed' : profile.spacing;
    const paddingClass = spacingPaddingMap[effectiveSpacing] ?? 'p-6';

    function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
      onKeyDown?.(e);
      if (interactive && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        (e.currentTarget as HTMLDivElement).click();
      }
    }

    return (
      <div
        ref={ref}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        data-neuro-component="card"
        className={cn(
          'rounded-xl overflow-hidden text-slate-950 dark:text-slate-50',
          paddingClass,
          'focus-visible:outline-none',
          variantClasses[variant],
          motionClass,
          focusClass,
          interactive && 'cursor-pointer select-none hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-900',
          'forced-colors:border-[ButtonBorder]',
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

// ── Compound export ─────────────────────────────────────────────────

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
