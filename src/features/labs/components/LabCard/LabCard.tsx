import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { activeopacity } from '../../../../utils/helpers';
import { colors, radius, spacing, typography } from '../../../../theme';
import type { LabListItem } from '../../types/lab.types';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
    flexWrap: 'wrap',
  },
  metaChip: {
    ...typography.caption,
    color: colors.textSecondary,
    backgroundColor: colors.surface2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  pausedText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

export function LabCard({ lab, onPress }: { lab: LabListItem; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={activeopacity} style={styles.card} onPress={onPress}>
      <Text style={styles.name}>{lab.name}</Text>
      <Text style={styles.meta}>
        {lab.city}, {lab.state} · {lab.serviceCount} service{lab.serviceCount === 1 ? '' : 's'}
      </Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaChip}>Lab visit</Text>
        {lab.homeCollectionEnabled && <Text style={styles.metaChip}>Home collection</Text>}
      </View>
      {!lab.isAcceptingBookings && <Text style={styles.pausedText}>Not accepting bookings</Text>}
    </TouchableOpacity>
  );
}
