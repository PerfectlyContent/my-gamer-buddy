import React from 'react';
import { cn } from '@/lib/utils';

export interface GamingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

const variantStyles: Record<
  NonNullable<GamingButtonProps['variant']>,
  { base: string; glow: string }
> = {
  primary: {
    base: 'bg-gradient-to-r from-gaming-blue/90 to-[#0099cc]/90 text-white border-gaming-blue/40 hover:from-gaming-blue hover:to-[#00aadd] hover:border-gaming-blue/70',
    glow: 'hover:shadow-[0_0_20px_rgba(0,212,255,0.4),0_0_40px_rgba(0,212,255,0.15)]',
  },
  secondary: {
    base: 'bg-gaming-purple/20 backdrop-blur-sm text-gaming-purple border-gaming-purple/30 hover:bg-gaming-purple/30 hover:border-gaming-purple/50',
    glow: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]',
  },
  ghost: {
    base: 'bg-transparent text-gaming-muted border-transparent hover:bg-white/[0.06] hover:backdrop-blur-sm hover:text-gaming-text hover:border-white/[0.10]',
    glow: '',
  },
  danger: {
    base: 'bg-gaming-red/20 backdrop-blur-sm text-gaming-red border-gaming-red/30 hover:bg-gaming-red/30 hover:border-gaming-red/50',
    glow: 'hover:shadow-[0_0_20px_rgba(255,51,51,0.3)]',
  },
};

const sizeStyles: Record<NonNullable<GamingButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const GamingButton = React.forwardRef<
  HTMLButtonElement,
  GamingButtonProps
>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      glow = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const v = variantStyles[variant];

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center font-medium font-body tracking-wide border rounded-xl',
          'transition-all duration-150 ease-out',
          'active:scale-[0.95]',
          'disabled:opacity-50 disabled:pointer-events-none',
          v.base,
          glow && v.glow,
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GamingButton.displayName = 'GamingButton';
