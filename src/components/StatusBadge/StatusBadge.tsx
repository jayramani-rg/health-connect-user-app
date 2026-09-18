import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '../../theme';
import type { AppointmentStatus } from '../../features/appointments/types/appointment.types';
import { styles } from './styles/StatusBadge.styles';
import type { StatusBadgeProps } from './types/StatusBadge.types';

const STATUS_META: Record<AppointmentStatus, { label: string; bg: string; fg: string }> = {
  PENDING: { label: 'Pending', bg: colors.pendingSoft, fg: colors.pending },
  RESCHEDULE_PROPOSED: { label: 'Reschedule offered', bg: colors.warningSoft, fg: colors.warning },
  CONFIRMED: { label: 'Confirmed', bg: colors.successSoft, fg: colors.success },
  IN_PROGRESS: { label: 'In progress', bg: colors.brandSoft, fg: colors.brand },
  COMPLETED: { label: 'Completed', bg: colors.surface2, fg: colors.textSecondary },
  REJECTED: { label: 'Declined', bg: colors.errorSoft, fg: colors.error },
  CANCELLED: { label: 'Cancelled', bg: colors.errorSoft, fg: colors.error },
  EXPIRED: { label: 'Expired', bg: colors.errorSoft, fg: colors.error },
  NO_SHOW: { label: 'No-show', bg: colors.errorSoft, fg: colors.error },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  return (
    <View style={[styles.base, { backgroundColor: meta.bg }]}>
      <Text style={[styles.text, { color: meta.fg }]}>{meta.label}</Text>
    </View>
  );
}

export type { StatusBadgeProps };
