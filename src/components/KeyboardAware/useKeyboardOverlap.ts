import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { Keyboard, LayoutAnimation, Platform } from 'react-native';
import type { HostInstance, KeyboardEvent, KeyboardMetrics } from 'react-native';

export interface KeyboardOverlapState {
  overlap: number;
  keyboardTop: number | null;
}

const HIDDEN: KeyboardOverlapState = { overlap: 0, keyboardTop: null };
const SHOW_EVENT = Platform.OS === 'ios' ? 'keyboardWillChangeFrame' : 'keyboardDidShow';
const HIDE_EVENT = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

function animateNext(duration: number | undefined) {
  if (Platform.OS !== 'ios' || !duration) return;
  const safeDuration = Math.max(duration, 10);
  LayoutAnimation.configureNext({
    duration: safeDuration,
    update: { duration: safeDuration, type: LayoutAnimation.Types.keyboard },
  });
}

export function useKeyboardOverlap(targetRef: RefObject<HostInstance | null>, enabled = true): KeyboardOverlapState {
  const [state, setState] = useState<KeyboardOverlapState>(HIDDEN);

  useEffect(() => {
    if (!enabled) {
      setState(HIDDEN);
      return undefined;
    }

    let active = true;

    function hide(duration?: number) {
      setState((current) => {
        if (current.overlap === 0 && current.keyboardTop === null) return current;
        animateNext(duration);
        return HIDDEN;
      });
    }

    function measure(metrics: KeyboardMetrics, duration?: number) {
      const node = targetRef.current;
      const keyboardTop = metrics.screenY;
      if (!node || keyboardTop <= 0 || metrics.height <= 0) {
        hide(duration);
        return;
      }
      node.measureInWindow((_x, y, _width, height) => {
        if (!active) return;
        const overlap = Math.max(0, Math.round(y + height - keyboardTop));
        setState((current) => {
          if (current.overlap === overlap && current.keyboardTop === keyboardTop) return current;
          animateNext(duration);
          return { overlap, keyboardTop };
        });
      });
    }

    const onShow = (event: KeyboardEvent) => measure(event.endCoordinates, event.duration);
    const onHide = (event: KeyboardEvent) => hide(event.duration);

    const subscriptions = [Keyboard.addListener(SHOW_EVENT, onShow), Keyboard.addListener(HIDE_EVENT, onHide)];

    const initial = Keyboard.isVisible() ? Keyboard.metrics() : undefined;
    if (initial) {
      measure(initial);
    }

    return () => {
      active = false;
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, [enabled, targetRef]);

  return state;
}
