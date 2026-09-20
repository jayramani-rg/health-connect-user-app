import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { CategoryGrid } from '../../../components/CategoryGrid/CategoryGrid';
import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { colors, spacing, typography } from '../../../theme';
import { activeopacity } from '../../../utils/helpers';
import { labTestCategoryService, type ApprovedLabTestCategory } from '../../../services/labTestCategoryService';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'LabCategories'>;

const LabCategoriesScreen: React.FC<Props> = ({ navigation }) => {
  const [categories, setCategories] = useState<ApprovedLabTestCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorText(null);
    try {
      const response = await labTestCategoryService.getApproved();
      setCategories(response.data);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Could not load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScreenContainer>
      <Text style={typography.h2}>What are you testing for?</Text>
      <Text style={{ ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg }}>
        Pick a category to see every lab that offers it, or browse the full list.
      </Text>

      <TouchableOpacity
        activeOpacity={activeopacity}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.brandSoft,
          borderRadius: 12,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          marginBottom: spacing.xl,
        }}
        onPress={() => navigation.navigate('LabList')}
      >
        <Text style={{ ...typography.bodyStrong, color: colors.brand }}>Browse all labs</Text>
        <Text style={{ ...typography.bodyStrong, color: colors.brand }}>{'→'}</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={{ paddingVertical: spacing.xxl, alignItems: 'center' }}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : categories.length === 0 ? (
        <EmptyState
          title={errorText ? 'Something went wrong' : 'No categories yet'}
          description={errorText ?? 'Check back soon, or browse all labs directly.'}
        />
      ) : (
        <CategoryGrid
          categories={categories}
          onSelect={(category) => navigation.navigate('LabList', { category: category.name })}
        />
      )}
    </ScreenContainer>
  );
};

export default LabCategoriesScreen;
