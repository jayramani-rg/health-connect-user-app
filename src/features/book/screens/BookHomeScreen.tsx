import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Card } from '../../../components/Card/Card';
import { Icon } from '../../../components/Icon/Icon';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { SearchBar } from '../../../components/SearchBar/SearchBar';
import { SegmentedControl } from '../../../components/SegmentedControl/SegmentedControl';
import { colors, spacing, typography } from '../../../theme';
import type { RootStackParamList } from '../../../navigation/types';

type Mode = 'DOCTORS' | 'LABS';

const COPY: Record<Mode, { placeholder: string; heading: string; body: string; browseLabel: string; allLabel: string }> = {
  DOCTORS: {
    placeholder: 'Search doctors or specialties',
    heading: 'Find the right doctor',
    body: 'Browse by specialty or search directly for a doctor.',
    browseLabel: 'Browse by specialty',
    allLabel: 'Browse all doctors',
  },
  LABS: {
    placeholder: 'Search labs or tests',
    heading: 'Book a lab test',
    body: 'Browse by test category or search directly for a lab.',
    browseLabel: 'Browse by category',
    allLabel: 'Browse all labs',
  },
};

export default function BookHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [mode, setMode] = useState<Mode>('DOCTORS');
  const [search, setSearch] = useState('');
  const copy = COPY[mode];

  function submitSearch() {
    if (mode === 'DOCTORS') {
      navigation.navigate('DoctorList', search ? { search } : undefined);
    } else {
      navigation.navigate('LabList', undefined);
    }
    setSearch('');
  }

  return (
    <ScreenContainer tabBarInset>
      <Text style={typography.h1}>Book care</Text>

      <SegmentedControl
        options={[
          { label: 'Doctors', value: 'DOCTORS' },
          { label: 'Labs', value: 'LABS' },
        ]}
        value={mode}
        onChange={(value) => setMode(value as Mode)}
      />

      <SearchBar value={search} onChangeText={setSearch} placeholder={copy.placeholder} onSubmitEditing={submitSearch} />

      <View style={{ gap: spacing.md, marginTop: spacing.sm }}>
        <Text style={[typography.title, { color: colors.ink }]}>{copy.heading}</Text>
        <Text style={[typography.body, { color: colors.inkSoft }]}>{copy.body}</Text>

        <Card onPress={() => navigation.navigate(mode === 'DOCTORS' ? 'DoctorCategories' : 'LabCategories')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.primarySoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="grid-outline" size={20} color={colors.primary} />
              </View>
              <Text style={typography.bodyStrong}>{copy.browseLabel}</Text>
            </View>
            <Icon name="chevron-forward" size={18} color={colors.inkFaint} />
          </View>
        </Card>

        <Card variant="outline" elevation="none" onPress={() => navigation.navigate(mode === 'DOCTORS' ? 'DoctorList' : 'LabList', undefined)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={typography.bodyStrong}>{copy.allLabel}</Text>
            <Icon name="chevron-forward" size={18} color={colors.inkFaint} />
          </View>
        </Card>
      </View>
    </ScreenContainer>
  );
}
