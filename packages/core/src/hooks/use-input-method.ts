import type { InputMethod } from '../types';
import { useNeuro } from './use-neuro';

export interface InputMethodResult {
  /** The current input method from the sensory profile. */
  inputMethod: InputMethod;
  /** Whether the user needs larger touch/switch targets (48px minimum). */
  needsLargerTargets: boolean;
  /** Whether interactive controls need always-visible text labels (voice/switch). */
  needsVisibleLabels: boolean;
}

/**
 * Convenience hook for adapting components to different input methods.
 * Touch and switch users need 48px minimum targets; voice and switch
 * users need visible labels on all interactive controls.
 */
export function useInputMethod(): InputMethodResult {
  const { profile } = useNeuro();
  return {
    inputMethod: profile.inputMethod,
    needsLargerTargets:
      profile.inputMethod === 'touch' || profile.inputMethod === 'switch',
    needsVisibleLabels:
      profile.inputMethod === 'voice' || profile.inputMethod === 'switch',
  };
}
