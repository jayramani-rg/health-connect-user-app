import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

export interface ScreenContainerProps {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}
