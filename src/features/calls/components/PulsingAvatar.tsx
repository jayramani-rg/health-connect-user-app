import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Avatar } from '../../../components/Avatar/Avatar';

export interface PulsingAvatarProps {
  name: string;
  imageUrl: string | null;
  size: number;
  pulsing: boolean;
}

const RING_COLOR = 'rgba(255, 255, 255, 0.22)';

export const PulsingAvatar: React.FC<PulsingAvatarProps> = ({ name, imageUrl, size, pulsing }) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!pulsing) {
      progress.setValue(0);
      return undefined;
    }

    const loop = Animated.loop(
      Animated.timing(progress, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulsing, progress]);

  const ringStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] }),
    transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }) }],
  };

  return (
    <View style={[styles.container, { width: size * 1.8, height: size * 1.8 }]}>
      {pulsing ? <Animated.View style={[styles.ring, ringStyle]} /> : null}
      <Avatar name={name} imageUrl={imageUrl} size={size} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    backgroundColor: RING_COLOR,
  },
});
