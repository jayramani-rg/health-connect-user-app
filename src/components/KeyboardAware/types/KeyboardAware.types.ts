import type { ReactNode } from 'react';
import type { ScrollViewProps, StyleProp, ViewProps, ViewStyle } from 'react-native';

export interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  footer?: ReactNode;
  footerStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  revealGap?: number;
  enabled?: boolean;
}

export interface KeyboardAvoidingContainerProps extends ViewProps {
  enabled?: boolean;
}
