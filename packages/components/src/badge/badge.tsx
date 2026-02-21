import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

// ── Types ───────────────────────────────────────────────────────────

export type BadgeVariant = 'default' | 'info' | 'success' | 'warning' | 'error';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: ReactNode;
}

// ── Variant color mapping ───────────────────────────────────────────

const variantColorVar: Record<BadgeVariant, string | undefined> = {
  default: undefined,
  info: 'var(--neuro-color-info)',
  success: 'var(--neuro-color-success)',
  warning: 'var(--neuro-color-warning)',
  error: 'var(--neuro-color-error)',
};

// ── Default icons for semantic variants ─────────────────────────────

function InfoDot() {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full"
      style={{ backgroundColor: 'var(--neuro-color-info)' }}
      aria-hidden="true"
    />
  );
}

function SuccessDot() {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full"
      style={{ backgroundColor: 'var(--neuro-color-success)' }}
      aria-hidden="true"
    />
  );
}

function WarningDot() {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full"
      style={{ backgroundColor: 'var(--neuro-color-warning)' }}
      aria-hidden="true"
    />
  );
}

function ErrorDot() {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full"
      style={{ backgroundColor: 'var(--neuro-color-error)' }}
      aria-hidden="true"
    />
  );
}

const defaultIcons: Record<BadgeVariant, (() => React.JSX.Element) | undefined> = {
  default: undefined,
  info: InfoDot,
  success: SuccessDot,
  warning: WarningDot,
  error: ErrorDot,
};

// ── Component ───────────────────────────────────────────────────────

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge({ variant = 'default', icon, className, children, ...rest }, ref) {
    const colorVar = variantColorVar[variant];
    const DefaultIcon = icon === undefined ? defaultIcons[variant] : undefined;

    return (
      <span
        ref={ref}
        data-neuro-component="badge"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
          'min-h-[22px]',
          'border border-slate-200 dark:border-slate-800',
          'text-slate-900 dark:text-slate-50',
          'bg-white dark:bg-slate-950',
          'forced-colors:border-[ButtonBorder]',
          className,
        )}
        style={colorVar ? { borderColor: colorVar } : undefined}
        {...rest}
      >
        {icon ?? (DefaultIcon ? <DefaultIcon /> : null)}
        {children}
      </span>
    );
  },
);
