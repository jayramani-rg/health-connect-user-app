import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface ScreenContainerProps {
  children: ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  tabBarInset?: boolean;
  footer?: ReactNode;
  variant?: 'default' | 'page' | 'list';
}
