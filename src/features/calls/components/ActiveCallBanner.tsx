import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../../components/Icon/Icon';
import { navigationRef } from '../../../navigation/navigationRef';
import { colors, fontFamily, radius, spacing } from '../../../theme';
import { useCall } from '../context/CallContextValue';
import { useCallDuration } from '../hooks/useCallDuration';
import { formatDuration } from '../utils/callFormat';

export const ActiveCallBanner: React.FC = () => {
  const { state, media } = useCall();
  const insets = useSafeAreaInsets();
  const [routeName, setRouteName] = useState<string | undefined>(undefined);

  useEffect(() => {
    const read = () => setRouteName(navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : undefined);
    read();
    return navigationRef.addListener('state', read);
  }, []);

  const startedAt = media.mediaConnectedAt ?? (state.call?.connectedAt ? Date.parse(state.call.connectedAt) : null);
  const seconds = useCallDuration(startedAt);

  const inCall = state.stage === 'outgoing' || state.stage === 'active';
  if (!inCall || routeName === 'Calling' || routeName === 'IncomingCall') {
    return null;
  }

  const label = startedAt !== null ? `Return to call  ${formatDuration(seconds)}` : 'Return to call';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Return to the call in progress"
      activeOpacity={0.85}
      onPress={() => navigationRef.isReady() && navigationRef.navigate('Calling')}
      style={[styles.banner, { top: insets.top + spacing.xs }]}
    >
      <Icon name="call" size={16} color={colors.white} />
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    elevation: 12,
    zIndex: 100,
  },
  text: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.white,
  },
});
