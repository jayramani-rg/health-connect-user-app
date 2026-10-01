import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { SearchBar } from '../../../components/SearchBar/SearchBar';
import { colors, spacing } from '../../../theme';
import { labService } from '../../../services/labService';
import { usePaginatedList } from '../../../hooks/usePaginatedList';
import type { RootStackParamList } from '../../../navigation/types';
import type { PaginatedResponse } from '../../../types/common.types';
import { LocalityStrip } from '../../location/components/LocalityStrip';
import { useUserLocality } from '../../location/hooks/useUserLocality';
import { LabCard } from '../components/LabCard/LabCard';
import { LabCardSkeleton, LabListSkeleton } from '../components/LabCard/LabCardSkeleton';
import type { LabListItem, LabServiceSearchResultItem } from '../types/lab.types';

type Props = NativeStackScreenProps<RootStackParamList, 'LabList'>;

const PAGE_SIZE = 20;

// /lab-services/search returns one row per matching service, not per lab — group them into the same
// LabListItem shape LabCard already renders, so a category-filtered browse looks identical to the
// default "every lab" list. `state`/`isAcceptingBookings` aren't in that response (it's a service-level
// search, not the lab directory), so they're left blank/optimistic; the lab profile screen shows the
// real truth once tapped. Insertion order is kept (Map preserves it): the server already ranked rows by
// the lab's locality, so re-sorting here would undo "near you first".
function groupByLaboratory(rows: LabServiceSearchResultItem[]): LabListItem[] {
  const byLab = new Map<string, LabListItem>();
  for (const row of rows) {
    const existing = byLab.get(row.laboratoryId);
    if (existing) {
      existing.serviceCount += 1;
      existing.homeCollectionEnabled = existing.homeCollectionEnabled || row.homeCollectionEnabled;
    } else {
      byLab.set(row.laboratoryId, {
        laboratoryId: row.laboratoryId,
        name: row.laboratoryName,
        city: row.city,
        state: '',
        locality: row.locality,
        photoUrl: null,
        homeCollectionEnabled: row.homeCollectionEnabled,
        isAcceptingBookings: true,
        serviceCount: 1,
        localityMatch: row.localityMatch,
        homeCollectionAvailableAtPincode: null,
      });
    }
  }
  return Array.from(byLab.values());
}

const LabListScreen: React.FC<Props> = ({ route, navigation }) => {
  const category = route.params?.category;
  const [searchText, setSearchText] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const { label: localityLabel, nearParams, location } = useUserLocality();
  const pincode = location.pincode ?? undefined;

  useEffect(() => {
    if (category) {
      navigation.setOptions({ title: category });
    }
  }, [category, navigation]);

  const fetchPage = useCallback(
    async (page: number): Promise<PaginatedResponse<LabListItem>> => {
      if (category) {
        const response = await labService.searchServices({ category, search: appliedSearch || undefined, ...nearParams, pageSize: 100 });
        const labs = groupByLaboratory(response.data.items);
        return { items: labs, totalCount: labs.length, pageNumber: 1, pageSize: labs.length, totalPages: 1, hasNextPage: false, hasPreviousPage: false };
      }
      const response = await labService.list({ search: appliedSearch || undefined, ...nearParams, pincode, page, pageSize: PAGE_SIZE });
      return response.data;
    },
    [category, appliedSearch, nearParams, pincode],
  );

  const resetKey = [category, appliedSearch, nearParams.nearLocality, nearParams.nearCity, pincode].join('|');
  const list = usePaginatedList<LabListItem>(fetchPage, resetKey);

  const header = <LocalityStrip label={localityLabel} noun="labs" onPress={() => navigation.navigate('SelectLocation')} />;

  return (
    <ScreenContainer scroll={false} style={{ padding: 0 }}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm }}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder={category ? `Search within ${category}` : 'Lab name, area or city'}
          onSubmitEditing={() => setAppliedSearch(searchText.trim())}
        />
      </View>

      {list.loading ? (
        <View style={{ padding: spacing.lg }}>
          {header}
          <LabListSkeleton count={6} />
        </View>
      ) : (
        <FlatList
          data={list.items}
          keyExtractor={(item) => item.laboratoryId}
          contentContainerStyle={{ padding: spacing.lg }}
          refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} tintColor={colors.primary} />}
          ListHeaderComponent={header}
          renderItem={({ item }) => (
            <Animated.View entering={FadeIn.duration(220)}>
              <LabCard lab={item} onPress={() => navigation.navigate('LabProfile', { laboratoryId: item.laboratoryId })} />
            </Animated.View>
          )}
          onEndReached={list.loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            list.loadingMore ? (
              <View>
                <LabCardSkeleton />
                <LabCardSkeleton />
              </View>
            ) : list.error && list.items.length > 0 ? (
              <EmptyState title="Couldn't load more labs" description={list.error} actionLabel="Try again" onActionPress={list.retry} />
            ) : undefined
          }
          ListEmptyComponent={
            list.error ? (
              <EmptyState title="Something went wrong" description={list.error} actionLabel="Try again" onActionPress={list.retry} />
            ) : (
              <EmptyState title="No labs found" description={category ? `No labs currently offer ${category}.` : 'Try a different search.'} />
            )
          }
        />
      )}
    </ScreenContainer>
  );
};

export default LabListScreen;
