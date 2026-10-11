import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '../../../components/Icon/Icon';
import { colors, fontFamily, radius, spacing } from '../../../theme';
import { useCallLauncher } from '../hooks/useCallLauncher';
import { resolveAppointmentCall, type CallableAppointment } from '../utils/appointmentCall';

export interface AppointmentCallCardProps {
  appointmentId: string;
  appointment: CallableAppointment;
  title: string;
  hint?: string;
}

export const AppointmentCallCard: React.FC<AppointmentCallCardProps> = ({ appointmentId, appointment, title, hint }) => {
  const { launch, isBusy, inCall } = useCallLauncher();
  const availability = resolveAppointmentCall(appointment);

  if (!availability.visible) {
    return null;
  }

  const isVideo = availability.callType === 'VIDEO';
  const disabled = !availability.enabled || isBusy || inCall;
  const label = isVideo ? 'Start video call' : 'Start voice call';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {availability.hint ?? hint ? <Text style={styles.hint}>{availability.hint ?? hint}</Text> : null}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        activeOpacity={0.85}
        disabled={disabled}
        onPress={() => launch({ callType: availability.callType, context: { appointmentId } })}
        style={[styles.button, disabled && styles.dim]}
      >
        {isBusy ? <ActivityIndicator color={colors.white} /> : <Icon name={isVideo ? 'videocam' : 'call'} size={18} color={colors.white} />}
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  hint: {
    marginTop: spacing.xs,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  button: {
    marginTop: spacing.md,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.white,
  },
  dim: {
    opacity: 0.5,
  },
});
