import React from 'react';
import { Play } from 'lucide-react';
import { Episode } from '../../types/database';

interface EpisodeItemProps {
  contentSlug: string;
  episode: Episode;
  onWatch: () => void;
}

export const EpisodeItem: React.FC<EpisodeItemProps> = ({
  episode,
  onWatch,
}) => {
  return (
    <div
      onClick={onWatch}
      className="group flex gap-3.5 p-3 rounded-xl bg-brand-surface/70 hover:bg-brand-card border border-brand-border/40 hover:border-crimson/50 transition-all cursor-pointer shadow-sm"
    >
      {/* Thumbnail with 16:9 Aspect Ratio */}
      <div className="relative shrink-0 w-32 sm:w-40 aspect-video rounded-lg overflow-hidden bg-brand-bg">
        <img
          src={episode.thumbnail_url || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80'}
          alt={episode.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Play Icon Overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
          <div className="w-8 h-8 rounded-full bg-crimson/90 group-hover:bg-crimson group-hover:scale-110 flex items-center justify-center text-white shadow-md transition-all">
            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Duration Badge */}
        {episode.duration && (
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white backdrop-blur-sm">
            {episode.duration}m
          </span>
        )}
      </div>

      {/* Episode Details */}
      <div className="flex flex-col justify-center flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-crimson">Ep. {episode.episode_number}</span>
          <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-crimson-light transition-colors">
            {episode.title}
          </h4>
        </div>
        <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">
          {episode.description || 'Assista a este episódio emocionante repleto de reviravoltas na trama.'}
        </p>
      </div>
    </div>
  );
};
