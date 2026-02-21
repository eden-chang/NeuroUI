import { createContext, useCallback, useContext, useId, useState, type ReactNode } from 'react';
import { useMotionSafety, useFlashSafety, useFocusMode, useCognitiveLoad } from '@neuroui/core';
import { cn } from '../utils/cn';

// Context
interface AccordionContextValue {
  openItems: Set<string>;
  toggle: (id: string) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

// Accordion root
export interface AccordionProps {
  type?: 'single' | 'multiple';
  defaultValue?: string[];
  children: ReactNode;
  className?: string;
}

export function Accordion({ type = 'single', defaultValue = [], children, className }: AccordionProps) {
  const { density } = useCognitiveLoad();
  const effectiveType = density === 'minimal' ? 'single' as const : type;
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultValue));

  const toggle = useCallback((id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (effectiveType === 'single') {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  }, [effectiveType]);

  return (
    <AccordionContext.Provider value={{ openItems, toggle, type: effectiveType }}>
      <div className={cn(className)} data-neuro-component="accordion">
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// AccordionItem
export interface AccordionItemProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function AccordionItem({ value, children, className }: AccordionItemProps) {
  return (
    <div className={cn('border-b border-slate-200 dark:border-slate-800 last:border-b-0 forced-colors:border-[ButtonBorder]', className)} data-accordion-item={value}>
      {children}
    </div>
  );
}

// AccordionTrigger
export interface AccordionTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function AccordionTrigger({ value, children, className }: AccordionTriggerProps) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('AccordionTrigger must be used within Accordion');

  const id = useId();
  const { motionLevel } = useMotionSafety();
  const { isFlashSafe } = useFlashSafety();
  const { isFocusMode } = useFocusMode();

  const isOpen = ctx.openItems.has(value);
  const hasMotion = !isFlashSafe && motionLevel !== 'none';
  const triggerId = `${id}-trigger`;
  const contentId = `${id}-content`;

  const focusClass = isFocusMode
    ? 'focus-visible:ring-[3px] focus-visible:ring-offset-[3px] focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300'
    : 'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300';

  return (
    <button
      type="button"
      id={triggerId}
      aria-expanded={isOpen}
      aria-controls={contentId}
      onClick={() => ctx.toggle(value)}
      className={cn(
        'flex w-full items-center justify-between py-4 text-sm font-medium text-left',
        'min-h-[var(--neuro-min-target-size,44px)]',
        'text-slate-950 dark:text-slate-50',
        'hover:underline',
        'focus-visible:outline-none',
        focusClass,
        className,
      )}
    >
      {children}
      <svg
        className={cn(
          'h-4 w-4 shrink-0 text-slate-500',
          hasMotion && 'transition-transform duration-200',
          isOpen && 'rotate-180',
        )}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
      </svg>
    </button>
  );
}

// AccordionContent
export interface AccordionContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function AccordionContent({ value, children, className }: AccordionContentProps) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('AccordionContent must be used within Accordion');

  const isOpen = ctx.openItems.has(value);

  if (!isOpen) return null;

  return (
    <div role="region" className={cn('pb-4 text-sm text-slate-600 dark:text-slate-400', className)}>
      {children}
    </div>
  );
}
