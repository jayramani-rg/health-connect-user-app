import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, type RouteProp } from '@react-navigation/native';

import { SegmentedControl } from '../../../components/SegmentedControl/SegmentedControl';
import { colors, spacing, typography } from '../../../theme';
import type { MainTabParamList } from '../../../navigation/types';
import MyAppointmentsScreen from './MyAppointmentsScreen';
import MyLabBookingsScreen from '../../labBookings/screens/MyLabBookingsScreen';

type Mode = 'DOCTOR' | 'LAB';

export default function AppointmentsHomeScreen() {
  const route = useRoute<RouteProp<MainTabParamList, 'Appointments'>>();
  const [mode, setMode] = useState<Mode>(route.params?.initialMode ?? 'DOCTOR');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={typography.h1}>Appointments</Text>
        <View style={{ marginTop: spacing.md }}>
          <SegmentedControl
            options={[
              { label: 'Doctor visits', value: 'DOCTOR' },
              { label: 'Lab bookings', value: 'LAB' },
            ]}
            value={mode}
            onChange={(value) => setMode(value as Mode)}
          />
        </View>
      </View>
      {mode === 'DOCTOR' ? <MyAppointmentsScreen /> : <MyLabBookingsScreen />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
});
