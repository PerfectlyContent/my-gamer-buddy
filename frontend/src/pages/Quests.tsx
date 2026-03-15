import { useEffect, useMemo } from 'react';
import { ListChecks } from 'lucide-react';
import GameHeader from '@/components/layout/GameHeader';
import { GamingProgressBar } from '@/components/ui/GamingProgressBar';
import { useToast } from '@/components/ui/GamingToast';
import QuestCategorySection from '@/components/quests/QuestCategorySection';
import { useGameStore } from '@/store/gameStore';
import { useQuestStore } from '@/store/questStore';
import type { Quest } from '@/types';

function FilterPill({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-3 py-1.5 rounded-xl border text-[10px] font-display uppercase tracking-widest font-bold transition-all whitespace-nowrap ${
        active
          ? 'bg-gaming-blue/20 border-gaming-blue/50 ring-1 ring-gaming-blue/20 text-gaming-blue'
          : 'bg-white/[0.05] border-white/10 text-gaming-muted hover:bg-white/[0.08] hover:text-gaming-text'
      }`}
    >
      {children}
    </button>
  );
}

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

  // Fetch quests and progress when game changes
  useEffect(() => {
    if (selectedGame) {
      fetchQuests(selectedGame.slug);
      fetchProgress(selectedGame.slug);
    }
  }, [selectedGame, fetchQuests, fetchProgress]);

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
        subtitle="Secrets, hidden encounters & missable events"
        icon={<ListChecks className="w-3.5 h-3.5" />}
      />

      {!selectedGame ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-white/10 text-gaming-muted text-xs">
            <span>👆</span>
            <span>Select a game above to track quests</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Filter bar */}
          <div className="px-4 py-3 lg:px-6 border-b border-white/[0.06] glass-surface space-y-2.5 shrink-0">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <span className="text-[10px] text-gaming-muted font-display uppercase tracking-[2px] shrink-0 mr-1">Cat</span>
              {CATEGORIES.map(({ value, label }) => (
                <FilterPill key={label} active={selectedCategory === value} onClick={() => setCategory(value)}>
                  {label}
                </FilterPill>
              ))}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <span className="text-[10px] text-gaming-muted font-display uppercase tracking-[2px] shrink-0 mr-1">Show</span>
              {COMPLETION_FILTERS.map(({ value, label }) => (
                <FilterPill
                  key={value}
                  active={showCompleted === value}
                  onClick={() => setShowCompleted(value as 'all' | 'incomplete' | 'complete')}
                >
                  {label}
                </FilterPill>
              ))}
            </div>

            {/* Overall progress */}
            {totalQuests > 0 && (
              <div className="flex items-center gap-3 px-1">
                <span className="text-[10px] text-gaming-muted font-display uppercase tracking-[2px] shrink-0">
                  {completedQuests}/{totalQuests}
                </span>
                <div className="flex-1">
                  <GamingProgressBar value={overallPercent} size="md" showLabel color="#00d4ff" />
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
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-sm font-semibold text-gaming-text mb-1">No quests found</p>
                  <p className="text-xs text-gaming-muted">Try adjusting your filters</p>
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
