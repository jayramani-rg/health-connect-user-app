import React, { memo } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Mask, Path, Rect, Stop } from 'react-native-svg';
import { colors } from '../../theme';
import type { WelcomeArtworkProps } from './types/WelcomeIllustration.types';

export const WELCOME_ARTWORK_RATIO = 360 / 260;

function tint(amount: number) {
  const hex = colors.brand.replace('#', '');
  const channels = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgb(${channels.map((c) => Math.round(c + (255 - c) * amount)).join(',')})`;
}

const tone = {
  halo: tint(0.06),
  coat: tint(0.12),
  skin: tint(0.16),
  garment: tint(0.2),
  paper: tint(0.24),
  hair: tint(0.32),
};

function WelcomeArtworkBase({ width, height }: WelcomeArtworkProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 360 260">
      <Defs>
        <LinearGradient id="welcomeFade" x1={0} y1={150} x2={0} y2={244} gradientUnits="userSpaceOnUse">
          <Stop offset={0} stopColor={colors.white} stopOpacity={1} />
          <Stop offset={1} stopColor={colors.white} stopOpacity={0} />
        </LinearGradient>
        <Mask id="welcomeMask">
          <Rect width={360} height={260} fill="url(#welcomeFade)" />
        </Mask>
      </Defs>
      <G mask="url(#welcomeMask)">
        <Circle cx={180} cy={142} r={104} fill={tone.halo} stroke={colors.white} strokeOpacity={0.22} strokeWidth={1.2} />
        <Circle cx={180} cy={142} r={120} fill="none" stroke={colors.white} strokeOpacity={0.3} strokeWidth={1.4} strokeDasharray="0.1 7" strokeLinecap="round" />
        <G fill="none" stroke={colors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <G transform="translate(224 96) scale(0.94)">
            <Circle cx={4} cy={-30} r={9} fill={tone.hair} />
            <Path d="M-7 12 L-7 28 L7 28 L7 12" fill={tone.skin} />
            <Path d="M-8 25 C-20 28 -33 31 -40 40 C-46 49 -48 66 -48 90 C-48 120 -47 160 -47 210 L47 210 C47 160 48 120 48 90 C48 66 46 49 40 40 C33 31 20 28 8 25 Z" fill={tone.garment} />
            <Path d="M-8 25 L0 44 L8 25" fill={tone.skin} />
            <Path d="M-11 25.5 L0 50 L11 25.5" />
            <Path d="M-37 46 C-35 60 -35 72 -36 86 M37 46 C35 60 35 72 36 86" />
            <Path d="M-48.5 84 L-35 87 M48.5 84 L35 87" />
            <Path d="M-36 87 C-36 110 -37 150 -38 210" />
            <G transform="rotate(-6 22 76)">
              <Path d="M8 54 L34 54 L34 96 L8 96 Z" fill={tone.paper} />
              <Path d="M15 54 L15 50 L27 50 L27 54" fill={tone.hair} />
              <Path d="M13 65 L29 65 M13 73 L29 73 M13 81 L23 81" strokeWidth={1.6} />
            </G>
            <Path d="M36 87 C37 91 37.5 94 38 97" />
            <Path d="M49 95 C40 97.5 29 97.5 20 96.5 C13 96 12 108 19 108.5 C29 109.5 40 109.5 49 109" fill={tone.skin} />
            <Path d="M20 97 C21 93 25 92.5 27 96" strokeWidth={1.6} />
            <Path d="M-15 -2 C-15 -16 -8 -23 0 -23 C8 -23 15 -16 15 -2 C15 9 9 17 0 19.5 C-9 17 -15 9 -15 -2 Z" fill={tone.skin} />
            <Path d="M-15 -1 C-18 -2 -19 5 -15 7 M15 -1 C18 -2 19 5 15 7" strokeWidth={1.6} />
            <Path d="M-17 10 C-21 -6 -16 -26 0 -26 C16 -26 21 -6 17 10 C17 2 16 -4 14.5 -8 C10 -11 6 -16 4 -18 C0 -12 -8 -10 -14 -9 C-15.5 -4 -16 2 -17 10 Z" fill={tone.hair} />
            <Circle cx={-5.5} cy={1} r={1.3} fill={colors.white} stroke="none" />
            <Circle cx={5.5} cy={1} r={1.3} fill={colors.white} stroke="none" />
            <Path d="M-8.5 -4 C-7 -5 -4.5 -5 -3 -4.5 M3 -4.5 C4.5 -5 7 -5 8.5 -4" strokeWidth={1.3} />
            <Path d="M0 3.5 L-1.2 8 L1 8.4" strokeWidth={1.3} />
            <Path d="M-3.5 12.5 Q0 14.8 3.5 12.5" strokeWidth={1.4} />
          </G>
          <G transform="translate(146 86)">
            <Path d="M-7 12 L-7 28 L7 28 L7 12" fill={tone.skin} />
            <Path d="M-9 27 C-22 30 -37 33 -44 42 C-50 51 -53 68 -53 92 C-53 125 -52 165 -51 210 L51 210 C52 165 53 125 53 92 C53 68 50 51 44 42 C37 33 22 30 9 27 Z" fill={tone.coat} />
            <Path d="M-9 27 L-6 60 L0 70 L6 60 L9 27 Z" fill={tone.skin} stroke="none" />
            <Path d="M-9 27 L-5 37 L0 32 L5 37 L9 27" />
            <Path d="M-3 35 L3 35 L5 58 L0 65 L-5 58 Z" fill={tone.hair} strokeWidth={1.6} />
            <Path d="M-9 27 C-13 38 -17 50 -19 58 L-9 64 L-2 98 L-2 210" />
            <Path d="M9 27 C13 38 17 50 19 58 L9 64 L-2 98" />
            <Path d="M-41 62 C-40 90 -41 130 -42 210 M41 62 C40 90 41 130 42 210" />
            <Path d="M23 70 L37 70" />
            <Path d="M27 70 L27 60 M31 70 L31 63" strokeWidth={1.6} />
            <Path d="M-12 29 C-19 44 -21 60 -17 72" />
            <Path d="M-17 72 C-15 76 -12 77 -10 74" strokeWidth={1.6} />
            <Path d="M12 29 C19 42 21 54 20 64 C19.5 70 20 74 22 77" />
            <Circle cx={23} cy={82} r={5} fill={colors.accent} stroke={colors.white} />
            <Path d="M-15.5 -2 C-15.5 -16 -8 -23 0 -23 C8 -23 15.5 -16 15.5 -2 C15.5 9 9.5 17.5 0 20 C-9.5 17.5 -15.5 9 -15.5 -2 Z" fill={tone.skin} />
            <Path d="M-15.5 -1 C-19 -2 -20 6 -15.5 8 M15.5 -1 C19 -2 20 6 15.5 8" strokeWidth={1.6} />
            <Path d="M-16 -1 C-19 -18 -9 -29 2 -28 C13 -27 19 -19 16 -1 C15.5 -8 14 -13 10 -15 C4 -13 -4 -14 -10 -18 C-12 -13 -14 -8 -16 -1 Z" fill={tone.hair} />
            <Circle cx={-5.5} cy={1} r={1.3} fill={colors.white} stroke="none" />
            <Circle cx={5.5} cy={1} r={1.3} fill={colors.white} stroke="none" />
            <Path d="M-9 -4.5 C-7.5 -5.8 -4.5 -5.8 -3 -5 M3 -5 C4.5 -5.8 7.5 -5.8 9 -4.5" strokeWidth={1.4} />
            <Path d="M0 3.5 L-1.2 8 L1 8.4" strokeWidth={1.3} />
            <Path d="M-4 12.5 Q0 15.2 4 12.5" strokeWidth={1.4} />
          </G>
          <Path d="M78 74 v10 M73 79 h10" strokeOpacity={0.55} strokeWidth={1.6} />
          <Path d="M286 60 v8 M282 64 h8" strokeOpacity={0.45} strokeWidth={1.6} />
          <Circle cx={294} cy={114} r={2.5} strokeOpacity={0.4} strokeWidth={1.4} />
        </G>
      </G>
    </Svg>
  );
}

export const WelcomeArtwork = memo(WelcomeArtworkBase);
