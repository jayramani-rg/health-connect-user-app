import { createContext, useCallback, useContext, useMemo } from 'react';
import type { RefObject } from 'react';
import type { HostInstance } from 'react-native';

export interface KeyboardAwareContextValue {
  revealField: (field: RefObject<HostInstance | null>) => void;
  releaseField: (field: RefObject<HostInstance | null>) => void;
}

export const KeyboardAwareContext = createContext<KeyboardAwareContextValue | null>(null);

export function useKeyboardAwareField(field: RefObject<HostInstance | null>) {
  const context = useContext(KeyboardAwareContext);

  const reveal = useCallback(() => context?.revealField(field), [context, field]);
  const release = useCallback(() => context?.releaseField(field), [context, field]);

  return useMemo(() => ({ reveal, release }), [reveal, release]);
}
