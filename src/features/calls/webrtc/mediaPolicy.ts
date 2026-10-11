import type { CallType } from '../types/call.types';

export interface CallMediaConstraints {
  audio: true;
  video: false | { facingMode: 'user'; width: number; height: number; frameRate: number };
}

export function usesCamera(callType: CallType, cameraAllowed: boolean): boolean {
  return callType === 'VIDEO' && cameraAllowed;
}

export function mediaConstraintsFor(callType: CallType, cameraAllowed: boolean): CallMediaConstraints {
  return {
    audio: true,
    video: usesCamera(callType, cameraAllowed) ? { facingMode: 'user', width: 640, height: 480, frameRate: 24 } : false,
  };
}

export function offerOptionsFor(callType: CallType): { offerToReceiveAudio: boolean; offerToReceiveVideo: boolean } {
  return { offerToReceiveAudio: true, offerToReceiveVideo: callType === 'VIDEO' };
}

export function startsOnSpeaker(callType: CallType): boolean {
  return callType === 'VIDEO';
}
