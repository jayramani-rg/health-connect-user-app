import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { CategoryGrid } from '../../../components/CategoryGrid/CategoryGrid';
import { Card } from '../../../components/Card/Card';
import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { Icon } from '../../../components/Icon/Icon';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { SkeletonList } from '../../../components/SkeletonLoader/SkeletonLoader';
import { colors, spacing, typography } from '../../../theme';
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
      <Text style={{ ...typography.body, color: colors.inkSoft, marginTop: spacing.xs, marginBottom: spacing.md }}>
        Pick a category to see every lab that offers it, or browse the full list.
      </Text>

      <Card variant="outline" elevation="none" onPress={() => navigation.navigate('LabList')} style={{ marginBottom: spacing.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ ...typography.bodyStrong, color: colors.primary }}>Browse all labs</Text>
          <Icon name="arrow-forward" size={18} color={colors.primary} />
        </View>
      </Card>

      {loading ? (
        <SkeletonList count={3} />
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
