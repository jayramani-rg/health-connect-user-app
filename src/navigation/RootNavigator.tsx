import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NetInfo from '@react-native-community/netinfo';

import type { RootStackParamList } from './types';
import { useAppDispatch, useAppSelector, setIsConnected, setUnreadCount } from '../store';
import { chatSocket } from '../services/chatSocket';
import { colors, fontFamily } from '../theme';

import WelcomeScreen from '../features/auth/screens/WelcomeScreen';
import MobileNumberScreen from '../features/auth/screens/MobileNumberScreen';
import OtpScreen from '../features/auth/screens/OtpScreen';
import LoginPasswordScreen from '../features/auth/screens/LoginPasswordScreen';
import CreatePasswordScreen from '../features/auth/screens/CreatePasswordScreen';
import ProfileBasicsScreen from '../features/auth/screens/ProfileBasicsScreen';
import TabNavigator from './TabNavigator';
import NoInternetScreen from '../features/common/screens/NoInternetScreen';
import DoctorCategoriesScreen from '../features/doctors/screens/DoctorCategoriesScreen';
import DoctorListScreen from '../features/doctors/screens/DoctorListScreen';
import DoctorProfileScreen from '../features/doctors/screens/DoctorProfileScreen';
import BookAppointmentScreen from '../features/appointments/screens/BookAppointmentScreen';
import AppointmentConfirmationScreen from '../features/appointments/screens/AppointmentConfirmationScreen';
import AppointmentDetailScreen from '../features/appointments/screens/AppointmentDetailScreen';
import LabCategoriesScreen from '../features/labs/screens/LabCategoriesScreen';
import LabListScreen from '../features/labs/screens/LabListScreen';
import LabProfileScreen from '../features/labs/screens/LabProfileScreen';
import BookLabServiceScreen from '../features/labBookings/screens/BookLabServiceScreen';
import LabBookingConfirmationScreen from '../features/labBookings/screens/LabBookingConfirmationScreen';
import LabBookingDetailScreen from '../features/labBookings/screens/LabBookingDetailScreen';
import ReportViewerScreen from '../features/labBookings/screens/ReportViewerScreen';
import ChatListScreen from '../features/chat/screens/ChatListScreen';
import ConversationScreen from '../features/chat/screens/ConversationScreen';
import NotificationCenterScreen from '../features/notifications/screens/NotificationCenterScreen';
import { notificationService } from '../services/notificationService';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import FamilyMembersScreen from '../features/profile/screens/FamilyMembersScreen';
import SettingsScreen from '../features/profile/screens/SettingsScreen';
import HelpSupportScreen from '../features/profile/screens/HelpSupportScreen';

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

  useEffect(() => {
    if (isAuthenticated) {
      chatSocket.connect();
      notificationService
        .unreadCount()
        .then((res) => dispatch(setUnreadCount(res.data.count)))
        .catch(() => {});
    } else {
      chatSocket.disconnect();
    }
  }, [isAuthenticated, dispatch]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: colors.surface },
          headerShadowVisible: false,
          headerTintColor: colors.primary,
          headerTitleStyle: { fontFamily: fontFamily.semiBold, fontSize: 17, color: colors.ink },
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.canvas },
        }}
      >
        {isAuthenticated ? (
          <Stack.Group>
            {/* ProfileBasics is always registered (the profile-completion gate can navigate to it from
                anywhere), but only declared FIRST — making it the initial route — right after registration,
                so a brand-new user sees it before the main app. */}
            {justRegistered && <Stack.Screen name="ProfileBasics" component={ProfileBasicsScreen} />}
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            {!justRegistered && <Stack.Screen name="ProfileBasics" component={ProfileBasicsScreen} />}
            <Stack.Screen name="DoctorCategories" component={DoctorCategoriesScreen} options={{ headerShown: true, title: 'Find a doctor' }} />
            <Stack.Screen name="DoctorList" component={DoctorListScreen} options={{ headerShown: true, title: 'Find a doctor' }} />
            <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} options={{ headerShown: true, title: 'Doctor profile' }} />
            <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AppointmentConfirmation" component={AppointmentConfirmationScreen} options={{ gestureEnabled: false }} />
            <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ headerShown: true, title: 'Appointment' }} />
            <Stack.Screen name="LabCategories" component={LabCategoriesScreen} options={{ headerShown: true, title: 'Book a lab test' }} />
            <Stack.Screen name="LabList" component={LabListScreen} options={{ headerShown: true, title: 'Find a lab' }} />
            <Stack.Screen name="LabProfile" component={LabProfileScreen} options={{ headerShown: true, title: 'Lab profile' }} />
            <Stack.Screen name="BookLabService" component={BookLabServiceScreen} options={{ headerShown: true, title: 'Book a test' }} />
            <Stack.Screen name="LabBookingConfirmation" component={LabBookingConfirmationScreen} options={{ gestureEnabled: false }} />
            <Stack.Screen name="LabBookingDetail" component={LabBookingDetailScreen} options={{ headerShown: true, title: 'Lab booking' }} />
            <Stack.Screen name="ReportViewer" component={ReportViewerScreen} options={{ headerShown: true, title: 'Report' }} />
            <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: true, title: 'Chats' }} />
            <Stack.Screen name="ChatConversation" component={ConversationScreen} options={{ headerShown: true, title: 'Chat' }} />
            <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} options={{ headerShown: true, title: 'Notifications' }} />
            <Stack.Screen name="EditProfile" component={ProfileScreen} options={{ headerShown: true, title: 'Edit profile' }} />
            <Stack.Screen name="FamilyMembers" component={FamilyMembersScreen} options={{ headerShown: true, title: 'Family members' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: 'Settings' }} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ headerShown: true, title: 'Help & support' }} />
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
