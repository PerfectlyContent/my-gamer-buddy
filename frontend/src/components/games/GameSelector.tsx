import { useGameStore } from '../../store/gameStore';
import { Game } from '../../types';

interface GameSelectorProps {
  onSelect?: (game: Game | null) => void;
  compact?: boolean;
}

export default function GameSelector({ onSelect, compact }: GameSelectorProps) {
  const { games, selectedGame, selectGame } = useGameStore();

  const handleSelect = (game: Game | null) => {
    selectGame(game);
    onSelect?.(game);
  };

  const pillSize = compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <div className="flex gap-1.5 p-3 overflow-x-auto scrollbar-hide">
      <button
        onClick={() => handleSelect(null)}
        className={`flex items-center gap-1 ${pillSize} rounded-full font-medium transition-all whitespace-nowrap shrink-0 ${
          !selectedGame
            ? 'glass-strong bg-gaming-blue/15 text-gaming-blue border border-gaming-blue/50 shadow-[0_0_10px_rgba(0,212,255,0.2)]'
            : 'glass text-gaming-muted border border-white/[0.08] hover:border-white/[0.16] hover:text-gaming-text'
        }`}
      >
        🎮 All
      </button>
      {games.map((game) => (
        <button
          key={game.id}
          onClick={() => handleSelect(game)}
          className={`flex items-center gap-1 ${pillSize} rounded-full font-medium transition-all whitespace-nowrap shrink-0 ${
            selectedGame?.id === game.id
              ? 'glass border'
              : 'glass text-gaming-muted border border-white/[0.08] hover:border-white/[0.16] hover:text-gaming-text'
          }`}
          style={
            selectedGame?.id === game.id
              ? {
                  backgroundColor: `${game.color_accent}20`,
                  color: game.color_accent,
                  borderColor: `${game.color_accent}80`,
                }
              : undefined
          }
        >
          {game.icon} {game.name}
        </button>
      ))}
    </div>
  );
}
