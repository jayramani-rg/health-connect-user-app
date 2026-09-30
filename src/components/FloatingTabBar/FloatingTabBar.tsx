import React from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, motion } from '../../theme';
import { haptics } from '../../utils/haptics';
import { Icon, type IoniconsIconName } from '../Icon/Icon';
import { BAR_BOTTOM_INSET, BAR_SIDE_INSET, ITEM_INNER_INSET, styles } from './styles/FloatingTabBar.styles';

const TAB_ICONS: Record<string, { active: IoniconsIconName; inactive: IoniconsIconName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Book: { active: 'search', inactive: 'search-outline' },
  Appointments: { active: 'calendar', inactive: 'calendar-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Module-scope function component invoked via JSX (`tabBar={(props) => <FloatingTabBar {...props} />}`)
 * rather than passed as a bare reference — passing it directly breaks the hooks below. */
export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const barWidth = SCREEN_WIDTH - BAR_SIDE_INSET * 2;
  const segmentWidth = barWidth / state.routes.length;

  const indicatorX = useSharedValue(state.index * segmentWidth);
  indicatorX.value = withSpring(state.index * segmentWidth, motion.spring.pill);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value + ITEM_INNER_INSET }],
    width: segmentWidth - ITEM_INNER_INSET * 2,
  }));

  return (
    <View style={[styles.wrapper, { bottom: BAR_BOTTOM_INSET + insets.bottom, width: barWidth }]} pointerEvents="box-none">
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const icons = TAB_ICONS[route.name] ?? TAB_ICONS.Home;
        const label = typeof options.tabBarLabel === 'string' ? options.tabBarLabel : (options.title ?? route.name);

        function onPress() {
          haptics.selection();
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.item}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={focused ? { selected: true } : {}}
          >
            <Icon name={focused ? icons.active : icons.inactive} size={22} color={focused ? colors.primaryStrong : colors.inkFaint} />
          </Pressable>
        );
      })}
    </View>
  );
}
