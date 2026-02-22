import React from 'react';
import { cn } from '@/lib/utils';
import { playSound, triggerHaptic } from '@/lib/sounds';

export interface GamingToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export const GamingToggle: React.FC<GamingToggleProps> = ({
  checked,
  onCheckedChange,
  label,
  className,
  disabled = false,
}) => {
  const handleToggle = () => {
    if (!disabled) {
      playSound('toggle');
      triggerHaptic('double');
      onCheckedChange(!checked);
    }
  };

  const toggle = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={handleToggle}
      className={cn(
        'relative inline-flex w-10 h-5 shrink-0 rounded-full border cursor-pointer',
        'transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gaming-blue/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        checked
          ? 'bg-gaming-blue/20 backdrop-blur-sm border-gaming-blue/60 shadow-[0_0_12px_rgba(0,212,255,0.3)]'
          : 'bg-white/[0.04] backdrop-blur-sm border-white/[0.10]'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 rounded-full',
          'transition-all duration-200 ease-out',
          'translate-y-[1px]',
          checked
            ? 'translate-x-5 bg-gaming-blue shadow-[0_0_12px_rgba(0,212,255,0.7),0_0_20px_rgba(0,212,255,0.4)]'
            : 'translate-x-[2px] bg-gaming-muted/60'
        )}
      />
    </button>
  );

  if (label) {
    return (
      <label
        className={cn(
          'flex items-center gap-3 cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {toggle}
        <span className="text-sm text-gaming-text select-none">{label}</span>
      </label>
    );
  }

  return <div className={className}>{toggle}</div>;
};

GamingToggle.displayName = 'GamingToggle';
