import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import type { MainTabParamList } from './types';
import { FloatingTabBar } from '../components/FloatingTabBar/FloatingTabBar';
import HomeScreen from '../features/home/screens/HomeScreen';
import BookHomeScreen from '../features/book/screens/BookHomeScreen';
import AppointmentsHomeScreen from '../features/appointments/screens/AppointmentsHomeScreen';
import ProfileHomeScreen from '../features/profile/screens/ProfileHomeScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Book" component={BookHomeScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsHomeScreen} />
      <Tab.Screen name="Profile" component={ProfileHomeScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
