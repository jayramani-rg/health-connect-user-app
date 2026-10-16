import React, { useContext } from 'react';
import { View } from 'react-native';
import { HeaderShownContext } from '@react-navigation/elements';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTabBarInset } from '../FloatingTabBar/useTabBarInset';
import { KeyboardAwareScrollView } from '../KeyboardAware/KeyboardAwareScrollView';
import { KeyboardAvoidingContainer } from '../KeyboardAware/KeyboardAvoidingContainer';
import { styles } from './styles/ScreenContainer.styles';
import type { ScreenContainerProps } from './types/ScreenContainer.types';

export function ScreenContainer({ children, scroll = true, style, tabBarInset, footer, variant = 'default' }: ScreenContainerProps) {
  const tabInset = useTabBarInset();
  const headerShown = useContext(HeaderShownContext);
  const variantStyle = variant === 'page' ? styles.page : variant === 'list' ? styles.list : null;
  const bottomStyle = tabBarInset ? { paddingBottom: tabInset } : variant === 'page' ? styles.pageBottom : null;
  const edges: Edge[] = [...(headerShown ? [] : ['top' as const]), ...(tabBarInset ? [] : ['bottom' as const])];

  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
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
