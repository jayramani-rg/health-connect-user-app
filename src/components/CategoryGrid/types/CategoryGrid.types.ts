export interface CategoryGridItem {
  id: string;
  name: string;
  imageUrl?: string | null;
}

export interface CategoryGridProps {
  categories: CategoryGridItem[];
  onSelect: (category: CategoryGridItem) => void;
  /** 'grid' (default) wraps into a 2-column card grid; 'strip' renders a compact horizontal scroller
   * (used for Home's preview row) sharing the same tile-with-image-fallback logic. */
  variant?: 'grid' | 'strip';
}
