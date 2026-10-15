import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { listItemEntering } from '../../../utils/motion';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { FilterChips, type FilterOption } from '../../../components/FilterChips/FilterChips';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { SearchBar } from '../../../components/SearchBar/SearchBar';
import { colors } from '../../../theme';
import { doctorService } from '../../../services/doctorService';
import { usePaginatedList } from '../../../hooks/usePaginatedList';
import type { RootStackParamList } from '../../../navigation/types';
import { listScreenStyles } from '../../common/styles/ListScreen.styles';
import { LocalityStrip } from '../../location/components/LocalityStrip';
import { ProfileGateDialog } from '../../profile/components/ProfileGateDialog';
import { useProfileGate } from '../../profile/hooks/useProfileGate';
import { useUserLocality } from '../../location/hooks/useUserLocality';
import { DoctorCard } from '../components/DoctorCard/DoctorCard';
import { DoctorCardSkeleton, DoctorListSkeleton } from '../components/DoctorCard/DoctorCardSkeleton';
import type { ConsultationType, DoctorListItem } from '../types/doctor.types';

type Props = NativeStackScreenProps<RootStackParamList, 'DoctorList'>;

type ModeFilter = ConsultationType | 'ALL';

const MODE_OPTIONS: FilterOption<ModeFilter>[] = [
  { label: 'All', value: 'ALL' },
  { label: 'In-clinic', value: 'IN_CLINIC' },
  { label: 'Video', value: 'VIDEO' },
  { label: 'Voice', value: 'VOICE' },
];

const PAGE_SIZE = 20;

const DoctorListScreen: React.FC<Props> = ({ route, navigation }) => {
  const specialization = route.params?.specialization ?? '';
  const [searchText, setSearchText] = useState(route.params?.search ?? '');
  const [appliedSearch, setAppliedSearch] = useState(route.params?.search ?? '');
  const [consultationType, setConsultationType] = useState<ConsultationType | ''>(route.params?.consultationType ?? '');
  const { label: localityLabel, nearParams } = useUserLocality();
  const { runWithProfileGate, dialogVisible, handleCompleteProfile, handleDismissGate } = useProfileGate();

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
    <ScreenContainer scroll={false} variant="list">
      <View style={listScreenStyles.header}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search doctors"
          onSubmitEditing={() => setAppliedSearch(searchText.trim())}
        />
      </View>
      <FilterChips
        options={MODE_OPTIONS}
        value={consultationType || 'ALL'}
        onChange={(mode) => setConsultationType(mode === 'ALL' ? '' : mode)}
        accessibilityLabel="Consultation type"
      />

      {list.loading ? (
        <View style={listScreenStyles.listContent}>
          {header}
          <DoctorListSkeleton count={6} />
        </View>
      ) : (
        <FlatList
          data={list.items}
          keyExtractor={(item) => item.doctorProfileId}
          contentContainerStyle={listScreenStyles.listContent}
          refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} tintColor={colors.primary} />}
          ListHeaderComponent={header}
          renderItem={({ item, index }) => (
            <Animated.View entering={listItemEntering(index)}>
              <DoctorCard
                doctor={item}
                showNextMode={!consultationType}
                onPress={() => navigation.navigate('DoctorProfile', { doctorProfileId: item.doctorProfileId })}
                onBook={() =>
                  runWithProfileGate(() =>
                    navigation.navigate('BookAppointment', {
                      doctorProfileId: item.doctorProfileId,
                      consultationType: consultationType || item.nextAvailableConsultationType || undefined,
                    }),
                  )
                }
              />
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
      <ProfileGateDialog visible={dialogVisible} onComplete={handleCompleteProfile} onDismiss={handleDismissGate} />
    </ScreenContainer>
  );
};

export default DoctorListScreen;
