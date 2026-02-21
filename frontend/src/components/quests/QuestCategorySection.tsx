import { useState } from 'react';

const CATEGORY_LABELS: Record<string, string> = {
  missable: '⚠️ Missable',
  secret: '🔐 Secret',
  npc_encounter: '🗣️ NPC Encounter',
  mini_event: '⚡ Mini Event',
  easter_egg: '🥚 Easter Egg',
};
import { Quest, QuestProgress } from '@/types';
import { GamingProgressBar } from '@/components/ui/GamingProgressBar';
import QuestItem from './QuestItem';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestCategorySectionProps {
  category: string;
  quests: Quest[];
  progress: Record<string, QuestProgress>;
  onToggle: (questId: string) => void;
  onUpdateNotes: (questId: string, notes: string) => void;
}

export default function QuestCategorySection({
  category,
  quests,
  progress,
  onToggle,
  onUpdateNotes,
}: QuestCategorySectionProps) {
  const [expanded, setExpanded] = useState(true);

  const completedCount = quests.filter(
    (q) => progress[q.id]?.completed
  ).length;
  const totalCount = quests.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-3 mb-6">
      {/* Category Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 py-2 px-2 rounded-lg group hover:bg-white/[0.04] transition-colors duration-200"
      >
        <span className="text-gaming-muted transition-transform duration-200">
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </span>

        <h3 className="text-base font-semibold text-gaming-text">
          {CATEGORY_LABELS[category] ?? category}
        </h3>

        <span className="text-xs text-gaming-muted font-medium">
          {completedCount}/{totalCount}
        </span>

        <div className={cn('flex-1', progressPercent >= 100 && 'drop-shadow-[0_0_8px_rgba(0,255,100,0.3)]')}>
          <GamingProgressBar value={progressPercent} size="sm" />
        </div>
      </button>

      {/* Quest List */}
      {expanded && (
        <div className={cn('space-y-2.5 pl-7')}>
          {quests.map((quest, index) => (
            <div key={quest.id} className="stagger-item" style={{ animationDelay: `${index * 40}ms` }}>
              <QuestItem
                quest={quest}
                progress={progress[quest.id]}
                onToggle={() => onToggle(quest.id)}
                onUpdateNotes={(notes) => onUpdateNotes(quest.id, notes)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
