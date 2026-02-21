import React from 'react';
import { cn } from '@/lib/utils';

const inputBaseStyles = [
  'w-full glass border border-white/[0.08] rounded-lg',
  'px-4 py-2.5 text-sm text-gaming-text',
  'placeholder:text-gaming-muted',
  'focus:outline-none focus:border-gaming-blue/50 focus:ring-1 focus:ring-gaming-blue/20 focus:shadow-[0_0_10px_rgba(0,212,255,0.10)]',
  'transition-all',
].join(' ');

export const GamingInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(inputBaseStyles, className)}
      {...props}
    />
  );
});

GamingInput.displayName = 'GamingInput';

export const GamingTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(inputBaseStyles, 'min-h-[80px] resize-y', className)}
      {...props}
    />
  );
});

GamingTextarea.displayName = 'GamingTextarea';
