// features/home/types/home.types.ts
// Tier 2: Feature Types — scoped to the home feature.

export interface HomeCategory {
  id: string;
  name: string;
  iconUrl: string;
}

// Mock data structure matches this type exactly (Sec 17.2 Mock-first
// development) — the demo screen below imports MOCK_ITEMS shaped this way.
