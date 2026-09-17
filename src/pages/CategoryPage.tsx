import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Filter, ArrowUpDown } from 'lucide-react';
import { getContents, getCategories } from '../services/api';
import { Content, Category } from '../types/database';
import { ContentCard } from '../components/home/ContentCard';
import { ContentCardSkeleton } from '../components/common/Skeleton';

export const CategoryPage: React.FC = () => {
  const location = useLocation();
  // extract slug from pathname: /doramas -> doramas
  const currentSlug = location.pathname.replace('/', '') || 'doramas';

  const [category, setCategory] = useState<Category | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'trending' | 'title'>('recent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryContent() {
      try {
        setLoading(true);
        const [cats, all] = await Promise.all([
          getCategories(),
          getContents({ categorySlug: currentSlug }),
        ]);

        const currentCat = cats.find(c => c.slug === currentSlug) || {
          id: 'cat-custom',
          name: currentSlug.toUpperCase(),
          slug: currentSlug,
          sort_order: 1,
          is_active: true,
          created_at: new Date().toISOString(),
        };

        setCategory(currentCat);
        setContents(all);
      } catch (e) {
        console.error('Error loading category:', e);
      } finally {
        setLoading(false);
      }
    }

    loadCategoryContent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSlug]);

  const sortedContents = React.useMemo(() => {
    const list = [...contents];
    if (sortBy === 'rating') {
      return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    if (sortBy === 'trending') {
      return list.sort((a, b) => (b.is_trending ? 1 : 0) - (a.is_trending ? 1 : 0));
    }
    if (sortBy === 'title') {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }
    // default recent
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [contents, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20 space-y-8">
      {/* Category Header Banner */}
      <div className="p-6 sm:p-10 rounded-2xl bg-gradient-to-r from-brand-surface via-brand-card to-brand-surface border border-brand-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-crimson">Categoria</span>
          <h1 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight">
            {category?.name || 'Catálogo'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted max-w-xl">
            Explore nossa seleção completa de títulos em alta definição com episódios completos, áudio original e legendas de qualidade.
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 bg-brand-bg/80 border border-brand-border px-3 py-2 rounded-xl text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-brand-muted shrink-0" />
          <span className="text-brand-muted">Ordenar:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-transparent text-white font-semibold outline-none cursor-pointer"
          >
            <option value="recent" className="bg-brand-surface">Mais Recentes</option>
            <option value="rating" className="bg-brand-surface">Melhor Avaliados</option>
            <option value="trending" className="bg-brand-surface">Em Alta</option>
            <option value="title" className="bg-brand-surface">Ordem Alfabética (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Grid of Content Cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <ContentCardSkeleton key={n} />
          ))}
        </div>
      ) : sortedContents.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {sortedContents.map(item => (
            <div key={item.id} className="flex justify-center">
              <ContentCard content={item} />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-brand-muted">
          Nenhum título encontrado nesta categoria no momento.
        </div>
      )}
    </div>
  );
};
