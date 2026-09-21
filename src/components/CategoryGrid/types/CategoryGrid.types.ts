export interface CategoryGridItem {
  id: string;
  name: string;
  imageUrl?: string | null;
}

export interface CategoryGridProps {
  categories: CategoryGridItem[];
  onSelect: (category: CategoryGridItem) => void;
}
