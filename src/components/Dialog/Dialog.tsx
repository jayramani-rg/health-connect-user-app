import React from 'react';
import { Modal, Text, View } from 'react-native';
import { Button } from '../Button/Button';
import { styles } from './styles/Dialog.styles';
import type { DialogProps } from './types/Dialog.types';

/** The app's one themed modal/dialog — reuses Button + theme tokens since no such component existed
 * before. Used anywhere a flow needs to interrupt the user with an explanation and a clear CTA
 * (e.g. the profile-completion gate) rather than a plain native Alert. */
export function Dialog({ visible, title, message, actions, onRequestClose }: DialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
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
        </View>
      </View>
    </Modal>
  );
}

export type { DialogProps, DialogAction } from './types/Dialog.types';
