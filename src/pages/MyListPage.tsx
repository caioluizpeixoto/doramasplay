import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Film } from 'lucide-react';
import { getFavorites } from '../services/api';
import { Content } from '../types/database';
import { ContentCard } from '../components/home/ContentCard';
import { ContentCardSkeleton } from '../components/common/Skeleton';
import { Button } from '../components/common/Button';

export const MyListPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await getFavorites();
      setFavorites(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-crimson fill-crimson" />
            Minha Lista
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Seus títulos favoritos salvos para assistir quando quiser.
          </p>
        </div>

        <span className="text-xs font-semibold text-brand-subtext bg-brand-surface px-3 py-1 rounded-full border border-brand-border">
          {favorites.length} {favorites.length === 1 ? 'título' : 'títulos'}
        </span>
      </div>

      {/* Grid of Favorited Titles */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5].map(n => (
            <ContentCardSkeleton key={n} />
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {favorites.map(content => (
            <div key={content.id} className="flex justify-center">
              <ContentCard
                content={content}
                isFavoritedInitial={true}
                onFavoriteChange={loadFavorites}
              />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-24 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-center mx-auto text-brand-muted">
            <Film className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Sua lista está vazia</h3>
            <p className="text-xs sm:text-sm text-brand-muted max-w-md mx-auto">
              Adicione doramas, filmes e séries clicando no botão "+ Minha Lista" em qualquer card ou banner.
            </p>
          </div>
          <Link to="/">
            <Button variant="primary" size="md" className="mt-2">
              Explorar Catálogo
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
