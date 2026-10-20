import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IoniconsIconName } from '../Icon/Icon';
import { colors, motion, spacing } from '../../theme';
import { getErrorMessage } from '../../utils/errors';
import { closeDialog, subscribeDialogs, type DialogRequest } from './dialogStore';
import { styles } from './styles/Dialog.styles';
import type { DialogAction, DialogActionVariant, DialogSheetProps, DialogTone } from './types/Dialog.types';

const TONE_META: Record<DialogTone, { icon: IoniconsIconName; fg: string; bg: string }> = {
  danger: { icon: 'alert-circle-outline', fg: colors.error, bg: colors.errorSoft },
  primary: { icon: 'help-circle-outline', fg: colors.brand, bg: colors.brandSoft },
  warning: { icon: 'warning-outline', fg: colors.warning, bg: colors.warningSoft },
  success: { icon: 'checkmark-circle-outline', fg: colors.success, bg: colors.successSoft },
  info: { icon: 'information-circle-outline', fg: colors.brand, bg: colors.brandSoft },
};

const BUTTON_STYLE: Record<DialogActionVariant, object> = {
  primary: styles.buttonPrimary,
  danger: styles.buttonDanger,
  secondary: styles.buttonSecondary,
  ghost: styles.buttonGhost,
};

const LABEL_STYLE: Record<DialogActionVariant, object> = {
  primary: styles.labelFilled,
  danger: styles.labelFilled,
  secondary: styles.labelSecondary,
  ghost: styles.labelGhost,
};

const ENTER = { duration: motion.duration.base, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System };
const EXIT = { duration: motion.duration.fast, easing: Easing.in(Easing.quad), reduceMotion: ReduceMotion.System };
const SHEET_OFFSET = 48;

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return !!value && typeof (value as PromiseLike<unknown>).then === 'function';
}

export function DialogSheet({
  visible,
  title,
  message,
  icon,
  tone = 'primary',
  actions,
  dismissible = true,
  errorFallback = 'Something went wrong. Please try again.',
  onDismiss,
  onRequestClose,
}: DialogSheetProps) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const [busyIndex, setBusyIndex] = useState<number | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const busyRef = useRef(false);
  const aliveRef = useRef(true);
  const progress = useSharedValue(0);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (visible) {
      busyRef.current = false;
      setBusyIndex(null);
      setErrorText(null);
      setMounted(true);
      progress.value = withTiming(1, ENTER);
      return undefined;
    }
    progress.value = withTiming(0, EXIT);
    const timer = setTimeout(() => {
      if (aliveRef.current) setMounted(false);
    }, EXIT.duration + 40);
    return () => clearTimeout(timer);
  }, [visible, progress]);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, progress.value * 1.6),
    transform: [{ translateY: (1 - progress.value) * SHEET_OFFSET }],
  }));

  const requestClose = useCallback(() => {
    if (busyRef.current || !dismissible) return;
    onDismiss?.();
    onRequestClose();
  }, [dismissible, onDismiss, onRequestClose]);

  const runAction = useCallback(
    (action: DialogAction, index: number) => {
      if (busyRef.current) return;
      let result: unknown;
      try {
        result = action.onPress?.();
      } catch (error) {
        setErrorText(getErrorMessage(error, errorFallback));
        return;
      }
      if (!isPromiseLike(result)) {
        onRequestClose();
        return;
      }
      busyRef.current = true;
      setBusyIndex(index);
      setErrorText(null);
      Promise.resolve(result).then(
        () => {
          busyRef.current = false;
          if (!aliveRef.current) return;
          setBusyIndex(null);
          onRequestClose();
        },
        (error: unknown) => {
          busyRef.current = false;
          if (!aliveRef.current) return;
          setBusyIndex(null);
          setErrorText(getErrorMessage(error, errorFallback));
        },
      );
    },
    [errorFallback, onRequestClose],
  );

  if (!mounted) return null;

  const meta = TONE_META[tone];
  const busy = busyIndex !== null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={requestClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.scrim, scrimStyle]}>
          <Pressable
            style={styles.scrimPressable}
            onPress={requestClose}
            accessibilityRole="button"
            accessibilityLabel="Close dialog"
            disabled={busy || !dismissible}
          />
        </Animated.View>
        <Animated.View
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.md }, sheetStyle]}
          accessibilityViewIsModal
          accessibilityLiveRegion="polite"
        >
          <View style={styles.handle} />
          <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
            <Icon name={icon ?? meta.icon} size={24} color={meta.fg} />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          {errorText ? (
            <View style={styles.error} accessibilityRole="alert">
              <Icon name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{errorText}</Text>
            </View>
          ) : null}
          <View style={styles.actions}>
            {actions.map((action, index) => {
              const variant = action.variant ?? (index === 0 ? 'primary' : 'secondary');
              const loading = busyIndex === index;
              const filled = variant === 'primary' || variant === 'danger';
              return (
                <Pressable
                  key={`${action.label}-${index}`}
                  onPress={() => runAction(action, index)}
                  disabled={busy}
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                  accessibilityHint={action.accessibilityHint}
                  accessibilityState={{ disabled: busy, busy: loading }}
                  style={({ pressed }) => [
                    styles.button,
                    BUTTON_STYLE[variant],
                    pressed && styles.buttonPressed,
                    busy && !loading && styles.buttonDisabled,
                  ]}
                >
                  {loading ? <ActivityIndicator size="small" color={filled ? colors.white : colors.brand} /> : null}
                  <Text style={[styles.label, LABEL_STYLE[variant]]} numberOfLines={1}>
                    {action.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export function DialogHost() {
  const [queue, setQueue] = useState<DialogRequest[]>([]);
  const [visibleId, setVisibleId] = useState<number | null>(null);
  const [current, setCurrent] = useState<DialogRequest | null>(null);

  useEffect(() => subscribeDialogs(setQueue), []);

  useEffect(() => {
    const head = queue[0] ?? null;
    if (current && head?.id !== current.id) {
      if (visibleId === current.id) {
        setVisibleId(null);
        return undefined;
      }
      const timer = setTimeout(() => setCurrent(null), EXIT.duration + 60);
      return () => clearTimeout(timer);
    }
    if (!current && head) {
      setCurrent(head);
      setVisibleId(head.id);
    }
    return undefined;
  }, [queue, current, visibleId]);

  const handleClose = useCallback(() => {
    if (current) closeDialog(current.id);
  }, [current]);

  if (!current) return null;

  return <DialogSheet key={current.id} {...current} visible={visibleId === current.id} onRequestClose={handleClose} />;
}

export { showDialog, confirmAction, showNotice, closeDialog } from './dialogStore';
export type { DialogAction, DialogOptions, DialogTone, ConfirmOptions, NoticeOptions } from './types/Dialog.types';
