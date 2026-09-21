import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Pdf from 'react-native-pdf';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { colors, spacing, typography } from '../../../theme';
import { useAppSelector } from '../../../store';
import { labBookingService } from '../../../services/labBookingService';
import { downloadToLocalFile, fetchAsDataUri } from '../../../utils/authenticatedFile';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportViewer'>;

const ReportViewerScreen: React.FC<Props> = ({ route }) => {
  const { bookingId, reportId, label, mimeType } = route.params;
  const accessToken = useAppSelector((state) => state.authData.tokens?.accessToken ?? null);
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const isPdf = mimeType === 'application/pdf';
  const isImage = mimeType.startsWith('image/');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorText(null);
    (async () => {
      try {
        const path = labBookingService.reportDownloadPath(bookingId, reportId);
        if (isPdf) {
          const localPath = await downloadToLocalFile(path, accessToken, `${reportId}.pdf`);
          if (active) setPdfPath(localPath);
        } else if (isImage) {
          const uri = await fetchAsDataUri(path, accessToken);
          if (active) setDataUri(uri);
        }
      } catch (error) {
        if (active) setErrorText(error instanceof Error ? error.message : 'Could not load this report.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [bookingId, reportId, accessToken, isPdf, isImage, retryToken]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <View style={{ padding: spacing.lg, paddingBottom: 0 }}>
        <Text style={typography.h2}>{label}</Text>
      </View>

      {loading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.brand} />
        </View>
      )}

      {!loading && errorText && (
        <View style={{ padding: spacing.lg }}>
          <Banner variant="error" message={errorText} />
          <TouchableOpacity onPress={() => setRetryToken((t) => t + 1)} style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}>
            <Text style={{ ...typography.bodyStrong, color: colors.brand }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !errorText && isPdf && pdfPath && (
        <Pdf
          source={{ uri: pdfPath }}
          style={{ flex: 1, width: '100%' }}
          onError={(error) => setErrorText(error instanceof Error ? error.message : 'Could not open this PDF.')}
        />
      )}

      {!loading && !errorText && isImage && dataUri && (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }} maximumZoomScale={3} minimumZoomScale={1}>
          <Image source={{ uri: dataUri }} style={{ width: '100%', aspectRatio: 0.75, borderRadius: 8 }} resizeMode="contain" />
        </ScrollView>
      )}

      {!loading && !errorText && !isPdf && !isImage && (
        <View style={{ padding: spacing.lg }}>
          <Banner
            variant="info"
            message="This file type can't be previewed in the app yet. Ask your lab to re-upload it as a PDF or photo."
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default ReportViewerScreen;
