import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NetInfo from '@react-native-community/netinfo';

import type { RootStackParamList } from './types';
import { useAppDispatch, useAppSelector, setIsConnected } from '../store';

import WelcomeScreen from '../features/auth/screens/WelcomeScreen';
import MobileNumberScreen from '../features/auth/screens/MobileNumberScreen';
import OtpScreen from '../features/auth/screens/OtpScreen';
import LoginPasswordScreen from '../features/auth/screens/LoginPasswordScreen';
import CreatePasswordScreen from '../features/auth/screens/CreatePasswordScreen';
import ProfileBasicsScreen from '../features/auth/screens/ProfileBasicsScreen';
import TabNavigator from './TabNavigator';
import NoInternetScreen from '../features/common/screens/NoInternetScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.authData.isAuthenticated);
  const justRegistered = useAppSelector((state) => state.authData.justRegistered);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      dispatch(setIsConnected(!!state.isConnected));
    });
    return () => unsubscribe();
  }, [dispatch]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Group>
            {justRegistered && <Stack.Screen name="ProfileBasics" component={ProfileBasicsScreen} />}
            <Stack.Screen name="MainTabs" component={TabNavigator} />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="MobileNumber" component={MobileNumberScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
            <Stack.Screen name="LoginPassword" component={LoginPasswordScreen} />
            <Stack.Screen name="CreatePassword" component={CreatePasswordScreen} />
          </Stack.Group>
        )}
        <Stack.Screen name="NoInternet" component={NoInternetScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
