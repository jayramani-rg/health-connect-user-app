import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { colors, radius, spacing, typography } from '../../../theme';
import { activeopacity } from '../../../utils/helpers';
import { labService } from '../../../services/labService';
import type { RootStackParamList } from '../../../navigation/types';
import type { LabDetail } from '../types/lab.types';

type Props = NativeStackScreenProps<RootStackParamList, 'LabProfile'>;

const LabProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { laboratoryId } = route.params;
  const [lab, setLab] = useState<LabDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await labService.getById(laboratoryId);
        if (active) setLab(response.data);
      } catch (error) {
        if (active) setErrorText(error instanceof Error ? error.message : 'Could not load this lab.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [laboratoryId]);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (!lab) {
    return (
      <ScreenContainer>
        <Banner variant="error" message={errorText ?? 'Lab not found.'} />
      </ScreenContainer>
    );
  }

  const selectedTotal = lab.services
    .filter((s) => selectedIds.has(s.id))
    .reduce((sum, s) => sum + (s.discountPrice ?? s.price), 0);

  return (
    <ScreenContainer>
      <Text style={typography.h2}>{lab.name}</Text>
      <Text style={{ ...typography.body, color: colors.textSecondary, marginTop: 2 }}>
        {lab.address}, {lab.city}, {lab.state} {lab.pincode}
      </Text>
      {lab.operatingHours && (
        <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 4 }}>Open {lab.operatingHours}</Text>
      )}

      {!lab.isAcceptingBookings && <Banner variant="warning" message="This lab is not accepting new bookings right now." />}

      <Text style={{ ...typography.title, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm }}>Tests & Packages</Text>
      {lab.services.map((service) => {
        const selected = selectedIds.has(service.id);
        return (
          <TouchableOpacity
            key={service.id}
            activeOpacity={activeopacity}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: selected ? colors.brandSoft : colors.surface,
              borderWidth: 1,
              borderColor: selected ? colors.brand : colors.border,
              borderRadius: radius.md,
              padding: spacing.md,
              marginBottom: spacing.sm,
            }}
            onPress={() => toggle(service.id)}
          >
            <View style={{ flex: 1 }}>
              <Text style={typography.bodyStrong}>{service.name}</Text>
              <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 2 }}>
                {service.category}
                {service.estimatedReportHours ? ` · Report in ~${service.estimatedReportHours}h` : ''}
              </Text>
            </View>
            <Text style={{ ...typography.bodyStrong, color: colors.brand }}>₹{service.discountPrice ?? service.price}</Text>
          </TouchableOpacity>
        );
      })}

      <View style={{ marginTop: spacing.xl }}>
        <Button
          label={selectedIds.size > 0 ? `Continue with ${selectedIds.size} selected (₹${selectedTotal})` : 'Select at least one test'}
          disabled={selectedIds.size === 0 || !lab.isAcceptingBookings}
          onPress={() => navigation.navigate('BookLabService', { laboratoryId, serviceIds: Array.from(selectedIds) })}
        />
      </View>
    </ScreenContainer>
  );
};

export default LabProfileScreen;
