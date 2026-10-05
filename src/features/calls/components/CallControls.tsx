import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../../../theme';
import type { AgoraCallControls, AgoraCallMedia } from '../hooks/useAgoraCall';
import type { CallType } from '../types/call.types';
import { CallControlButton } from './CallControlButton';

export interface CallControlsProps {
  callType: CallType;
  media: AgoraCallMedia;
  controls: AgoraCallControls;
  onEnd: () => void;
  disabled?: boolean;
}

export const CallControls: React.FC<CallControlsProps> = ({ callType, media, controls, onEnd, disabled = false }) => {
  const isVideo = callType === 'VIDEO';

  return (
    <View style={styles.row}>
      <CallControlButton
        icon={media.muted ? 'mic-off' : 'mic'}
        label={media.muted ? 'Unmute' : 'Mute'}
        active={media.muted}
        disabled={disabled}
        onPress={controls.toggleMute}
      />
      {isVideo ? (
        <CallControlButton
          icon={media.cameraOn ? 'videocam' : 'videocam-off'}
          label={media.cameraOn ? 'Camera' : 'Camera off'}
          active={!media.cameraOn}
          disabled={disabled}
          onPress={controls.toggleCamera}
        />
      ) : null}
      {isVideo ? (
        <CallControlButton
          icon="camera-reverse"
          label="Flip"
          disabled={disabled || !media.cameraOn}
          onPress={controls.switchCamera}
        />
      ) : null}
      <CallControlButton
        icon={media.speakerOn ? 'volume-high' : 'volume-low'}
        label="Speaker"
        active={media.speakerOn}
        disabled={disabled}
        onPress={controls.toggleSpeaker}
      />
      <CallControlButton icon="call" label="End" danger rotateIcon onPress={onEnd} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
