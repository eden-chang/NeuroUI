import {
  forwardRef,
  useCallback,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useFocusMode, useNeuro } from '@neuroui/core';
import { cn } from '../utils/cn';

// ── Types ───────────────────────────────────────────────────────────

export type NavigationOrientation = 'horizontal' | 'vertical';

export interface NavigationProps extends HTMLAttributes<HTMLElement> {
  orientation?: NavigationOrientation;
  label: string;
}

export interface NavigationItemProps extends HTMLAttributes<HTMLAnchorElement> {
  href: string;
  active?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

// ── NavigationRoot ──────────────────────────────────────────────────

const NavigationRoot = forwardRef<HTMLElement, NavigationProps>(
  function Navigation(
    { orientation = 'horizontal', label, className, children, ...rest },
    ref,
  ) {
    const listRef = useRef<HTMLUListElement>(null);
    const { profile } = useNeuro();

    const gapClass =
      orientation === 'horizontal'
        ? profile.spacing === 'relaxed'
          ? 'gap-6'
          : profile.spacing === 'compact'
            ? 'gap-1'
            : 'gap-2'
        : profile.spacing === 'relaxed'
          ? 'gap-2'
          : profile.spacing === 'compact'
            ? 'gap-0'
            : 'gap-1';

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLUListElement>) => {
        const list = listRef.current;
        if (!list) return;

        const items = Array.from(
          list.querySelectorAll('a:not([aria-disabled="true"])'),
        ) as HTMLElement[];
        const currentIndex = items.indexOf(document.activeElement as HTMLElement);
        if (currentIndex === -1) return;

        const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
        const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';

        let nextIndex = currentIndex;
        if (e.key === nextKey) {
          e.preventDefault();
          nextIndex = (currentIndex + 1) % items.length;
        } else if (e.key === prevKey) {
          e.preventDefault();
          nextIndex = (currentIndex - 1 + items.length) % items.length;
        } else if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          (document.activeElement as HTMLElement)?.click();
          return;
        }

        if (nextIndex !== currentIndex) {
          items[nextIndex]?.focus();
        }
      },
      [orientation],
    );

    return (
      <nav
        ref={ref}
        aria-label={label}
        className={className}
        data-neuro-component="navigation"
        {...rest}
      >
        <ul
          ref={listRef}
          role="menubar"
          onKeyDown={handleKeyDown}
          className={cn(
            'flex list-none p-0 m-0',
            orientation === 'vertical' ? 'flex-col' : 'flex-row items-center',
            gapClass,
          )}
        >
          {children}
        </ul>
      </nav>
    );
  },
);

// ── NavigationItem ──────────────────────────────────────────────────

export const NavigationItem = forwardRef<HTMLAnchorElement, NavigationItemProps>(
  function NavigationItem(
    { href, active = false, icon, className, children, ...rest },
    ref,
  ) {
    const { isFocusMode } = useFocusMode();

    const focusClass = isFocusMode
      ? 'focus-visible:ring-[3px] focus-visible:ring-offset-[3px] focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300'
      : 'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300';

    return (
      <li role="none">
        <a
          ref={ref}
          href={href}
          role="menuitem"
          aria-current={active ? 'page' : undefined}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md',
            'min-h-[var(--neuro-min-target-size,44px)]',
            'focus-visible:outline-none',
            focusClass,
            active
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-medium border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-50 border border-transparent',
            'forced-colors:border-[ButtonBorder]',
            className,
          )}
          {...rest}
        >
          {icon}
          {children}
        </a>
      </li>
    );
  },
);

// ── Export ──────────────────────────────────────────────────────────

export const Navigation = Object.assign(NavigationRoot, {
  Item: NavigationItem,
});
