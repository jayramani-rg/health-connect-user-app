import React from 'react';
import { Text, View } from 'react-native';

import { Card } from '../../../components/Card/Card';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { colors, spacing, typography } from '../../../theme';
import { useAppSelector } from '../../../store';
import packageJson from '../../../../package.json';

export default function SettingsScreen() {
  const authUser = useAppSelector((state) => state.authData.user);

  return (
    <ScreenContainer>
      <View style={{ gap: spacing.xs }}>
        <Text style={[typography.label, { color: colors.inkFaint }]}>ACCOUNT</Text>
        <Card variant="outline" elevation="none">
          <View style={{ gap: spacing.xs }}>
            <Text style={typography.bodyStrong}>Phone number</Text>
            <Text style={[typography.body, { color: colors.inkSoft }]}>{authUser?.phone ?? 'Not available'}</Text>
          </View>
        </Card>
      </View>

      <View style={{ gap: spacing.xs }}>
        <Text style={[typography.label, { color: colors.inkFaint }]}>ABOUT</Text>
        <Card variant="outline" elevation="none">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={typography.bodyStrong}>App version</Text>
            <Text style={[typography.body, { color: colors.inkSoft }]}>{packageJson.version}</Text>
          </View>
        </Card>
      </View>
    </ScreenContainer>
  );
}
