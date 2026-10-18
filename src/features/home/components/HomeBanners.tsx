import React, { useCallback, useState } from 'react';
import { FlatList, Image, Linking, Pressable, StyleSheet, Text, View, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { Icon } from '../../../components/Icon/Icon';
import { SkeletonBlock } from '../../../components/SkeletonLoader/SkeletonLoader';
import { colors, layout, radius, spacing, textRole } from '../../../theme';
import { useRemoteImage } from '../../../utils/media';
import type { HomeBanner } from '../types/banner.types';
import { resolveBannerAction, type BannerRoute } from '../utils/bannerNavigation';

export const BANNER_ASPECT = 12 / 5;
const BANNER_GAP = 10;

interface HomeBannersProps {
  banners: HomeBanner[];
  loading: boolean;
  onNavigate: (route: BannerRoute) => void;
}

function BannerCard({ banner, width, onNavigate }: { banner: HomeBanner; width: number; onNavigate: (route: BannerRoute) => void }) {
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
      style={({ pressed }) => [styles.card, { width, height: width / BANNER_ASPECT }, pressed && tappable && styles.cardPressed]}
    >
      {image.showImage && image.uri ? (
        <Image source={{ uri: image.uri }} onError={image.onError} onLoad={image.onLoad} resizeMode="cover" style={StyleSheet.absoluteFill} />
      ) : null}
      <LinearGradient
        colors={['rgba(9, 34, 30, 0.78)', 'rgba(9, 34, 30, 0.35)', 'rgba(9, 34, 30, 0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={2}>
          {banner.title}
        </Text>
        {banner.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {banner.subtitle}
          </Text>
        ) : null}
        {banner.ctaLabel && tappable ? (
          <View style={styles.cta}>
            <Text style={styles.ctaText} numberOfLines={1}>
              {banner.ctaLabel}
            </Text>
            <Icon name={action.kind === 'open-url' ? 'open-outline' : 'arrow-forward'} size={13} color={colors.brand} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export function HomeBanners({ banners, loading, onNavigate }: HomeBannersProps) {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);

  const handleLayout = useCallback((event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width), []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (width <= 0) return;
      const next = Math.round(event.nativeEvent.contentOffset.x / (width + BANNER_GAP));
      setIndex((current) => (current === next ? current : next));
    },
    [width],
  );

  if (!loading && banners.length === 0) return null;

  return (
    <View onLayout={handleLayout} style={styles.wrap}>
      {width > 0 && loading && banners.length === 0 ? <SkeletonBlock width={width} height={width / BANNER_ASPECT} radius={layout.cardRadius} /> : null}
      {width > 0 && banners.length > 0 ? (
        <>
          <FlatList
            data={banners}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={width + BANNER_GAP}
            decelerationRate="fast"
            disableIntervalMomentum
            onScroll={handleScroll}
            scrollEventThrottle={32}
            ItemSeparatorComponent={Separator}
            renderItem={({ item }) => <BannerCard banner={item} width={width} onNavigate={onNavigate} />}
            accessibilityLabel="Announcements"
          />
          {banners.length > 1 ? (
            <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
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

function Separator() {
  return <View style={{ width: BANNER_GAP }} />;
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
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
    width: '68%',
    justifyContent: 'flex-end',
    padding: layout.cardPadding,
    gap: 2,
  },
  title: {
    ...textRole.cardTitle,
    fontSize: 17,
    lineHeight: 22,
    color: colors.white,
  },
  subtitle: {
    ...textRole.meta,
    color: 'rgba(255, 255, 255, 0.86)',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
  },
  ctaText: {
    ...textRole.badge,
    color: colors.brand,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderStrong,
  },
  dotActive: {
    width: 16,
    backgroundColor: colors.brand,
  },
});
