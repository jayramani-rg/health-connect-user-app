import { Easing, FadeIn, FadeInUp, ReduceMotion } from 'react-native-reanimated';
import { motion } from '../theme';

const ENTRANCE_OFFSET = 8;
const ANIMATED_LIST_ITEMS = 8;

export const pressFeedback = {
  scale: 0.98,
  timing: { duration: motion.duration.fast, easing: Easing.out(Easing.quad), reduceMotion: ReduceMotion.System },
};

export function staggerDelay(index: number, max = 6): number {
  return Math.min(index, max) * motion.listStagger;
}

export function fadeEntering(delay = 0) {
  return FadeIn.duration(motion.duration.base).delay(delay).reduceMotion(ReduceMotion.System);
}

export function fadeUpEntering(delay = 0) {
  return FadeInUp.duration(motion.duration.slow)
    .delay(delay)
    .easing(Easing.out(Easing.cubic))
    .withInitialValues({ opacity: 0, transform: [{ translateY: ENTRANCE_OFFSET }] })
    .reduceMotion(ReduceMotion.System);
}

export function listItemEntering(index: number) {
  if (index >= ANIMATED_LIST_ITEMS) return undefined;
  return fadeEntering(staggerDelay(index));
}
