import { useEffect, useMemo } from 'react';
import GameHeader from '@/components/layout/GameHeader';
import { GamingButton } from '@/components/ui/GamingButton';
import { GamingProgressBar } from '@/components/ui/GamingProgressBar';
import { useToast } from '@/components/ui/GamingToast';
import QuestCategorySection from '@/components/quests/QuestCategorySection';
import { useGameStore } from '@/store/gameStore';
import { useQuestStore } from '@/store/questStore';
import type { Quest } from '@/types';

const CATEGORIES = [
  { value: null, label: 'All' },
  { value: 'missable', label: '⚠️ Missable' },
  { value: 'secret', label: '🔐 Secret' },
  { value: 'npc_encounter', label: '🗣️ NPC' },
  { value: 'mini_event', label: '⚡ Event' },
  { value: 'easter_egg', label: '🥚 Easter Egg' },
] as const;

const COMPLETION_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'incomplete', label: 'Incomplete' },
  { value: 'complete', label: 'Complete' },
] as const;

export default function Quests() {
  const { selectedGame } = useGameStore();
  const {
    quests,
    progress,
    loading,
    selectedCategory,
    showCompleted,
    fetchQuests,
    fetchProgress,
    toggleQuestComplete,
    updateNotes,
    setCategory,
    setShowCompleted,
  } = useQuestStore();
  const { toast } = useToast();

  // Fetch quests and progress when game or category changes
  useEffect(() => {
    if (selectedGame) {
      fetchQuests(selectedGame.slug);
      fetchProgress(selectedGame.slug);
    }
  }, [selectedGame, selectedCategory, fetchQuests, fetchProgress]);

  // Filter quests by completion status
  const filteredQuests = useMemo(() => {
    if (showCompleted === 'all') return quests;
    return quests.filter((q) => {
      const isComplete = progress[q.id]?.completed || false;
      return showCompleted === 'complete' ? isComplete : !isComplete;
    });
  }, [quests, progress, showCompleted]);

  // Group quests by category
  const groupedQuests = useMemo(() => {
    const groups: Record<string, Quest[]> = {};
    filteredQuests.forEach((quest) => {
      if (!groups[quest.category]) {
        groups[quest.category] = [];
      }
      groups[quest.category].push(quest);
    });
    // Sort categories in a consistent order
    const order = ['missable', 'secret', 'npc_encounter', 'mini_event', 'easter_egg'];
    const sorted: [string, Quest[]][] = [];
    order.forEach((cat) => {
      if (groups[cat]) sorted.push([cat, groups[cat]]);
    });
    // Add any remaining categories
    Object.keys(groups).forEach((cat) => {
      if (!order.includes(cat)) sorted.push([cat, groups[cat]]);
    });
    return sorted;
  }, [filteredQuests]);

  // Overall progress
  const totalQuests = quests.length;
  const completedQuests = quests.filter(
    (q) => progress[q.id]?.completed
  ).length;
  const overallPercent =
    totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0;

  const handleToggle = async (questId: string) => {
    if (!selectedGame) return;
    const wasCompleted = progress[questId]?.completed || false;
    await toggleQuestComplete(questId, selectedGame.slug);
    if (!wasCompleted) {
      const quest = quests.find((q) => q.id === questId);
      toast({
        title: 'Quest Complete!',
        description: quest ? quest.name : 'A quest has been completed',
        variant: 'achievement',
      });
    }
  };

  const handleUpdateNotes = (questId: string, notes: string) => {
    if (!selectedGame) return;
    updateNotes(questId, notes, selectedGame.slug);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <GameHeader
        title="Quest Tracker"
        subtitle="Secrets, hidden encounters & missable events you might have skipped"
      />

      {!selectedGame ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-5xl mb-4">🎮</div>
            <h2 className="text-xl font-bold text-gaming-text mb-2">
              Select a Game
            </h2>
            <p className="text-gaming-muted">
              Choose a game above to track quests
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Filter Bar */}
          <div className="px-4 py-3 lg:px-6 border-b border-white/[0.10] glass space-y-3 shrink-0">
            {/* Category Tabs */}
            <div className="flex items-center gap-2 flex-nowrap overflow-x-auto scrollbar-hide">
              <span className="text-xs text-gaming-muted font-medium mr-1 shrink-0">
                Category:
              </span>
              {CATEGORIES.map(({ value, label }) => (
                <GamingButton
                  key={label}
                  variant={selectedCategory === value ? 'primary' : 'ghost'}
                  size="sm"
                  className="shrink-0 whitespace-nowrap"
                  onClick={() => setCategory(value)}
                >
                  {label}
                </GamingButton>
              ))}
            </div>

            {/* Completion Filter */}
            <div className="flex items-center gap-2 flex-nowrap overflow-x-auto scrollbar-hide">
              <span className="text-xs text-gaming-muted font-medium mr-1 shrink-0">
                Show:
              </span>
              {COMPLETION_FILTERS.map(({ value, label }) => (
                <GamingButton
                  key={value}
                  variant={showCompleted === value ? 'primary' : 'ghost'}
                  size="sm"
                  className="shrink-0 whitespace-nowrap"
                  onClick={() =>
                    setShowCompleted(
                      value as 'all' | 'incomplete' | 'complete'
                    )
                  }
                >
                  {label}
                </GamingButton>
              ))}
            </div>

            {/* Overall Progress */}
            {totalQuests > 0 && (
              <div className="glass-card rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gaming-muted font-medium">
                    Overall: {completedQuests}/{totalQuests}
                  </span>
                  <div className="flex-1">
                    <GamingProgressBar
                      value={overallPercent}
                      size="md"
                      showLabel
                      color="#00d4ff"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="glass-card rounded-2xl p-4 space-y-3">
                    <div className="skeleton h-6 w-1/3 rounded-lg" />
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="skeleton h-12 w-full rounded-xl" style={{ animationDelay: `${(i * 4 + j) * 40}ms` }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredQuests.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-4xl mb-3">📋</div>
                  <h3 className="text-lg font-semibold text-gaming-text mb-1">
                    No quests found
                  </h3>
                  <p className="text-gaming-muted text-sm">
                    Try adjusting your filters or select a different game
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedQuests.map(([category, categoryQuests]) => (
                  <QuestCategorySection
                    key={category}
                    category={category}
                    quests={categoryQuests}
                    progress={progress}
                    onToggle={handleToggle}
                    onUpdateNotes={handleUpdateNotes}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
