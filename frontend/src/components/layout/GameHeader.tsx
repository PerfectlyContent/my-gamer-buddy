import GameSelector from '@/components/games/GameSelector';

interface GameHeaderProps {
  title: string;
  subtitle?: string;
}

export default function GameHeader({ title, subtitle }: GameHeaderProps) {
  return (
    <div className="glass-surface shrink-0">
      <div className="flex flex-col lg:flex-row lg:items-center px-4 py-2 lg:px-6">
        <div className="shrink-0">
          <h1 className="text-xl lg:text-2xl font-bold gaming-heading tracking-wider">{title}</h1>
          {subtitle && <p className="text-xs text-gaming-muted mt-0.5 font-body">{subtitle}</p>}
        </div>
        <div className="flex-1 min-w-0 lg:ml-4">
          <GameSelector />
        </div>
      </div>
      <div className="gradient-sep" />
    </div>
  );
}
