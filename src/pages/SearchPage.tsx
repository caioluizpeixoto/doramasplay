import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X, SlidersHorizontal, Film } from 'lucide-react';
import { getContents, getCategories } from '../services/api';
import { Content, Category } from '../types/database';
import { ContentCard } from '../components/home/ContentCard';
import { ContentCardSkeleton } from '../components/common/Skeleton';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [results, setResults] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function initCategories() {
      const cats = await getCategories();
      setCategories(cats);
    }
    initCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const filters: any = {};
        if (query.trim()) filters.search = query.trim();
        if (selectedCategory !== 'all') filters.categorySlug = selectedCategory;

        const data = await getContents(filters);
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val.trim() });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20 space-y-8">
      {/* Search Header and Input */}
      <div className="max-w-2xl mx-auto space-y-4 text-center">
        <h1 className="text-2xl sm:text-4xl font-black font-display text-white tracking-tight">
          O que você quer assistir hoje?
        </h1>

        <div className="relative flex items-center bg-brand-surface border border-brand-border/80 rounded-2xl px-4 py-3 shadow-2xl focus-within:border-crimson focus-within:ring-2 focus-within:ring-crimson/20 transition-all">
          <SearchIcon className="w-5 h-5 text-brand-muted shrink-0 mr-3" />
          <input
            type="text"
            placeholder="Pesquise por títulos, gêneros ou palavras-chave..."
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-brand-muted outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => handleQueryChange('')}
              className="p-1 rounded-lg text-brand-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-crimson text-white shadow-md shadow-crimson/30'
                : 'bg-brand-surface text-brand-subtext hover:text-white hover:bg-brand-card'
            }`}
          >
            Todos
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === c.slug
                  ? 'bg-crimson text-white shadow-md shadow-crimson/30'
                  : 'bg-brand-surface text-brand-subtext hover:text-white hover:bg-brand-card'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
            {results.length} {results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <ContentCardSkeleton key={n} />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {results.map(content => (
              <div key={content.id} className="flex justify-center">
                <ContentCard content={content} />
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-center mx-auto text-brand-muted">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Nenhum título encontrado</h3>
            <p className="text-xs text-brand-muted max-w-sm mx-auto">
              Tente pesquisar com outro termo ou selecione uma categoria diferente acima.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
