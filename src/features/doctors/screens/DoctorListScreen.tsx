import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChipGroup } from '../../../components/ChipGroup/ChipGroup';
import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { TextField } from '../../../components/TextField/TextField';
import { colors, radius, spacing, typography } from '../../../theme';
import { doctorService } from '../../../services/doctorService';
import type { RootStackParamList } from '../../../navigation/types';
import { DoctorCard } from '../components/DoctorCard/DoctorCard';
import type { ConsultationType, DoctorListItem } from '../types/doctor.types';
import { styles } from '../styles/DoctorListScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'DoctorList'>;

const MODE_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'In-clinic', value: 'IN_CLINIC' },
  { label: 'Video', value: 'VIDEO' },
  { label: 'Voice', value: 'VOICE' },
];

const DoctorListScreen: React.FC<Props> = ({ route, navigation }) => {
  // A specialization arriving via navigation (from the category browse screen) is a precise server-side
  // filter, kept separate from the free-text search box — pre-filling that box with a long category name
  // would look like the user typed it, and typing over it would silently drop the filter.
  const [specialization, setSpecialization] = useState(route.params?.specialization ?? '');
  const [search, setSearch] = useState('');
  const [consultationType, setConsultationType] = useState<ConsultationType | ''>(route.params?.consultationType ?? '');
  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (specialization) {
      navigation.setOptions({ title: specialization });
    }
  }, [specialization, navigation]);

  const load = useCallback(
    async (isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setErrorText(null);
      try {
        const response = await doctorService.list({
          specialization: specialization || undefined,
          search: search || undefined,
          consultationType: consultationType || undefined,
          pageSize: 30,
        });
        setDoctors(response.data.items);
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : 'Could not load doctors.');
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [search, specialization, consultationType],
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultationType, specialization]);

  return (
    <ScreenContainer scroll={false} style={{ padding: 0 }}>
      <View style={styles.header}>
        {specialization ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.brandSoft,
              borderRadius: radius.md,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              marginBottom: spacing.sm,
            }}
          >
            <Text style={{ ...typography.bodyStrong, color: colors.brand }} numberOfLines={1}>
              {specialization}
            </Text>
            <TouchableOpacity onPress={() => setSpecialization('')}>
              <Text style={{ ...typography.bodyStrong, color: colors.brand }}>Clear</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        <TextField
          label="Search"
          value={search}
          onChangeText={setSearch}
          placeholder="Doctor name or specialization"
          onSubmitEditing={() => load()}
        />
        <ChipGroup options={MODE_OPTIONS} value={consultationType} onChange={(v) => setConsultationType(v as ConsultationType | '')} />
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.doctorProfileId}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
          renderItem={({ item }) => (
            <DoctorCard doctor={item} onPress={() => navigation.navigate('DoctorProfile', { doctorProfileId: item.doctorProfileId })} />
          )}
          ListEmptyComponent={
            <EmptyState
              title={errorText ? 'Something went wrong' : 'No doctors found'}
              description={errorText ?? (specialization ? `No doctors currently offer ${specialization}.` : 'Try a different search or filter.')}
            />
          }
        />
      )}
    </ScreenContainer>
  );
};

export default DoctorListScreen;
