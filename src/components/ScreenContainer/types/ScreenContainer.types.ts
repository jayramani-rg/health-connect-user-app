import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

export interface ScreenContainerProps {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  /** Adds bottom clearance so content isn't covered by the floating tab bar — pass on tab-root screens. */
  tabBarInset?: boolean;
}
