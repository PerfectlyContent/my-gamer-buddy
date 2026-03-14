import { create } from 'zustand';
import { Game } from '../types';
import { gamesApi } from '../lib/api';

interface GameStore {
  games: Game[];
  selectedGame: Game | null;
  loading: boolean;
  fetchGames: () => Promise<void>;
  selectGame: (game: Game | null) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  games: [],
  selectedGame: null,
  loading: false,

  fetchGames: async () => {
    const { games, loading } = get();
    if (games.length > 0 || loading) return;

    set({ loading: true });
    try {
      const games = await gamesApi.list();
      set({ games, loading: false });
    } catch (error) {
      console.error('Failed to fetch games:', error);
      set({ loading: false });
    }
  },

  selectGame: (game) => set({ selectedGame: game }),
}));
