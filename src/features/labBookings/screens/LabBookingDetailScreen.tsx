import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { LabStatusBadge } from '../../../components/LabStatusBadge/LabStatusBadge';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { colors, radius, spacing, typography } from '../../../theme';
import { activeopacity } from '../../../utils/helpers';
import { labBookingService } from '../../../services/labBookingService';
import type { RootStackParamList } from '../../../navigation/types';
import type { LabBookingDetail } from '../types/labBooking.types';

type Props = NativeStackScreenProps<RootStackParamList, 'LabBookingDetail'>;

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

const TRACKING_STEPS: { status: string; label: string }[] = [
  { status: 'CONFIRMED', label: 'Booking confirmed' },
  { status: 'COLLECTOR_ASSIGNED', label: 'Collector assigned' },
  { status: 'ON_THE_WAY', label: 'On the way' },
  { status: 'SAMPLE_COLLECTED', label: 'Sample collected' },
  { status: 'PROCESSING', label: 'Processing' },
  { status: 'REPORT_READY', label: 'Report ready' },
];

const LabBookingDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<LabBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await labBookingService.getById(bookingId);
      setBooking(response.data);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not load this booking.');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function confirmCancel() {
    Alert.alert('Cancel booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, cancel',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          setActionError(null);
          try {
            const response = await labBookingService.cancel(bookingId);
            setBooking(response.data);
          } catch (error) {
            setActionError(error instanceof Error ? error.message : 'This action could not be completed.');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (!booking) {
    return (
      <ScreenContainer>
        <Banner variant="error" message={actionError ?? 'Booking not found.'} />
      </ScreenContainer>
    );
  }

  const isHomeCollection = booking.collectionMethod === 'HOME_COLLECTION';
  const canCancel = ['PENDING', 'CONFIRMED', 'COLLECTOR_ASSIGNED', 'ON_THE_WAY'].includes(booking.status);
  const currentTrackingIndex = TRACKING_STEPS.findIndex((s) => s.status === booking.status);

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text style={typography.h2}>{booking.laboratoryName}</Text>
          {booking.dependentName ? (
            <Text style={{ ...typography.body, color: colors.textSecondary }}>For {booking.dependentName} ({booking.dependentRelation})</Text>
          ) : null}
        </View>
        <LabStatusBadge status={booking.status} />
      </View>

      {actionError && <Banner variant="error" message={actionError} />}
      {booking.status === 'COLLECTION_FAILED' && (
        <Banner variant="warning" message="The last collection attempt was unsuccessful — the lab will reassign a new time." />
      )}

      {currentTrackingIndex >= 0 && isHomeCollection && (
        <View style={{ marginBottom: spacing.md }}>
          {TRACKING_STEPS.map((s, i) => (
            <View key={s.status} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i <= currentTrackingIndex ? colors.brand : colors.border,
                  marginRight: spacing.sm,
                }}
              />
              <Text style={{ ...typography.body, color: i <= currentTrackingIndex ? colors.text : colors.textSecondary }}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md }}>
        <Row label="Method" value={isHomeCollection ? 'Home collection' : 'Lab visit'} />
        <Row label="Scheduled for" value={formatDateTime(booking.scheduledAtUtc)} />
        {booking.totalAmount !== null && <Row label="Total" value={`₹${booking.totalAmount}`} />}
        {isHomeCollection && booking.addressLine1 && (
          <Row label="Address" value={[booking.addressLine1, booking.addressLine2, booking.addressCity, booking.addressPincode].filter(Boolean).join(', ')} />
        )}
        {booking.assignedCollectorName && <Row label="Collector" value={booking.assignedCollectorName} />}
      </View>

      {booking.items.length > 0 && (
        <>
          <Text style={sectionTitle}>Tests</Text>
          {booking.items.map((item, i) => (
            <Text key={i} style={typography.body}>
              {item.serviceName}{booking.totalAmount !== null ? ` — ₹${item.price}` : ''}
            </Text>
          ))}
        </>
      )}

      {booking.cancellationReason && (
        <>
          <Text style={sectionTitle}>Cancellation reason</Text>
          <Text style={typography.body}>{booking.cancellationReason}</Text>
        </>
      )}
      {booking.rejectionReason && (
        <>
          <Text style={sectionTitle}>Reason declined</Text>
          <Text style={typography.body}>{booking.rejectionReason}</Text>
        </>
      )}

      {booking.reports.length > 0 && (
        <>
          <Text style={sectionTitle}>Reports</Text>
          {booking.reports.map((r) => (
            <TouchableOpacity
              key={r.id}
              activeOpacity={activeopacity}
              style={reportRowStyle}
              onPress={() => navigation.navigate('ReportViewer', { bookingId, reportId: r.id, label: r.label, mimeType: r.mimeType })}
            >
              <Text style={typography.bodyStrong}>{r.label}</Text>
              <Text style={{ ...typography.caption, color: colors.brand }}>View</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {canCancel && (
        <View style={{ marginTop: spacing.lg }}>
          <Button label="Cancel booking" variant="secondary" disabled={actionLoading} onPress={confirmCancel} />
        </View>
      )}
    </ScreenContainer>
  );
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
      <Text style={{ ...typography.caption, color: colors.textSecondary }}>{label}</Text>
      <Text style={{ ...typography.bodyStrong, color: colors.text, maxWidth: '65%', textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

const sectionTitle = { ...typography.title, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm };
const reportRowStyle = {
  flexDirection: 'row' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'center' as const,
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.md,
  padding: spacing.md,
  marginBottom: spacing.sm,
};

export default LabBookingDetailScreen;
