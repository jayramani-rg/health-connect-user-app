import React, { type ReactNode } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { styles } from './styles/PageHeader.styles';

export interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  subtitle?: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode;
  titleLines?: number;
  style?: StyleProp<ViewStyle>;
}

export function PageHeader({ title, eyebrow, subtitle, leading, actions, titleLines = 1, style }: PageHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.titleBlock}>
        {eyebrow ? (
          <Text style={styles.eyebrow} numberOfLines={1}>
            {eyebrow}
          </Text>
        ) : null}
        <Text style={styles.title} numberOfLines={titleLines} ellipsizeMode="tail" accessibilityRole="header">
          {title}
        </Text>
        {typeof subtitle === 'string' ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : (
          subtitle ?? null
        )}
      </View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

export default PageHeader;
