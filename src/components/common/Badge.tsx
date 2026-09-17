import React from 'react';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'rating' | 'classification' | 'resolution' | 'gold';
  classification?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  classification,
  className = '',
}) => {
  if (variant === 'rating') {
    return (
      <span className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-brand-surface/90 border border-brand-border/60 text-gold shadow-sm backdrop-blur-sm',
        className
      )}>
        <Star className="w-3 h-3 fill-gold text-gold" />
        <span>{children}</span>
      </span>
    );
  }

  if (variant === 'classification') {
    const age = classification || String(children);
    const colorMap: Record<string, string> = {
      'L': 'bg-emerald-600 text-white',
      '10': 'bg-sky-600 text-white',
      '12': 'bg-amber-500 text-black font-bold',
      '14': 'bg-orange-600 text-white',
      '16': 'bg-crimson text-white font-bold',
      '18': 'bg-red-950 text-red-300 border border-red-800 font-bold',
    };

    return (
      <span className={clsx(
        'inline-flex items-center justify-center w-5 h-5 rounded text-[11px] font-bold tracking-tight',
        colorMap[age] || 'bg-brand-border text-brand-text',
        className
      )}>
        {age}
      </span>
    );
  }

  if (variant === 'resolution') {
    return (
      <span className={clsx(
        'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border border-brand-border/80 bg-brand-surface/70 text-brand-subtext',
        className
      )}>
        {children}
      </span>
    );
  }

  if (variant === 'gold') {
    return (
      <span className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gold/15 text-gold border border-gold/30',
        className
      )}>
        {children}
      </span>
    );
  }

  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-card/80 text-brand-muted border border-brand-border/50',
      className
    )}>
      {children}
    </span>
  );
};
