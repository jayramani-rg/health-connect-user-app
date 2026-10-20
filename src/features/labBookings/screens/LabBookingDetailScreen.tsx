import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { ConfirmSheet } from '../../../components/ConfirmSheet/ConfirmSheet';
import { Icon } from '../../../components/Icon/Icon';
import { LabStatusBadge } from '../../../components/LabStatusBadge/LabStatusBadge';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { SkeletonList } from '../../../components/SkeletonLoader/SkeletonLoader';
import { colors } from '../../../theme';
import { labBookingService } from '../../../services/labBookingService';
import { chatSocket } from '../../../services/chatSocket';
import type { RootStackParamList } from '../../../navigation/types';
import type { LabBookingDetail, LabReport } from '../types/labBooking.types';
import { getErrorMessage } from '../../../utils/errors';
import { cancellationMessage } from '../../../utils/cancellationCopy';
import { patientProgress } from '../utils/labProgress';
import { styles } from '../styles/LabBookingDetailScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'LabBookingDetail'>;

const CANCELLABLE = ['PENDING', 'CONFIRMED', 'COLLECTOR_ASSIGNED', 'ON_THE_WAY', 'PAYMENT_PENDING'];

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

function formatFileSize(bytes: number): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const LabBookingDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const isFocused = useIsFocused();
  const [booking, setBooking] = useState<LabBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cancelSheetVisible, setCancelSheetVisible] = useState(false);
  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const response = await labBookingService.getById(bookingId);
      setBooking(response.data);
      setLoadError(null);
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Could not load this booking.'));
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [bookingId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    if (!isFocused) return undefined;
    const offNotification = chatSocket.onNotification((notification) => {
      if (notification.entityType === 'LabBooking' && notification.entityId === bookingId) {
        load();
      }
    });
    const appState = AppState.addEventListener('change', (next) => {
      if (next === 'active') load();
    });
    return () => {
      offNotification();
      appState.remove();
    };
  }, [isFocused, bookingId, load]);

  const progress = useMemo(
    () =>
      booking
        ? patientProgress({
            status: booking.status,
            collectionMethod: booking.collectionMethod,
            collectorName: booking.assignedCollectorName,
            laboratoryName: booking.laboratoryName,
          })
        : null,
    [booking],
  );

  async function handleConfirmCancel() {
    const response = await labBookingService.cancel(bookingId);
    setBooking(response.data);
  }

  function openReport(report: LabReport) {
    navigation.navigate('ReportViewer', { bookingId, reportId: report.id, label: report.label, mimeType: report.mimeType });
  }

  if (loading) {
    return (
      <ScreenContainer variant="page">
        <SkeletonList count={3} />
      </ScreenContainer>
    );
  }

  if (!booking || !progress) {
    return (
      <ScreenContainer variant="page">
        <Banner variant="error" message={loadError ?? 'Booking not found.'} />
        <View style={styles.spacer} />
        <Button
          label="Try again"
          variant="secondary"
          onPress={() => {
            setLoading(true);
            load();
          }}
        />
      </ScreenContainer>
    );
  }

  const isHomeCollection = booking.collectionMethod === 'HOME_COLLECTION';
  const canCancel = CANCELLABLE.includes(booking.status);
  const awaitingPayment = booking.status === 'PAYMENT_PENDING';
  const showReports = booking.reports.length > 0 || progress.reportsExpected;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          tintColor={colors.brand}
          colors={[colors.brand]}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.labName}>{booking.laboratoryName}</Text>
          {booking.dependentName ? (
            <Text style={styles.subtle}>
              For {booking.dependentName}
              {booking.dependentRelation ? ` (${booking.dependentRelation})` : ''}
            </Text>
          ) : null}
        </View>
        <LabStatusBadge status={booking.status} />
      </View>

      {loadError ? <Banner variant="error" message={loadError} /> : null}

      <View style={styles.card}>
        <Text style={styles.progressHeadline}>{progress.headline}</Text>
        {progress.message ? <Text style={styles.progressMessage}>{progress.message}</Text> : null}
        {awaitingPayment ? (
          <View style={styles.steps}>
            <Button label="Pay now" onPress={() => navigation.navigate('PaymentSummary', { kind: 'LAB_BOOKING', bookingId })} />
          </View>
        ) : null}
        {progress.steps.length > 0 ? (
          <View style={styles.steps} accessibilityRole="list">
            {progress.steps.map((step, index) => {
              const last = index === progress.steps.length - 1;
              const done = step.state === 'done';
              const current = step.state === 'current';
              return (
                <View key={step.label} style={styles.stepRow} accessibilityLabel={`${step.label}, ${done ? 'completed' : current ? 'in progress' : 'upcoming'}`}>
                  <View style={styles.stepRail}>
                    <View style={[styles.stepDot, done && styles.stepDotDone, current && styles.stepDotCurrent]}>
                      {done ? <Icon name="checkmark" size={12} color={colors.white} /> : current ? <View style={styles.stepDotInner} /> : null}
                    </View>
                    {!last ? <View style={[styles.stepLine, done && styles.stepLineDone]} /> : null}
                  </View>
                  <View style={[styles.stepBody, last && styles.stepBodyLast]}>
                    <Text style={[styles.stepLabel, (done || current) && styles.stepLabelActive]}>{step.label}</Text>
                    {step.detail ? <Text style={styles.stepDetail}>{step.detail}</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>

      {showReports ? (
        <>
          <Text style={styles.sectionTitle}>Reports</Text>
          <View style={[styles.card, styles.cardFlush]}>
            {booking.reports.length === 0 ? (
              <View style={styles.emptyRow}>
                <Icon name="hourglass-outline" size={20} color={colors.textTertiary} />
                <Text style={styles.emptyText}>Your report will appear here once the lab uploads it. We will notify you.</Text>
              </View>
            ) : (
              booking.reports.map((report, index) => (
                <Pressable
                  key={report.id}
                  onPress={() => openReport(report)}
                  accessibilityRole="button"
                  accessibilityLabel={`View ${report.label}`}
                  style={({ pressed }) => [styles.listRow, index > 0 && styles.listDivider, pressed && styles.listPressed]}
                >
                  <View style={styles.reportIcon}>
                    <Icon name={report.mimeType === 'application/pdf' ? 'document-text-outline' : 'image-outline'} size={20} color={colors.brand} />
                  </View>
                  <View style={styles.listBody}>
                    <Text style={styles.listTitle} numberOfLines={1}>
                      {report.label}
                    </Text>
                    <Text style={styles.listMeta} numberOfLines={1}>
                      {['Uploaded ' + formatDateTime(report.uploadedAt), formatFileSize(report.fileSize)].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                  <Text style={styles.viewChip}>View</Text>
                </Pressable>
              ))
            )}
          </View>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>Details</Text>
      <View style={styles.card}>
        <InfoRow label="Service" value={isHomeCollection ? 'Home collection' : 'Lab visit'} />
        <InfoRow label="Scheduled for" value={formatDateTime(booking.scheduledAtUtc)} />
        {isHomeCollection && booking.addressLine1 ? (
          <InfoRow label="Address" value={[booking.addressLine1, booking.addressLine2, booking.addressCity, booking.addressPincode].filter(Boolean).join(', ')} />
        ) : null}
        {isHomeCollection && booking.assignedCollectorName ? <InfoRow label="Collector" value={booking.assignedCollectorName} /> : null}
        {booking.collectedAt ? <InfoRow label="Sample collected" value={formatDateTime(booking.collectedAt)} /> : null}
        {booking.totalAmount !== null ? <InfoRow label="Total" value={`₹${booking.totalAmount}`} /> : null}
      </View>

      {booking.items.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Tests</Text>
          <View style={[styles.card, styles.cardFlush]}>
            {booking.items.map((item, index) => (
              <View key={`${item.laboratoryServiceId}-${index}`} style={[styles.listRow, index > 0 && styles.listDivider]}>
                <Icon name="flask-outline" size={18} color={colors.brand} />
                <Text style={[styles.listTitle, styles.listBody]} numberOfLines={2}>
                  {item.serviceName}
                </Text>
                {booking.totalAmount !== null ? <Text style={styles.testPrice}>₹{item.price}</Text> : null}
              </View>
            ))}
          </View>
        </>
      ) : null}

      {booking.cancellationReason ? (
        <>
          <Text style={styles.sectionTitle}>Cancellation reason</Text>
          <View style={styles.card}>
            <Text style={styles.reasonText}>{booking.cancellationReason}</Text>
          </View>
        </>
      ) : null}
      {booking.rejectionReason ? (
        <>
          <Text style={styles.sectionTitle}>Reason declined</Text>
          <View style={styles.card}>
            <Text style={styles.reasonText}>{booking.rejectionReason}</Text>
          </View>
        </>
      ) : null}

      <View style={styles.footer}>
        {canCancel ? <Button label="Cancel booking" variant="secondary" onPress={() => setCancelSheetVisible(true)} /> : null}
      </View>

      <ConfirmSheet
        visible={cancelSheetVisible}
        title="Cancel booking?"
        message={cancellationMessage('labBooking', booking.status)}
        icon="calendar-clear-outline"
        tone="danger"
        errorFallback="Could not cancel this booking. Please try again."
        actions={[
          { label: 'Cancel booking', variant: 'destructive', onPress: handleConfirmCancel },
          { label: 'Keep booking', variant: 'secondary', onPress: () => setCancelSheetVisible(false) },
        ]}
        onRequestClose={() => setCancelSheetVisible(false)}
      />
    </ScrollView>
    </SafeAreaView>
  );
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default LabBookingDetailScreen;
