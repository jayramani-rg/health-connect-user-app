import React, { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { BottomSheetModal, BottomSheetView, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import { Button } from '../Button/Button';
import { motion } from '../../theme';
import { styles } from './styles/ConfirmSheet.styles';
import type { ConfirmSheetProps } from './types/ConfirmSheet.types';

export function ConfirmSheet({ visible, title, message, actions, onRequestClose }: ConfirmSheetProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const animationConfigs = useBottomSheetSpringConfigs(motion.spring.sheet);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      animationConfigs={animationConfigs}
      onDismiss={onRequestClose}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          {actions.map((action, index) => (
            <Button
              key={action.label}
              label={action.label}
              onPress={action.onPress}
              variant={action.variant ?? (index === actions.length - 1 ? 'primary' : 'secondary')}
            />
          ))}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

export type { ConfirmSheetProps, ConfirmSheetAction } from './types/ConfirmSheet.types';
