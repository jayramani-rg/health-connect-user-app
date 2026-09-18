import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { colors, spacing, typography } from '../../../theme';
import { useAppSelector } from '../../../store';
import { labBookingService } from '../../../services/labBookingService';
import { fetchAsDataUri } from '../../../utils/authenticatedFile';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportViewer'>;

const ReportViewerScreen: React.FC<Props> = ({ route }) => {
  const { bookingId, reportId, label } = route.params;
  const accessToken = useAppSelector((state) => state.authData.tokens?.accessToken ?? null);
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const path = labBookingService.reportDownloadPath(bookingId, reportId);
        const uri = await fetchAsDataUri(path, accessToken);
        if (active) setDataUri(uri);
      } catch (error) {
        if (active) setErrorText(error instanceof Error ? error.message : 'Could not load this report.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [bookingId, reportId, accessToken]);

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }} maximumZoomScale={3} minimumZoomScale={1}>
      <Text style={{ ...typography.h2, marginBottom: spacing.md }}>{label}</Text>

      {loading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl }}>
          <ActivityIndicator color={colors.brand} />
        </View>
      )}

      {!loading && errorText && <Banner variant="error" message={errorText} />}

      {!loading && dataUri && (
        <>
          {dataUri.startsWith('data:image') ? (
            <Image source={{ uri: dataUri }} style={{ width: '100%', aspectRatio: 0.75, borderRadius: 8 }} resizeMode="contain" />
          ) : (
            <Banner
              variant="info"
              message="This report isn't an image this app can preview yet. Ask your lab to re-upload it as a photo, or view it from a device that can open the file type directly."
            />
          )}
        </>
      )}
    </ScrollView>
  );
};

export default ReportViewerScreen;
