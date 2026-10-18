import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '../../theme';
import type { AppointmentStatus } from '../../features/appointments/types/appointment.types';
import { styles } from './styles/StatusBadge.styles';
import type { StatusBadgeProps } from './types/StatusBadge.types';

export const STATUS_META: Record<AppointmentStatus, { label: string; bg: string; fg: string }> = {
  PENDING: { label: 'Pending', bg: colors.pendingSoft, fg: colors.pending },
  CONFIRMED: { label: 'Confirmed', bg: colors.successSoft, fg: colors.success },
  IN_PROGRESS: { label: 'In progress', bg: colors.brandSoft, fg: colors.brand },
  COMPLETED: { label: 'Completed', bg: colors.surface2, fg: colors.textSecondary },
  REJECTED: { label: 'Declined', bg: colors.errorSoft, fg: colors.error },
  CANCELLED: { label: 'Cancelled', bg: colors.errorSoft, fg: colors.error },
  EXPIRED: { label: 'Expired', bg: colors.errorSoft, fg: colors.error },
  NO_SHOW: { label: 'No-show', bg: colors.errorSoft, fg: colors.error },
  PAYMENT_PENDING: { label: 'Awaiting payment', bg: colors.warningSoft, fg: colors.warning },
};

export function statusMeta(status: string): { label: string; bg: string; fg: string } {
  return (
    STATUS_META[status as AppointmentStatus] ?? {
      label: status.charAt(0) + status.slice(1).replace(/_/g, ' ').toLowerCase(),
      bg: colors.surface2,
      fg: colors.textSecondary,
    }
  );
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const meta = statusMeta(status);
  return (
    <View style={[styles.base, { backgroundColor: meta.bg }]}>
      <View style={[styles.dot, { backgroundColor: meta.fg }]} />
      <Text style={[styles.text, { color: meta.fg }]} numberOfLines={1}>{meta.label}</Text>
    </View>
  );
}

export type { StatusBadgeProps };
