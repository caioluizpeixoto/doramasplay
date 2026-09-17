import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none';

  const variants = {
    primary: 'bg-crimson hover:bg-crimson-hover text-white shadow-lg shadow-crimson/25 hover:shadow-crimson/40',
    secondary: 'bg-brand-surface/90 hover:bg-brand-elevated text-brand-text border border-brand-border/60 hover:border-brand-border backdrop-blur-sm',
    outline: 'bg-transparent border border-brand-border hover:border-crimson hover:text-crimson text-brand-text',
    ghost: 'bg-transparent hover:bg-brand-card/50 text-brand-muted hover:text-white',
    gold: 'bg-gold hover:bg-gold-hover text-black font-semibold shadow-lg shadow-gold/20 hover:shadow-gold/35',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 h-8',
    md: 'text-sm px-4 py-2 rounded-xl gap-2 h-10',
    lg: 'text-base px-6 py-3 rounded-xl gap-2.5 h-12 font-semibold',
    icon: 'p-2 rounded-xl h-10 w-10 shrink-0',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
