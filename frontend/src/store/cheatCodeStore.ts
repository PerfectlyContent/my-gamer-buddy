import { create } from 'zustand';
import { CheatCode } from '../types';
import { cheatCodesApi } from '../lib/api';

interface CheatCodeStore {
  allCheatCodes: CheatCode[];
  cheatCodes: CheatCode[];
  loading: boolean;
  loadedSlug: string | null;
  selectedCategory: string | null;
  selectedPlatform: string | null;
  fetchCheatCodes: (slug: string) => Promise<void>;
  setCategory: (category: string | null) => void;
  setPlatform: (platform: string | null) => void;
}

function applyFilters(
  all: CheatCode[],
  category: string | null,
  platform: string | null,
): CheatCode[] {
  let filtered = all;
  if (category) {
    filtered = filtered.filter((c) => c.category === category);
  }
  if (platform) {
    filtered = filtered.filter(
      (c) => c.platform === platform || c.platform === 'All',
    );
  }
  return filtered;
}

export const useCheatCodeStore = create<CheatCodeStore>((set, get) => ({
  allCheatCodes: [],
  cheatCodes: [],
  loading: false,
  loadedSlug: null,
  selectedCategory: null,
  selectedPlatform: null,

  fetchCheatCodes: async (slug: string) => {
    const { loadedSlug, allCheatCodes, selectedCategory, selectedPlatform } = get();
    // If already loaded for this game, just re-filter
    if (loadedSlug === slug && allCheatCodes.length > 0) {
      set({ cheatCodes: applyFilters(allCheatCodes, selectedCategory, selectedPlatform) });
      return;
    }
    set({ loading: true });
    try {
      const cheatCodes = await cheatCodesApi.list(slug);
      set({
        allCheatCodes: cheatCodes,
        cheatCodes: applyFilters(cheatCodes, selectedCategory, selectedPlatform),
        loadedSlug: slug,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch cheat codes:', error);
      set({ allCheatCodes: [], cheatCodes: [], loading: false });
    }
  },

  setCategory: (category) => {
    set({ selectedCategory: category });
    const { allCheatCodes, selectedPlatform } = get();
    set({ cheatCodes: applyFilters(allCheatCodes, category, selectedPlatform) });
  },

  setPlatform: (platform) => {
    set({ selectedPlatform: platform });
    const { allCheatCodes, selectedCategory } = get();
    set({ cheatCodes: applyFilters(allCheatCodes, selectedCategory, platform) });
  },
}));
