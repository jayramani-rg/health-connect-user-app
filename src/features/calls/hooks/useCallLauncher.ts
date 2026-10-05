import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useCall } from '../context/CallContextValue';
import type { StartCallInput } from '../types/call.types';

export function useCallLauncher() {
  const { startCall, isBusy, state } = useCall();

  const launch = useCallback(
    async (input: StartCallInput) => {
      const outcome = await startCall(input);
      if (!outcome.ok && outcome.message) {
        Alert.alert('Unable to start the call', outcome.message);
      }
    },
    [startCall],
  );

  return { launch, isBusy, inCall: state.stage !== 'idle' };
}
