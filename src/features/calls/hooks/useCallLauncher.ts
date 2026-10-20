import { useCallback } from 'react';
import { showNotice } from '../../../components/Dialog/dialogStore';
import { useCall } from '../context/CallContextValue';
import type { StartCallInput } from '../types/call.types';

export function useCallLauncher() {
  const { startCall, isBusy, state } = useCall();

  const launch = useCallback(
    async (input: StartCallInput) => {
      const outcome = await startCall(input);
      if (!outcome.ok && outcome.message) {
        showNotice({ title: 'Unable to start the call', message: outcome.message, tone: 'warning', icon: 'call-outline' });
      }
    },
    [startCall],
  );

  return { launch, isBusy, inCall: state.stage !== 'idle' };
}
