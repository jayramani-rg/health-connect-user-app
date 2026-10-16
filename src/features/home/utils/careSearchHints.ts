import type { SearchHints } from '../../../components/SearchBar/types/SearchBar.types';

export const CARE_SEARCH_HINTS: SearchHints = {
  prefix: 'Search',
  hints: [
    { group: 'doctor', label: 'voice call' },
    { group: 'doctor', label: 'video call' },
    { group: 'doctor', label: 'in-clinic visit' },
    { group: 'lab', label: 'booking' },
    { group: 'lab', label: 'home collection' },
  ],
};
