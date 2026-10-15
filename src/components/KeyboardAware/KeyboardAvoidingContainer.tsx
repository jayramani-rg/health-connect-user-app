import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import type { HostInstance } from 'react-native';
import { useKeyboardOverlap } from './useKeyboardOverlap';
import type { KeyboardAvoidingContainerProps } from './types/KeyboardAware.types';

export function KeyboardAvoidingContainer({ children, style, enabled = true, ...viewProps }: KeyboardAvoidingContainerProps) {
  const containerRef = useRef<HostInstance>(null);
  const { overlap } = useKeyboardOverlap(containerRef, enabled);

  return (
    <View ref={containerRef} style={[styles.container, style, { paddingBottom: overlap }]} {...viewProps}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
