import { useState } from 'react';
import { Quest, QuestProgress } from '@/types';
import { GamingBadge } from '@/components/ui/GamingBadge';
import { cn } from '@/lib/utils';
import { StickyNote, ChevronDown, ChevronUp } from 'lucide-react';

interface QuestItemProps {
  quest: Quest;
  progress: QuestProgress | undefined;
  onToggle: () => void;
  onUpdateNotes: (notes: string) => void;
}

export default function QuestItem({
  quest,
  progress,
  onToggle,
  onUpdateNotes,
}: QuestItemProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(progress?.notes || '');
  const isCompleted = progress?.completed || false;

  const handleNotesBlur = () => {
    if (notesDraft !== (progress?.notes || '')) {
      onUpdateNotes(notesDraft);
    }
  };

  const difficultyVariant = quest.difficulty as 'easy' | 'medium' | 'hard' | undefined;

  return (
    <div
      className={cn(
        'px-5 py-4 transition-all duration-200',
        isCompleted ? 'glass rounded-xl opacity-60' : 'glass-card rounded-xl'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={cn(
            'mt-0.5 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200',
            isCompleted
              ? 'bg-gaming-blue border-gaming-blue scale-105 shadow-[0_0_8px_rgba(0,212,255,0.5)]'
              : 'border-white/20 hover:border-gaming-blue/50'
          )}
        >
          {isCompleted && (
            <svg
              className="w-3 h-3 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'text-sm font-medium',
                isCompleted
                  ? 'text-gaming-muted line-through'
                  : 'text-gaming-text'
              )}
            >
              {quest.name}
            </span>
            {quest.is_missable && !isCompleted && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-amber-500/20 text-amber-400 border border-amber-500/30">
                ⚠️ Missable
              </span>
            )}
            {quest.difficulty && difficultyVariant && (
              <GamingBadge variant={difficultyVariant}>
                {quest.difficulty}
              </GamingBadge>
            )}
            {quest.region && (
              <GamingBadge variant="default">{quest.region}</GamingBadge>
            )}
          </div>

          {quest.description && (
            <p className="text-xs text-gaming-muted mt-1 leading-relaxed">
              {quest.description}
            </p>
          )}
        </div>

        {/* Notes Toggle */}
        <button
          onClick={() => setShowNotes(!showNotes)}
          className={cn(
            'shrink-0 p-1 rounded transition-colors',
            showNotes || progress?.notes
              ? 'text-gaming-blue'
              : 'text-gaming-muted hover:text-gaming-text'
          )}
          title="Notes"
        >
          <StickyNote className="w-4 h-4" />
          {showNotes ? (
            <ChevronUp className="w-3 h-3 inline ml-0.5" />
          ) : (
            <ChevronDown className="w-3 h-3 inline ml-0.5" />
          )}
        </button>
      </div>

      {/* Expandable Notes */}
      {showNotes && (
        <div className="mt-3 pl-8">
          <textarea
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add personal notes for this quest..."
            className="w-full glass border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gaming-text placeholder:text-gaming-muted/50 resize-none focus:outline-none focus:border-gaming-blue/50 focus:ring-1 focus:ring-gaming-blue/20 transition-colors"
            rows={2}
          />
        </div>
      )}
    </div>
  );
}
