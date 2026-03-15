import { useEffect } from 'react';
import { Code2 } from 'lucide-react';
import GameHeader from '@/components/layout/GameHeader';
import CheatCodeCard from '@/components/cheat-codes/CheatCodeCard';
import { useGameStore } from '@/store/gameStore';
import { useCheatCodeStore } from '@/store/cheatCodeStore';

const CATEGORIES = [
  'money', 'weapons', 'vehicles', 'god-mode',
  'spawn', 'world', 'stats', 'fun', 'other',
];
const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Phone'] as const;

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

export default function CheatCodes() {
  const { selectedGame } = useGameStore();
  const {
    cheatCodes, loading, selectedCategory, selectedPlatform,
    fetchCheatCodes, setCategory, setPlatform,
  } = useCheatCodeStore();

  useEffect(() => {
    if (selectedGame) fetchCheatCodes(selectedGame.slug);
  }, [selectedGame, fetchCheatCodes]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <GameHeader
        title="Cheat Codes"
        subtitle="Unlock hidden powers and secret commands"
        icon={<Code2 className="w-3.5 h-3.5" />}
      />

      {!selectedGame ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-white/10 text-gaming-muted text-xs">
            <span>👆</span>
            <span>Select a game above to view cheat codes</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Filter bar */}
          <div className="px-4 py-3 lg:px-6 border-b border-white/[0.06] glass-surface space-y-2.5 shrink-0">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <span className="text-[10px] text-gaming-muted font-display uppercase tracking-[2px] shrink-0 mr-1">Cat</span>
              <FilterPill active={selectedCategory === null} onClick={() => setCategory(null)}>All</FilterPill>
              {CATEGORIES.map((cat) => (
                <FilterPill key={cat} active={selectedCategory === cat} onClick={() => setCategory(selectedCategory === cat ? null : cat)}>
                  {cat}
                </FilterPill>
              ))}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <span className="text-[10px] text-gaming-muted font-display uppercase tracking-[2px] shrink-0 mr-1">Plat</span>
              <FilterPill active={selectedPlatform === null} onClick={() => setPlatform(null)}>All</FilterPill>
              {PLATFORMS.map((plat) => (
                <FilterPill key={plat} active={selectedPlatform === plat} onClick={() => setPlatform(selectedPlatform === plat ? null : plat)}>
                  {plat}
                </FilterPill>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="glass-card rounded-2xl p-4 space-y-3" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="skeleton h-5 w-3/4 rounded-lg" />
                    <div className="skeleton h-4 w-1/2 rounded-lg" />
                    <div className="skeleton h-20 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : cheatCodes.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-sm font-semibold text-gaming-text mb-1">No cheat codes found</p>
                  <p className="text-xs text-gaming-muted">Try adjusting your filters</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cheatCodes.map((code, index) => (
                  <div key={code.id} className="stagger-item" style={{ animationDelay: `${index * 40}ms` }}>
                    <CheatCodeCard cheatCode={code} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
