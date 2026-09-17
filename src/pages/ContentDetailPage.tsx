import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Star, Globe, Clock, ShieldAlert, Sparkles, ArrowLeft } from 'lucide-react';
import { getContentBySlug, getContents, toggleFavorite, isFavorite } from '../services/api';
import { Content, Episode } from '../types/database';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SeasonSelector } from '../components/content/SeasonSelector';
import { ContentCarousel } from '../components/home/ContentCarousel';
import { ContentCard } from '../components/home/ContentCard';
import { showToast } from '../components/common/Toast';
import { HeroSkeleton } from '../components/common/Skeleton';

export const ContentDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [content, setContent] = useState<Content | null>(null);
  const [relatedContents, setRelatedContents] = useState<Content[]>([]);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetails() {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await getContentBySlug(slug);
        if (data) {
          setContent(data);
          const fav = await isFavorite(data.id);
          setIsFav(fav);

          // Get related items in same category
          const all = await getContents({ categorySlug: data.category?.slug });
          setRelatedContents(all.filter(c => c.id !== data.id));
        } else {
          navigate('/404');
        }
      } catch (e) {
        console.error('Error loading content details:', e);
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, navigate]);

  if (loading || !content) {
    return (
      <div className="space-y-6 pb-20">
        <HeroSkeleton />
      </div>
    );
  }

  const handleWatchNow = (episode?: Episode) => {
    navigate(`/watch/${content.slug}`);
  };

  const handleToggleFavorite = async () => {
    const newState = await toggleFavorite(content.id);
    setIsFav(newState);
    showToast(newState ? 'Adicionado à Minha Lista' : 'Removido da Minha Lista');
  };

  const hasEpisodes = content.episodes && content.episodes.length > 0;

  return (
    <div className="space-y-12 pb-24">
      {/* Immersive Backdrop Section */}
      <div className="relative w-full h-[65vh] min-h-[480px] max-h-[700px] overflow-hidden bg-brand-bg">
        <img
          src={content.banner_url || content.cover_url}
          alt={content.title}
          className="w-full h-full object-cover object-top"
        />

        {/* Cinematic Vignettes */}
        <div className="absolute inset-0 bg-hero-side-gradient" />
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-20 left-4 sm:left-8 z-20 p-2.5 rounded-full bg-brand-surface/70 hover:bg-brand-surface text-white border border-brand-border/60 backdrop-blur-md transition-all hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Details Overlay */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 z-10">
          <div className="flex flex-col sm:flex-row gap-6 items-end sm:items-center">
            {/* Poster thumbnail for desktop */}
            <div className="hidden sm:block shrink-0 w-44 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-brand-border/80 ring-2 ring-brand-border/30">
              <img src={content.cover_url} alt={content.title} className="w-full h-full object-cover" />
            </div>

            {/* Main Info */}
            <div className="space-y-4 max-w-2xl">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {content.category?.name && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-crimson text-white">
                    {content.category.name}
                  </span>
                )}
                {content.rating && (
                  <Badge variant="rating">{content.rating.toFixed(1)}</Badge>
                )}
                {content.year && (
                  <span className="text-xs font-semibold text-brand-subtext">{content.year}</span>
                )}
                {content.classification && (
                  <Badge variant="classification" classification={content.classification} />
                )}
                <Badge variant="resolution">4K Ultra HD</Badge>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight leading-tight">
                {content.title}
              </h1>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleWatchNow()}
                  icon={<Play className="w-5 h-5 fill-white ml-0.5" />}
                  className="shadow-xl shadow-crimson/30 hover:scale-105"
                >
                  Assistir {hasEpisodes ? 'Episódio 1' : 'Agora'}
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleToggleFavorite}
                  icon={isFav ? <Check className="w-5 h-5 text-crimson" /> : <Plus className="w-5 h-5" />}
                >
                  {isFav ? 'Na Minha Lista' : 'Minha Lista'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Info & Episodes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 sm:p-8 rounded-2xl bg-brand-surface/60 border border-brand-border/60 backdrop-blur-sm">
          {/* Synopsis */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted">Sinopse</h3>
            <p className="text-sm sm:text-base text-brand-text leading-relaxed font-normal">
              {content.description || 'Uma emocionante narrativa que captura a essência dos melhores dramas asiáticos com atuações aclamadas pela crítica internacional.'}
            </p>
          </div>

          {/* Technical Info */}
          <div className="space-y-3 border-t md:border-t-0 md:border-l border-brand-border/60 pt-4 md:pt-0 md:pl-8 text-xs space-y-2.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-2">Ficha Técnica</h3>
            
            <div className="flex justify-between py-1 border-b border-brand-border/40">
              <span className="text-brand-muted">País de Origem:</span>
              <span className="font-semibold text-white">{content.country || 'Coreia do Sul'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-brand-border/40">
              <span className="text-brand-muted">Áudio & Legendas:</span>
              <span className="font-semibold text-white">{content.language || 'Legendado / Dublado'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-brand-border/40">
              <span className="text-brand-muted">Duração Total:</span>
              <span className="font-semibold text-white">{content.duration ? `${content.duration} minutos` : 'Completo'}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-brand-muted">Qualidade:</span>
              <span className="font-semibold text-gold">4K HDR & 60 FPS</span>
            </div>
          </div>
        </div>

        {/* Seasons and Episodes Section */}
        {hasEpisodes && (
          <section className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">Episódios</h2>
            <SeasonSelector
              contentSlug={content.slug}
              episodes={content.episodes || []}
              onSelectEpisode={(ep) => handleWatchNow(ep)}
            />
          </section>
        )}

        {/* Recommended & Related Content */}
        {relatedContents.length > 0 && (
          <section className="space-y-4">
            <ContentCarousel title="Títulos Semelhantes Recomendados">
              {relatedContents.map(rel => (
                <ContentCard key={rel.id} content={rel} />
              ))}
            </ContentCarousel>
          </section>
        )}
      </div>
    </div>
  );
};
