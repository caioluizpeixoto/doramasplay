import React from 'react';
import { clsx } from 'clsx';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-lg bg-gradient-to-r from-brand-surface via-brand-card to-brand-surface bg-[length:200%_100%]',
        className
      )}
    />
  );
};

export const ContentCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-2 shrink-0 w-[160px] sm:w-[190px] md:w-[220px]">
      <Skeleton className="w-full aspect-[2/3] rounded-xl" />
      <Skeleton className="w-3/4 h-4 rounded" />
      <Skeleton className="w-1/2 h-3 rounded" />
    </div>
  );
};

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="w-full h-[70vh] min-h-[500px] relative overflow-hidden bg-brand-surface">
      <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-black/40" />
      <div className="absolute bottom-12 left-6 md:left-16 space-y-4 max-w-xl">
        <Skeleton className="w-32 h-6 rounded" />
        <Skeleton className="w-96 h-12 rounded-lg" />
        <Skeleton className="w-full h-16 rounded" />
        <div className="flex gap-4">
          <Skeleton className="w-36 h-12 rounded-xl" />
          <Skeleton className="w-36 h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
