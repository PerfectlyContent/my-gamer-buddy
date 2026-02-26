import { create } from 'zustand';
import { CheatCode } from '../types';
import { cheatCodesApi } from '../lib/api';

interface CheatCodeStore {
  cheatCodes: CheatCode[];
  loading: boolean;
  selectedCategory: string | null;
  selectedPlatform: string | null;
  fetchCheatCodes: (slug: string) => Promise<void>;
  setCategory: (category: string | null) => void;
  setPlatform: (platform: string | null) => void;
}

export const useCheatCodeStore = create<CheatCodeStore>((set, get) => ({
  cheatCodes: [],
  loading: false,
  selectedCategory: null,
  selectedPlatform: null,

  fetchCheatCodes: async (slug: string) => {
    set({ loading: true });
    try {
      const { selectedCategory, selectedPlatform } = get();
      const params: { category?: string; platform?: string } = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedPlatform) params.platform = selectedPlatform;
      const cheatCodes = await cheatCodesApi.list(slug, params);
      set({ cheatCodes: Array.isArray(cheatCodes) ? cheatCodes : [], loading: false });
    } catch (error) {
      console.error('Failed to fetch cheat codes:', error);
      set({ cheatCodes: [], loading: false });
    }
  },

  setCategory: (category) => set({ selectedCategory: category }),
  setPlatform: (platform) => set({ selectedPlatform: platform }),
}));
