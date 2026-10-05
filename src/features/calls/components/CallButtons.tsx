import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '../../../components/Icon/Icon';
import { colors, fontFamily, radius, spacing } from '../../../theme';
import { useCallLauncher } from '../hooks/useCallLauncher';
import type { CallContextRef, CallType } from '../types/call.types';

export interface CallButtonsProps {
  context: CallContextRef;
  variant?: 'header' | 'inline' | 'card';
  allowVideo?: boolean;
  allowVoice?: boolean;
}

export const CallButtons: React.FC<CallButtonsProps> = ({ context, variant = 'inline', allowVideo = true, allowVoice = true }) => {
  const { launch, isBusy, inCall } = useCallLauncher();
  const disabled = isBusy || inCall;

  const start = (callType: CallType) => {
    if (!disabled) {
      launch({ callType, context });
    }
  };

  if (variant === 'card') {
    return (
      <View style={styles.cardRow}>
        {allowVoice ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Start a voice call"
            activeOpacity={0.85}
            disabled={disabled}
            onPress={() => start('VOICE')}
            style={[styles.cardButton, styles.cardButtonOutline, disabled && styles.dim]}
          >
            {isBusy ? <ActivityIndicator color={colors.primary} /> : <Icon name="call" size={18} color={colors.primary} />}
            <Text style={[styles.cardLabel, { color: colors.primary }]}>Voice call</Text>
          </TouchableOpacity>
        ) : null}
        {allowVideo ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Start a video call"
            activeOpacity={0.85}
            disabled={disabled}
            onPress={() => start('VIDEO')}
            style={[styles.cardButton, styles.cardButtonFilled, disabled && styles.dim]}
          >
            <Icon name="videocam" size={18} color={colors.white} />
            <Text style={[styles.cardLabel, { color: colors.white }]}>Video call</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  const size = variant === 'header' ? 36 : 40;

  return (
    <View style={styles.iconRow}>
      {allowVoice ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Start a voice call"
          activeOpacity={0.8}
          disabled={disabled}
          onPress={() => start('VOICE')}
          style={[styles.iconButton, { width: size, height: size, borderRadius: size / 2 }, disabled && styles.dim]}
        >
          <Icon name="call" size={18} color={colors.primary} />
        </TouchableOpacity>
      ) : null}
      {allowVideo ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Start a video call"
          activeOpacity={0.8}
          disabled={disabled}
          onPress={() => start('VIDEO')}
          style={[styles.iconButton, { width: size, height: size, borderRadius: size / 2 }, disabled && styles.dim]}
        >
          <Icon name="videocam" size={20} color={colors.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export function callHeaderRight(context: CallContextRef): () => React.JSX.Element {
  return () => <CallButtons context={context} variant="header" />;
}

const styles = StyleSheet.create({
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  cardRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
  },
  cardButtonOutline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  cardButtonFilled: {
    backgroundColor: colors.primary,
  },
  cardLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
  },
  dim: {
    opacity: 0.5,
  },
});
