import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ContentCarouselProps {
  title: string;
  categoryLink?: string;
  children: React.ReactNode;
}

export const ContentCarousel: React.FC<ContentCarouselProps> = ({
  title,
  categoryLink,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollBounds = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollBounds();
    const el = containerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollBounds);
      window.addEventListener('resize', checkScrollBounds);
      return () => {
        el.removeEventListener('scroll', checkScrollBounds);
        window.removeEventListener('resize', checkScrollBounds);
      };
    }
  }, [children]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const { clientWidth } = containerRef.current;
      const scrollAmount = clientWidth * 0.75;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative w-full py-4 group/carousel">
      {/* Header with Title & Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3.5 flex items-center justify-between">
        <h3 className="text-base sm:text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
          {title}
        </h3>
        {categoryLink && (
          <Link
            to={categoryLink}
            className="text-xs font-semibold text-crimson hover:text-crimson-light flex items-center gap-1 transition-colors"
          >
            <span>Ver tudo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Desktop Left Navigation Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => handleScroll('left')}
          className="hidden md:flex absolute left-2 sm:left-4 top-[58%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-brand-surface/90 hover:bg-crimson text-white items-center justify-center border border-brand-border shadow-2xl backdrop-blur-md transition-all duration-200 active:scale-95"
          aria-label="Rolar para a esquerda"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Desktop Right Navigation Arrow */}
      {canScrollRight && (
        <button
          onClick={() => handleScroll('right')}
          className="hidden md:flex absolute right-2 sm:right-4 top-[58%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-brand-surface/90 hover:bg-crimson text-white items-center justify-center border border-brand-border shadow-2xl backdrop-blur-md transition-all duration-200 active:scale-95"
          aria-label="Rolar para a direita"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Scrollable Card Track */}
      <div
        ref={containerRef}
        className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 py-2 scroll-smooth"
      >
        {children}
      </div>
    </section>
  );
};
