import React from 'react';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';

import type { MainTabParamList } from './types';
import { FloatingTabBar, type FloatingTabIcons } from '../components/FloatingTabBar/FloatingTabBar';
import HomeScreen from '../features/home/screens/HomeScreen';
import BookHomeScreen from '../features/book/screens/BookHomeScreen';
import AppointmentsHomeScreen from '../features/appointments/screens/AppointmentsHomeScreen';
import ProfileHomeScreen from '../features/profile/screens/ProfileHomeScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: FloatingTabIcons = {
  Home: { active: 'home', inactive: 'home-outline' },
  Book: { active: 'search', inactive: 'search-outline' },
  Appointments: { active: 'calendar', inactive: 'calendar-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

function renderTabBar(props: BottomTabBarProps) {
  return <FloatingTabBar {...props} icons={TAB_ICONS} />;
}

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={renderTabBar}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Book" component={BookHomeScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsHomeScreen} />
      <Tab.Screen name="Profile" component={ProfileHomeScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
