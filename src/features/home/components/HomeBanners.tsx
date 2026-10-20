import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  AppState,
  FlatList,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

import { Icon } from '../../../components/Icon/Icon';
import { SkeletonBlock } from '../../../components/SkeletonLoader/SkeletonLoader';
import { colors, layout, radius, spacing, textRole } from '../../../theme';
import { useRemoteImage } from '../../../utils/media';
import type { HomeBanner } from '../types/banner.types';
import { resolveBannerAction, type BannerRoute } from '../utils/bannerNavigation';
import { buildLoopSlides, firstPage, pageForOffset, realIndexForPage, wrapPage, type LoopSlide } from '../utils/bannerLoop';

export const BANNER_ASPECT = 10 / 3;
const MIN_BANNER_HEIGHT = 96;
const MAX_BANNER_HEIGHT = 136;
const BANNER_GAP = 12;
const AUTO_ADVANCE_MS = 4500;
const SETTLE_FALLBACK_MS = 1200;

interface HomeBannersProps {
  banners: HomeBanner[];
  loading: boolean;
  onNavigate: (route: BannerRoute) => void;
}

export function bannerHeightFor(width: number): number {
  return Math.round(Math.min(MAX_BANNER_HEIGHT, Math.max(MIN_BANNER_HEIGHT, width / BANNER_ASPECT)));
}

