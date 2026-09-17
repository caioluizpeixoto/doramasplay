import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  subtitle,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border/70 hover:border-brand-border transition-all shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">{title}</span>
        <div className="p-2 rounded-xl bg-brand-card text-brand-subtext border border-brand-border/50">
          {icon}
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">{value}</h3>
        
        <div className="flex items-center gap-2">
          {change && (
            <span className={`inline-flex items-center text-xs font-bold gap-0.5 ${
              isPositive ? 'text-emerald-500' : 'text-crimson'
            }`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {change}
            </span>
          )}
          {subtitle && <span className="text-xs text-brand-muted">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
};
