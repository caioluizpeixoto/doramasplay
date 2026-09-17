import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Info, Volume2, VolumeX } from 'lucide-react';
import { Banner, Content } from '../../types/database';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { toggleFavorite } from '../../services/api';
import { showToast } from '../common/Toast';

interface HeroBannerProps {
  banners: Banner[];
  featuredContents: Content[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ banners, featuredContents }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isFav, setIsFav] = useState(false);

  // Pool of items for the hero banner
  const items = banners.length > 0
    ? banners.map(b => ({
        id: b.id,
        title: b.title,
        image_url: b.image_url,
        content: b.content || featuredContents.find(f => f.id === b.content_id) || featuredContents[0],
      }))
    : featuredContents.map(f => ({
        id: f.id,
        title: f.title,
        image_url: f.banner_url || f.cover_url,
        content: f,
      }));

  const currentItem = items[currentIndex] || null;
  const currentContent = currentItem?.content;

  // Auto slide rotation
  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (!currentItem || !currentContent) return null;

  const handleWatchNow = () => {
    navigate(`/watch/${currentContent.slug}`);
  };

  const handleToggleFavorite = async () => {
    const newState = await toggleFavorite(currentContent.id);
    setIsFav(newState);
    showToast(newState ? 'Adicionado à Minha Lista' : 'Removido da Minha Lista');
  };

  const handleMoreInfo = () => {
    navigate(`/content/${currentContent.slug}`);
  };

  return (
    <div className="relative w-full h-[75vh] min-h-[540px] max-h-[780px] overflow-hidden bg-brand-bg select-none">
      {/* Background Backdrop Image with Crossfade */}
      <div className="absolute inset-0">
        <img
          src={currentItem.image_url}
          alt={currentItem.title}
          className="w-full h-full object-cover object-top transition-opacity duration-1000 ease-in-out"
        />

        {/* Cinematographic Gradient Overlays */}
        {/* Left-to-right gradient for text contrast */}
        <div className="absolute inset-0 bg-hero-side-gradient" />
        
        {/* Bottom vignette to blend into carousels */}
        <div className="absolute inset-0 bg-hero-gradient" />
        
        {/* Top shadow for navbar */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />
      </div>

      {/* Hero Content Information */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 md:pb-24 z-10">
        <div className="max-w-2xl space-y-4">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            {currentContent.category?.name && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-crimson/90 text-white shadow-sm">
                {currentContent.category.name}
              </span>
            )}
            {currentContent.rating && (
              <Badge variant="rating">{currentContent.rating.toFixed(1)}</Badge>
            )}
            {currentContent.year && (
              <span className="text-xs font-semibold text-brand-subtext">{currentContent.year}</span>
            )}
            {currentContent.classification && (
              <Badge variant="classification" classification={currentContent.classification} />
            )}
            <Badge variant="resolution">4K Ultra HD</Badge>
          </div>

          {/* Title in strong cinematic display font */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white drop-shadow-lg leading-[1.08]">
            {currentContent.title}
          </h1>

          {/* Synopsis (short and readable) */}
          <p className="text-sm sm:text-base text-brand-subtext/90 line-clamp-3 leading-relaxed drop-shadow max-w-xl font-normal">
            {currentContent.description || 'Assista a esta superprodução premiada com elenco de estrelas e enredo inesquecível disponível exclusivamente na DoramasPlay.'}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleWatchNow}
              icon={<Play className="w-5 h-5 fill-white ml-0.5" />}
              className="shadow-xl shadow-crimson/30 hover:scale-105"
            >
              Assistir Agora
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleToggleFavorite}
              icon={isFav ? <Check className="w-5 h-5 text-crimson" /> : <Plus className="w-5 h-5" />}
            >
              {isFav ? 'Na Minha Lista' : 'Minha Lista'}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleMoreInfo}
              icon={<Info className="w-5 h-5" />}
              className="hidden sm:inline-flex"
            >
              Mais Informações
            </Button>
          </div>
        </div>

        {/* Bottom Controls: Carousel Dots & Audio Toggle */}
        <div className="absolute bottom-6 right-6 md:right-12 flex items-center gap-4 z-20">
          {/* Audio toggle button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-full bg-brand-surface/70 hover:bg-brand-surface text-white border border-brand-border/60 backdrop-blur-md transition-colors"
            title={isMuted ? 'Ativar Som' : 'Desativar Som'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Carousel Slide Dots */}
          {items.length > 1 && (
            <div className="flex items-center gap-2">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-6 bg-crimson shadow-md shadow-crimson/50'
                      : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
