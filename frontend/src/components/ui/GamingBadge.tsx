import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'default'
  | 'money'
  | 'weapons'
  | 'vehicles'
  | 'god-mode'
  | 'spawn'
  | 'world'
  | 'stats'
  | 'fun'
  | 'pc'
  | 'playstation'
  | 'xbox'
  | 'easy'
  | 'medium'
  | 'hard'
  | 'main'
  | 'side'
  | 'hidden'
  | 'collectible'
  | 'achievement';

export interface GamingBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantColorMap: Record<BadgeVariant, string> = {
  default:
    'bg-gaming-muted/[0.12] text-gaming-muted border-gaming-muted/40',
  money:
    'bg-gaming-green/[0.12] text-gaming-green border-gaming-green/40',
  weapons:
    'bg-gaming-red/[0.12] text-gaming-red border-gaming-red/40',
  vehicles:
    'bg-gaming-blue/[0.12] text-gaming-blue border-gaming-blue/40',
  'god-mode':
    'bg-gaming-purple/[0.12] text-gaming-purple border-gaming-purple/40',
  spawn:
    'bg-gaming-orange/[0.12] text-gaming-orange border-gaming-orange/40',
  world:
    'bg-gaming-blue/[0.12] text-gaming-blue border-gaming-blue/40',
  stats:
    'bg-gaming-green/[0.12] text-gaming-green border-gaming-green/40',
  fun:
    'bg-gaming-pink/[0.12] text-gaming-pink border-gaming-pink/40',
  pc:
    'bg-gaming-muted/[0.12] text-gaming-muted border-gaming-muted/40',
  playstation:
    'bg-gaming-muted/[0.12] text-gaming-muted border-gaming-muted/40',
  xbox:
    'bg-gaming-muted/[0.12] text-gaming-muted border-gaming-muted/40',
  easy:
    'bg-gaming-green/[0.12] text-gaming-green border-gaming-green/40',
  medium:
    'bg-gaming-orange/[0.12] text-gaming-orange border-gaming-orange/40',
  hard:
    'bg-gaming-red/[0.12] text-gaming-red border-gaming-red/40',
  main:
    'bg-gaming-blue/[0.12] text-gaming-blue border-gaming-blue/40',
  side:
    'bg-gaming-purple/[0.12] text-gaming-purple border-gaming-purple/40',
  hidden:
    'bg-gaming-pink/[0.12] text-gaming-pink border-gaming-pink/40',
  collectible:
    'bg-gaming-green/[0.12] text-gaming-green border-gaming-green/40',
  achievement:
    'bg-gaming-orange/[0.12] text-gaming-orange border-gaming-orange/40',
};

export const GamingBadge: React.FC<GamingBadgeProps> = ({
  variant = 'default',
  children,
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border backdrop-blur-sm',
        variantColorMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

GamingBadge.displayName = 'GamingBadge';
