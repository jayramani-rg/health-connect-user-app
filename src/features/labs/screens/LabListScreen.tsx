import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { TextField } from '../../../components/TextField/TextField';
import { colors, spacing } from '../../../theme';
import { labService } from '../../../services/labService';
import type { RootStackParamList } from '../../../navigation/types';
import { LabCard } from '../components/LabCard/LabCard';
import type { LabListItem, LabServiceSearchResultItem } from '../types/lab.types';

type Props = NativeStackScreenProps<RootStackParamList, 'LabList'>;

// /lab-services/search returns one row per matching service, not per lab — group them into the same
// LabListItem shape LabCard already renders, so a category-filtered browse looks identical to the
// default "every lab" list. `state`/`isAcceptingBookings` aren't in that response (it's a service-level
// search, not the lab directory), so they're left blank/optimistic; the lab profile screen shows the
// real truth once tapped.
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
        homeCollectionEnabled: row.homeCollectionEnabled,
        isAcceptingBookings: true,
        serviceCount: 1,
      });
    }
  }
  return Array.from(byLab.values()).sort((a, b) => a.name.localeCompare(b.name));
}

const LabListScreen: React.FC<Props> = ({ route, navigation }) => {
  const category = route.params?.category;
  const [search, setSearch] = useState('');
  const [labs, setLabs] = useState<LabListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      navigation.setOptions({ title: category });
    }
  }, [category, navigation]);

  const load = useCallback(
    async (isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setErrorText(null);
      try {
        if (category) {
          const response = await labService.searchServices({ category, search: search || undefined, pageSize: 100 });
          setLabs(groupByLaboratory(response.data.items));
        } else {
          const response = await labService.list({ search: search || undefined, pageSize: 30 });
          setLabs(response.data.items);
        }
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : 'Could not load labs.');
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [search, category],
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScreenContainer scroll={false} style={{ padding: 0 }}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TextField
          label="Search"
          value={search}
          onChangeText={setSearch}
          placeholder={category ? `Search within ${category}` : 'Lab name or city'}
          onSubmitEditing={() => load()}
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : (
        <FlatList
          data={labs}
          keyExtractor={(item) => item.laboratoryId}
          contentContainerStyle={{ padding: spacing.lg }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
          renderItem={({ item }) => (
            <LabCard lab={item} onPress={() => navigation.navigate('LabProfile', { laboratoryId: item.laboratoryId })} />
          )}
          ListEmptyComponent={
            <EmptyState
              title={errorText ? 'Something went wrong' : 'No labs found'}
              description={errorText ?? (category ? `No labs currently offer ${category}.` : 'Try a different search.')}
            />
          }
        />
      )}
    </ScreenContainer>
  );
};

export default LabListScreen;
