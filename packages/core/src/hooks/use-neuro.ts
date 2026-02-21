import { useContext } from 'react';

import { NeuroContext } from '../provider';
import type { NeuroContextValue } from '../types';

/**
 * Access the full sensory profile and mutation methods.
 * Must be used within a `<NeuroProvider>`.
 *
 * @throws {Error} if called outside NeuroProvider
 */
export function useNeuro(): NeuroContextValue {
  const context = useContext(NeuroContext);
  if (context === null) {
    throw new Error(
      'useNeuro must be used within a <NeuroProvider>. ' +
        'Wrap your app with <NeuroProvider> to use NeuroUI hooks.',
    );
  }
  return context;
}
