import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

const REFERENCE_WIDTH = 393;
const REFERENCE_HEIGHT = 852;

export const getWidth = (w: number): number => (screenWidth * w) / REFERENCE_WIDTH;

export const getHeight = (h: number): number => (screenHeight * h) / REFERENCE_HEIGHT;

export const getFontSize = (size: number): number => size * (screenWidth / REFERENCE_WIDTH);

export const activeopacity = 0.6;

export const OTP_RESEND_COOLDOWN_SECONDS = 30;

/**
 * "yyyy-MM-dd" for the device's local calendar day. `Date.toISOString()` converts to UTC first, which
 * silently shifts the date back a day for any timezone ahead of UTC (e.g. IST, UTC+5:30) — always use
 * this instead when a date key needs to match what the user sees on screen.
 */
export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
