import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Info } from 'lucide-react';
import { Content } from '../../types/database';
import { Badge } from '../common/Badge';
import { toggleFavorite } from '../../services/api';
import { showToast } from '../common/Toast';

interface ContentCardProps {
  content: Content;
  isFavoritedInitial?: boolean;
  onFavoriteChange?: () => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  content,
  isFavoritedInitial = false,
  onFavoriteChange,
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isFav, setIsFav] = useState(isFavoritedInitial);

  const handleCardClick = () => {
    navigate(`/content/${content.slug}`);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/watch/${content.slug}`);
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = await toggleFavorite(content.id);
    setIsFav(newState);
    showToast(newState ? 'Adicionado à Minha Lista' : 'Removido da Minha Lista');
    if (onFavoriteChange) onFavoriteChange();
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/content/${content.slug}`);
  };

  return (
    <div
      className="relative shrink-0 w-[150px] sm:w-[185px] md:w-[215px] group cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-brand-card shadow-md transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-crimson/15 group-hover:scale-[1.04] group-hover:ring-2 group-hover:ring-crimson/50">
        <img
          src={content.cover_url}
          alt={content.title}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay for Title & Metadata readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/95 via-brand-bg/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

        {/* Badges on Top */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {content.category?.name && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white/90 backdrop-blur-sm border border-white/10">
              {content.category.name}
            </span>
          )}
          {content.rating && (
            <Badge variant="rating">{content.rating.toFixed(1)}</Badge>
          )}
        </div>

        {/* Card Info Content at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-1.5 z-10">
          <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-crimson-light transition-colors">
            {content.title}
          </h4>

          <div className="flex items-center gap-2 text-[11px] text-brand-muted">
            {content.year && <span>{content.year}</span>}
            {content.duration && <span>• {content.duration}m</span>}
            {content.classification && (
              <Badge variant="classification" classification={content.classification} />
            )}
          </div>

          {/* Desktop Hover Quick Actions */}
          <div className={`hidden sm:flex items-center gap-2 pt-1 transition-all duration-200 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}>
            <button
              onClick={handlePlayClick}
              className="p-2 rounded-full bg-crimson hover:bg-crimson-hover text-white shadow-md shadow-crimson/40 hover:scale-110 active:scale-95 transition-all"
              title="Assistir Agora"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
            </button>

            <button
              onClick={handleFavoriteClick}
              className="p-2 rounded-full bg-brand-surface/90 hover:bg-brand-elevated text-white border border-brand-border/70 hover:scale-110 active:scale-95 transition-all"
              title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              {isFav ? <Check className="w-3.5 h-3.5 text-crimson" /> : <Plus className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleInfoClick}
              className="p-2 rounded-full bg-brand-surface/90 hover:bg-brand-elevated text-white border border-brand-border/70 hover:scale-110 active:scale-95 transition-all ml-auto"
              title="Mais detalhes"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
