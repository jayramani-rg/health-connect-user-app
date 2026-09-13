// src/navigation/TabNavigator.tsx
// Handbook Sec 13.1 — MainTabs is registered as a single RootStackParamList
// screen, giving the root stack full control over presenting modals over
// the tab bar without nested-navigator complexity.

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import type { MainTabParamList } from './types';
import HomeScreen from '../features/home/screens/HomeScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      {/* Cart / Orders / Profile screens follow the same feature-slice
          pattern demonstrated by features/home — scaffold them the same
          way when those features are built out. */}
    </Tab.Navigator>
  );
};

export default TabNavigator;
