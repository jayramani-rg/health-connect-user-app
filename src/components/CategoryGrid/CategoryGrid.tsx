import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { activeopacity } from '../../utils/helpers';
import { ASSETS_BASE_URL } from '../../config/env';
import { styles } from './styles/CategoryGrid.styles';
import type { CategoryGridItem, CategoryGridProps } from './types/CategoryGrid.types';

type TileVariant = NonNullable<CategoryGridProps['variant']>;

export function CategoryGrid({ categories, onSelect, variant = 'grid' }: CategoryGridProps) {
  const tiles = categories.map((category) => (
    <CategoryTile key={category.id} category={category} variant={variant} onPress={() => onSelect(category)} />
  ));

  if (variant === 'strip') {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
        {tiles}
      </ScrollView>
    );
  }

  return <View style={variant === 'compact' ? styles.compactGrid : styles.grid}>{tiles}</View>;
}

const TILE_STYLES: Record<TileVariant, { tile: object; avatar: object; image: object; name: object }> = {
  grid: { tile: styles.tile, avatar: styles.avatar, image: styles.avatarImage, name: styles.name },
  strip: { tile: styles.stripTile, avatar: styles.roundAvatar, image: [styles.avatarImage, styles.roundAvatarImage], name: styles.roundName },
  compact: { tile: styles.compactTile, avatar: styles.roundAvatar, image: [styles.avatarImage, styles.roundAvatarImage], name: styles.compactName },
};

function nameFit(name: string, variant: TileVariant) {
  if (variant !== 'compact') return { numberOfLines: 2 };
  const singleWord = !/\s/.test(name.trim());
  return { numberOfLines: singleWord ? 1 : 2, adjustsFontSizeToFit: true, minimumFontScale: 0.85 };
}

function CategoryTile({ category, variant, onPress }: { category: CategoryGridItem; variant: TileVariant; onPress: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = !!category.imageUrl && !imageFailed;
  const look = TILE_STYLES[variant];

  return (
    <TouchableOpacity activeOpacity={activeopacity} style={look.tile} onPress={onPress} accessibilityRole="button" accessibilityLabel={category.name}>
      <View style={look.avatar}>
        {showImage ? (
          <Image
            source={{ uri: `${ASSETS_BASE_URL}${category.imageUrl}` }}
            style={look.image}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <Text style={styles.avatarInitial}>{category.name.trim().charAt(0).toUpperCase() || '?'}</Text>
        )}
      </View>
      <Text style={look.name} {...nameFit(category.name, variant)}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

export type { CategoryGridItem, CategoryGridProps };
