import type { StyleProp, ViewStyle } from 'react-native';

export interface SkeletonBlockProps {
  width: number | `${number}%`;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}
