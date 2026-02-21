import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  useMotionSafety,
  useFlashSafety,
  useCognitiveLoad,
  useNeuro,
} from '@neuroui/core';
import { cn } from '../utils/cn';

// ── Types ───────────────────────────────────────────────────────────

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: ReactNode;
  position?: TooltipPosition;
  children: ReactElement;
  className?: string;
}

// ── Component ───────────────────────────────────────────────────────

export function Tooltip({
  content,
  position = 'top',
  children,
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { density } = useCognitiveLoad();
  const { profile } = useNeuro();
  const { motionLevel } = useMotionSafety();
  const { isFlashSafe } = useFlashSafety();

  const delay =
    profile.timing === 'patient' ? 500 : profile.timing === 'quick' ? 100 : 200;
  const hasMotion = !isFlashSafe && motionLevel !== 'none';

  const show = useCallback(() => {
    if (density === 'minimal') return;
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  }, [delay, density]);

  const hide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisible(false);
  }, []);

  // Clean up pending timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // density:minimal → tooltips disabled
  if (density === 'minimal') {
    return <>{children}</>;
  }

  const tooltipId = `${id}-tooltip`;

  const positionClasses: Record<TooltipPosition, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      data-neuro-component="tooltip"
    >
      <span aria-describedby={visible ? tooltipId : undefined}>{children}</span>
      {visible && (
        <span
          id={tooltipId}
          role="tooltip"
          className={cn(
            'absolute z-50 rounded-md px-3 py-1.5 text-xs',
            'bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900',
            'shadow-md whitespace-nowrap pointer-events-none',
            'forced-colors:border forced-colors:border-[ButtonBorder]',
            positionClasses[position],
            hasMotion && 'animate-in fade-in-0',
            className,
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
