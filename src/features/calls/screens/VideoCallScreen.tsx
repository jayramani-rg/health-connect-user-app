import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import { Icon } from '../../../components/Icon/Icon';
import { colors, radius, spacing } from '../../../theme';
import { PulsingAvatar } from '../components/PulsingAvatar';
import { VideoCallControls } from '../components/VideoCallControls';
import { useCall } from '../context/CallContextValue';
import { useCallPresentation, useConfirmLeaveCall } from '../hooks/useCallPresentation';
import { callScreenStyles as styles } from './callScreenStyles';

const LOCAL_PREVIEW_WIDTH = 108;
const LOCAL_PREVIEW_HEIGHT = 152;

const VideoCallScreen: React.FC<{ navigation: NavigationProp<ParamListBase> }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { endCall } = useCall();
  const { media, controls, other, ended, mediaConnected, statusText, notice, subtitle, photoUrl, call } = useCallPresentation();

  useConfirmLeaveCall(navigation);

  if (!call || !other) {
    return <View style={styles.root} />;
  }

  const remoteVisible = !ended && mediaConnected && media.remoteVideoActive && media.remoteStreamURL !== null;
  const hasLocalVideo = media.localStreamURL !== null;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {remoteVisible && media.remoteStreamURL ? (
        <RTCView streamURL={media.remoteStreamURL} objectFit="cover" style={StyleSheet.absoluteFill} />
      ) : null}

      {remoteVisible ? <View style={styles.scrim} pointerEvents="none" /> : null}

      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.typePill}>
          <Icon name="videocam" size={14} color={colors.white} />
          <Text style={styles.typeText}>Video call</Text>
        </View>
        {remoteVisible ? (
          <>
            <Text style={styles.nameCompact} numberOfLines={1}>
              {other.name}
            </Text>
            <Text style={styles.status}>{statusText}</Text>
          </>
        ) : null}
      </View>

      {!remoteVisible ? (
        <View style={styles.center}>
          <PulsingAvatar name={other.name} imageUrl={photoUrl} size={132} pulsing={!ended && !mediaConnected} />
          <Text style={styles.name} numberOfLines={2}>
            {other.name}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
          <Text style={styles.statusLarge}>{statusText}</Text>
        </View>
      ) : null}

      {!ended ? (
        <View style={[local.preview, { top: insets.top + spacing.xxxl + spacing.massive }]}>
          {media.cameraOn && media.localStreamURL ? (
            <RTCView streamURL={media.localStreamURL} objectFit="cover" mirror zOrder={1} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={local.off}>
              <Icon name="videocam-off" size={26} color="rgba(255, 255, 255, 0.8)" />
            </View>
          )}
        </View>
      ) : null}

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xl }]}>
        {notice ? (
          <View style={styles.notice} accessibilityLiveRegion="polite">
            <Icon name="warning" size={16} color={colors.white} />
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        ) : null}
        {!ended ? <VideoCallControls media={media} controls={controls} hasLocalVideo={hasLocalVideo} onEnd={() => endCall('HANGUP')} /> : null}
      </View>
    </View>
  );
};

const local = StyleSheet.create({
  preview: {
    position: 'absolute',
    right: spacing.lg,
    width: LOCAL_PREVIEW_WIDTH,
    height: LOCAL_PREVIEW_HEIGHT,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(9, 79, 71, 0.9)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  off: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default VideoCallScreen;
