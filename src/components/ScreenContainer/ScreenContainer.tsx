import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TAB_BAR_CLEARANCE } from '../FloatingTabBar/styles/FloatingTabBar.styles';
import { styles } from './styles/ScreenContainer.styles';
import type { ScreenContainerProps } from './types/ScreenContainer.types';

export function ScreenContainer({ children, scroll = true, style, tabBarInset }: ScreenContainerProps) {
  const insetStyle = tabBarInset ? { paddingBottom: TAB_BAR_CLEARANCE } : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={tabBarInset ? ['top'] : ['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView contentContainerStyle={[styles.content, insetStyle, style]} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, insetStyle, style]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export type { ScreenContainerProps };
