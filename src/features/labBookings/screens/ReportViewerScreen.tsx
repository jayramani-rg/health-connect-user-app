import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Pdf from 'react-native-pdf';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { colors, layout, spacing, typography } from '../../../theme';
import { store } from '../../../store';
import { labBookingService } from '../../../services/labBookingService';
import { downloadToLocalFile, fetchAsDataUri, FileRequestError } from '../../../utils/authenticatedFile';
import type { RootStackParamList } from '../../../navigation/types';
import { getErrorMessage } from '../../../utils/errors';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportViewer'>;

function currentToken(): string | null {
  return store.getState().authData.tokens?.accessToken ?? null;
}

async function withSession<T>(bookingId: string, run: (token: string | null) => Promise<T>): Promise<T> {
  try {
    return await run(currentToken());
  } catch (error) {
    if (!(error instanceof FileRequestError) || error.status !== 401) throw error;
    await labBookingService.getById(bookingId);
    return run(currentToken());
  }
}

const ReportViewerScreen: React.FC<Props> = ({ route }) => {
  const { bookingId, reportId, label, mimeType } = route.params;
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
          const localPath = await withSession(bookingId, token => downloadToLocalFile(path, token, `${reportId}.pdf`));
          if (active) setPdfPath(localPath);
        } else if (isImage) {
          const uri = await withSession(bookingId, token => fetchAsDataUri(path, token));
          if (active) setDataUri(uri);
        }
      } catch (error) {
        if (active) setErrorText(getErrorMessage(error, 'Could not load this report. Check your connection and try again.'));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [bookingId, reportId, isPdf, isImage, retryToken]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }} edges={['bottom']}>
      <View style={{ paddingHorizontal: layout.gutter, paddingVertical: spacing.md }}>
        <Text style={typography.title} numberOfLines={2}>
          {label}
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm }}>
          <ActivityIndicator color={colors.brand} />
          <Text style={{ ...typography.caption, color: colors.textSecondary }}>Opening your report</Text>
        </View>
      ) : null}

      {!loading && errorText ? (
        <View style={{ padding: layout.gutter, gap: spacing.md }}>
          <Banner variant="error" message={errorText} />
          <Button label="Try again" variant="secondary" onPress={() => setRetryToken(t => t + 1)} />
        </View>
      ) : null}

      {!loading && !errorText && isPdf && pdfPath ? (
        <Pdf
          source={{ uri: pdfPath }}
          style={{ flex: 1, width: '100%', backgroundColor: colors.canvas }}
          trustAllCerts={false}
          onError={error => setErrorText(getErrorMessage(error, 'Could not open this PDF.'))}
        />
      ) : null}

      {!loading && !errorText && isImage && dataUri ? (
        <ScrollView contentContainerStyle={{ padding: layout.gutter, flexGrow: 1 }} maximumZoomScale={3} minimumZoomScale={1}>
          <Image source={{ uri: dataUri }} style={{ width: '100%', aspectRatio: 0.75, borderRadius: 8 }} resizeMode="contain" accessibilityLabel={label} />
        </ScrollView>
      ) : null}

      {!loading && !errorText && !isPdf && !isImage ? (
        <View style={{ padding: layout.gutter }}>
          <Banner variant="info" message="This file type cannot be previewed in the app. Ask your lab to upload it as a PDF or photo." />
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default ReportViewerScreen;
