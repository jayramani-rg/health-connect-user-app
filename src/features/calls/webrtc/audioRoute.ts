import InCallManager from 'react-native-incall-manager';
import type { CallType } from '../types/call.types';

export const audioRoute = {
  start(callType: CallType, speakerOn: boolean): void {
    try {
      InCallManager.start({ media: callType === 'VIDEO' ? 'video' : 'audio', auto: false });
      InCallManager.setForceSpeakerphoneOn(speakerOn);
      InCallManager.setKeepScreenOn(true);
    } catch {}
  },

  setSpeaker(on: boolean): void {
    try {
      InCallManager.setForceSpeakerphoneOn(on);
    } catch {}
  },

  stop(): void {
    try {
      InCallManager.setKeepScreenOn(false);
      InCallManager.stop();
    } catch {}
  },
};
