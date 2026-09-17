import React, { useEffect, useState } from 'react';
import { 
  getBanners, 
  getContents, 
  getWatchHistory, 
  getFavorites,
  getCategories 
} from '../services/api';
import { Banner, Content, WatchHistory, Category } from '../types/database';
import { HeroBanner } from '../components/home/HeroBanner';
import { ContentCarousel } from '../components/home/ContentCarousel';
import { ContentCard } from '../components/home/ContentCard';
import { ContinueWatchingCard } from '../components/home/ContinueWatchingCard';
import { HeroSkeleton, ContentCardSkeleton } from '../components/common/Skeleton';

export const HomePage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredContents, setFeaturedContents] = useState<Content[]>([]);
  const [continueWatching, setContinueWatching] = useState<WatchHistory[]>([]);
  const [trending, setTrending] = useState<Content[]>([]);
  const [doramas, setDoramas] = useState<Content[]>([]);
  const [filmes, setFilmes] = useState<Content[]>([]);
  const [series, setSeries] = useState<Content[]>([]);
  const [novelas, setNovelas] = useState<Content[]>([]);
  const [novelinhas, setNovelinhas] = useState<Content[]>([]);
  const [mais18, setMais18] = useState<Content[]>([]);
  const [myList, setMyList] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [
          allBanners,
          allContents,
          history,
          favs,
        ] = await Promise.all([
          getBanners(),
          getContents(),
          getWatchHistory(),
          getFavorites(),
        ]);

        setBanners(allBanners);
        setFeaturedContents(allContents.filter(c => c.is_featured));
        setContinueWatching(history.filter(h => !h.completed));
        setMyList(favs);

        // Filter sections
        setTrending(allContents.filter(c => c.is_trending));
        setDoramas(allContents.filter(c => c.category?.slug === 'doramas'));
        setFilmes(allContents.filter(c => c.category?.slug === 'filmes'));
        setSeries(allContents.filter(c => c.category?.slug === 'series'));
        setNovelas(allContents.filter(c => c.category?.slug === 'novelas'));
        setNovelinhas(allContents.filter(c => c.category?.slug === 'novelinhas'));
        setMais18(allContents.filter(c => c.category?.slug === 'mais-18'));
      } catch (e) {
        console.error('Failed to load home data:', e);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 pb-16">
        <HeroSkeleton />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <ContentCardSkeleton key={n} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      {/* Cinematic Hero Carousel */}
      <HeroBanner
        banners={banners}
        featuredContents={featuredContents}
      />

      {/* Carousels Container */}
      <div className="space-y-6 sm:space-y-10 relative z-20 -mt-8 sm:-mt-14">
        {/* Continue Watching Section */}
        {continueWatching.length > 0 && (
          <ContentCarousel title="Continue Assistindo">
            {continueWatching.map(item => (
              <ContinueWatchingCard key={item.id} item={item} />
            ))}
          </ContentCarousel>
        )}

        {/* Em Alta (Trending) */}
        {trending.length > 0 && (
          <ContentCarousel title="Em Alta no DoramasPlay">
            {trending.map(content => (
              <ContentCard key={content.id} content={content} />
            ))}
          </ContentCarousel>
        )}

        {/* Doramas */}
        {doramas.length > 0 && (
          <ContentCarousel title="Doramas Imperdíveis" categoryLink="/doramas">
            {doramas.map(content => (
              <ContentCard key={content.id} content={content} />
            ))}
          </ContentCarousel>
        )}

        {/* Filmes */}
        {filmes.length > 0 && (
          <ContentCarousel title="Filmes Asiáticos em Destaque" categoryLink="/filmes">
            {filmes.map(content => (
              <ContentCard key={content.id} content={content} />
            ))}
          </ContentCarousel>
        )}

        {/* Séries */}
        {series.length > 0 && (
          <ContentCarousel title="Séries & K-Dramas" categoryLink="/series">
            {series.map(content => (
              <ContentCard key={content.id} content={content} />
            ))}
          </ContentCarousel>
        )}

        {/* Novelas */}
        {novelas.length > 0 && (
          <ContentCarousel title="Novelas Orientais" categoryLink="/novelas">
            {novelas.map(content => (
              <ContentCard key={content.id} content={content} />
            ))}
          </ContentCarousel>
        )}

        {/* Novelinhas */}
        {novelinhas.length > 0 && (
          <ContentCarousel title="Novelinhas Rápidas" categoryLink="/novelinhas">
            {novelinhas.map(content => (
              <ContentCard key={content.id} content={content} />
            ))}
          </ContentCarousel>
        )}

        {/* Conteúdos +18 */}
        {mais18.length > 0 && (
          <ContentCarousel title="Coleção Especial +18" categoryLink="/mais-18">
            {mais18.map(content => (
              <ContentCard key={content.id} content={content} />
            ))}
          </ContentCarousel>
        )}

        {/* Minha Lista (se houver itens) */}
        {myList.length > 0 && (
          <ContentCarousel title="Minha Lista" categoryLink="/minha-lista">
            {myList.map(content => (
              <ContentCard key={content.id} content={content} isFavoritedInitial={true} />
            ))}
          </ContentCarousel>
        )}
      </div>
    </div>
  );
};
