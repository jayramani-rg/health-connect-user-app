import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Icon, type IoniconsIconName } from '../Icon/Icon';
import { motion } from '../../theme';
import { styles } from './StatCard.styles';

export interface StatCardProps {
  icon: IoniconsIconName;
  tint: string;
  tintSoft: string;
  value: number;
  label: string;
  index?: number;
}

/** Premium KPI tile used in 2x2 dashboard grids — an icon badge tinted per metric, a large
 * value, and a caption label. Kept visually identical to the Doctor and Lab apps' StatCard. */
export function StatCard({ icon, tint, tintSoft, value, label, index = 0 }: StatCardProps) {
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * motion.listStagger).duration(220).springify().damping(18)} style={styles.card}>
      <View style={[styles.iconBadge, { backgroundColor: tintSoft }]}>
        <Icon name={icon} size={18} color={tint} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
}

export default StatCard;
