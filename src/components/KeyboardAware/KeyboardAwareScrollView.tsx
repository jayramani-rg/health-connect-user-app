import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import type { HostInstance, LayoutChangeEvent, ScrollViewInstance } from 'react-native';
import { KeyboardAwareContext } from './KeyboardAwareContext';
import type { KeyboardAwareContextValue } from './KeyboardAwareContext';
import { useKeyboardOverlap } from './useKeyboardOverlap';
import type { KeyboardAwareScrollViewProps } from './types/KeyboardAware.types';


const TOP_GAP = 12;
const DEFAULT_REVEAL_GAP = 20;

export const KeyboardAwareScrollView = forwardRef<ScrollViewInstance, KeyboardAwareScrollViewProps>(function KeyboardAwareScrollViewImpl(
  {
    children,
    footer,
    footerStyle,
    containerStyle,
    revealGap = DEFAULT_REVEAL_GAP,
    enabled = true,
    keyboardShouldPersistTaps = 'handled',
    onContentSizeChange,
    onLayout,
    ...scrollProps
  },
  ref,
) {
  const containerRef = useRef<HostInstance>(null);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const activeFieldRef = useRef<RefObject<HostInstance | null> | null>(null);
  const frameRef = useRef<number | null>(null);
  const { overlap, keyboardTop } = useKeyboardOverlap(containerRef, enabled);
  const keyboardTopRef = useRef<number | null>(keyboardTop);
  keyboardTopRef.current = keyboardTop;

  useImperativeHandle(ref, () => scrollRef.current as ScrollViewInstance, []);

  const reveal = useCallback(() => {
    const keyboardY = keyboardTopRef.current;
    const scroll = scrollRef.current;
    if (keyboardY === null || !scroll) return;
    const inner = scroll.getInnerViewRef();
    const nativeScroll = scroll.getNativeScrollRef();
    const field = (activeFieldRef.current?.current ?? TextInput.State.currentlyFocusedInput()) as HostInstance | null;
    if (!inner || !nativeScroll || !field) return;

    nativeScroll.measureInWindow((_sx, scrollTop, _sw, scrollHeight) => {
      const visibleBottom = Math.min(scrollTop + scrollHeight, keyboardY);
      const visibleHeight = visibleBottom - scrollTop;
      if (visibleHeight <= 0) return;

      field.measureInWindow((_fx, fieldTop, _fw, fieldHeight) => {
        const hiddenBelow = fieldTop + fieldHeight + revealGap > visibleBottom;
        const hiddenAbove = fieldTop - TOP_GAP < scrollTop;
        if (!hiddenBelow && !hiddenAbove) return;

        field.measureLayout(
          inner,
          (_x, contentY, _w, height) => {
            const target = hiddenBelow ? contentY + height + revealGap - visibleHeight : contentY - TOP_GAP;
            scroll.scrollTo({ y: Math.max(0, target), animated: true });
          },
          () => undefined,
        );
      });
    });
  }, [revealGap]);

  const scheduleReveal = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      reveal();
    });
  }, [reveal]);

  useEffect(() => {
    if (keyboardTop !== null) scheduleReveal();
  }, [keyboardTop, overlap, scheduleReveal]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const contextValue = useMemo<KeyboardAwareContextValue>(
    () => ({
      revealField: (field) => {
        activeFieldRef.current = field;
        scheduleReveal();
      },
      releaseField: (field) => {
        if (activeFieldRef.current === field) activeFieldRef.current = null;
      },
    }),
    [scheduleReveal],
  );

  const handleContentSizeChange = useCallback(
    (width: number, height: number) => {
      onContentSizeChange?.(width, height);
      if (keyboardTopRef.current !== null) scheduleReveal();
    },
    [onContentSizeChange, scheduleReveal],
  );

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onLayout?.(event);
      if (keyboardTopRef.current !== null) scheduleReveal();
    },
    [onLayout, scheduleReveal],
  );

  return (
    <KeyboardAwareContext.Provider value={contextValue}>
      <View ref={containerRef} style={[styles.container, containerStyle, { paddingBottom: overlap }]}>
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          onContentSizeChange={handleContentSizeChange}
          onLayout={handleLayout}
          {...scrollProps}
        >
          {children}
        </ScrollView>
        {footer ? <View style={footerStyle}>{footer}</View> : null}
      </View>
    </KeyboardAwareContext.Provider>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
