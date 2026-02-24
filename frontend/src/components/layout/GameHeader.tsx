import React from 'react';
import GameSelector from '@/components/games/GameSelector';

interface GameHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export default function GameHeader({ title, subtitle, icon }: GameHeaderProps) {
  return (
    <>
      {/* ── Mobile header: game pills + page title row ── */}
      <header className="shrink-0 border-b border-white/[0.06] glass-strong z-10 lg:hidden">
        {/* Row 1: game selector pills */}
        <div className="overflow-x-auto scrollbar-hide px-3 pt-3 pb-1">
          <GameSelector />
        </div>

        {/* Row 2: page identity */}
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          {icon && (
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-gaming-muted flex-shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h1 className="font-display text-[11px] tracking-[0.2em] uppercase text-gaming-text">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[10px] text-gaming-muted mt-0.5 leading-tight">{subtitle}</p>
            )}
          </div>
        </div>
      </header>

      {/* ── Desktop header: title + game selector inline ── */}
      <div className="hidden lg:flex items-center gap-4 px-6 py-3 border-b border-white/[0.06] glass-surface shrink-0">
        <div className="shrink-0">
          <h1 className="text-lg font-bold gaming-heading tracking-wider">{title}</h1>
          {subtitle && <p className="text-xs text-gaming-muted mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex-1 min-w-0">
          <GameSelector />
        </div>
      </div>
    </>
  );
}