function BannerCard({ banner, width, height, onNavigate }: { banner: HomeBanner; width: number; height: number; onNavigate: (route: BannerRoute) => void }) {
  const image = useRemoteImage(banner.imageUrl);
  const action = resolveBannerAction(banner.destination);
  const tappable = action.kind !== 'none';

  const handlePress = useCallback(() => {
    if (action.kind === 'navigate') {
      onNavigate(action.route);
    } else if (action.kind === 'open-url') {
      Linking.openURL(action.url).catch(() => {});
    }
  }, [action, onNavigate]);

  return (
    <Pressable
      onPress={tappable ? handlePress : undefined}
      disabled={!tappable}
      accessibilityRole={tappable ? (action.kind === 'open-url' ? 'link' : 'button') : 'image'}
      accessibilityLabel={[banner.title, banner.subtitle, banner.ctaLabel].filter(Boolean).join('. ')}
      style={({ pressed }) => [styles.card, { width, height }, pressed && tappable && styles.cardPressed]}
    >
      {image.showImage && image.uri ? (
        <Image source={{ uri: image.uri }} onError={image.onError} onLoad={image.onLoad} resizeMode="cover" style={StyleSheet.absoluteFill} />
      ) : null}
      <LinearGradient
        colors={['rgba(9, 34, 30, 0.82)', 'rgba(9, 34, 30, 0.42)', 'rgba(9, 34, 30, 0)']}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={banner.subtitle ? 1 : 2}>
          {banner.title}
        </Text>
        {banner.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {banner.subtitle}
          </Text>
        ) : null}
        {banner.ctaLabel && tappable ? (
          <View style={styles.cta}>
            <Text style={styles.ctaText} numberOfLines={1}>
              {banner.ctaLabel}
            </Text>
            <Icon name={action.kind === 'open-url' ? 'open-outline' : 'arrow-forward'} size={12} color={colors.brand} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export function HomeBanners({ banners, loading, onNavigate }: HomeBannersProps) {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const [reduceMotion, setReduceMotion] = useState(false);
  const isFocused = useIsFocused();

  const listRef = useRef<FlatList<LoopSlide<HomeBanner>>>(null);
  const pageRef = useRef(firstPage(banners.length));
  const targetPageRef = useRef<number | null>(null);
  const offsetRef = useRef(0);

  const count = banners.length;
  const looping = count > 1;
  const step = width + BANNER_GAP;
  const height = bannerHeightFor(width);
  const slides = useMemo(() => buildLoopSlides(banners), [banners]);
  const signature = useMemo(() => banners.map(banner => banner.id).join('|'), [banners]);

  useEffect(() => {
    pageRef.current = firstPage(count);
    targetPageRef.current = null;
    offsetRef.current = firstPage(count) * step;
    setIndex(0);
  }, [signature, count, step]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', next => setAppActive(next === 'active'));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(enabled => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const settle = useCallback(
    (offset: number) => {
      if (step <= 0) return;
      let page = pageForOffset(offset, step, count);
      const wrapped = wrapPage(page, count);
      if (wrapped !== null) {
        page = wrapped;
        offsetRef.current = page * step;
        listRef.current?.scrollToOffset({ offset: page * step, animated: false });
      }
      pageRef.current = page;
      targetPageRef.current = null;
      setIndex(realIndexForPage(page, count));
      setCycle(value => value + 1);
    },
    [count, step],
  );

  useEffect(() => {
    if (!looping || !isFocused || !appActive || reduceMotion || dragging || step <= 0) return undefined;
    let fallback: ReturnType<typeof setTimeout> | null = null;
    const timer = setTimeout(() => {
      const next = pageRef.current + 1;
      targetPageRef.current = next;
      listRef.current?.scrollToOffset({ offset: next * step, animated: true });
      fallback = setTimeout(() => {
        if (targetPageRef.current === next) settle(next * step);
      }, SETTLE_FALLBACK_MS);
    }, AUTO_ADVANCE_MS);
    return () => {
      clearTimeout(timer);
      if (fallback) clearTimeout(fallback);
    };
  }, [looping, isFocused, appActive, reduceMotion, dragging, step, cycle, settle]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset.x;
      offsetRef.current = offset;
      const target = targetPageRef.current;
      if (target !== null && Math.abs(offset - target * step) < 1) {
        settle(offset);
      }
    },
    [settle, step],
  );

  const handleBeginDrag = useCallback(() => {
    targetPageRef.current = null;
    setDragging(true);
  }, []);

  const handleEndDrag = useCallback(() => {
    setDragging(false);
  }, []);

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      settle(event.nativeEvent.contentOffset.x);
    },
    [settle],
  );

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.width);
    setWidth(current => (current === next ? current : next));
  }, []);

  const getItemLayout = useCallback((_: unknown, itemIndex: number) => ({ length: step, offset: step * itemIndex, index: itemIndex }), [step]);

  if (!loading && count === 0) return null;

  return (
    <View onLayout={handleLayout} style={[styles.wrap, width > 0 ? { height } : null]} accessibilityLabel="Offers and announcements">
      {width > 0 && loading && count === 0 ? <SkeletonBlock width={width} height={height} radius={layout.cardRadius} /> : null}
      {width > 0 && count > 0 ? (
        <>
          <FlatList
            key={`${signature}-${width}`}
            ref={listRef}
            data={slides}
            keyExtractor={slide => slide.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={step}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
            scrollEnabled={looping}
            initialScrollIndex={firstPage(count)}
            getItemLayout={getItemLayout}
            initialNumToRender={Math.min(slides.length, 3)}
            windowSize={3}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onScrollBeginDrag={handleBeginDrag}
            onScrollEndDrag={handleEndDrag}
            onMomentumScrollEnd={handleMomentumEnd}
            renderItem={({ item }) => (
              <View style={{ width: step }}>
                <BannerCard banner={item.item} width={width} height={height} onNavigate={onNavigate} />
              </View>
            )}
          />
          {looping ? (
            <View style={styles.dots} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {banners.map((banner, i) => (
                <View key={banner.id} style={[styles.dot, i === index && styles.dotActive]} />
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: layout.cardRadius,
    overflow: 'hidden',
  },
  card: {
    borderRadius: layout.cardRadius,
    overflow: 'hidden',
    backgroundColor: colors.brandStrong,
  },
  cardPressed: {
    opacity: 0.92,
  },
  copy: {
    flex: 1,
    width: '66%',
    justifyContent: 'center',
    paddingHorizontal: layout.cardPadding,
    paddingVertical: spacing.md,
    gap: 2,
  },
  title: {
    ...textRole.cardTitle,
    fontSize: 16,
    lineHeight: 21,
    color: colors.white,
  },
  subtitle: {
    ...textRole.meta,
    color: 'rgba(255, 255, 255, 0.88)',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
  },
  ctaText: {
    ...textRole.badge,
    color: colors.brand,
  },
  dots: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(9, 34, 30, 0.38)',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  dotActive: {
    width: 14,
    backgroundColor: colors.white,
  },
});
