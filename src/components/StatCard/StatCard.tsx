import React from 'react';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { listItemEntering } from '../../utils/motion';

import { Icon, type IoniconsIconName } from '../Icon/Icon';

import { styles } from './StatCard.styles';

export interface StatCardProps {
  icon: IoniconsIconName;
  tint: string;
  tintSoft: string;
  value: number;
  label: string;
  index?: number;
}

export function StatCard({ icon, tint, tintSoft, value, label, index = 0 }: StatCardProps) {
  return (
    <Animated.View entering={listItemEntering(index)} style={styles.card}>
      <View style={[styles.iconBadge, { backgroundColor: tintSoft }]}>
        <Icon name={icon} size={18} color={tint} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
}

export default StatCard;
