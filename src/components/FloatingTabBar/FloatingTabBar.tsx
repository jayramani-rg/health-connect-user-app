import React, { useEffect } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors } from '../../theme';
import { haptics } from '../../utils/haptics';
import { Icon, type IoniconsIconName } from '../Icon/Icon';
import { BAR_BOTTOM_INSET, INDICATOR_SIZE, INDICATOR_SPRING, PRESS_SPRING, styles } from './styles/FloatingTabBar.styles';

export type FloatingTabIcons = Record<string, { active: IoniconsIconName; inactive: IoniconsIconName }>;

interface FloatingTabBarProps extends BottomTabBarProps {
  icons: FloatingTabIcons;
  badges?: Record<string, number>;
}

interface TabItemProps {
  focused: boolean;
  icon: { active: IoniconsIconName; inactive: IoniconsIconName };
  badge: number;
  label: string;
  onPress: () => void;
}

function TabItem({ focused, icon, badge, label, onPress }: TabItemProps) {
  const scale = useSharedValue(1);
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      onPressIn={() => {
        scale.value = withSpring(0.86, PRESS_SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, PRESS_SPRING);
      }}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      style={styles.item}
    >
      <Animated.View style={[styles.iconWrap, iconStyle]}>
        <Icon name={focused ? icon.active : icon.inactive} size={22} color={focused ? colors.brandStrong : colors.textTertiary} />
        {badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

export function FloatingTabBar({ state, descriptors, navigation, icons, badges }: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const barWidth = useSharedValue(0);
  const activeIndex = useSharedValue(state.index);
  const routeCount = state.routes.length;

  useEffect(() => {
    activeIndex.value = withSpring(state.index, INDICATOR_SPRING);
  }, [state.index, activeIndex]);

  function handleLayout(event: LayoutChangeEvent) {
    barWidth.value = event.nativeEvent.layout.width;
  }

  const indicatorStyle = useAnimatedStyle(() => {
    const segment = barWidth.value / Math.max(routeCount, 1);
    return {
      opacity: barWidth.value > 0 ? 1 : 0,
      transform: [{ translateX: activeIndex.value * segment + (segment - INDICATOR_SIZE) / 2 }],
    };
  });

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom: insets.bottom + BAR_BOTTOM_INSET }]}>
      <View style={styles.bar} onLayout={handleLayout} accessibilityRole="tablist">
        <Animated.View pointerEvents="none" style={[styles.indicator, indicatorStyle]} />
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const iconSet = icons[route.name];
          if (!iconSet) return null;

          function onPress() {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          }

          return (
            <TabItem
              key={route.key}
              focused={focused}
              icon={iconSet}
              badge={badges?.[route.name] ?? 0}
              label={typeof options.tabBarLabel === 'string' ? options.tabBarLabel : (options.title ?? route.name)}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
}

export { TAB_BAR_CLEARANCE } from './styles/FloatingTabBar.styles';
