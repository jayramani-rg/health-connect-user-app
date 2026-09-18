// src/navigation/TabNavigator.tsx
// Handbook Sec 13.1 — MainTabs is registered as a single RootStackParamList
// screen, giving the root stack full control over presenting modals over
// the tab bar without nested-navigator complexity.

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import type { MainTabParamList } from './types';
import HomeScreen from '../features/home/screens/HomeScreen';
import MyAppointmentsScreen from '../features/appointments/screens/MyAppointmentsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Appointments" component={MyAppointmentsScreen} options={{ title: 'Appointments' }} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
