import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, textRole } from '../../theme';
import { Avatar } from '../Avatar/Avatar';
import { Icon } from '../Icon/Icon';

export interface ChatHeaderTitleProps {
  name: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  onPress?: () => void;
  accessibilityHint?: string;
}

export function ChatHeaderTitle({ name, subtitle, imageUrl, onPress, accessibilityHint }: ChatHeaderTitleProps) {
  const content = (
    <>
      <Avatar name={name} imageUrl={imageUrl ?? null} size={34} />
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onPress ? <Icon name="chevron-forward" size={14} color={colors.textTertiary} /> : null}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={`${name}${subtitle ? `, ${subtitle}` : ''}`}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

export function chatHeaderTitle(props: ChatHeaderTitleProps) {
  return () => <ChatHeaderTitle {...props} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: 260,
    paddingVertical: 2,
  },
  pressed: {
    opacity: 0.6,
  },
  text: {
    flexShrink: 1,
    minWidth: 0,
  },
  name: {
    ...textRole.cardTitle,
    color: colors.text,
  },
  subtitle: {
    ...textRole.badge,
    color: colors.textSecondary,
  },
});

export default ChatHeaderTitle;
