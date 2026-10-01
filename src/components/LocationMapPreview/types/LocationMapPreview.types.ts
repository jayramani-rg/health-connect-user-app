export interface LocationMapPreviewProps {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  /** Short label on the bottom strip, e.g. "Prahlad Nagar, Ahmedabad". */
  caption?: string | null;
  height?: number;
  /** Shows a spinner in the placeholder while an address lookup is in flight. */
  loading?: boolean;
  /** Placeholder text when no point is resolved yet. */
  placeholder?: string;
}
