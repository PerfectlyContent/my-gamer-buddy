import { useState } from 'react';
import { CheatCode } from '@/types';
import { GamingCard } from '@/components/ui/GamingCard';
import { GamingBadge } from '@/components/ui/GamingBadge';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playSound, triggerHaptic } from '@/lib/sounds';

interface CheatCodeCardProps {
  cheatCode: CheatCode;
}

export default function CheatCodeCard({ cheatCode }: CheatCodeCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cheatCode.code);
      setCopied(true);
      playSound('copy');
      triggerHaptic('copy');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      playSound('error');
      triggerHaptic('error');
      console.error('Failed to copy to clipboard');
    }
  };

  const platformMap: Record<string, 'pc' | 'playstation' | 'xbox' | 'default'> = {
    pc: 'pc',
    playstation: 'playstation',
    xbox: 'xbox',
  };
  const platformKey = cheatCode.platform.toLowerCase().replace(' ', '');
  const platformVariant = platformMap[platformKey] || 'default';

  const categoryVariant = (
    ['money', 'weapons', 'vehicles', 'god-mode', 'spawn', 'world', 'stats', 'fun'].includes(
      cheatCode.category
    )
      ? cheatCode.category
      : 'default'
  ) as 'money' | 'weapons' | 'vehicles' | 'god-mode' | 'spawn' | 'world' | 'stats' | 'fun' | 'default';

  const glowColorMap: Record<string, string> = {
    money: 'rgba(0, 255, 100, 0.15)',
    currency: 'rgba(0, 255, 100, 0.15)',
    weapons: 'rgba(255, 50, 50, 0.15)',
    combat: 'rgba(255, 50, 50, 0.15)',
    vehicles: 'rgba(0, 150, 255, 0.15)',
    transport: 'rgba(0, 150, 255, 0.15)',
    abilities: 'rgba(180, 0, 255, 0.15)',
    power: 'rgba(180, 0, 255, 0.15)',
    'god-mode': 'rgba(180, 0, 255, 0.15)',
  };
  const glowColor = glowColorMap[cheatCode.category] || 'rgba(0, 212, 255, 0.15)';

  return (
    <GamingCard hover={false} className="flex flex-col gap-4" style={{ boxShadow: `0 0 20px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.05)` }}>
      <h3 className="text-base font-semibold text-gaming-text">{cheatCode.title}</h3>

      {cheatCode.description && (
        <p className="text-gaming-muted text-sm">{cheatCode.description}</p>
      )}

      <div className="relative overflow-hidden bg-black/50 backdrop-blur-sm rounded-xl">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)' }} />
        <div className="relative px-4 py-3 font-mono text-gaming-green text-sm flex items-center justify-between gap-2">
          <span className="break-all">{cheatCode.code}</span>
          <button
            onClick={handleCopy}
            className={cn(
              'shrink-0 p-1 rounded transition-all duration-200',
              copied
                ? 'text-gaming-green bg-gaming-green/20 shadow-[0_0_10px_rgba(0,255,100,0.3)]'
                : 'text-gaming-muted hover:text-gaming-text'
            )}
            title={copied ? 'Copied!' : 'Copy code'}
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <GamingBadge variant={categoryVariant}>{cheatCode.category}</GamingBadge>
        <GamingBadge variant={platformVariant}>
          {cheatCode.platform}
        </GamingBadge>
      </div>
    </GamingCard>
  );
}
