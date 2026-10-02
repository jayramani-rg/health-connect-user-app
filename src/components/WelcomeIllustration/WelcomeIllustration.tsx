import React, { useCallback, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { getHeight, getWidth } from '../../utils/helpers';
import { styles } from './styles/WelcomeIllustration.styles';
import type { WelcomeIllustrationProps } from './types/WelcomeIllustration.types';
import { WELCOME_ARTWORK_RATIO, WelcomeArtwork } from './WelcomeArtwork';

const MIN_HEIGHT = 96;
const MAX_WIDTH = Math.min(getWidth(320), 380);
const INSET = getHeight(8);

export function WelcomeIllustration({ style }: WelcomeIllustrationProps) {
  const [box, setBox] = useState({ width: 0, height: 0 });

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setBox((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  }, []);

  const height = Math.floor(Math.min(box.height - INSET * 2, box.width / WELCOME_ARTWORK_RATIO, MAX_WIDTH / WELCOME_ARTWORK_RATIO));

  return (
    <View
      style={[styles.frame, style]}
      onLayout={onLayout}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {height >= MIN_HEIGHT && <WelcomeArtwork width={Math.floor(height * WELCOME_ARTWORK_RATIO)} height={height} />}
    </View>
  );
}
