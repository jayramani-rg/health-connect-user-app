import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Icon } from '../../../components/Icon/Icon';
import { ASSETS_BASE_URL } from '../../../config/env';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, fontFamily, radius, spacing } from '../../../theme';
import { PulsingAvatar } from '../components/PulsingAvatar';
import { useCall } from '../context/CallContextValue';
import { callTypeLabel, resolvePhotoUrl, roleLabel } from '../utils/callFormat';
import { endedMessage } from '../utils/callMessages';

type Props = NativeStackScreenProps<RootStackParamList, 'IncomingCall'>;

const ACTION_SIZE = 76;

const IncomingCallScreen: React.FC<Props> = ({ navigation }) => {
  const { state, userId, acceptCall, declineCall, isBusy } = useCall();
  const insets = useSafeAreaInsets();

  const stageRef = useRef(state.stage);
  stageRef.current = state.stage;

  useEffect(() => {
    return navigation.addListener('beforeRemove', (event) => {
      if (stageRef.current === 'incoming') {
        event.preventDefault();
      }
    });
  }, [navigation]);

  const call = state.call;
  if (!call) {
    return <View style={styles.root} />;
  }

  const caller = call.caller;
  const isVideo = call.callType === 'VIDEO';
  const ended = state.stage === 'ended';
  const subtitle = [roleLabel(caller.role), caller.subtitle].filter(Boolean).join(' · ');

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.massive, paddingBottom: insets.bottom + spacing.xxxl }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.top}>
        <View style={styles.typePill}>
          <Icon name={isVideo ? 'videocam' : 'call'} size={14} color={colors.white} />
          <Text style={styles.typeText}>{`Incoming ${callTypeLabel(call.callType).toLowerCase()}`}</Text>
        </View>
        <PulsingAvatar name={caller.name} imageUrl={resolvePhotoUrl(caller.photoUrl, ASSETS_BASE_URL)} size={128} pulsing={!ended} />
        <Text style={styles.name} numberOfLines={2}>
          {caller.name}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {ended && userId ? <Text style={styles.endedText}>{endedMessage(call, userId)}</Text> : null}
      </View>

      {!ended ? (
        <View style={styles.actions}>
          <View style={styles.action}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Decline call"
              activeOpacity={0.85}
              disabled={isBusy}
              onPress={declineCall}
              style={[styles.actionButton, { backgroundColor: colors.error }]}
            >
              <Icon name="call" size={32} color={colors.white} style={styles.hangUp} />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Decline</Text>
          </View>

          <View style={styles.action}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={isVideo ? 'Accept video call' : 'Accept voice call'}
              activeOpacity={0.85}
              disabled={isBusy}
              onPress={acceptCall}
              style={[styles.actionButton, { backgroundColor: colors.success }]}
            >
              {isBusy ? <ActivityIndicator color={colors.white} /> : <Icon name={isVideo ? 'videocam' : 'call'} size={32} color={colors.white} />}
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Accept</Text>
          </View>
        </View>
      ) : (
        <View style={styles.actions} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: colors.primaryStrong,
  },
  top: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    marginBottom: spacing.xl,
  },
  typeText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    letterSpacing: 0.3,
    color: colors.white,
  },
  name: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    textAlign: 'center',
    color: colors.white,
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.74)',
  },
  endedText: {
    marginTop: spacing.md,
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
    color: colors.white,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xxxl,
    minHeight: ACTION_SIZE + spacing.xxxl,
  },
  action: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    borderRadius: ACTION_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hangUp: {
    transform: [{ rotate: '135deg' }],
  },
  actionLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.white,
  },
});

export default IncomingCallScreen;
