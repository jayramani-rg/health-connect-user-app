import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabBarInset } from '../FloatingTabBar/useTabBarInset';
import { KeyboardAwareScrollView } from '../KeyboardAware/KeyboardAwareScrollView';
import { KeyboardAvoidingContainer } from '../KeyboardAware/KeyboardAvoidingContainer';
import { styles } from './styles/ScreenContainer.styles';
import type { ScreenContainerProps } from './types/ScreenContainer.types';

export function ScreenContainer({ children, scroll = true, style, tabBarInset, footer, variant = 'default' }: ScreenContainerProps) {
  const tabInset = useTabBarInset();
  const variantStyle = variant === 'page' ? styles.page : variant === 'list' ? styles.list : null;
  const bottomStyle = tabBarInset ? { paddingBottom: tabInset } : variant === 'page' ? styles.pageBottom : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={tabBarInset ? ['top'] : ['top', 'bottom']}>
      {scroll ? (
        <KeyboardAwareScrollView
          contentContainerStyle={[styles.content, variantStyle, bottomStyle, style]}
          footer={footer}
          footerStyle={styles.footer}
        >
          {children}
        </KeyboardAwareScrollView>
      ) : (
        <KeyboardAvoidingContainer>
          <View style={[styles.content, variantStyle, bottomStyle, style]}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </KeyboardAvoidingContainer>
      )}
    </SafeAreaView>
  );
}

export type { ScreenContainerProps };
