import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { CategoryGrid } from '../../../components/CategoryGrid/CategoryGrid';
import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { colors, spacing, typography } from '../../../theme';
import { activeopacity } from '../../../utils/helpers';
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
      <Text style={{ ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg }}>
        Pick a specialization to see matching doctors, or browse the full list.
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
        onPress={() => navigation.navigate('DoctorList')}
      >
        <Text style={{ ...typography.bodyStrong, color: colors.brand }}>Browse all doctors</Text>
        <Text style={{ ...typography.bodyStrong, color: colors.brand }}>{'→'}</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={{ paddingVertical: spacing.xxl, alignItems: 'center' }}>
          <ActivityIndicator color={colors.brand} />
        </View>
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
