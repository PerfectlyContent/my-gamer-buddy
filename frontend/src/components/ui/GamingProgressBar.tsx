import React from 'react';
import { cn } from '@/lib/utils';

export interface GamingProgressBarProps {
  value: number;
  color?: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export const GamingProgressBar: React.FC<GamingProgressBarProps> = ({
  value,
  color = '#00d4ff',
  size = 'sm',
  showLabel = false,
  className,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex-1 bg-white/[0.04] backdrop-blur-sm rounded-full overflow-hidden border border-white/[0.08]',
          size === 'sm' ? 'h-2' : 'h-3'
        )}
      >
        <div
          className="relative overflow-hidden h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${clampedValue}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}40, 0 0 4px ${color}60`,
          }}
        >
          <div className="absolute inset-0 shimmer-bg opacity-60" />
        </div>
      </div>
      {showLabel && (
        <span className="text-xs text-gaming-muted font-medium tabular-nums min-w-[3ch] text-right">
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  );
};

GamingProgressBar.displayName = 'GamingProgressBar';
