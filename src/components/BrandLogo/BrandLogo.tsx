import React from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { colors } from '../../theme';

// Carova logo artwork. Geometry is copied from brand/logo/build.js (the source of truth) — never
// redraw it, and never stand a <Text>"Carova"</Text> in for the wordmark.
// Ink: colors.primary on light grounds, colors.white on teal / dark grounds. The dot stays coral.

type WordmarkProps = { width?: number; color?: string; dotColor?: string };
type SymbolProps = { size?: number; color?: string; dotColor?: string };

const WORDMARK_RATIO = 108 / 552;

export function CarovaWordmark({ width = 140, color = colors.primary, dotColor = colors.accent }: WordmarkProps) {
  return (
    <Svg width={width} height={width * WORDMARK_RATIO} viewBox="-2 -4 552 108" accessible accessibilityRole="image" accessibilityLabel="Carova">
      <G fill="none" stroke={color} strokeWidth={20}>
        <Path d="M81.698 79.698A42 42 0 1 1 81.698 20.302" />
        <Circle cx={138} cy={50} r={42} />
        <Path d="M180 0V100" />
        <Path d="M224 100V44A36 36 0 0 1 272.31 10.17" />
        <Path d="M357.90 31.90A42 42 0 1 1 338.10 12.10" />
        <Circle cx={496} cy={50} r={42} />
        <Path d="M538 0V100" />
      </G>
      <Path d="M360 0H381.62L408 64.34L434.38 0H456L415 100H401Z" fill={color} />
      <Circle cx={349.7} cy={20.3} r={10} fill={dotColor} />
    </Svg>
  );
}

export function CarovaSymbol({ size = 40, color = colors.primary, dotColor = colors.accent }: SymbolProps) {
  return (
    <Svg width={size} height={size} viewBox="10 10 100 100" accessible accessibilityRole="image" accessibilityLabel="Carova">
      <Path d="M96.050 47.983A38 38 0 1 1 72.017 23.950" fill="none" stroke={color} strokeWidth={24} />
      <Circle cx={86.87} cy={33.13} r={12} fill={dotColor} />
    </Svg>
  );
}
