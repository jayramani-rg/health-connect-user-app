import React from 'react';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Button } from '../../../../components/Button/Button';
import { Icon } from '../../../../components/Icon/Icon';
import { colors } from '../../../../theme';
import { fadeEntering } from '../../../../utils/motion';
import type { BookingRequest } from '../../types/appointment.types';
import { formatCountdown, isActiveRequest, queueMessage } from '../../utils/slotState';
import { styles } from './styles/BookingFooter.styles';

const EXPIRING_SOON_MS = 2 * 60 * 1000;

export interface BookingSelectionSummary {
  dateLabel: string;
  timeLabel: string;
  joinsQueue: boolean;
}

export interface BookingFooterProps {
  selection: BookingSelectionSummary | null;
  detail: string;
  request: BookingRequest | null;
  remainingMs: number | null;
  submitting: boolean;
  cancelling: boolean;
  error: string | null;
  onContinue: () => void;
  onLeaveQueue: () => void;
  onResumePayment: () => void;
  onDismiss: () => void;
}

export function BookingFooter({
  selection,
  detail,
  request,
  remainingMs,
  submitting,
  cancelling,
  error,
  onContinue,
  onLeaveQueue,
  onResumePayment,
  onDismiss,
}: BookingFooterProps) {
  const errorRow = error ? (
    <View style={styles.errorRow} accessibilityLiveRegion="polite">
      <Icon name="alert-circle" size={16} color={colors.error} />
      <Text style={styles.errorText}>{error}</Text>
    </View>
  ) : null;

  if (request && request.status === 'WAITING') {
    const message = queueMessage(request);
    return (
      <Animated.View entering={fadeEntering()} style={styles.container}>
        {errorRow}
        <View style={styles.statusRow} accessibilityLiveRegion="polite">
          <View style={[styles.positionBadge, request.queuePosition === 1 && styles.positionBadgeNext]}>
            <Text style={[styles.positionText, request.queuePosition === 1 && styles.positionTextNext]}>
              {request.queuePosition ?? '–'}
            </Text>
          </View>
          <View style={styles.statusText}>
            <Text style={styles.title}>{message.title}</Text>
            <Text style={styles.body}>{message.body}</Text>
          </View>
        </View>
        <Button label="Leave queue" variant="secondary" onPress={onLeaveQueue} loading={cancelling} />
      </Animated.View>
    );
  }

  if (request && request.status === 'RESERVED') {
    const expiringSoon = remainingMs !== null && remainingMs <= EXPIRING_SOON_MS;
    return (
      <Animated.View entering={fadeEntering()} style={styles.container}>
        {errorRow}
        <View style={styles.statusRow} accessibilityLiveRegion="polite">
          <View style={[styles.iconBadge, styles.iconBadgeSuccess]}>
            <Icon name="time-outline" size={18} color={colors.brand} />
          </View>
          <View style={styles.statusText}>
            <Text style={styles.title}>Slot reserved for you</Text>
            <Text style={[styles.body, expiringSoon && styles.bodyWarning]}>
              {remainingMs === null
                ? 'Complete payment to confirm it.'
                : remainingMs > 0
                  ? `${expiringSoon ? 'Expiring soon. ' : ''}Hold ends in ${formatCountdown(remainingMs)}`
                  : 'Your hold is ending. Checking status…'}
            </Text>
          </View>
        </View>
        <Button label="Continue to payment" onPress={onResumePayment} disabled={remainingMs === 0} />
      </Animated.View>
    );
  }

  if (request && !isActiveRequest(request) && request.status !== 'CONFIRMED') {
    const message = queueMessage(request);
    return (
      <Animated.View entering={fadeEntering()} style={styles.container}>
        <View style={styles.statusRow} accessibilityLiveRegion="polite">
          <View style={[styles.iconBadge, message.tone === 'warning' && styles.iconBadgeWarning]}>
            <Icon name={message.tone === 'warning' ? 'alert-circle-outline' : 'information-circle-outline'} size={18} color={message.tone === 'warning' ? colors.warning : colors.textSecondary} />
          </View>
          <View style={styles.statusText}>
            <Text style={styles.title}>{message.title}</Text>
            <Text style={styles.body}>{message.body}</Text>
          </View>
        </View>
        <Button label="Choose another time" variant="secondary" onPress={onDismiss} />
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      {errorRow}
      <View style={styles.summaryRow}>
        <View style={styles.summaryText}>
          {selection ? (
            <>
              <Text style={styles.title} numberOfLines={1}>
                {selection.dateLabel} · {selection.timeLabel}
              </Text>
              <Text style={styles.body} numberOfLines={1}>
                {selection.joinsQueue ? 'Currently held by another patient. You will join the queue.' : detail}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.titleMuted}>Select a time</Text>
              <Text style={styles.body} numberOfLines={1}>
                {detail}
              </Text>
            </>
          )}
        </View>
        <View style={styles.cta}>
          <Button
            label={selection?.joinsQueue ? 'Join queue' : 'Continue'}
            onPress={onContinue}
            disabled={!selection}
            loading={submitting}
          />
        </View>
      </View>
    </View>
  );
}
