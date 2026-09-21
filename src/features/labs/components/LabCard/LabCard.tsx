import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '../../../../components/Icon/Icon';
import { activeopacity } from '../../../../utils/helpers';
import { colors, radius, spacing, typography } from '../../../../theme';
import { ASSETS_BASE_URL } from '../../../../config/env';
import type { LabListItem } from '../../types/lab.types';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
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
    fontWeight: '600',
    color: colors.brandStrong,
    backgroundColor: colors.brandSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  pausedText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

export function LabCard({ lab, onPress }: { lab: LabListItem; onPress: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = !!lab.photoUrl && !imageFailed;

  return (
    <TouchableOpacity activeOpacity={activeopacity} style={styles.card} onPress={onPress}>
      <View style={styles.avatar}>
        {showImage ? (
          <Image
            source={{ uri: `${ASSETS_BASE_URL}${lab.photoUrl}` }}
            style={{ width: '100%', height: '100%', borderRadius: radius.md }}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <Icon name="flask" size={24} color={colors.brand} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {lab.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {[lab.city, lab.state].filter(Boolean).join(', ')} · {lab.serviceCount} service{lab.serviceCount === 1 ? '' : 's'}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaChip}>Lab visit</Text>
          {lab.homeCollectionEnabled && <Text style={styles.metaChip}>Home collection</Text>}
        </View>
        {!lab.isAcceptingBookings && <Text style={styles.pausedText}>Not accepting bookings</Text>}
      </View>
    </TouchableOpacity>
  );
}
