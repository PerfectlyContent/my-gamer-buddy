import { useEffect } from 'react';
import GameHeader from '@/components/layout/GameHeader';
import { GamingButton } from '@/components/ui/GamingButton';
import CheatCodeCard from '@/components/cheat-codes/CheatCodeCard';
import { useGameStore } from '@/store/gameStore';
import { useCheatCodeStore } from '@/store/cheatCodeStore';

const CATEGORIES = [
  'money',
  'weapons',
  'vehicles',
  'god-mode',
  'spawn',
  'world',
  'stats',
  'fun',
  'other',
];

const PLATFORMS = ['PC', 'PlayStation', 'Xbox'] as const;

export default function CheatCodes() {
  const { selectedGame } = useGameStore();
  const {
    cheatCodes,
    loading,
    selectedCategory,
    selectedPlatform,
    fetchCheatCodes,
    setCategory,
    setPlatform,
  } = useCheatCodeStore();

  // Fetch when game, category, or platform changes
  useEffect(() => {
    if (selectedGame) {
      fetchCheatCodes(selectedGame.slug);
    }
  }, [selectedGame, selectedCategory, selectedPlatform, fetchCheatCodes]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <GameHeader
        title="Cheat Codes"
        subtitle="Unlock hidden powers and secret commands"
      />

      {!selectedGame ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-5xl mb-4">🎮</div>
            <h2 className="text-xl font-bold text-gaming-text mb-2">
              Select a Game
            </h2>
            <p className="text-gaming-muted">
              Choose a game above to view cheat codes
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Filter Bar */}
          <div className="px-4 py-3 lg:px-6 border-b border-white/[0.10] glass space-y-3 shrink-0">
            {/* Category Pills */}
            <div className="flex items-center gap-2 flex-nowrap overflow-x-auto scrollbar-hide">
              <span className="text-xs text-gaming-muted font-medium mr-1 shrink-0">
                Category:
              </span>
              <GamingButton
                variant={selectedCategory === null ? 'primary' : 'ghost'}
                size="sm"
                className="shrink-0 whitespace-nowrap"
                onClick={() => setCategory(null)}
              >
                All
              </GamingButton>
              {CATEGORIES.map((cat) => (
                <GamingButton
                  key={cat}
                  variant={selectedCategory === cat ? 'primary' : 'ghost'}
                  size="sm"
                  className="shrink-0 whitespace-nowrap"
                  onClick={() =>
                    setCategory(selectedCategory === cat ? null : cat)
                  }
                >
                  {cat}
                </GamingButton>
              ))}
            </div>

            {/* Platform Pills */}
            <div className="flex items-center gap-2 flex-nowrap overflow-x-auto scrollbar-hide">
              <span className="text-xs text-gaming-muted font-medium mr-1 shrink-0">
                Platform:
              </span>
              <GamingButton
                variant={selectedPlatform === null ? 'primary' : 'ghost'}
                size="sm"
                className="shrink-0 whitespace-nowrap"
                onClick={() => setPlatform(null)}
              >
                All
              </GamingButton>
              {PLATFORMS.map((plat) => (
                <GamingButton
                  key={plat}
                  variant={selectedPlatform === plat ? 'primary' : 'ghost'}
                  size="sm"
                  className="shrink-0 whitespace-nowrap"
                  onClick={() =>
                    setPlatform(selectedPlatform === plat ? null : plat)
                  }
                >
                  {plat}
                </GamingButton>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="glass-card rounded-2xl p-4 space-y-3" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="skeleton h-5 w-3/4 rounded-lg" />
                    <div className="skeleton h-4 w-1/2 rounded-lg" />
                    <div className="skeleton h-20 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : cheatCodes.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <h3 className="text-lg font-semibold text-gaming-text mb-1">
                    No cheat codes found
                  </h3>
                  <p className="text-gaming-muted text-sm">
                    Try adjusting your filters or select a different game
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
