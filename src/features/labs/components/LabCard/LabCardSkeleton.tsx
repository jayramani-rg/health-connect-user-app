import React from 'react';
import { View } from 'react-native';
import { SkeletonBlock } from '../../../../components/SkeletonLoader/SkeletonLoader';
import { radius } from '../../../../theme';
import { LOGO_SIZE, styles } from './styles/LabCard.styles';

export function LabCardSkeleton() {
  return (
    <View style={styles.card} accessibilityLabel="Loading laboratory">
      <View style={styles.top}>
        <SkeletonBlock width={LOGO_SIZE} height={LOGO_SIZE} radius={radius.md} />
        <View style={styles.skeletonLines}>
          <SkeletonBlock width="60%" height={16} />
          <SkeletonBlock width="72%" height={12} />
          <SkeletonBlock width="40%" height={12} />
        </View>
      </View>
      <View style={styles.options}>
        <SkeletonBlock width="48%" height={52} radius={radius.md} />
        <SkeletonBlock width="48%" height={52} radius={radius.md} />
      </View>
      <View style={styles.footer}>
        <SkeletonBlock width={90} height={30} />
        <SkeletonBlock width={112} height={44} radius={radius.pill} />
      </View>
    </View>
  );
}

export function LabListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <LabCardSkeleton key={index} />
      ))}
    </View>
  );
}
