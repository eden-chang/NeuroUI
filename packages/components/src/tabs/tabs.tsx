import { createContext, useCallback, useContext, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useFocusMode, useMotionSafety, useFlashSafety } from '@neuroui/core';
import { cn } from '../utils/cn';

// Context
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

// Tabs root
export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const baseId = useId();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeTab = value ?? internalValue;

  const setActiveTab = useCallback((id: string) => {
    if (value === undefined) setInternalValue(id);
    onValueChange?.(id);
  }, [value, onValueChange]);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, baseId }}>
      <div className={className} data-neuro-component="tabs">
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// TabList
export interface TabListProps {
  children: ReactNode;
  className?: string;
}

export function TabList({ children, className }: TabListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const { isFocusMode } = useFocusMode();

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const list = listRef.current;
    if (!list) return;

    const tabs = Array.from(list.querySelectorAll('[role="tab"]:not([disabled])')) as HTMLElement[];
    const currentIndex = tabs.indexOf(document.activeElement as HTMLElement);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== currentIndex) {
      tabs[nextIndex]?.focus();
      tabs[nextIndex]?.click();
    }
  }, []);

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn(
        'flex border-b border-slate-200 dark:border-slate-800',
        className,
      )}
    >
      {children}
    </div>
  );
}

// Tab trigger
export interface TabProps {
  value: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export function Tab({ value, disabled, children, className }: TabProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tab must be used within Tabs');

  const { motionLevel } = useMotionSafety();
  const { isFlashSafe } = useFlashSafety();
  const { isFocusMode } = useFocusMode();

  const isActive = ctx.activeTab === value;
  const tabId = `${ctx.baseId}-tab-${value}`;
  const panelId = `${ctx.baseId}-panel-${value}`;

  const hasMotion = !isFlashSafe && motionLevel !== 'none';

  const focusClass = isFocusMode
    ? 'focus-visible:ring-[3px] focus-visible:ring-offset-[3px] focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300'
    : 'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300';

  return (
    <button
      type="button"
      role="tab"
      id={tabId}
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => ctx.setActiveTab(value)}
      className={cn(
        'px-4 py-2 text-sm font-medium -mb-px border-b-2 focus-visible:outline-none',
        'min-h-[var(--neuro-min-target-size,44px)]',
        isActive
          ? 'border-slate-900 dark:border-slate-50 text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-slate-900'
          : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50',
        hasMotion && 'transition-colors duration-150',
        focusClass,
        disabled && 'opacity-50 cursor-not-allowed',
        'forced-colors:border-[ButtonBorder]',
        className,
      )}
    >
      {children}
    </button>
  );
}

// TabPanel
export interface TabPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabPanel must be used within Tabs');

  const isActive = ctx.activeTab === value;
  const tabId = `${ctx.baseId}-tab-${value}`;
  const panelId = `${ctx.baseId}-panel-${value}`;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      tabIndex={0}
      className={cn('pt-4', className)}
    >
      {children}
    </div>
  );
}
