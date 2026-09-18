import type { StyleProp, TextStyle } from 'react-native';
import type { IoniconsIconName } from '@react-native-vector-icons/ionicons';

export interface IconProps {
  name: IoniconsIconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export type { IoniconsIconName };
