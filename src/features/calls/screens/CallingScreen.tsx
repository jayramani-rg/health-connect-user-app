import React, { useEffect, useMemo, useRef } from 'react';
import { Alert, StatusBar, StyleSheet, Text, View } from 'react-native';
import { RenderModeType, RtcSurfaceView } from 'react-native-agora';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Icon } from '../../../components/Icon/Icon';
import { ASSETS_BASE_URL } from '../../../config/env';
import type { RootStackParamList } from '../../../navigation/types';
import { useAppSelector } from '../../../store';
import { colors, fontFamily, radius, spacing } from '../../../theme';
import { CallControls } from '../components/CallControls';
import { PulsingAvatar } from '../components/PulsingAvatar';
import { useCall } from '../context/CallContextValue';
import { useCallDuration } from '../hooks/useCallDuration';
import { callTypeLabel, formatDuration, otherParticipant, resolvePhotoUrl, roleLabel } from '../utils/callFormat';
import { endedMessage, issueMessage } from '../utils/callMessages';

type Props = NativeStackScreenProps<RootStackParamList, 'Calling'>;

const LOCAL_PREVIEW_WIDTH = 108;
const LOCAL_PREVIEW_HEIGHT = 152;

const CallingScreen: React.FC<Props> = ({ navigation }) => {
  const { state, media, controls, userId, endCall } = useCall();
  const insets = useSafeAreaInsets();
  const isOnline = useAppSelector((root) => root.networkData.isConnected);

  const stageRef = useRef(state.stage);
  stageRef.current = state.stage;

  const call = state.call;
  const startedAt = media.mediaConnectedAt ?? (call?.connectedAt ? Date.parse(call.connectedAt) : null);
  const seconds = useCallDuration(state.stage === 'ended' ? null : startedAt);

  useEffect(() => {
    return navigation.addListener('beforeRemove', (event) => {
      if (stageRef.current !== 'outgoing' && stageRef.current !== 'active') {
        return;
      }
      event.preventDefault();
      Alert.alert('End this call?', 'You will be disconnected from the call.', [
        { text: 'Stay on call', style: 'cancel' },
        { text: 'End call', style: 'destructive', onPress: () => endCall('HANGUP') },
      ]);
    });
  }, [navigation, endCall]);

  const other = useMemo(() => (call && userId ? otherParticipant(call, userId) : null), [call, userId]);

  if (!call || !other || !userId) {
    return <View style={styles.root} />;
  }

  const isVideo = call.callType === 'VIDEO';
  const ended = state.stage === 'ended';
  const remoteVisible = isVideo && !ended && media.remoteUid !== null && media.remoteVideoActive;
  const mediaConnected = media.connection === 'connected' && media.remoteUid !== null;
  const photoUrl = resolvePhotoUrl(other.photoUrl, ASSETS_BASE_URL);

  let statusText: string;
  if (ended) {
    statusText = endedMessage(call, userId);
  } else if (media.connection === 'reconnecting') {
    statusText = 'Reconnecting…';
  } else if (mediaConnected) {
    statusText = formatDuration(seconds);
  } else if (state.stage === 'outgoing') {
    statusText = media.connection === 'connected' ? 'Ringing…' : 'Calling…';
  } else {
    statusText = 'Connecting…';
  }

  const notice = ended
    ? null
    : !isOnline
      ? 'You are offline. Trying to reconnect.'
      : media.issue
        ? issueMessage(media.issue)
        : media.networkQuality === 'poor' || media.networkQuality === 'bad'
          ? 'Poor connection. Audio and video may be affected.'
          : null;

  const subtitle = [roleLabel(other.role), other.subtitle].filter(Boolean).join(' · ');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {remoteVisible && media.remoteUid !== null ? (
        <RtcSurfaceView
          style={StyleSheet.absoluteFill}
          canvas={{ uid: media.remoteUid, renderMode: RenderModeType.RenderModeHidden }}
        />
      ) : null}

      {remoteVisible ? <View style={styles.scrim} pointerEvents="none" /> : null}

      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.typePill}>
          <Icon name={isVideo ? 'videocam' : 'call'} size={14} color={colors.white} />
          <Text style={styles.typeText}>{callTypeLabel(call.callType)}</Text>
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

      {isVideo && !ended ? (
        <View style={[styles.localPreview, { top: insets.top + spacing.xxxl + spacing.massive }]}>
          {media.cameraOn ? (
            <RtcSurfaceView style={StyleSheet.absoluteFill} canvas={{ uid: 0 }} zOrderMediaOverlay />
          ) : (
            <View style={styles.localOff}>
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
        {!ended ? <CallControls callType={call.callType} media={media} controls={controls} onEnd={() => endCall('HANGUP')} /> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primaryStrong,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(9, 79, 71, 0.18)',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  typeText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    letterSpacing: 0.3,
    color: colors.white,
  },
  nameCompact: {
    marginTop: spacing.md,
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.white,
  },
  status: {
    marginTop: spacing.xs,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.86)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  name: {
    marginTop: spacing.lg,
    fontFamily: fontFamily.bold,
    fontSize: 26,
    textAlign: 'center',
    color: colors.white,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.72)',
  },
  statusLarge: {
    marginTop: spacing.lg,
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
    color: colors.white,
  },
  localPreview: {
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
  localOff: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    alignItems: 'center',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
  noticeText: {
    flexShrink: 1,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.white,
  },
});

export default CallingScreen;
