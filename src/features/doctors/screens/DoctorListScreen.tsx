import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChipGroup } from '../../../components/ChipGroup/ChipGroup';
import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { SearchBar } from '../../../components/SearchBar/SearchBar';
import { colors, radius, spacing, typography } from '../../../theme';
import { doctorService } from '../../../services/doctorService';
import { usePaginatedList } from '../../../hooks/usePaginatedList';
import type { RootStackParamList } from '../../../navigation/types';
import { LocalityStrip } from '../../location/components/LocalityStrip';
import { useUserLocality } from '../../location/hooks/useUserLocality';
import { DoctorCard } from '../components/DoctorCard/DoctorCard';
import { DoctorCardSkeleton, DoctorListSkeleton } from '../components/DoctorCard/DoctorCardSkeleton';
import type { ConsultationType, DoctorListItem } from '../types/doctor.types';
import { styles } from '../styles/DoctorListScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'DoctorList'>;

const MODE_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'In-clinic', value: 'IN_CLINIC' },
  { label: 'Video', value: 'VIDEO' },
  { label: 'Voice', value: 'VOICE' },
];

const PAGE_SIZE = 20;

const DoctorListScreen: React.FC<Props> = ({ route, navigation }) => {
  const [specialization, setSpecialization] = useState(route.params?.specialization ?? '');
  const [searchText, setSearchText] = useState(route.params?.search ?? '');
  const [appliedSearch, setAppliedSearch] = useState(route.params?.search ?? '');
  const [consultationType, setConsultationType] = useState<ConsultationType | ''>(route.params?.consultationType ?? '');
  const { label: localityLabel, nearParams } = useUserLocality();

  useEffect(() => {
    if (specialization) {
      navigation.setOptions({ title: specialization });
    }
  }, [specialization, navigation]);

  const fetchPage = useCallback(
    async (page: number) => {
      const response = await doctorService.list({
        specialization: specialization || undefined,
        search: appliedSearch || undefined,
        consultationType: consultationType || undefined,
        ...nearParams,
        page,
        pageSize: PAGE_SIZE,
      });
      return response.data;
    },
    [specialization, appliedSearch, consultationType, nearParams],
  );

  const resetKey = [specialization, appliedSearch, consultationType, nearParams.nearLocality, nearParams.nearCity].join('|');
  const list = usePaginatedList<DoctorListItem>(fetchPage, resetKey);

  const header = (
    <LocalityStrip label={localityLabel} noun="doctors" onPress={() => navigation.navigate('SelectLocation')} />
  );

  return (
    <ScreenContainer scroll={false} style={{ padding: 0 }}>
      <View style={styles.header}>
        {specialization ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.primarySoft,
              borderRadius: radius.md,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              marginBottom: spacing.sm,
            }}
          >
            <Text style={{ ...typography.bodyStrong, color: colors.primary }} numberOfLines={1}>
              {specialization}
            </Text>
            <TouchableOpacity onPress={() => setSpecialization('')}>
              <Text style={{ ...typography.bodyStrong, color: colors.primary }}>Clear</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Doctor name or specialization"
          onSubmitEditing={() => setAppliedSearch(searchText.trim())}
        />
        <View style={{ marginTop: spacing.sm }}>
          <ChipGroup options={MODE_OPTIONS} value={consultationType} onChange={(v) => setConsultationType(v as ConsultationType | '')} />
        </View>
      </View>

      {list.loading ? (
        <View style={styles.listContent}>
          {header}
          <DoctorListSkeleton count={6} />
        </View>
      ) : (
        <FlatList
          data={list.items}
          keyExtractor={(item) => item.doctorProfileId}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} tintColor={colors.primary} />}
          ListHeaderComponent={header}
          renderItem={({ item }) => (
            <Animated.View entering={FadeIn.duration(220)}>
              <DoctorCard doctor={item} onPress={() => navigation.navigate('DoctorProfile', { doctorProfileId: item.doctorProfileId })} />
            </Animated.View>
          )}
          onEndReached={list.loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            list.loadingMore ? (
              <View>
                <DoctorCardSkeleton />
                <DoctorCardSkeleton />
              </View>
            ) : list.error && list.items.length > 0 ? (
              <EmptyState title="Couldn't load more doctors" description={list.error} actionLabel="Try again" onActionPress={list.retry} />
            ) : undefined
          }
          ListEmptyComponent={
            list.error ? (
              <EmptyState title="Something went wrong" description={list.error} actionLabel="Try again" onActionPress={list.retry} />
            ) : (
              <EmptyState
                title="No doctors found"
                description={specialization ? `No doctors currently offer ${specialization}.` : 'Try a different search or filter.'}
              />
            )
          }
        />
      )}
    </ScreenContainer>
  );
};

export default DoctorListScreen;
