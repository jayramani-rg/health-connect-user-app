declare module '@env' {
  export const API_BASE_URL: string;
  /** Google Maps Platform key (Geocoding + Maps Static). Undefined when the active .env omits it — the
   * location helpers treat that as "location lookup unavailable", never a crash. */
  export const GOOGLE_API_KEY: string | undefined;
}
