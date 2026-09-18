import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChipGroup } from '../../../components/ChipGroup/ChipGroup';
import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { TextField } from '../../../components/TextField/TextField';
import { colors } from '../../../theme';
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
  const [search, setSearch] = useState(route.params?.specialization ?? '');
  const [consultationType, setConsultationType] = useState<ConsultationType | ''>(route.params?.consultationType ?? '');
  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setErrorText(null);
      try {
        const response = await doctorService.list({
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
    [search, consultationType],
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultationType]);

  return (
    <ScreenContainer scroll={false} style={{ padding: 0 }}>
      <View style={styles.header}>
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
              description={errorText ?? 'Try a different search or filter.'}
            />
          }
        />
      )}
    </ScreenContainer>
  );
};

export default DoctorListScreen;
