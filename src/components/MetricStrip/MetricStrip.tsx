import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors } from '../../theme';
import { styles } from './styles/MetricStrip.styles';

export interface MetricItem {
  key: string;
  label: string;
  value: number;
  tone?: string;
  onPress?: () => void;
}

export interface MetricStripProps {
  items: MetricItem[];
}

export function MetricStrip({ items }: MetricStripProps) {
  return (
    <View style={styles.card}>
      {items.map((item, index) => {
        const tone = item.tone ?? colors.brand;
        const body = (
          <>
            <Text style={[styles.value, item.value > 0 && { color: tone }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
              {item.value}
            </Text>
            <Text style={styles.label} numberOfLines={2}>
              {item.label}
            </Text>
          </>
        );
        return (
          <React.Fragment key={item.key}>
            {index > 0 ? <View style={styles.divider} /> : null}
            {item.onPress ? (
              <Pressable
                onPress={item.onPress}
                accessibilityRole="button"
                accessibilityLabel={`${item.value} ${item.label}`}
                style={({ pressed }) => [styles.cell, pressed && styles.cellPressed]}
              >
                {body}
              </Pressable>
            ) : (
              <View style={styles.cell} accessible accessibilityLabel={`${item.value} ${item.label}`}>
                {body}
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

export default MetricStrip;
