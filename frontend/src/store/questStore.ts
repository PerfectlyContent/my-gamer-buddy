import { create } from 'zustand';
import { Quest, QuestProgress } from '../types';
import { questsApi } from '../lib/api';

interface QuestStore {
  allQuests: Quest[];
  quests: Quest[];
  progress: Record<string, QuestProgress>;
  loading: boolean;
  loadedSlug: string | null;
  selectedCategory: string | null;
  showCompleted: 'all' | 'incomplete' | 'complete';
  fetchQuests: (slug: string) => Promise<void>;
  fetchProgress: (slug: string) => Promise<void>;
  toggleQuestComplete: (questId: string, slug: string) => Promise<void>;
  updateNotes: (questId: string, notes: string, slug: string) => Promise<void>;
  setCategory: (category: string | null) => void;
  setShowCompleted: (filter: 'all' | 'incomplete' | 'complete') => void;
}

function filterByCategory(all: Quest[], category: string | null): Quest[] {
  if (!category) return all;
  return all.filter((q) => q.category === category);
}

export const useQuestStore = create<QuestStore>((set, get) => ({
  allQuests: [],
  quests: [],
  progress: {},
  loading: false,
  loadedSlug: null,
  selectedCategory: null,
  showCompleted: 'all',

  fetchQuests: async (slug: string) => {
    const { loadedSlug, allQuests, selectedCategory } = get();
    // If already loaded for this game, just re-filter
    if (loadedSlug === slug && allQuests.length > 0) {
      set({ quests: filterByCategory(allQuests, selectedCategory) });
      return;
    }
    set({ loading: true });
    try {
      const quests = await questsApi.list(slug);
      set({
        allQuests: quests,
        quests: filterByCategory(quests, selectedCategory),
        loadedSlug: slug,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch quests:', error);
      set({ allQuests: [], quests: [], loading: false });
    }
  },

  fetchProgress: async (slug: string) => {
    try {
      const progressArray: QuestProgress[] = await questsApi.getProgress(slug);
      const progressMap: Record<string, QuestProgress> = {};
      progressArray.forEach((p) => {
        progressMap[p.quest_id] = p;
      });
      set({ progress: progressMap });
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
    } catch (error) {
      console.error('Failed to toggle quest:', error);
      // Refetch on error for consistency
      get().fetchProgress(slug);
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
    } catch (error) {
      console.error('Failed to update notes:', error);
      // Refetch on error for consistency
      get().fetchProgress(slug);
    }
  },

  setCategory: (category) => {
    set({ selectedCategory: category });
    const { allQuests } = get();
    set({ quests: filterByCategory(allQuests, category) });
  },

  setShowCompleted: (filter) => set({ showCompleted: filter }),
}));
