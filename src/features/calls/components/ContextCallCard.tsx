import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../../theme';
import type { CallContextRef } from '../types/call.types';
import { CallButtons } from './CallButtons';

export interface ContextCallCardProps {
  context: CallContextRef;
  title: string;
  hint?: string;
  allowVideo?: boolean;
}

export const ContextCallCard: React.FC<ContextCallCardProps> = ({ context, title, hint, allowVideo = true }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    <View style={styles.buttons}>
      <CallButtons context={context} variant="card" allowVideo={allowVideo} />
    </View>
  </View>
);

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
  hint: {
    marginTop: spacing.xs,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  buttons: {
    marginTop: spacing.md,
  },
});
