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
import { specializationCategoryService, type ApprovedSpecializationCategory } from '../../../services/specializationCategoryService';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DoctorCategories'>;

const DoctorCategoriesScreen: React.FC<Props> = ({ navigation }) => {
  const [categories, setCategories] = useState<ApprovedSpecializationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorText(null);
    try {
      const response = await specializationCategoryService.getApproved();
      setCategories(response.data);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Could not load specializations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScreenContainer>
      <Text style={typography.h2}>What do you need care for?</Text>
      <Text style={{ ...typography.body, color: colors.inkSoft, marginTop: spacing.xs, marginBottom: spacing.md }}>
        Pick a specialization to see matching doctors, or browse the full list.
      </Text>

      <Card variant="outline" elevation="none" onPress={() => navigation.navigate('DoctorList')} style={{ marginBottom: spacing.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ ...typography.bodyStrong, color: colors.primary }}>Browse all doctors</Text>
          <Icon name="arrow-forward" size={18} color={colors.primary} />
        </View>
      </Card>

      {loading ? (
        <SkeletonList count={3} />
      ) : categories.length === 0 ? (
        <EmptyState
          title={errorText ? 'Something went wrong' : 'No specializations yet'}
          description={errorText ?? 'Check back soon, or browse all doctors directly.'}
        />
      ) : (
        <CategoryGrid
          categories={categories}
          onSelect={(category) => navigation.navigate('DoctorList', { specialization: category.name })}
        />
      )}
    </ScreenContainer>
  );
};

export default DoctorCategoriesScreen;
