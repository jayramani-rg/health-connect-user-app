import React, { useState } from 'react';
import { ActivityIndicator, Image, LayoutChangeEvent, Text, View } from 'react-native';
import { Icon } from '../Icon/Icon';
import { colors } from '../../theme';
import { staticMapUrl } from '../../services/googleLocationService';
import { styles } from './styles/LocationMapPreview.styles';
import type { LocationMapPreviewProps } from './types/LocationMapPreview.types';

export function LocationMapPreview({ latitude, longitude, caption, height = 180, loading = false, placeholder }: LocationMapPreviewProps) {
  const [width, setWidth] = useState(0);
  const [failed, setFailed] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const hasPoint = latitude != null && longitude != null;
  const url = latitude != null && longitude != null && width > 0 ? staticMapUrl(latitude, longitude, { width, height, zoom: 16 }) : null;
  const showImage = !!url && !failed;

  function handleLayout(event: LayoutChangeEvent) {
    const next = Math.round(event.nativeEvent.layout.width);
    if (next !== width) setWidth(next);
  }

  return (
    <View style={[styles.card, { height }]} onLayout={handleLayout}>
      {showImage ? (
        <>
          <Image
            key={url}
            source={{ uri: url }}
            style={styles.image}
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => setFailed(true)}
            accessibilityLabel="Map showing the selected location"
          />
          {imageLoading && (
            <View style={styles.overlayCenter}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
        </>
      ) : (
        <View style={styles.placeholder}>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <View style={styles.placeholderIcon}>
                <Icon name={hasPoint ? 'location' : 'map-outline'} size={22} color={colors.primary} />
              </View>
              <Text style={styles.placeholderText}>
                {hasPoint ? 'Location pinned' : placeholder ?? 'Enter the address below to pin it on the map'}
              </Text>
            </>
          )}
        </View>
      )}
      {hasPoint && caption ? (
        <View style={styles.captionStrip}>
          <Icon name="location" size={14} color={colors.primary} />
          <Text style={styles.captionText} numberOfLines={1}>
            {caption}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export type { LocationMapPreviewProps };
