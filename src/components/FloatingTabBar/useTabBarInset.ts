import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { layout } from '../../theme';
import { BAR_BOTTOM_INSET, BAR_HEIGHT } from './styles/FloatingTabBar.styles';

export function useTabBarInset(): number {
  const insets = useSafeAreaInsets();
  return insets.bottom + BAR_BOTTOM_INSET + BAR_HEIGHT + layout.bottomBreathing;
}

export function useTabBarOverlayOffset(): number {
  const insets = useSafeAreaInsets();
  return insets.bottom + BAR_BOTTOM_INSET + BAR_HEIGHT + layout.inlineGap;
}

export function useScreenBottomInset(): number {
  const insets = useSafeAreaInsets();
  return insets.bottom + layout.bottomBreathing;
}
