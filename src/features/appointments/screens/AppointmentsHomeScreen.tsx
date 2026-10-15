import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, type RouteProp } from '@react-navigation/native';

import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { SegmentedControl } from '../../../components/SegmentedControl/SegmentedControl';
import { colors, layout } from '../../../theme';
import type { MainTabParamList } from '../../../navigation/types';
import MyAppointmentsScreen from './MyAppointmentsScreen';
import MyLabBookingsScreen from '../../labBookings/screens/MyLabBookingsScreen';

type Mode = 'DOCTOR' | 'LAB';

export default function AppointmentsHomeScreen() {
  const route = useRoute<RouteProp<MainTabParamList, 'Appointments'>>();
  const requestedMode = route.params?.initialMode;
  const [mode, setMode] = useState<Mode>(requestedMode ?? 'DOCTOR');

  useEffect(() => {
    if (requestedMode) setMode(requestedMode);
  }, [requestedMode]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <PageHeader title="Appointments" />
        <SegmentedControl
          accessibilityLabel="Booking type"
          options={[
            { label: 'Doctor visits', value: 'DOCTOR' },
            { label: 'Lab tests', value: 'LAB' },
          ]}
          value={mode}
          onChange={(value) => setMode(value as Mode)}
        />
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
    paddingHorizontal: layout.gutter,
    paddingTop: 4,
    paddingBottom: layout.inlineGap,
    gap: layout.inlineGap,
  },
});
