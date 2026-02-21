import {
  createContext,
  useCallback,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

// ── Types ───────────────────────────────────────────────────────────

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  closable?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastItem extends ToastOptions {
  id: string;
  variant: ToastVariant;
  closable: boolean;
}

export interface ToastContextValue {
  toasts: ToastItem[];
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

// ── Reducer ─────────────────────────────────────────────────────────

type ToastAction =
  | { type: 'ADD_TOAST'; payload: ToastItem }
  | { type: 'REMOVE_TOAST'; payload: string };

function toastReducer(state: ToastItem[], action: ToastAction): ToastItem[] {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, action.payload];
    case 'REMOVE_TOAST':
      return state.filter((t) => t.id !== action.payload);
    default:
      return state;
  }
}

// ── Context ─────────────────────────────────────────────────────────

export const ToastContext = createContext<ToastContextValue | null>(null);

// ── ID generation ───────────────────────────────────────────────────

let counter = 0;

function generateId(): string {
  counter += 1;
  return `toast-${counter.toString(36)}-${Date.now().toString(36)}`;
}

// ── Provider ────────────────────────────────────────────────────────

export interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const toast = useCallback((options: ToastOptions): string => {
    const id = generateId();
    const item: ToastItem = {
      ...options,
      id,
      variant: options.variant ?? 'info',
      closable: options.closable ?? true,
    };
    dispatch({ type: 'ADD_TOAST', payload: item });
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, toast, dismiss }),
    [toasts, toast, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}
