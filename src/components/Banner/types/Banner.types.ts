export type BannerVariant = 'info' | 'warning' | 'error' | 'success';

export interface BannerProps {
  variant: BannerVariant;
  message: string;
}
