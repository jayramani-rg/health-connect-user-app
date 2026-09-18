import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { TextField } from '../../../components/TextField/TextField';
import { colors, spacing } from '../../../theme';
import { labService } from '../../../services/labService';
import type { RootStackParamList } from '../../../navigation/types';
import { LabCard } from '../components/LabCard/LabCard';
import type { LabListItem } from '../types/lab.types';

type Props = NativeStackScreenProps<RootStackParamList, 'LabList'>;

const LabListScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [labs, setLabs] = useState<LabListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setErrorText(null);
      try {
        const response = await labService.list({ search: search || undefined, pageSize: 30 });
        setLabs(response.data.items);
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : 'Could not load labs.');
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [search],
  );

  return (
    <ScreenContainer scroll={false} style={{ padding: 0 }}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TextField
          label="Search"
          value={search}
          onChangeText={setSearch}
          placeholder="Lab name or city"
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
            <EmptyState title={errorText ? 'Something went wrong' : 'No labs found'} description={errorText ?? 'Try a different search.'} />
          }
        />
      )}
    </ScreenContainer>
  );
};

export default LabListScreen;
