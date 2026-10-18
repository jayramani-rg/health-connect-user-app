import React from 'react';
import { Image, Text, View } from 'react-native';
import { colors } from '../../theme';
import { useRemoteImage } from '../../utils/media';
import { Icon, type IoniconsIconName } from '../Icon/Icon';
import { styles } from './styles/ProviderHero.styles';

export interface ProviderHeroChip {
  icon: IoniconsIconName;
  label: string;
  tone?: 'brand' | 'neutral' | 'warning';
}

export interface ProviderHeroProps {
  name: string;
  imageUrl: string | null;
  shape: 'circle' | 'rounded';
  fallbackIcon?: IoniconsIconName;
  verified?: boolean;
  title?: string | null;
  subtitle?: string | null;
  meta?: string | null;
  chips?: ProviderHeroChip[];
}

export function ProviderHero({ name, imageUrl, shape, fallbackIcon, verified, title, subtitle, meta, chips = [] }: ProviderHeroProps) {
  const image = useRemoteImage(imageUrl);
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const frameStyle = shape === 'circle' ? styles.frameCircle : styles.frameRounded;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.frame, frameStyle]}>
          {!image.showImage || !image.loaded ? (
            fallbackIcon ? <Icon name={fallbackIcon} size={30} color={colors.brand} /> : <Text style={styles.initial}>{initial}</Text>
          ) : null}
          {image.showImage && image.uri ? (
            <Image
              source={{ uri: image.uri }}
              style={[styles.image, frameStyle]}
              resizeMode="cover"
              onError={image.onError}
              onLoad={image.onLoad}
              accessibilityIgnoresInvertColors
              accessibilityLabel={`${name} photo`}
            />
          ) : null}
        </View>
        <View style={styles.text}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={2} accessibilityRole="header">
              {name}
            </Text>
            {verified ? (
              <View style={styles.verified} accessibilityLabel="Verified by Carova">
                <Icon name="checkmark-circle" size={16} color={colors.brand} />
              </View>
            ) : null}
          </View>
          {title ? (
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
          {meta ? (
            <Text style={styles.meta} numberOfLines={2}>
              {meta}
            </Text>
          ) : null}
        </View>
      </View>
      {chips.length > 0 ? (
        <View style={styles.chips}>
          {chips.map((chip) => (
            <View
              key={chip.label}
              style={[styles.chip, chip.tone === 'brand' && styles.chipBrand, chip.tone === 'warning' && styles.chipWarning]}
            >
              <Icon
                name={chip.icon}
                size={13}
                color={chip.tone === 'brand' ? colors.brandStrong : chip.tone === 'warning' ? colors.warning : colors.textSecondary}
              />
              <Text style={[styles.chipText, chip.tone === 'brand' && styles.chipTextBrand, chip.tone === 'warning' && styles.chipTextWarning]}>
                {chip.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default ProviderHero;
