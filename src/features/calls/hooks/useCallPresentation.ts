import { useEffect, useMemo, useRef } from 'react';
import { confirmAction } from '../../../components/Dialog/dialogStore';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { ASSETS_BASE_URL } from '../../../config/env';
import { useAppSelector } from '../../../store';
import { useCall } from '../context/CallContextValue';
import { endedMessage, issueMessage } from '../utils/callMessages';
import { formatDuration, otherParticipant, resolvePhotoUrl, roleLabel } from '../utils/callFormat';
import { useCallDuration } from './useCallDuration';

export function useCallPresentation() {
  const { state, media, controls, userId } = useCall();
  const isOnline = useAppSelector((root) => root.networkData.isConnected);

  const call = state.call;
  const ended = state.stage === 'ended';
  const startedAt = media.mediaConnectedAt ?? (call?.connectedAt ? Date.parse(call.connectedAt) : null);
  const seconds = useCallDuration(ended ? null : startedAt);

  const other = useMemo(() => (call && userId ? otherParticipant(call, userId) : null), [call, userId]);
  const mediaConnected = media.connection === 'connected';

  let statusText = 'Connecting…';
  if (call && userId) {
    if (ended) {
      statusText = endedMessage(call, userId);
    } else if (media.connection === 'reconnecting') {
      statusText = 'Reconnecting…';
    } else if (media.connection === 'disconnected' || media.connection === 'failed') {
      statusText = 'Disconnected';
    } else if (mediaConnected) {
      statusText = media.networkQuality === 'poor' ? `${formatDuration(seconds)} · Poor connection` : formatDuration(seconds);
    } else if (state.stage === 'outgoing') {
      statusText = 'Calling…';
    }
  }

  let notice: string | null = null;
  if (!ended) {
    if (!isOnline) {
      notice = 'You are offline. Trying to reconnect.';
    } else if (media.issue) {
      notice = issueMessage(media.issue);
    } else if (media.networkQuality === 'poor' && mediaConnected) {
      notice = 'Poor connection. Audio and video may be affected.';
    }
  }

  const subtitle = other ? [roleLabel(other.role), other.subtitle].filter(Boolean).join(' · ') : '';
  const photoUrl = other ? resolvePhotoUrl(other.photoUrl, ASSETS_BASE_URL) : null;

  return { state, media, controls, userId, call, other, ended, mediaConnected, statusText, notice, subtitle, photoUrl };
}

export function useConfirmLeaveCall(navigation: NavigationProp<ParamListBase>) {
  const { state, endCall } = useCall();
  const stageRef = useRef(state.stage);
  stageRef.current = state.stage;

  useEffect(() => {
    return navigation.addListener('beforeRemove', (event) => {
      if (stageRef.current !== 'outgoing' && stageRef.current !== 'active') {
        return;
      }
      event.preventDefault();
      confirmAction({
        title: 'End this call?',
        message: 'You will be disconnected from the call.',
        icon: 'call-outline',
        confirmLabel: 'End call',
        cancelLabel: 'Stay on call',
        onConfirm: () => {
          endCall('HANGUP');
        },
      });
    });
  }, [navigation, endCall]);
}
