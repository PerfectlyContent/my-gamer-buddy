import { create } from 'zustand';
import { Quest, QuestProgress } from '../types';
import { questsApi } from '../lib/api';

interface QuestStore {
  quests: Quest[];
  progress: Record<string, QuestProgress>;
  loading: boolean;
  selectedCategory: string | null;
  showCompleted: 'all' | 'incomplete' | 'complete';
  fetchQuests: (slug: string) => Promise<void>;
  fetchProgress: (slug: string) => Promise<void>;
  toggleQuestComplete: (questId: string, slug: string) => Promise<void>;
  updateNotes: (questId: string, notes: string, slug: string) => Promise<void>;
  setCategory: (category: string | null) => void;
  setShowCompleted: (filter: 'all' | 'incomplete' | 'complete') => void;
}

export const useQuestStore = create<QuestStore>((set, get) => ({
  quests: [],
  progress: {},
  loading: false,
  selectedCategory: null,
  showCompleted: 'all',

  fetchQuests: async (slug: string) => {
    set({ loading: true });
    try {
      const { selectedCategory } = get();
      const quests = await questsApi.list(slug, selectedCategory || undefined);
      set({ quests: Array.isArray(quests) ? quests : [], loading: false });
    } catch (error) {
      console.error('Failed to fetch quests:', error);
      set({ quests: [], loading: false });
    }
  },

  fetchProgress: async (slug: string) => {
    try {
      // Backend returns Record<string, QuestProgress> directly
      const progress: Record<string, QuestProgress> = await questsApi.getProgress(slug);
      set({ progress: (progress && typeof progress === 'object' && !Array.isArray(progress)) ? progress : {} });
    } catch (error) {
      console.error('Failed to fetch quest progress:', error);
    }
  },

  toggleQuestComplete: async (questId: string, slug: string) => {
    const { progress } = get();
    const current = progress[questId];
    const newCompleted = !(current?.completed);
    try {
      await questsApi.updateProgress(questId, { completed: newCompleted });
      // Optimistically update local state
      set({
        progress: {
          ...progress,
          [questId]: {
            quest_id: questId,
            completed: newCompleted,
            notes: current?.notes || null,
            completed_at: newCompleted ? new Date().toISOString() : null,
          },
        },
      });
      // Refetch for consistency
      get().fetchProgress(slug);
    } catch (error) {
      console.error('Failed to toggle quest:', error);
    }
  },

  updateNotes: async (questId: string, notes: string, slug: string) => {
    const { progress } = get();
    const current = progress[questId];
    try {
      await questsApi.updateProgress(questId, { notes });
      set({
        progress: {
          ...progress,
          [questId]: {
            quest_id: questId,
            completed: current?.completed || false,
            notes,
            completed_at: current?.completed_at || null,
          },
        },
      });
      get().fetchProgress(slug);
    } catch (error) {
      console.error('Failed to update notes:', error);
    }
  },

  setCategory: (category) => set({ selectedCategory: category }),
  setShowCompleted: (filter) => set({ showCompleted: filter }),
}));
