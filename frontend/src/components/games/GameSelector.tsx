import { memo } from 'react';
import { useGameStore } from '../../store/gameStore';

interface GameSelectorProps {
  onSelect?: (game: import('../../types').Game | null) => void;
  compact?: boolean;
}

export default memo(function GameSelector({ onSelect, compact: _compact }: GameSelectorProps) {
  const { games, selectedGame, selectGame } = useGameStore();

  const handleSelect = (game: import('../../types').Game | null) => {
    selectGame(game);
    onSelect?.(game);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
      {/* All games pill */}
      <button
        onClick={() => handleSelect(null)}
        className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${
          !selectedGame
            ? 'bg-gaming-blue/20 border-gaming-blue/50 ring-1 ring-gaming-blue/20'
            : 'bg-white/[0.05] border-white/10 grayscale hover:grayscale-0'
        }`}
      >
        <span className="text-xl">🎮</span>
        <span
          className={`text-[10px] font-display uppercase tracking-widest font-bold pr-1 ${
            !selectedGame ? 'text-gaming-blue' : 'text-gaming-muted'
          }`}
        >
          All
        </span>
      </button>

      {games.map((game) => {
        const isActive = selectedGame?.id === game.id;
        return (
          <button
            key={game.id}
            onClick={() => handleSelect(game)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${
              isActive ? 'ring-1' : 'bg-white/[0.05] border-white/10 grayscale hover:grayscale-0'
            }`}
            style={
              isActive
                ? {
                    backgroundColor: `${game.color_accent}20`,
                    borderColor: `${game.color_accent}60`,
                    boxShadow: `0 0 0 1px ${game.color_accent}20`,
                  }
                : undefined
            }
          >
            <span className="text-xl">{game.icon}</span>
            <span
              className="text-[10px] font-display uppercase tracking-widest font-bold pr-1"
              style={isActive ? { color: game.color_accent } : undefined}
            >
              {game.name}
            </span>
          </button>
        );
      })}
    </div>
  );
})
