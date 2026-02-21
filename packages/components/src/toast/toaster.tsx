import { useContext } from 'react';
import { createPortal } from 'react-dom';
import { useCognitiveLoad, useNeuro } from '@neuroui/core';

import { ToastContext } from './toast-context';
import { Toast } from './toast';

export function Toaster() {
  const ctx = useContext(ToastContext);
  const { profile } = useNeuro();
  const { density } = useCognitiveLoad();

  if (ctx === null) {
    throw new Error('Toaster must be used within a <ToastProvider>');
  }

  // Silent mode — suppress all toasts
  if (profile.notifications === 'silent') return null;

  // SSR guard
  if (typeof document === 'undefined') return null;

  const maxToasts = density === 'minimal' ? 1 : 3;
  const isMinimal = density === 'minimal';
  const visibleToasts = ctx.toasts.slice(-maxToasts);

  // Timing-based default duration (matches --neuro-toast-duration CSS variable)
  const timingDurationMap: Record<string, number> = {
    patient: 10000,
    normal: 5000,
    quick: 3000,
  };
  const defaultDuration = timingDurationMap[profile.timing] ?? 5000;

  const portal = (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      data-neuro-component="toaster"
    >
      {visibleToasts.map((t) => (
        <Toast
          key={t.id}
          item={t}
          onDismiss={ctx.dismiss}
          isMinimal={isMinimal}
          defaultDuration={defaultDuration}
        />
      ))}
    </div>
  );

  return createPortal(portal, document.body);
}
