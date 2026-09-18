// src/navigation/TabNavigator.tsx
// Handbook Sec 13.1 — MainTabs is registered as a single RootStackParamList
// screen, giving the root stack full control over presenting modals over
// the tab bar without nested-navigator complexity.

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { MainTabParamList } from './types';
import { Icon, type IoniconsIconName } from '../components/Icon/Icon';
import { colors } from '../theme';
import HomeScreen from '../features/home/screens/HomeScreen';
import MyAppointmentsScreen from '../features/appointments/screens/MyAppointmentsScreen';
import MyLabBookingsScreen from '../features/labBookings/screens/MyLabBookingsScreen';
import ChatListScreen from '../features/chat/screens/ChatListScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, { active: IoniconsIconName; inactive: IoniconsIconName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Appointments: { active: 'calendar', inactive: 'calendar-outline' },
  Labs: { active: 'flask', inactive: 'flask-outline' },
  Chat: { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' },
};

const TabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: {
          height: 56 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name as keyof MainTabParamList];
          return <Icon name={focused ? icons.active : icons.inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Appointments" component={MyAppointmentsScreen} options={{ title: 'Appointments' }} />
      <Tab.Screen name="Labs" component={MyLabBookingsScreen} options={{ title: 'Lab Bookings' }} />
      <Tab.Screen name="Chat" component={ChatListScreen} options={{ title: 'Chat' }} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
