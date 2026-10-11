import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../../../theme';
import type { CallControls, CallMedia } from '../hooks/useWebRTCCall';
import { CallControlButton } from './CallControlButton';

export interface VideoCallControlsProps {
  media: CallMedia;
  controls: CallControls;
  onEnd: () => void;
  hasLocalVideo: boolean;
}

export const VideoCallControls: React.FC<VideoCallControlsProps> = ({ media, controls, onEnd, hasLocalVideo }) => (
  <View style={styles.row}>
    <CallControlButton
      icon={media.muted ? 'mic-off' : 'mic'}
      label={media.muted ? 'Unmute' : 'Mute'}
      active={media.muted}
      onPress={controls.toggleMute}
    />
    <CallControlButton
      icon={media.cameraOn ? 'videocam' : 'videocam-off'}
      label={media.cameraOn ? 'Camera' : 'Camera off'}
      active={!media.cameraOn}
      disabled={!hasLocalVideo}
      onPress={controls.toggleCamera}
    />
    <CallControlButton icon="camera-reverse" label="Flip" disabled={!media.cameraOn} onPress={controls.switchCamera} />
    <CallControlButton
      icon={media.speakerOn ? 'volume-high' : 'volume-low'}
      label="Speaker"
      active={media.speakerOn}
      onPress={controls.toggleSpeaker}
    />
    <CallControlButton icon="call" label="End" danger rotateIcon onPress={onEnd} />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
