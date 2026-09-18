import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '../../theme';
import type { LabBookingStatus } from '../../features/labBookings/types/labBooking.types';
import { styles } from './styles/LabStatusBadge.styles';
import type { LabStatusBadgeProps } from './types/LabStatusBadge.types';

const STATUS_META: Record<LabBookingStatus, { label: string; bg: string; fg: string }> = {
  PENDING: { label: 'Pending', bg: colors.pendingSoft, fg: colors.pending },
  CONFIRMED: { label: 'Confirmed', bg: colors.successSoft, fg: colors.success },
  COLLECTOR_ASSIGNED: { label: 'Collector assigned', bg: colors.brandSoft, fg: colors.brand },
  ON_THE_WAY: { label: 'On the way', bg: colors.brandSoft, fg: colors.brand },
  COLLECTION_FAILED: { label: 'Collection failed', bg: colors.errorSoft, fg: colors.error },
  SAMPLE_COLLECTED: { label: 'Sample collected', bg: colors.brandSoft, fg: colors.brand },
  PROCESSING: { label: 'Processing', bg: colors.warningSoft, fg: colors.warning },
  REPORT_READY: { label: 'Report ready', bg: colors.successSoft, fg: colors.success },
  REJECTED: { label: 'Declined', bg: colors.errorSoft, fg: colors.error },
  CANCELLED: { label: 'Cancelled', bg: colors.errorSoft, fg: colors.error },
  EXPIRED: { label: 'Expired', bg: colors.errorSoft, fg: colors.error },
  NO_SHOW: { label: 'No-show', bg: colors.errorSoft, fg: colors.error },
};

export function LabStatusBadge({ status }: LabStatusBadgeProps) {
  const meta = STATUS_META[status];
  return (
    <View style={[styles.base, { backgroundColor: meta.bg }]}>
      <Text style={[styles.text, { color: meta.fg }]}>{meta.label}</Text>
    </View>
  );
}
