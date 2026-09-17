import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { WatchHistory } from '../../types/database';

interface ContinueWatchingCardProps {
  item: WatchHistory;
}

export const ContinueWatchingCard: React.FC<ContinueWatchingCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const content = item.content;
  if (!content) return null;

  const handlePlay = () => {
    navigate(`/watch/${content.slug}`);
  };

  const remainingSeconds = Math.max(0, item.duration_seconds - item.progress_seconds);
  const remainingMinutes = Math.ceil(remainingSeconds / 60);

  const thumbUrl = item.episode?.thumbnail_url || content.banner_url || content.cover_url;

  return (
    <div
      onClick={handlePlay}
      className="group relative shrink-0 w-[240px] sm:w-[280px] md:w-[320px] rounded-xl overflow-hidden bg-brand-card border border-brand-border/60 hover:border-crimson/50 transition-all duration-300 hover:shadow-xl hover:shadow-crimson/10 cursor-pointer"
    >
      {/* 16:9 Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-brand-surface">
        <img
          src={thumbUrl}
          alt={content.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-crimson/90 group-hover:bg-crimson group-hover:scale-110 flex items-center justify-center text-white shadow-lg shadow-crimson/40 transition-all">
            <Play className="w-4 h-4 fill-white ml-0.5" />
          </div>
        </div>

        {/* Remaining Time Badge */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-black/75 text-white/90 backdrop-blur-sm">
          {remainingMinutes > 0 ? `Restam ${remainingMinutes} min` : 'Quase no fim'}
        </div>
      </div>

      {/* Progress Bar in Crimson */}
      <div className="w-full h-1.5 bg-brand-border/80 overflow-hidden">
        <div
          className="h-full bg-crimson transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
        />
      </div>

      {/* Details Container */}
      <div className="p-3">
        <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-crimson-light transition-colors">
          {content.title}
        </h4>
        <p className="text-[11px] text-brand-muted line-clamp-1 mt-0.5">
          {item.episode ? `${item.episode.title}` : (content.category?.name || 'Filme')}
        </p>
      </div>
    </div>
  );
};
