import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { meetingService } from '../../../services/meetingService';
import { colors, fontFamily, radius, spacing } from '../../../theme';
import { callTypeLabel } from '../../calls/utils/callFormat';
import type { Meeting } from '../types/meeting.types';
import { NOTE_FIELDS, formatMeetingDuration, meetingStatusLabel } from '../utils/meetingFormat';

export const MeetingCard: React.FC<{ appointmentId: string }> = ({ appointmentId }) => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      meetingService
        .getByAppointment(appointmentId)
        .then((response) => {
          if (active) {
            setMeeting(response.data);
          }
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, [appointmentId]),
  );

  if (!meeting) {
    return null;
  }

  const attempts = meeting.calls.length;
  const note = meeting.note;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{`${callTypeLabel(meeting.meetingType)} consultation`}</Text>
      <Text style={styles.meta}>
        {[
          meetingStatusLabel(meeting.status),
          `${attempts} ${attempts === 1 ? 'call attempt' : 'call attempts'}`,
          meeting.durationSeconds > 0 ? formatMeetingDuration(meeting.durationSeconds) : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Text>

      {note ? (
        <View style={styles.notes}>
          <Text style={styles.notesHeading}>Notes from your doctor</Text>
          {NOTE_FIELDS.map((field) => {
            const value = note[field.key];
            return value ? (
              <View key={field.key} style={styles.noteBlock}>
                <Text style={styles.noteLabel}>{field.label}</Text>
                <Text style={styles.noteValue}>{value}</Text>
              </View>
            ) : null;
          })}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  meta: {
    marginTop: spacing.xs,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  notes: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  notesHeading: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.text,
  },
  noteBlock: {
    gap: 2,
  },
  noteLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  noteValue: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});
