export type BannerDestinationType = 'NONE' | 'INTERNAL' | 'EXTERNAL';

export interface BannerDestination {
  type: BannerDestinationType;
  internalTarget: string | null;
  internalParam: string | null;
  externalUrl: string | null;
}

export interface HomeBanner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  ctaLabel: string | null;
  destination: BannerDestination;
}
