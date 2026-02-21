import React from 'react';
import { cn } from '@/lib/utils';

export interface GamingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glowColor?: string;
}

export const GamingCard = React.forwardRef<HTMLDivElement, GamingCardProps>(
  ({ className, hover = true, glowColor, style, children, ...props }, ref) => {
    const hoverStyles = hover
      ? glowColor
        ? 'hover:translate-y-[-2px] hover:border-[var(--glow-color)] hover:shadow-[0_0_24px_var(--glow-color),0_12px_40px_rgba(0,0,0,0.5)]'
        : 'hover:translate-y-[-2px] hover:border-white/[0.16] hover:shadow-[0_0_24px_rgba(0,212,255,0.10),0_12px_40px_rgba(0,0,0,0.5)]'
      : '';

    const combinedStyle =
      hover && glowColor
        ? { ...style, '--glow-color': glowColor } as React.CSSProperties
        : style;

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
          'transition-all duration-250',
          hoverStyles,
          className
        )}
        style={combinedStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GamingCard.displayName = 'GamingCard';
