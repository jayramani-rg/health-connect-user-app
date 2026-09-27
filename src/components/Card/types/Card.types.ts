import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'surface' | 'sunken' | 'outline';
  elevation?: 'none' | 'card' | 'raised';
  style?: StyleProp<ViewStyle>;
}
